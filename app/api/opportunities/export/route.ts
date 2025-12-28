import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpportunitiesWithFilters } from '@/lib/db/dashboard-queries';
import { OpportunityFilters, OpportunitySort } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;

    // Build filters from query params
    const filters: OpportunityFilters = {};
    if (searchParams.get('status')) filters.status = searchParams.get('status')!;
    if (searchParams.get('agency')) filters.agency = searchParams.get('agency')!;
    if (searchParams.get('minMatchScore')) filters.minMatchScore = parseInt(searchParams.get('minMatchScore')!);
    if (searchParams.get('maxMatchScore')) filters.maxMatchScore = parseInt(searchParams.get('maxMatchScore')!);
    if (searchParams.get('naicsCode')) filters.naicsCode = searchParams.get('naicsCode')!;
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;

    const sort: OpportunitySort = {
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    // Get all opportunities (no pagination for export)
    const result = await getOpportunitiesWithFilters(
      filters,
      sort,
      { limit: 10000, offset: 0 } // Large limit to get all
    );

    // Convert to CSV
    const headers = [
      'ID',
      'Title',
      'Agency',
      'Value',
      'Due Date',
      'Status',
      'Match Score',
      'NAICS Code',
      'Description',
      'Created At',
      'Updated At',
    ];

    const csvRows = [
      headers.join(','),
      ...result.opportunities.map(opp => {
        const row = [
          opp.id,
          `"${(opp.title || '').replace(/"/g, '""')}"`,
          `"${(opp.agency || '').replace(/"/g, '""')}"`,
          `"${(opp.value || '').replace(/"/g, '""')}"`,
          opp.dueDate ? new Date(opp.dueDate).toISOString().split('T')[0] : '',
          opp.status || '',
          opp.matchScore?.toString() || '0',
          `"${(opp.naicsCode || '').replace(/"/g, '""')}"`,
          `"${(opp.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          opp.createdAt ? new Date(opp.createdAt).toISOString() : '',
          opp.updatedAt ? new Date(opp.updatedAt).toISOString() : '',
        ];
        return row.join(',');
      }),
    ];

    const csv = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="opportunities-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



