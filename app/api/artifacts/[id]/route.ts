import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { artifacts } from '@/db/schema';
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

        const [artifact] = await db
            .select()
            .from(artifacts)
            .where(eq(artifacts.id, id))
            .limit(1);

        if (!artifact) {
            return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
        }

        return NextResponse.json({ artifact });
    } catch (error) {
        console.error('Error fetching artifact:', error);
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
        const updates: Partial<typeof artifacts.$inferInsert> = {};

        if (body.name) updates.name = body.name;
        if (body.type) updates.type = body.type;
        if (body.status) updates.status = body.status;
        if (body.opportunityId !== undefined) updates.opportunityId = body.opportunityId;

        const [artifact] = await db
            .update(artifacts)
            .set(updates)
            .where(eq(artifacts.id, id))
            .returning();

        if (!artifact) {
            return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
        }

        return NextResponse.json({ artifact });
    } catch (error) {
        console.error('Error updating artifact:', error);
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

        await db.delete(artifacts).where(eq(artifacts.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting artifact:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
