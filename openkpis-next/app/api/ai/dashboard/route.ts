import { NextRequest, NextResponse } from 'next/server';
import { getDashboardSuggestions } from '@/lib/services/ai';

// Increase timeout for dashboard generation (up to 200 seconds)
export const maxDuration = 200;

export async function POST(request: NextRequest) {
  try {
    const { requirements, analyticsSolution, selectedInsights, aiExpanded } = await request.json();

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Requirements and analytics solution are required' },
        { status: 400 }
      );
    }

    // Selected insights are required for dashboard generation
    const insights = selectedInsights || [];
    
    if (insights.length === 0) {
      return NextResponse.json(
        { error: 'At least one insight must be selected' },
        { status: 400 }
      );
    }

    const dashboards = await getDashboardSuggestions(
      requirements,
      analyticsSolution,
      insights,
      aiExpanded || null
    );

    return NextResponse.json({ dashboards });
  } catch (error: any) {
    console.error('[AI Dashboard] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get dashboard suggestions' },
      { status: 500 }
    );
  }
}

