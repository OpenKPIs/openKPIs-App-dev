import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

type ExcelRequestBody = {
  items: {
    kpis?: Array<{ name: string }>;
    metrics?: Array<{ name: string }>;
    dimensions?: Array<{ name: string }>;
  };
  dashboards?: Array<{
    name: string;
    description?: string;
    kpis: string[];
    layout?: string;
    visualization: string[];
  }>;
  submittedItems?: string[];
};

const kpisTable = withTablePrefix('kpis');
const metricsTable = withTablePrefix('metrics');
const dimensionsTable = withTablePrefix('dimensions');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, dashboards, submittedItems }: ExcelRequestBody = await request.json();

    if (!items) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    const submittedNames = new Set((submittedItems ?? []).map((name) => name.toLowerCase()));

    const rows: string[][] = [];
    rows.push(['Type', 'Name', 'Description', 'Category', 'Tags', 'Dashboard', 'Status']);

    const collectNames = (list: Array<{ name: string }> | undefined) =>
      (list ?? [])
        .map((entry) => entry.name?.trim())
        .filter((name): name is string => Boolean(name && !submittedNames.has(name.toLowerCase())));

    const itemNames = {
      kpis: collectNames(items.kpis),
      metrics: collectNames(items.metrics),
      dimensions: collectNames(items.dimensions),
    };

    const dashboardKpiMap: Record<string, string[]> = {};
    (dashboards ?? []).forEach((dashboard) => {
      dashboard.kpis.forEach((kpi) => {
        if (!dashboardKpiMap[kpi]) {
          dashboardKpiMap[kpi] = [];
        }
        dashboardKpiMap[kpi].push(dashboard.name);
      });
    });

    if (itemNames.kpis.length > 0) {
      const { data: kpis } = await supabase
        .from(kpisTable)
        .select('name, description, category, tags')
        .in('name', itemNames.kpis)
        .eq('status', 'published');

      (kpis ?? []).forEach((kpi) => {
        rows.push([
          'KPI',
          kpi.name,
          kpi.description || '',
          kpi.category || '',
          (kpi.tags ?? []).join('; '),
          (dashboardKpiMap[kpi.name] || []).join('; '),
          'Published',
        ]);
      });
    }

    if (itemNames.metrics.length > 0) {
      const { data: metrics } = await supabase
        .from(metricsTable)
        .select('name, description, category, tags')
        .in('name', itemNames.metrics)
        .eq('status', 'published');

      (metrics ?? []).forEach((metric) => {
        rows.push([
          'Metric',
          metric.name,
          metric.description || '',
          metric.category || '',
          (metric.tags ?? []).join('; '),
          '',
          'Published',
        ]);
      });
    }

    if (itemNames.dimensions.length > 0) {
      const { data: dimensions } = await supabase
        .from(dimensionsTable)
        .select('name, description, category, tags')
        .in('name', itemNames.dimensions)
        .eq('status', 'published');

      (dimensions ?? []).forEach((dimension) => {
        rows.push([
          'Dimension',
          dimension.name,
          dimension.description || '',
          dimension.category || '',
          (dimension.tags ?? []).join('; '),
          '',
          'Published',
        ]);
      });
    }

    if (dashboards && dashboards.length > 0) {
      rows.push([]);
      rows.push(['Dashboard', 'Description', 'KPIs', 'Layout', 'Visualizations']);
      dashboards.forEach((dashboard) => {
        rows.push([
          dashboard.name,
          dashboard.description || '',
          dashboard.kpis.join('; '),
          dashboard.layout || '',
          dashboard.visualization.join('; '),
        ]);
      });
    }

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => {
            const cellStr = String(cell ?? '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(',')
      )
      .join('\n');

    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dashboard-mapping.csv"',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate Excel file';
    console.error('[Download Excel] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

