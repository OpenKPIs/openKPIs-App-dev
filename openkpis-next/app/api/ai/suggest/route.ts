import { NextRequest, NextResponse } from 'next/server';
import { getAISuggestions, type AIResponse } from '@/lib/services/ai';
import { authorizeAIRequest, incrementAIUsage } from '@/lib/server/aiUsage';

// Increase timeout for AI suggestions (up to 200 seconds)
export const maxDuration = 200;

type SuggestRequestBody = {
  requirements: string;
  analyticsSolution: string;
  kpiCount?: number;
  apiKey?: string;
  model?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { requirements, analyticsSolution, kpiCount, apiKey, model }: SuggestRequestBody = await request.json();

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Requirements and analytics solution are required' },
        { status: 400 }
      );
    }

    // Validate and set default KPI count
    const validKpiCount = kpiCount && kpiCount > 0 && kpiCount <= 50 ? kpiCount : 5;

    const auth = await authorizeAIRequest(apiKey);
    if (auth.errorResponse) return auth.errorResponse;

    const suggestions = await getAISuggestions(requirements, analyticsSolution, validKpiCount, auth.apiKey, model);

    if (auth.isUsingDefaultKey && auth.userId) {
      await incrementAIUsage(auth.userId, auth.currentCount);
    }

    return NextResponse.json<AIResponse>(suggestions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get AI suggestions';
    console.error('[AI Suggest] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
