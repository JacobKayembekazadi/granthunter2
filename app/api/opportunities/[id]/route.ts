import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { opportunities } from '@/db/schema';
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

    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
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
    const updates: Partial<typeof opportunities.$inferInsert> = {};

    if (body.title) updates.title = body.title;
    if (body.agency) updates.agency = body.agency;
    if (body.value) updates.value = body.value;
    if (body.dueDate) updates.dueDate = new Date(body.dueDate);
    if (body.status) updates.status = body.status;
    if (body.matchScore !== undefined) updates.matchScore = body.matchScore;
    if (body.description) updates.description = body.description;

    const [opportunity] = await db
      .update(opportunities)
      .set(updates)
      .where(eq(opportunities.id, id))
      .returning();

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error updating opportunity:', error);
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

    await db
      .delete(opportunities)
      .where(eq(opportunities.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

