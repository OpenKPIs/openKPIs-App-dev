import { NextRequest, NextResponse } from 'next/server';
import { getAISuggestions } from '@/lib/services/ai';

// Increase timeout for AI suggestions (up to 200 seconds)
export const maxDuration = 200;

export async function POST(request: NextRequest) {
  try {
    const { requirements, analyticsSolution, kpiCount } = await request.json();

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Requirements and analytics solution are required' },
        { status: 400 }
      );
    }

    // Validate and set default KPI count
    const validKpiCount = kpiCount && kpiCount > 0 && kpiCount <= 50 ? kpiCount : 5;

    const suggestions = await getAISuggestions(requirements, analyticsSolution, validKpiCount);

    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error('[AI Suggest] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get AI suggestions' },
      { status: 500 }
    );
  }
}
