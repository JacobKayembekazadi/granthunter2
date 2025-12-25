import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { opportunities } from '@/db/schema';
import { eq, and, or, gte, lte, sql, desc, asc, count } from 'drizzle-orm';
import { OpportunityFilters, OpportunitySort } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const page = Math.floor(offset / limit) + 1;

    // Filters
    const status = searchParams.get('status');
    const agency = searchParams.get('agency');
    const minMatchScore = searchParams.get('minMatchScore');
    const maxMatchScore = searchParams.get('maxMatchScore');
    const naicsCode = searchParams.get('naicsCode');
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(opportunities.status, status));
    }

    if (agency) {
      conditions.push(eq(opportunities.agency, agency));
    }

    if (minMatchScore !== null && minMatchScore !== undefined) {
      conditions.push(gte(opportunities.matchScore, parseInt(minMatchScore)));
    }

    if (maxMatchScore !== null && maxMatchScore !== undefined) {
      conditions.push(lte(opportunities.matchScore, parseInt(maxMatchScore)));
    }

    if (naicsCode) {
      conditions.push(eq(opportunities.naicsCode, naicsCode));
    }

    if (minValue || maxValue) {
      // Value filtering is complex since it's stored as text
      // For now, we'll do client-side filtering or convert to numeric
      // This is a simplified version - in production, you'd want to normalize values
    }

    if (dateFrom) {
      conditions.push(gte(opportunities.createdAt, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(opportunities.createdAt, new Date(dateTo)));
    }

    if (search) {
      conditions.push(
        or(
          sql`${opportunities.title} ILIKE ${`%${search}%`}`,
          sql`${opportunities.description} ILIKE ${`%${search}%`}`
        )!
      );
    }

    // Build query with conditions
    let query = db.select().from(opportunities);
    let countQuery = db.select({ count: count() }).from(opportunities);

    if (conditions.length > 0) {
      const whereClause = and(...conditions)!;
      query = query.where(whereClause) as any;
      countQuery = countQuery.where(whereClause) as any;
    }

    // Apply sorting
    const sortField = opportunities[sortBy as keyof typeof opportunities];
    if (sortField) {
      if (sortOrder === 'desc') {
        query = query.orderBy(desc(sortField)) as any;
      } else {
        query = query.orderBy(asc(sortField)) as any;
      }
    } else {
      // Default sort
      query = query.orderBy(desc(opportunities.createdAt)) as any;
    }

    // Apply pagination
    query = query.limit(limit).offset(offset) as any;

    // Execute queries
    const [results, totalResult] = await Promise.all([
      query,
      countQuery,
    ]);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      opportunities: results,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
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
    const { title, agency, value, dueDate, naicsCode, description, matchScore = 85 } = body;

    if (!title || !agency) {
      return NextResponse.json({ error: 'Title and agency are required' }, { status: 400 });
    }

    const [opportunity] = await db
      .insert(opportunities)
      .values({
        title,
        agency,
        value,
        dueDate: dueDate ? new Date(dueDate) : null,
        naicsCode,
        description,
        matchScore,
        status: 'new',
      })
      .returning();

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

