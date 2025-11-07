import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const userId = user?.id || (await supabase.auth.getSession()).data.session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch specific analysis (RLS will ensure user can only access their own)
    const { data: analysis, error: analysisError } = await supabase
      .from('user_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', userId)
      .single();

    if (analysisError) {
      console.error('[Get Saved Analysis] Error:', analysisError);
      return NextResponse.json(
        { error: analysisError.message || 'Failed to fetch analysis' },
        { status: 500 }
      );
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Fetch related insights if analysis has selected_insights
    let insights: any[] = [];
    if (analysis.selected_insights && analysis.selected_insights.length > 0) {
      const { data: savedInsights } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', userId)
        .in('insight_id', analysis.selected_insights);
      
      insights = savedInsights || [];
    }

    // Fetch related dashboards if analysis has dashboard_ids
    let dashboards: any[] = [];
    if (analysis.dashboard_ids && analysis.dashboard_ids.length > 0) {
      const { data: savedDashboards } = await supabase
        .from('dashboards')
        .select('*')
        .in('id', analysis.dashboard_ids);
      
      dashboards = savedDashboards || [];
    }

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      dashboards,
    });
  } catch (error: any) {
    console.error('[Get Saved Analysis] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

