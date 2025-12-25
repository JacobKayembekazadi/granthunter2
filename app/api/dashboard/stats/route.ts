import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { opportunities, proposals, searchAgents } from '@/db/schema';
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';
import { DashboardStats } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization ID (simplified - in production, get from user record)
    // For now, we'll query all data (you should filter by organizationId in production)

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Get all opportunities counts
    const [totalOppsResult] = await db
      .select({ count: count() })
      .from(opportunities);

    const totalOpportunities = totalOppsResult?.count || 0;

    // Get new opportunities (status='new', created in last 7 days)
    const [newOppsResult] = await db
      .select({ count: count() })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.status, 'new'),
          gte(opportunities.createdAt, sevenDaysAgo)
        )
      );

    const newOpportunities = newOppsResult?.count || 0;

    // Get opportunities from previous period for trend calculation
    const [prevPeriodOppsResult] = await db
      .select({ count: count() })
      .from(opportunities)
      .where(
        and(
          eq(opportunities.status, 'new'),
          gte(opportunities.createdAt, fourteenDaysAgo),
          lte(opportunities.createdAt, sevenDaysAgo)
        )
      );

    const prevPeriodOpportunities = prevPeriodOppsResult?.count || 0;
    const opportunitiesChange = prevPeriodOpportunities > 0
      ? ((newOpportunities - prevPeriodOpportunities) / prevPeriodOpportunities) * 100
      : 0;

    // Get active proposals (status='processing' or 'queued')
    const [activeProposalsResult] = await db
      .select({ count: count() })
      .from(proposals)
      .where(
        sql`${proposals.status} IN ('processing', 'queued')`
      );

    const activeProposals = activeProposalsResult?.count || 0;

    // Get submitted/completed proposals
    const [submittedProposalsResult] = await db
      .select({ count: count() })
      .from(proposals)
      .where(eq(proposals.status, 'completed'));

    const submittedProposals = submittedProposalsResult?.count || 0;

    // Calculate previous period proposals for trend
    // This is simplified - in production, you'd filter by date ranges
    const proposalsChange = 0; // Placeholder for trend calculation

    // Get total value tracked (sum of opportunity values)
    // Note: value is stored as text, so we need to parse it
    const valueResults = await db
      .select({ value: opportunities.value })
      .from(opportunities)
      .where(sql`${opportunities.value} IS NOT NULL`);

    let totalValue = 0;
    valueResults.forEach(row => {
      if (row.value) {
        // Extract numeric value from string (remove $, commas, etc.)
        const numericValue = parseFloat(row.value.replace(/[^0-9.-]+/g, ''));
        if (!isNaN(numericValue)) {
          totalValue += numericValue;
        }
      }
    });

    const totalValueTracked = formatCurrency(totalValue);

    // Get average match score
    const [avgMatchResult] = await db
      .select({ avg: sql<number>`AVG(${opportunities.matchScore})` })
      .from(opportunities)
      .where(sql`${opportunities.matchScore} IS NOT NULL`);

    const averageMatchScore = Math.round(avgMatchResult?.avg || 0);

    // Get active search agents
    const [activeAgentsResult] = await db
      .select({ count: count() })
      .from(searchAgents)
      .where(eq(searchAgents.status, 'Active'));

    const activeAgents = activeAgentsResult?.count || 0;

    // Get upcoming deadlines (due in next 7 days)
    const [upcomingDeadlinesResult] = await db
      .select({ count: count() })
      .from(opportunities)
      .where(
        and(
          sql`${opportunities.dueDate} IS NOT NULL`,
          gte(opportunities.dueDate, now),
          lte(opportunities.dueDate, sevenDaysFromNow)
        )
      );

    const upcomingDeadlines = upcomingDeadlinesResult?.count || 0;

    const stats: DashboardStats = {
      totalOpportunities,
      newOpportunities,
      activeProposals,
      submittedProposals,
      totalValueTracked,
      averageMatchScore,
      activeAgents,
      upcomingDeadlines,
      trends: {
        opportunitiesChange: Math.round(opportunitiesChange * 100) / 100,
        proposalsChange: Math.round(proposalsChange * 100) / 100,
      },
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

