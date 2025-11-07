import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, submittedItems } = await request.json();

    if (!items) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    const submittedNames = new Set(submittedItems || []);
    const sqlQueries: string[] = [];

    // Get published items from Supabase (exclude newly submitted items)
    const itemNames = {
      kpis: (items.kpis || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
      metrics: (items.metrics || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
      dimensions: (items.dimensions || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
    };

    // Fetch KPIs - Use case-insensitive matching with OR condition
    if (itemNames.kpis.length > 0) {
      // Fetch all published KPIs and filter client-side for exact/partial matches
      const { data: allKpis } = await supabase
        .from('kpis')
        .select('name, sql_query, slug')
        .eq('status', 'published');

      // Filter for matching items (case-insensitive)
      const matchingKpis = allKpis?.filter((kpi: any) => {
        const kpiNameLower = kpi.name.toLowerCase();
        return itemNames.kpis.some((itemName: string) => 
          kpiNameLower === itemName.toLowerCase() || 
          kpiNameLower.includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(kpiNameLower)
        );
      });

      matchingKpis?.forEach((kpi: any) => {
        if (kpi.sql_query && kpi.sql_query.trim()) {
          sqlQueries.push(`-- KPI: ${kpi.name}\n${kpi.sql_query}\n`);
        }
      });
    }

    // Fetch Metrics - Use case-insensitive matching
    if (itemNames.metrics.length > 0) {
      const { data: allMetrics } = await supabase
        .from('metrics')
        .select('name, sql_query, slug')
        .eq('status', 'published');

      const matchingMetrics = allMetrics?.filter((metric: any) => {
        const metricNameLower = metric.name.toLowerCase();
        return itemNames.metrics.some((itemName: string) => 
          metricNameLower === itemName.toLowerCase() || 
          metricNameLower.includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(metricNameLower)
        );
      });

      matchingMetrics?.forEach((metric: any) => {
        if (metric.sql_query && metric.sql_query.trim()) {
          sqlQueries.push(`-- Metric: ${metric.name}\n${metric.sql_query}\n`);
        }
      });
    }

    // Combine all SQL queries
    const sqlContent = sqlQueries.length > 0
      ? sqlQueries.join('\n\n-- ' + '='.repeat(70) + '\n\n')
      : '-- No SQL queries available for published items in your analysis.\n-- Newly submitted items are not included until they are published.';

    return new NextResponse(sqlContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="analysis-sql-queries.sql"',
      },
    });
  } catch (error: any) {
    console.error('[Download SQL] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate SQL file' },
      { status: 500 }
    );
  }
}

