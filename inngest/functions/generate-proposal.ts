import { inngest } from '../client';
import { db } from '@/db';
import { proposals, proposalSections, jobLogs, opportunities } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const generateProposal = inngest.createFunction(
  { id: 'generate-proposal' },
  { event: 'proposal/generate' },
  async ({ event, step }) => {
    const { proposalId } = event.data;

    // Get proposal details
    const proposal = await step.run('get-proposal', async () => {
      const [result] = await db
        .select()
        .from(proposals)
        .where(eq(proposals.id, proposalId))
        .limit(1);
      return result;
    });

    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    // Update status to processing
    await step.run('update-status', async () => {
      await db
        .update(proposals)
        .set({
          status: 'processing',
          progress: 0,
          stage: 'Initial Planning',
        })
        .where(eq(proposals.id, proposalId));
    });

    // Add log
    await step.run('add-log', async () => {
      await db.insert(jobLogs).values({
        proposalId,
        message: 'Project initialized.',
        type: 'info',
      });
    });

    // 1. Parse RFP requirements
    const requirements = await step.run('parse-requirements', async () => {
      if (!proposal.opportunityId) return [];
      
      const [opportunity] = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, proposal.opportunityId))
        .limit(1);

      if (!opportunity?.rfpContent) return [];

      const { extractRequirements } = await import('@/lib/proposals/compliance-matrix');
      return extractRequirements(opportunity.rfpContent);
    });

    // 2. Get section templates
      const sections = await step.run('get-sections', async () => {
      const { getSectionTemplates } = await import('@/lib/proposals/sections');
      const [opportunity] = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, proposal.opportunityId!))
        .limit(1);
      return getSectionTemplates(opportunity?.rfpContent || undefined);
    });

    // 3. Generate sections sequentially
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      await step.run(`generate-section-${i}`, async () => {
        // Update progress
        const progress = Math.floor(((i + 1) / sections.length) * 90); // 90% for generation, 10% for review
        await db
          .update(proposals)
          .set({
            progress,
            stage: `Drafting ${section.title}`,
          })
          .where(eq(proposals.id, proposalId));

        // Add log
        await db.insert(jobLogs).values({
          proposalId,
          message: `Generating ${section.title}...`,
          type: 'info',
        });

        // Generate section
        const { generateProposalSection } = await import('@/lib/proposals/generator');
        const rfpRequirements = requirements
          .filter(r => r.section === section.number || !r.section)
          .map(r => r.text)
          .join('\n');

        // Convert template to ProposalSection format
        const proposalSection = {
          number: section.number,
          title: section.title,
          content: '', // Will be generated
          order: section.order,
        };
        await generateProposalSection(proposalId, proposalSection, rfpRequirements);
      });
    }

    // 4. Review and compliance check
    await step.run('review-proposal', async () => {
      await db
        .update(proposals)
        .set({
          progress: 95,
          stage: 'Final Review',
        })
        .where(eq(proposals.id, proposalId));

      await db.insert(jobLogs).values({
        proposalId,
        message: 'Reviewing proposal for compliance...',
        type: 'info',
      });

      // Get all sections
      const allSections = await db
        .select()
        .from(proposalSections)
        .where(eq(proposalSections.proposalId, proposalId));

      const fullContent = allSections.map(s => s.content).join('\n\n');

      // Check compliance
      const { checkCompliance } = await import('@/lib/proposals/compliance-matrix');
      const complianceResults = await checkCompliance(fullContent, requirements);

      // Update proposal with compliance results
      // Note: metadata field doesn't exist in schema, storing in configuration instead
      const complianceScore = requirements.length > 0 
        ? complianceResults.filter(r => r.addressed).length / requirements.length 
        : 0;
      
      await db
        .update(proposals)
        .set({
          configuration: {
            compliance: complianceResults,
            complianceScore,
          },
        })
        .where(eq(proposals.id, proposalId));
    });

    // 5. Compile document (will be implemented in document-generation phase)
    await step.run('compile-document', async () => {
      await db.insert(jobLogs).values({
        proposalId,
        message: 'Compiling final document...',
        type: 'info',
      });
      // Document compilation will be handled in document-generation phase
    });

    // 6. Mark as completed
    await step.run('complete-proposal', async () => {
      await db
        .update(proposals)
        .set({
          progress: 100,
          status: 'completed',
          stage: 'Ready for Review',
        })
        .where(eq(proposals.id, proposalId));

      await db.insert(jobLogs).values({
        proposalId,
        message: 'Proposal generation completed successfully.',
        type: 'success',
      });
    });

    return { proposalId, status: 'completed' };
  }
);

