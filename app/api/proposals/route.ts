import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { proposals } from '@/db/schema';
import { inngest } from '@/inngest/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proposalsList = await db
      .select()
      .from(proposals)
      .orderBy(proposals.createdAt);

    return NextResponse.json({ proposals: proposalsList });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { name, type, opportunityId, priority = 'Normal', configuration } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    // Create proposal
    const [proposal] = await db
      .insert(proposals)
      .values({
        name,
        type,
        opportunityId: opportunityId || null,
        priority,
        status: 'processing',
        progress: 0,
        stage: 'Starting',
        configuration: configuration || {
          model: 'Gemini-2.0-Flash',
          creativity: 'Standard',
          depth: 'Standard',
        },
      })
      .returning();

    // Try to trigger generation workflow (optional - doesn't break if Inngest not configured)
    try {
      await inngest.send({
        name: 'proposal/generate',
        data: { proposalId: proposal.id },
      });
    } catch (inngestError) {
      console.warn('Inngest not available, skipping workflow trigger:', inngestError);
      // Update status to indicate manual processing might be needed
    }

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating proposal:', error);
    return NextResponse.json({
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

