import { NextRequest, NextResponse } from 'next/server';
import { getInsightSuggestions, type GroupedInsight } from '@/lib/services/ai';
import { authorizeAIRequest, incrementAIUsage } from '@/lib/server/aiUsage';

// Increase timeout for insights generation (up to 200 seconds)
export const maxDuration = 200;

type InsightRequestBody = {
  requirements: string;
  analyticsSolution: string;
  aiExpanded?: Record<string, unknown> | null;
  itemsInAnalysis?: {
    kpis?: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
    metrics?: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
    dimensions?: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
  };
  apiKey?: string;
  model?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { requirements, analyticsSolution, aiExpanded, itemsInAnalysis, apiKey, model }: InsightRequestBody = await request.json();

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Missing required fields: requirements, analyticsSolution' },
        { status: 400 }
      );
    }

    const auth = await authorizeAIRequest(apiKey);
    if (auth.errorResponse) return auth.errorResponse;

    const insights = await getInsightSuggestions(
      requirements,
      analyticsSolution,
      aiExpanded || null,
      itemsInAnalysis?.kpis || [],
      itemsInAnalysis?.metrics || [],
      itemsInAnalysis?.dimensions || [],
      auth.apiKey,
      model
    );

    if (auth.isUsingDefaultKey && auth.userId) {
      await incrementAIUsage(auth.userId, auth.currentCount);
    }

    return NextResponse.json<{ insights: GroupedInsight[] }>({ insights });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get insights';
    console.error('[API] AI insights error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

