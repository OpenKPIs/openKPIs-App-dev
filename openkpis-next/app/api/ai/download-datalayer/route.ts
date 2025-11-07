import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, analyticsSolution, submittedItems } = await request.json();

    if (!items || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Items and analytics solution are required' },
        { status: 400 }
      );
    }

    const submittedNames = new Set(submittedItems || []);
    const dataLayer: any = {
      solution: analyticsSolution,
      events: [],
      dataLayer: {},
      timestamp: new Date().toISOString(),
      note: 'Only published items are included. Newly submitted items will appear after editor approval and publishing.',
    };

    // Get published items from Supabase
    const itemNames = {
      kpis: (items.kpis || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
      metrics: (items.metrics || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
      dimensions: (items.dimensions || []).filter((item: any) => !submittedNames.has(item.name)).map((item: any) => item.name),
    };

    // Fetch KPIs, Metrics, Dimensions and extract data layer mappings
    if (itemNames.kpis.length > 0) {
      const { data: allKpis } = await supabase
        .from('kpis')
        .select('name, data_layer_mapping, ga4_implementation, adobe_implementation, slug')
        .eq('status', 'published');

      const matchingKpis = allKpis?.filter((kpi: any) => {
        const kpiNameLower = kpi.name.toLowerCase();
        return itemNames.kpis.some((itemName: string) => 
          kpiNameLower === itemName.toLowerCase() || 
          kpiNameLower.includes(itemName.toLowerCase()) ||
          itemName.toLowerCase().includes(kpiNameLower)
        );
      });

      matchingKpis?.forEach((kpi: any) => {
        if (kpi.data_layer_mapping) {
          try {
            const mapping = typeof kpi.data_layer_mapping === 'string' 
              ? JSON.parse(kpi.data_layer_mapping) 
              : kpi.data_layer_mapping;
            Object.assign(dataLayer.dataLayer, mapping);
          } catch (e) {
            // Invalid JSON, skip
          }
        }
        // Also include GA4/Adobe implementations as text
        if (kpi.ga4_implementation && analyticsSolution.toLowerCase().includes('ga4')) {
          dataLayer.dataLayer[`${kpi.name}_ga4`] = kpi.ga4_implementation;
        }
        if (kpi.adobe_implementation && analyticsSolution.toLowerCase().includes('adobe')) {
          dataLayer.dataLayer[`${kpi.name}_adobe`] = kpi.adobe_implementation;
        }
      });
    }

    // Fetch Events (if any are in the analysis)
    // For now, we'll include common events based on KPIs
    const { data: events } = await supabase
      .from('events')
      .select('name, data_layer_mapping, ga4_implementation, adobe_implementation')
      .eq('status', 'published')
      .limit(50); // Get recent published events

    events?.forEach((event: any) => {
      if (event.data_layer_mapping) {
        try {
          const mapping = typeof event.data_layer_mapping === 'string'
            ? JSON.parse(event.data_layer_mapping)
            : event.data_layer_mapping;
          dataLayer.events.push({
            name: event.name,
            mapping,
          });
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    });

    return new NextResponse(JSON.stringify(dataLayer, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="datalayer-events-${analyticsSolution.replace(/\s+/g, '-').toLowerCase()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('[Download DataLayer] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate data layer file' },
      { status: 500 }
    );
  }
}

