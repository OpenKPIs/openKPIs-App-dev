import { NextRequest, NextResponse } from 'next/server';
import { getAdditionalSuggestions, AISuggestion } from '@/lib/services/ai';

export async function POST(request: NextRequest) {
  try {
    const { requirements, analyticsSolution, existingSuggestions } = await request.json();

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Requirements and analytics solution are required' },
        { status: 400 }
      );
    }

    // Flatten existing suggestions into a single array
    const allExisting: AISuggestion[] = [
      ...(existingSuggestions?.kpis || []),
      ...(existingSuggestions?.metrics || []),
      ...(existingSuggestions?.dimensions || []),
    ];

    const additional = await getAdditionalSuggestions(
      requirements,
      analyticsSolution,
      allExisting
    );

    return NextResponse.json(additional);
  } catch (error: any) {
    console.error('[AI Additional] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get additional suggestions' },
      { status: 500 }
    );
  }
}

