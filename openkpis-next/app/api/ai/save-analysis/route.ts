import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const analysisBasketTable = withTablePrefix('analysis_basket');
const dashboardsTable = withTablePrefix('dashboards');
const userInsightsTable = withTablePrefix('user_insights');
const userAnalysesTable = withTablePrefix('user_analyses');

type SuggestedItem = {
  name: string;
  description?: string;
  category?: string;
};

type DashboardInput = {
  title?: string;
  purpose?: string;
  description?: string;
  kpis: string[];
  layout?: string;
  visualization: string[];
};

type InsightInput = {
  id?: string;
  group?: string;
  title?: string;
  rationale?: string;
  data_requirements?: string[];
  chart_hint?: string;
  signal_strength?: string;
  insight_type?: string;
  opportunities?: string[];
};

type AnalysisItemsPayload = {
  kpis?: SuggestedItem[];
  metrics?: SuggestedItem[];
  dimensions?: SuggestedItem[];
};

type SaveAnalysisRequestBody = {
  items: AnalysisItemsPayload;
  dashboards?: DashboardInput[];
  insights?: InsightInput[];
  requirements?: string;
  analyticsSolution?: string;
  aiExpanded?: Record<string, unknown> | null;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      items,
      dashboards,
      insights,
      requirements,
      analyticsSolution,
      aiExpanded,
    }: SaveAnalysisRequestBody = await request.json();

    // Get current user - use getUser() as the canonical, validated identity
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const currentUser: User | null = user ?? null;
    const userId: string | null = currentUser?.id ?? null;
    
    if (!userId || !currentUser) {
      console.error('[Save Analysis] Auth error (getUser):', userError);
      return NextResponse.json(
        { error: 'Authentication required. Please sign in with GitHub to save your analysis.' },
        { status: 401 }
      );
    }
    let savedItems = 0;

    // Save items to analysis_basket
    const allItems = [
      ...(items.kpis || []).map((item) => ({ type: 'kpi' as const, item })),
      ...(items.metrics || []).map((item) => ({ type: 'metric' as const, item })),
      ...(items.dimensions || []).map((item) => ({ type: 'dimension' as const, item })),
    ];

    for (const { type, item } of allItems) {
      try {
        const slug = createSlug(item.name);
        const tableName = withTablePrefix(`${type}s`);

        // Find the item in Supabase by slug or name (case-insensitive)
        const { data: dbItems } = await supabase
          .from(tableName)
          .select('id, slug, name')
          .eq('status', 'published');

        const existingItem = dbItems?.find((dbItem) => 
          dbItem.slug === slug || 
          dbItem.name.toLowerCase() === item.name.toLowerCase() ||
          dbItem.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(dbItem.name.toLowerCase())
        );

        if (existingItem) {
          // Check if already in basket
          const { data: existingBasketItem } = await supabase
            .from(analysisBasketTable)
            .select('id')
            .eq('user_id', userId)
            .eq('item_type', type)
            .eq('item_id', existingItem.id)
            .single();

          if (!existingBasketItem) {
            // Add to basket
            await supabase.from(analysisBasketTable).insert({
              user_id: userId,
              item_type: type,
              item_id: existingItem.id,
              item_slug: existingItem.slug,
              item_name: existingItem.name,
            });
            savedItems++;
          }
        }
      } catch (error) {
        // Skip items that don't exist or already in basket
        console.error(`Error saving ${type} ${item.name}:`, error);
      }
    }

    // Save dashboards to dashboards table
    let savedDashboards = 0;
    if (dashboards && Array.isArray(dashboards) && dashboards.length > 0) {
      for (const dashboard of dashboards) {
        try {
          const dashboardSlug = createSlug(dashboard.title || `dashboard-${Date.now()}`);
          const userName =
            (currentUser.user_metadata?.user_name as string | undefined) ||
            currentUser.email ||
            'unknown';
          
          // Check if dashboard already exists
          const { data: existingDashboard } = await supabase
            .from(dashboardsTable)
            .select('id')
            .eq('slug', dashboardSlug)
            .eq('created_by', userName)
            .single();

          if (!existingDashboard) {
            // Create new dashboard record
            const { data: newDashboard, error: dashboardError } = await supabase
              .from(dashboardsTable)
              .insert({
                slug: dashboardSlug,
                name: dashboard.title || 'Untitled Dashboard',
                description: dashboard.purpose || dashboard.description || null,
                created_by: userName,
                owner: userName,
                status: 'draft',
                dashboard_url: null,
                screenshot_url: null,
              })
              .select()
              .single();

            if (!dashboardError && newDashboard) {
              savedDashboards++;
              
              // Save dashboard to analysis_basket
              await supabase.from(analysisBasketTable).insert({
                user_id: userId,
                item_type: 'dashboard',
                item_id: newDashboard.id,
                item_slug: dashboardSlug,
                item_name: dashboard.title || 'Untitled Dashboard',
              });
            }
          } else {
            // Dashboard exists, add to basket if not already there
            const { data: existingBasketItem } = await supabase
              .from(analysisBasketTable)
              .select('id')
              .eq('user_id', userId)
              .eq('item_type', 'dashboard')
              .eq('item_id', existingDashboard.id)
              .single();

            if (!existingBasketItem) {
              await supabase.from(analysisBasketTable).insert({
                user_id: userId,
                item_type: 'dashboard',
                item_id: existingDashboard.id,
                item_slug: dashboardSlug,
                item_name: dashboard.title || 'Untitled Dashboard',
              });
            }
          }
        } catch (error) {
          console.error(`Error saving dashboard ${dashboard.title}:`, error);
        }
      }
    }

    // Save insights to user_insights table
    let savedInsights = 0;
    if (insights && Array.isArray(insights) && insights.length > 0) {
      for (const insight of insights) {
        try {
          // Check if insight already exists for this user
            const { data: existingInsight } = await supabase
            .from(userInsightsTable)
            .select('id')
            .eq('user_id', userId)
            .eq('insight_id', insight.id)
            .single();

          if (!existingInsight) {
            // Insert new insight
            const { error: insightError } = await supabase
              .from(userInsightsTable)
              .insert({
                user_id: userId,
                insight_id: insight.id || `insight_${Date.now()}_${Math.random()}`,
                group_name: insight.group || null,
                title: insight.title || 'Untitled Insight',
                rationale: insight.rationale || null,
                data_requirements: insight.data_requirements || [],
                chart_hint: insight.chart_hint || null,
                signal_strength: insight.signal_strength || 'medium',
                insight_data: insight, // Store full insight as JSONB
              });

            if (!insightError) {
              savedInsights++;
            } else {
              console.error(`Error saving insight ${insight.id}:`, insightError);
            }
          }
        } catch (error) {
          console.error(`Error saving insight ${insight.id}:`, error);
        }
      }
    }

    // Save complete analysis session to user_analyses table
    let savedAnalysisId: string | null = null;
    try {
          const { data: newAnalysis, error: analysisError } = await supabase
        .from(userAnalysesTable)
        .insert({
          user_id: userId,
          requirements: requirements || null,
          analytics_solution: analyticsSolution || null,
          selected_items: items || {},
              selected_insights: insights?.map((insight) => insight.id).filter(Boolean) || [],
          dashboard_ids: [], // Will be populated after dashboards are saved
          analysis_data: {
            items,
            dashboards,
            insights,
            requirements,
            analytics_solution: analyticsSolution,
            ai_expanded: aiExpanded,
          },
        })
        .select()
        .single();

      if (!analysisError && newAnalysis) {
        savedAnalysisId = newAnalysis.id;
        
        // Update dashboard_ids if dashboards were saved
        if (savedDashboards > 0) {
          // Fetch recently created dashboards for this user
          const { data: userDashboards } = await supabase
            .from(dashboardsTable)
            .select('id')
            .eq('created_by', currentUser.user_metadata?.user_name || currentUser.email)
            .order('created_at', { ascending: false })
            .limit(savedDashboards);

          if (userDashboards && userDashboards.length > 0) {
            const dashboardIds = userDashboards.map(d => d.id);
            await supabase
              .from(userAnalysesTable)
              .update({ dashboard_ids: dashboardIds })
              .eq('id', savedAnalysisId);
          }
        }
      } else {
        console.error('Error saving analysis:', analysisError);
      }
    } catch (error) {
      console.error('Error saving analysis session:', error);
    }

    return NextResponse.json({
      success: true,
      savedItems,
      savedDashboards,
      savedInsights,
      analysisId: savedAnalysisId,
      message: `Successfully saved ${savedItems} item(s), ${savedDashboards} dashboard(s), and ${savedInsights} insight(s) to your analysis. Your complete analysis session has been saved and can be retrieved later.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save analysis';
    console.error('[Save Analysis] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

