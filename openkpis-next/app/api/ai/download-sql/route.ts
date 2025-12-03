import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

type AnalysisItemsPayload = {
  items: {
    kpis?: Array<{ name: string }>;
    metrics?: Array<{ name: string }>;
    dimensions?: Array<{ name: string }>;
  };
  submittedItems?: string[];
};

const kpisTable = withTablePrefix('kpis');
const metricsTable = withTablePrefix('metrics');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, submittedItems }: AnalysisItemsPayload = await request.json();

    if (!items) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    const submittedNames = new Set((submittedItems ?? []).map((name) => name.toLowerCase()));
    const sqlQueries: string[] = [];

    const collectNames = (list: Array<{ name: string }> | undefined) =>
      (list ?? [])
        .map((entry) => entry.name?.trim())
        .filter((name): name is string => Boolean(name && !submittedNames.has(name.toLowerCase())));

    const itemNames = {
      kpis: collectNames(items.kpis),
      metrics: collectNames(items.metrics),
    };

    if (itemNames.kpis.length > 0) {
      const { data: allKpis } = await supabase
        .from(kpisTable)
        .select('name, sql_query')
        .eq('status', 'published');

      const matchingKpis = (allKpis ?? []).filter((kpi) => {
        const kpiNameLower = kpi.name.toLowerCase();
        return itemNames.kpis.some((itemName) => {
          const lower = itemName.toLowerCase();
          return (
            kpiNameLower === lower ||
            kpiNameLower.includes(lower) ||
            lower.includes(kpiNameLower)
          );
        });
      });

      matchingKpis.forEach((kpi) => {
        if (kpi.sql_query && kpi.sql_query.trim()) {
          sqlQueries.push(`-- KPI: ${kpi.name}\n${kpi.sql_query}\n`);
        }
      });
    }

    if (itemNames.metrics.length > 0) {
      const { data: allMetrics } = await supabase
        .from(metricsTable)
        .select('name, sql_query')
        .eq('status', 'published');

      const matchingMetrics = (allMetrics ?? []).filter((metric) => {
        const metricNameLower = metric.name.toLowerCase();
        return itemNames.metrics.some((itemName) => {
          const lower = itemName.toLowerCase();
          return (
            metricNameLower === lower ||
            metricNameLower.includes(lower) ||
            lower.includes(metricNameLower)
          );
        });
      });

      matchingMetrics.forEach((metric) => {
        if (metric.sql_query && metric.sql_query.trim()) {
          sqlQueries.push(`-- Metric: ${metric.name}\n${metric.sql_query}\n`);
        }
      });
    }

    const sqlContent = sqlQueries.length > 0
      ? sqlQueries.join('\n\n-- ' + '='.repeat(70) + '\n\n')
      : '-- No SQL queries available for published items in your analysis.\n-- Newly submitted items are not included until they are published.';

    return new NextResponse(sqlContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="analysis-sql-queries.sql"',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate SQL file';
    console.error('[Download SQL] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

