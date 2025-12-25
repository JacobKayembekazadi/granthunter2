import { db } from '@/db';
import { opportunities, pastPerformance } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { retrievePastPerformance } from '@/lib/rag/retriever';
import { Opportunity } from '@/types';

export interface OpportunityAnalysisContext {
  opportunity: Opportunity;
  rfpContent?: string;
  similarPastPerformance: Array<{
    id: string;
    title: string;
    agency: string;
    value: string;
    description: string;
    score: number;
  }>;
  similarOpportunities: Array<{
    id: string;
    title: string;
    agency: string;
    matchScore: number;
  }>;
  agencyPatterns: {
    totalWithAgency: number;
    averageMatchScore: number;
  };
}

export async function buildOpportunityAnalysisContext(
  opportunityId: string,
  organizationId?: string
): Promise<OpportunityAnalysisContext> {
  // Fetch opportunity
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, opportunityId))
    .limit(1);

  if (!opportunity) {
    throw new Error('Opportunity not found');
  }

  // Get RFP content if available
  const rfpContent = opportunity.rfpContent || undefined;

  // Get similar past performance using RAG
  const queryText = [
    opportunity.title,
    opportunity.description,
    opportunity.agency,
    opportunity.naicsCode,
  ]
    .filter(Boolean)
    .join(' ');

  const similarPastPerf = queryText
    ? await retrievePastPerformance(queryText, 5)
    : [];

  // Get similar opportunities (same agency or NAICS code)
  const conditions = [];
  if (opportunity.agency) {
    conditions.push(eq(opportunities.agency, opportunity.agency));
  }
  if (opportunity.naicsCode) {
    conditions.push(eq(opportunities.naicsCode, opportunity.naicsCode));
  }

  const similarOpps = conditions.length > 0
    ? await db
        .select({
          id: opportunities.id,
          title: opportunities.title,
          agency: opportunities.agency,
          matchScore: opportunities.matchScore,
        })
        .from(opportunities)
        .where(and(...conditions)!)
        .limit(10)
    : [];

  // Filter out the current opportunity
  const filteredSimilarOpps = similarOpps
    .filter(o => o.id !== opportunityId)
    .slice(0, 5);

  // Get agency patterns (all opportunities with same agency)
  const agencyOpps = opportunity.agency
    ? await db
        .select({
          matchScore: opportunities.matchScore,
        })
        .from(opportunities)
        .where(eq(opportunities.agency, opportunity.agency))
    : [];

  const agencyAverageMatchScore = agencyOpps.length > 0
    ? agencyOpps.reduce((sum, o) => sum + (o.matchScore || 0), 0) / agencyOpps.length
    : 0;

  return {
    opportunity: opportunity as Opportunity,
    rfpContent,
    similarPastPerformance: similarPastPerf.map(pp => ({
      id: pp.id,
      title: pp.title,
      agency: pp.agency || '',
      value: pp.value || '',
      description: pp.description || '',
      score: pp.score,
    })),
    similarOpportunities: filteredSimilarOpps.map(o => ({
      id: o.id,
      title: o.title,
      agency: o.agency,
      matchScore: o.matchScore || 0,
    })),
    agencyPatterns: {
      totalWithAgency: agencyOpps.length,
      averageMatchScore: Math.round(agencyAverageMatchScore),
    },
  };
}

