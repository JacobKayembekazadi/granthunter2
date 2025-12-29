import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { proposals } from '@/db/schema';
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

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    const body = await request.json();
    const updates: Partial<typeof proposals.$inferInsert> = {};

    if (body.name) updates.name = body.name;
    if (body.type) updates.type = body.type;
    if (body.status) updates.status = body.status;
    if (body.priority) updates.priority = body.priority;
    if (body.progress !== undefined) updates.progress = body.progress;
    if (body.stage) updates.stage = body.stage;

    const [proposal] = await db
      .update(proposals)
      .set(updates)
      .where(eq(proposals.id, id))
      .returning();

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    await db.delete(proposals).where(eq(proposals.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
