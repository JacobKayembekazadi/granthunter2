import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { proposals, jobLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id))
      .limit(1);

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const logs = await db
      .select()
      .from(jobLogs)
      .where(eq(jobLogs.proposalId, id))
      .orderBy(jobLogs.timestamp);

    return NextResponse.json({
      status: proposal.status,
      progress: proposal.progress,
      stage: proposal.stage,
      logs,
    });
  } catch (error) {
    console.error('Error fetching proposal status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

