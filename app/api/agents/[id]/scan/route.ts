import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { searchAgents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/inngest/client';

export async function POST(
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

    // Update lastRun timestamp
    await db
      .update(searchAgents)
      .set({ lastRun: new Date() })
      .where(eq(searchAgents.id, id));

    // Try to trigger scan via Inngest (optional)
    let inngestTriggered = false;
    try {
      await inngest.send({
        name: 'agent/scan',
        data: { agentId: id },
      });
      inngestTriggered = true;
    } catch (inngestError) {
      console.warn('Inngest not available, scan will run manually:', inngestError);
    }

    return NextResponse.json({
      message: 'Scan triggered',
      inngestTriggered,
    });
  } catch (error: any) {
    console.error('Error triggering scan:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
