import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { artifacts, opportunities } from '@/db/schema';
import { eq, desc, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');

        let query = db
            .select({
                id: artifacts.id,
                name: artifacts.name,
                type: artifacts.type,
                status: artifacts.status,
                size: artifacts.size,
                opportunityId: artifacts.opportunityId,
                proposalId: artifacts.proposalId,
                storageUrl: artifacts.storageUrl,
                createdAt: artifacts.createdAt,
                updatedAt: artifacts.updatedAt,
                opportunity: {
                    id: opportunities.id,
                    title: opportunities.title,
                },
            })
            .from(artifacts)
            .leftJoin(opportunities, eq(artifacts.opportunityId, opportunities.id))
            .orderBy(desc(artifacts.createdAt));

        const result = await query;

        // Filter by search if provided
        let filteredArtifacts = result;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredArtifacts = result.filter(a =>
                a.name.toLowerCase().includes(searchLower) ||
                a.opportunity?.title?.toLowerCase().includes(searchLower)
            );
        }

        // Format response
        const formattedArtifacts = filteredArtifacts.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type,
            status: a.status,
            size: a.size ? `${(a.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
            date: new Date(a.createdAt).toISOString().split('T')[0],
            opportunityId: a.opportunityId,
            oppName: a.opportunity?.title || null,
            storageUrl: a.storageUrl,
        }));

        return NextResponse.json({ artifacts: formattedArtifacts });
    } catch (error) {
        console.error('Error fetching artifacts:', error);
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
        const { name, type, opportunityId, proposalId, status = 'ready', size } = body;

        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }

        // Create artifact
        const [artifact] = await db
            .insert(artifacts)
            .values({
                name,
                type,
                opportunityId: opportunityId || null,
                proposalId: proposalId || null,
                status,
                size: size || null,
            })
            .returning();

        return NextResponse.json({ artifact }, { status: 201 });
    } catch (error) {
        console.error('Error creating artifact:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
