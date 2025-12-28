import { NextRequest, NextResponse } from 'next/server';
import { samGovClient } from '@/lib/sam-gov/client';

export async function GET(request: NextRequest) {
  try {
    // Test SAM.gov API with a simple search
    const testResults = await samGovClient.searchOpportunities({
      keywords: ['technology'],
      limit: 5,
    });

    return NextResponse.json({
      success: true,
      message: 'SAM.gov API is functional',
      results: {
        total: testResults.total,
        opportunitiesFound: testResults.opportunities.length,
        hasMore: testResults.hasMore,
        sampleOpportunities: testResults.opportunities.slice(0, 2).map(opp => ({
          noticeId: opp.noticeId,
          title: opp.title,
          agency: opp.agency,
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      message: 'SAM.gov API test failed',
      details: error.stack,
    }, { status: 500 });
  }
}



