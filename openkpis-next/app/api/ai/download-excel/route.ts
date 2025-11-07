import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, dashboards, submittedItems } = await request.json();

    if (!items) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    const submittedNames = new Set(submittedItems || []);
    
    // Create a simple CSV format (Excel-compatible)
    // In production, you might want to use a library like xlsx
    const rows: string[][] = [];
    
    // Header
    rows.push(['Type', 'Name', 'Description', 'Category', 'Tags', 'Dashboard', 'Status']);
    
    // Get published items
    const itemNames = {
      kpis: (items.kpis || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
      metrics: (items.metrics || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
      dimensions: (items.dimensions || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
    };

    // Map dashboards to their KPIs
    const dashboardKpiMap: Record<string, string[]> = {};
    (dashboards || []).forEach((dashboard: any) => {
      dashboard.kpis.forEach((kpi: string) => {
        if (!dashboardKpiMap[kpi]) dashboardKpiMap[kpi] = [];
        dashboardKpiMap[kpi].push(dashboard.name);
      });
    });

    // Fetch and add KPIs
    if (itemNames.kpis.length > 0) {
      const { data: kpis } = await supabase
        .from('kpis')
        .select('name, description, category, tags')
        .in('name', itemNames.kpis)
        .eq('status', 'published');

      kpis?.forEach((kpi: any) => {
        rows.push([
          'KPI',
          kpi.name,
          kpi.description || '',
          kpi.category || '',
          (kpi.tags || []).join('; '),
          (dashboardKpiMap[kpi.name] || []).join('; ') || '',
          'Published',
        ]);
      });
    }

    // Fetch and add Metrics
    if (itemNames.metrics.length > 0) {
      const { data: metrics } = await supabase
        .from('metrics')
        .select('name, description, category, tags')
        .in('name', itemNames.metrics)
        .eq('status', 'published');

      metrics?.forEach((metric: any) => {
        rows.push([
          'Metric',
          metric.name,
          metric.description || '',
          metric.category || '',
          (metric.tags || []).join('; '),
          '',
          'Published',
        ]);
      });
    }

    // Fetch and add Dimensions
    if (itemNames.dimensions.length > 0) {
      const { data: dimensions } = await supabase
        .from('dimensions')
        .select('name, description, category, tags')
        .in('name', itemNames.dimensions)
        .eq('status', 'published');

      dimensions?.forEach((dim: any) => {
        rows.push([
          'Dimension',
          dim.name,
          dim.description || '',
          dim.category || '',
          (dim.tags || []).join('; '),
          '',
          'Published',
        ]);
      });
    }

    // Add dashboard information
    if (dashboards && dashboards.length > 0) {
      rows.push([]); // Empty row
      rows.push(['Dashboard', 'Description', 'KPIs', 'Layout', 'Visualizations']);
      dashboards.forEach((dashboard: any) => {
        rows.push([
          dashboard.name,
          dashboard.description || '',
          dashboard.kpis.join('; '),
          dashboard.layout || '',
          dashboard.visualization.join('; '),
        ]);
      });
    }

    // Convert to CSV format
    const csvContent = rows.map(row => 
      row.map(cell => {
        const cellStr = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');

    // Add BOM for Excel UTF-8 support
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dashboard-mapping.csv"',
      },
    });
  } catch (error: any) {
    console.error('[Download Excel] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}

