import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { opportunities, proposals } from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

interface Notification {
  id: string;
  type: 'opportunity' | 'proposal' | 'deadline' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unread') === 'true';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications: Notification[] = [];

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Deadline notifications (upcoming deadlines)
    if (!type || type === 'deadline') {
      const upcomingDeadlines = await db
        .select()
        .from(opportunities)
        .where(
          and(
            sql`${opportunities.dueDate} IS NOT NULL`,
            gte(opportunities.dueDate, now),
            lte(opportunities.dueDate, sevenDaysFromNow)
          )!
        )
        .limit(20);

      upcomingDeadlines.forEach(opp => {
        const dueDate = typeof opp.dueDate === 'string' ? new Date(opp.dueDate) : opp.dueDate;
        if (dueDate) {
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const urgency = daysUntilDue <= 1 ? 'URGENT' : daysUntilDue <= 3 ? 'SOON' : 'UPCOMING';

          notifications.push({
            id: `deadline-${opp.id}`,
            type: 'deadline',
            title: `${urgency}: ${opp.title}`,
            message: `Deadline in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
            timestamp: opp.updatedAt?.toString() || new Date().toISOString(),
            read: false,
            actionUrl: `/opportunities/${opp.id}`,
          });
        }
      });
    }

    // Proposal status notifications
    if (!type || type === 'proposal') {
      const recentProposals = await db
        .select()
        .from(proposals)
        .where(sql`${proposals.status} IN ('completed', 'failed')`)
        .orderBy(sql`${proposals.updatedAt} DESC`)
        .limit(10);

      recentProposals.forEach(proposal => {
        notifications.push({
          id: `proposal-${proposal.id}`,
          type: 'proposal',
          title: `Proposal ${proposal.status === 'completed' ? 'Completed' : 'Failed'}: ${proposal.name}`,
          message: proposal.status === 'completed' 
            ? 'Your proposal has been completed and is ready for review.'
            : 'Proposal generation encountered an error.',
          timestamp: proposal.updatedAt?.toString() || new Date().toISOString(),
          read: false,
          actionUrl: `/factory`,
        });
      });
    }

    // New opportunities notifications (high match scores)
    if (!type || type === 'opportunity') {
      const newHighMatchOpps = await db
        .select()
        .from(opportunities)
        .where(
          and(
            eq(opportunities.status, 'new'),
            sql`${opportunities.matchScore} >= 80`,
            gte(opportunities.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
          )!
        )
        .limit(10);

      newHighMatchOpps.forEach(opp => {
        notifications.push({
          id: `opportunity-${opp.id}`,
          type: 'opportunity',
          title: `High-Match Opportunity: ${opp.title}`,
          message: `New opportunity with ${opp.matchScore}% match score found.`,
          timestamp: opp.createdAt?.toString() || new Date().toISOString(),
          read: false,
          actionUrl: `/opportunities/${opp.id}`,
        });
      });
    }

    // Sort by timestamp (most recent first)
    notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Filter by type if specified
    const filtered = type 
      ? notifications.filter(n => n.type === type)
      : notifications;

    // Filter by unread if specified
    const filteredByRead = unreadOnly
      ? filtered.filter(n => !n.read)
      : filtered;

    // Apply pagination
    const paginated = filteredByRead.slice(offset, offset + limit);

    return NextResponse.json({
      notifications: paginated,
      total: filteredByRead.length,
      unreadCount: filteredByRead.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds must be an array' }, { status: 400 });
    }

    // In a real implementation, you'd mark these as read in a database
    // For now, we'll just return success since notifications are computed on-the-fly
    // In production, you'd want to store read status in a user_notifications table

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



