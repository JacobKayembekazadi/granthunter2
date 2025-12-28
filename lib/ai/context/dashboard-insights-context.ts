import { getUserInsights } from '@/lib/db/dashboard-queries';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { retrievePastPerformance } from '@/lib/rag/retriever';
import { DashboardContext } from '@/types/dashboard';

export async function buildDashboardInsightsContext(
  userId: string,
  organizationId?: string
): Promise<DashboardContext> {
  // Fetch user profile
  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = {
    name: userData?.fullName || userData?.email?.split('@')[0] || 'Operator',
    org: organizationId || 'Unknown',
  };

  // Fetch all relevant data
  const insightsData = await getUserInsights(userId, organizationId);

  // Group opportunities by status
  const byStatus: Record<string, number> = {};
  insightsData.opportunities.forEach(opp => {
    byStatus[opp.status] = (byStatus[opp.status] || 0) + 1;
  });

  // Group opportunities by agency
  const byAgency: Record<string, number> = {};
  insightsData.opportunities.forEach(opp => {
    if (opp.agency) {
      byAgency[opp.agency] = (byAgency[opp.agency] || 0) + 1;
    }
  });

  // Get high match opportunities
  const highMatch = insightsData.opportunities
    .filter(o => o.matchScore !== null && o.matchScore > 80)
    .map(o => ({ id: o.id, matchScore: o.matchScore || 0 }));

  // Get upcoming deadlines (next 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = insightsData.opportunities
    .filter(o => {
      if (!o.dueDate) return false;
      const dueDate = typeof o.dueDate === 'string' ? new Date(o.dueDate) : o.dueDate;
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .map(o => ({
      id: o.id,
      dueDate: typeof o.dueDate === 'string' ? o.dueDate : o.dueDate?.toISOString() || '',
    }));

  // Calculate proposal metrics
  const completedProposals = insightsData.proposals.filter(p => p.status === 'completed');
  const completionRate = insightsData.proposals.length > 0
    ? (completedProposals.length / insightsData.proposals.length) * 100
    : 0;

  // Calculate average time to complete (simplified)
  const averageTimeToComplete = 0; // Would calculate from createdAt to updatedAt for completed proposals

  // Get active agents
  const activeAgents = insightsData.agents.filter(a => a.status === 'Active');

  // Get relevant past performance using RAG
  // Use a general query based on user's opportunities
  const queryText = insightsData.opportunities
    .slice(0, 3)
    .map(o => o.title)
    .join(' ');
  
  const relevantPastPerf = queryText
    ? await retrievePastPerformance(queryText, 5)
    : [];

  // Analyze win patterns from past performance
  const topAgencies: string[] = [];
  const agencyCounts: Record<string, number> = {};
  
  insightsData.pastPerformance.forEach(pp => {
    if (pp.agency) {
      agencyCounts[pp.agency] = (agencyCounts[pp.agency] || 0) + 1;
    }
  });

  Object.entries(agencyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .forEach(([agency]) => topAgencies.push(agency));

  const winRate = 0; // Would calculate from historical data

  const context: DashboardContext = {
    user,
    opportunities: {
      total: insightsData.opportunities.length,
      byStatus,
      byAgency,
      highMatch,
      upcomingDeadlines,
    },
    proposals: {
      active: insightsData.proposals.filter(p => p.status === 'processing' || p.status === 'queued').length,
      completed: completedProposals.length,
      metrics: {
        completionRate,
        averageTimeToComplete,
      },
    },
    agents: {
      active: activeAgents.length,
      recentRuns: insightsData.recentRuns.map(run => ({
        id: run.id,
        opportunitiesFound: run.opportunitiesFound || 0,
      })),
    },
    pastPerformance: {
      relevant: relevantPastPerf.map(pp => ({
        id: pp.id,
        title: pp.title,
        agency: pp.agency || '',
      })),
      patterns: {
        topAgencies,
        winRate,
      },
    },
  };

  return context;
}

