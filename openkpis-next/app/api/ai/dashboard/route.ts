import { NextRequest, NextResponse } from 'next/server';
import { getDashboardSuggestions, type DashboardSuggestionDetailed } from '@/lib/services/ai';

// Increase timeout for dashboard generation (up to 200 seconds)
export const maxDuration = 200;

interface InsightItem {
  id: string;
  title: string;
  group: string;
  rationale: string;
  chart_hint: string;
}

type DashboardRequestBody = {
  requirements: string;
  analyticsSolution: string;
  selectedInsights: InsightItem[];
  aiExpanded?: Record<string, unknown> | null;
  datasetSchema?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const {
      requirements,
      analyticsSolution,
      selectedInsights,
      aiExpanded,
      datasetSchema,
    } = (await request.json()) as DashboardRequestBody;

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
      aiExpanded || null,
      datasetSchema
    );

    return NextResponse.json<{ dashboards: DashboardSuggestionDetailed[] }>({ dashboards });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get dashboard suggestions';
    console.error('[AI Dashboard] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

