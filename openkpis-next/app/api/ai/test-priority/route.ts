import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to verify Priority Processing configuration
 */
export async function GET(request: NextRequest) {
  try {
    const serviceTier = process.env.OPENAI_SERVICE_TIER;
    const model = process.env.OPENAI_MODEL;
    
    return NextResponse.json({
      success: true,
      configuration: {
        model: model || 'not set',
        serviceTier: serviceTier || 'not set',
        priorityEnabled: serviceTier === 'priority',
      },
      message: serviceTier === 'priority' 
        ? '✅ Priority Processing is enabled' 
        : 'ℹ️  Priority Processing is not enabled (using standard tier)',
      note: 'If you set OPENAI_SERVICE_TIER=priority in .Credentials.txt, restart the dev server for it to take effect.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
      },
      { status: 500 }
    );
  }
}

