import { NextRequest, NextResponse } from 'next/server';
import { getInsightSuggestions } from '@/lib/services/ai';

// Increase timeout for insights generation (up to 200 seconds)
export const maxDuration = 200;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requirements, analyticsSolution, aiExpanded, itemsInAnalysis } = body;

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Missing required fields: requirements, analyticsSolution' },
        { status: 400 }
      );
    }

    const insights = await getInsightSuggestions(
      requirements,
      analyticsSolution,
      aiExpanded || null,
      itemsInAnalysis?.kpis || [],
      itemsInAnalysis?.metrics || [],
      itemsInAnalysis?.dimensions || []
    );

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('[API] AI insights error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get insights' },
      { status: 500 }
    );
  }
}

