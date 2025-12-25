import { db } from '@/db';
import { opportunities, proposals, proposalSections, pastPerformance } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateWithModel } from '@/lib/ai/orchestrator';
import { architectPrompts } from '@/lib/ai/prompts/architect-prompts';
import { retrievePastPerformance } from '@/lib/rag/retriever';

export interface ProposalSection {
  number: string;
  title: string;
  content: string;
  order: number;
}

export async function generateProposalSection(
  proposalId: string,
  section: ProposalSection,
  rfpRequirements: string
): Promise<string> {
  // Get proposal and opportunity
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal || !proposal.opportunityId) {
    throw new Error('Proposal or opportunity not found');
  }

  // Get opportunity details
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, proposal.opportunityId))
    .limit(1);

  if (!opportunity) {
    throw new Error('Opportunity not found');
  }

  // Retrieve relevant past performance
  const pastPerformanceResults = await retrievePastPerformance(
    section.title + ' ' + rfpRequirements,
    3 // Top 3 matches
  );

  // Convert past performance results to context string
  const pastPerformanceContext = pastPerformanceResults
    .map(pp => `${pp.title} (${pp.agency}): ${pp.description}`)
    .join('\n\n');

  // Generate section content
  const content = await generateWithModel({
    role: 'architect',
    prompt: architectPrompts.generateSection(
      section.title,
      rfpRequirements,
      pastPerformanceContext
    ),
    context: opportunity.rfpContent || opportunity.description || undefined,
    temperature: 0.7,
    maxTokens: 3000,
  });

  // Save section to database
  await db.insert(proposalSections).values({
    proposalId,
    sectionNumber: section.number,
    title: section.title,
    content,
    order: section.order,
    status: 'completed',
  });

  return content;
}

export async function generateComplianceMatrix(
  proposalId: string,
  rfpRequirements: string[]
): Promise<Record<string, boolean>> {
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal) {
    throw new Error('Proposal not found');
  }

  // Get all sections
  const sections = await db
    .select()
    .from(proposalSections)
    .where(eq(proposalSections.proposalId, proposalId));

  const sectionContent = sections.map(s => s.content).join('\n\n');

  // Check each requirement
  const matrix: Record<string, boolean> = {};
  
  for (const requirement of rfpRequirements) {
    // Simple keyword matching - could be enhanced with AI
    const requirementLower = requirement.toLowerCase();
    const contentLower = sectionContent.toLowerCase();
    matrix[requirement] = contentLower.includes(requirementLower) || 
                          requirementLower.split(' ').some(word => 
                            word.length > 4 && contentLower.includes(word)
                          );
  }

  return matrix;
}

