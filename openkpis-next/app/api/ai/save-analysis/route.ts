import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, dashboards, insights, requirements, analyticsSolution, aiExpanded } = await request.json();

    // Get current user - try getUser() first as it's more reliable for server-side
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // If getUser() fails, try getSession() as fallback
    let userId: string | null = null;
    let currentUser: any = null;
    if (user) {
      userId = user.id;
      currentUser = user;
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        userId = session.user.id;
        currentUser = session.user;
      }
    }
    
    if (!userId || !currentUser) {
      console.error('[Save Analysis] Auth error:', userError);
      return NextResponse.json(
        { error: 'Authentication required. Please sign in with GitHub to save your analysis.' },
        { status: 401 }
      );
    }
    let savedItems = 0;

    // Save items to analysis_basket
    const allItems = [
      ...(items.kpis || []).map((item: any) => ({ type: 'kpi', item })),
      ...(items.metrics || []).map((item: any) => ({ type: 'metric', item })),
      ...(items.dimensions || []).map((item: any) => ({ type: 'dimension', item })),
    ];

    for (const { type, item } of allItems) {
      try {
        const slug = createSlug(item.name);
        const tableName = `${type}s`;

        // Find the item in Supabase by slug or name (case-insensitive)
        const { data: dbItems } = await supabase
          .from(tableName)
          .select('id, slug, name')
          .eq('status', 'published');

        const existingItem = dbItems?.find((dbItem: any) => 
          dbItem.slug === slug || 
          dbItem.name.toLowerCase() === item.name.toLowerCase() ||
          dbItem.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(dbItem.name.toLowerCase())
        );

        if (existingItem) {
          // Check if already in basket
          const { data: existingBasketItem } = await supabase
            .from('analysis_basket')
            .select('id')
            .eq('user_id', userId)
            .eq('item_type', type)
            .eq('item_id', existingItem.id)
            .single();

          if (!existingBasketItem) {
            // Add to basket
            await supabase.from('analysis_basket').insert({
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
          const userName = currentUser.user_metadata?.user_name || currentUser.email || 'unknown';
          
          // Check if dashboard already exists
          const { data: existingDashboard } = await supabase
            .from('dashboards')
            .select('id')
            .eq('slug', dashboardSlug)
            .eq('created_by', userName)
            .single();

          if (!existingDashboard) {
            // Create new dashboard record
            const { data: newDashboard, error: dashboardError } = await supabase
              .from('dashboards')
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
              await supabase.from('analysis_basket').insert({
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
              .from('analysis_basket')
              .select('id')
              .eq('user_id', userId)
              .eq('item_type', 'dashboard')
              .eq('item_id', existingDashboard.id)
              .single();

            if (!existingBasketItem) {
              await supabase.from('analysis_basket').insert({
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
            .from('user_insights')
            .select('id')
            .eq('user_id', userId)
            .eq('insight_id', insight.id)
            .single();

          if (!existingInsight) {
            // Insert new insight
            const { error: insightError } = await supabase
              .from('user_insights')
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
        .from('user_analyses')
        .insert({
          user_id: userId,
          requirements: requirements || null,
          analytics_solution: analyticsSolution || null,
          selected_items: items || {},
          selected_insights: insights?.map((i: any) => i.id) || [],
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
            .from('dashboards')
            .select('id')
            .eq('created_by', currentUser.user_metadata?.user_name || currentUser.email)
            .order('created_at', { ascending: false })
            .limit(savedDashboards);

          if (userDashboards && userDashboards.length > 0) {
            const dashboardIds = userDashboards.map(d => d.id);
            await supabase
              .from('user_analyses')
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
  } catch (error: any) {
    console.error('[Save Analysis] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save analysis' },
      { status: 500 }
    );
  }
}

