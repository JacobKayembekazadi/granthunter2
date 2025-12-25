import { db } from '@/db';
import { opportunities, proposals, searchAgents, agentRuns, users, pastPerformance, artifacts } from '@/db/schema';
import { eq, and, gte, lte, sql, count, desc } from 'drizzle-orm';
import { OpportunityFilters, OpportunitySort } from '@/types/dashboard';

export async function getDashboardStats(userId: string, organizationId?: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const conditions = organizationId ? [eq(opportunities.organizationId, organizationId)] : [];

  // Total opportunities
  const [totalResult] = await db
    .select({ count: count() })
    .from(opportunities)
    .where(conditions.length > 0 ? and(...conditions)! : undefined);

  // New opportunities
  const [newResult] = await db
    .select({ count: count() })
    .from(opportunities)
    .where(
      and(
        ...conditions,
        eq(opportunities.status, 'new'),
        gte(opportunities.createdAt, sevenDaysAgo)
      )!
    );

  // Active proposals
  const proposalConditions = organizationId ? [eq(proposals.organizationId, organizationId)] : [];
  const [activeProposalsResult] = await db
    .select({ count: count() })
    .from(proposals)
    .where(
      and(
        ...proposalConditions,
        sql`${proposals.status} IN ('processing', 'queued')`
      )!
    );

  // Submitted proposals
  const [submittedResult] = await db
    .select({ count: count() })
    .from(proposals)
    .where(
      and(
        ...proposalConditions,
        eq(proposals.status, 'completed')
      )!
    );

  // Active agents
  const agentConditions = organizationId ? [eq(searchAgents.organizationId, organizationId)] : [];
  const [activeAgentsResult] = await db
    .select({ count: count() })
    .from(searchAgents)
    .where(
      and(
        ...agentConditions,
        eq(searchAgents.status, 'Active')
      )!
    );

  // Upcoming deadlines
  const [deadlinesResult] = await db
    .select({ count: count() })
    .from(opportunities)
    .where(
      and(
        ...conditions,
        sql`${opportunities.dueDate} IS NOT NULL`,
        gte(opportunities.dueDate, now),
        lte(opportunities.dueDate, sevenDaysFromNow)
      )!
    );

  return {
    totalOpportunities: totalResult?.count || 0,
    newOpportunities: newResult?.count || 0,
    activeProposals: activeProposalsResult?.count || 0,
    submittedProposals: submittedResult?.count || 0,
    activeAgents: activeAgentsResult?.count || 0,
    upcomingDeadlines: deadlinesResult?.count || 0,
  };
}

export async function getOpportunitiesWithFilters(
  filters: OpportunityFilters,
  sort: OpportunitySort,
  pagination: { limit: number; offset: number },
  organizationId?: string
) {
  const conditions = organizationId ? [eq(opportunities.organizationId, organizationId)] : [];

  if (filters.status) {
    conditions.push(eq(opportunities.status, filters.status));
  }

  if (filters.agency) {
    conditions.push(eq(opportunities.agency, filters.agency));
  }

  if (filters.minMatchScore !== undefined) {
    conditions.push(gte(opportunities.matchScore, filters.minMatchScore));
  }

  if (filters.maxMatchScore !== undefined) {
    conditions.push(lte(opportunities.matchScore, filters.maxMatchScore));
  }

  if (filters.naicsCode) {
    conditions.push(eq(opportunities.naicsCode, filters.naicsCode));
  }

  if (filters.dateFrom) {
    conditions.push(gte(opportunities.createdAt, new Date(filters.dateFrom)));
  }

  if (filters.dateTo) {
    conditions.push(lte(opportunities.createdAt, new Date(filters.dateTo)));
  }

  if (filters.search) {
    conditions.push(
      sql`(${opportunities.title} ILIKE ${`%${filters.search}%`} OR ${opportunities.description} ILIKE ${`%${filters.search}%`})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions)! : undefined;

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(opportunities)
    .where(whereClause);

  // Build query
  let query = db.select().from(opportunities).where(whereClause);

  // Apply sorting
  const sortField = opportunities[sort.sortBy];
  if (sortField) {
    if (sort.sortOrder === 'desc') {
      query = query.orderBy(desc(sortField)) as any;
    } else {
      query = query.orderBy(sortField) as any;
    }
  }

  // Apply pagination
  query = query.limit(pagination.limit).offset(pagination.offset) as any;

  const results = await query;

  return {
    opportunities: results,
    total: totalResult?.count || 0,
  };
}

export async function getOpportunityWithRelations(id: string) {
  const [opportunity] = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, id))
    .limit(1);

  if (!opportunity) {
    return null;
  }

  // Get related proposals
  const relatedProposals = await db
    .select()
    .from(proposals)
    .where(eq(proposals.opportunityId, id));

  // Get related artifacts
  const relatedArtifacts = await db
    .select()
    .from(artifacts)
    .where(eq(artifacts.opportunityId, id));

  return {
    opportunity,
    proposals: relatedProposals,
    artifacts: relatedArtifacts,
  };
}

export async function getUserInsights(userId: string, organizationId?: string) {
  // Get user's opportunities
  const oppConditions = organizationId ? [eq(opportunities.organizationId, organizationId)] : [];
  const userOpportunities = await db
    .select()
    .from(opportunities)
    .where(oppConditions.length > 0 ? and(...oppConditions)! : undefined);

  // Get user's proposals
  const proposalConditions = organizationId ? [eq(proposals.organizationId, organizationId)] : [];
  const userProposals = await db
    .select()
    .from(proposals)
    .where(proposalConditions.length > 0 ? and(...proposalConditions)! : undefined);

  // Get user's agents
  const agentConditions = organizationId ? [eq(searchAgents.organizationId, organizationId)] : [];
  const userAgents = await db
    .select()
    .from(searchAgents)
    .where(agentConditions.length > 0 ? and(...agentConditions)! : undefined);

  // Get recent agent runs
  const recentRuns = userAgents.length > 0
    ? await db
        .select()
        .from(agentRuns)
        .orderBy(desc(agentRuns.startedAt))
        .limit(10)
    : [];

  // Get relevant past performance (simplified - would use RAG in production)
  const perfConditions = organizationId ? [eq(pastPerformance.organizationId, organizationId)] : [];
  const relevantPastPerformance = await db
    .select()
    .from(pastPerformance)
    .where(perfConditions.length > 0 ? and(...perfConditions)! : undefined)
    .limit(10);

  return {
    opportunities: userOpportunities,
    proposals: userProposals,
    agents: userAgents,
    recentRuns,
    pastPerformance: relevantPastPerformance,
  };
}

