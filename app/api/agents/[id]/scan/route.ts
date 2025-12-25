import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // Trigger scan
    await inngest.send({
      name: 'agent/scan',
      data: { agentId: id },
    });

    return NextResponse.json({ message: 'Scan triggered' });
  } catch (error) {
    console.error('Error triggering scan:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

