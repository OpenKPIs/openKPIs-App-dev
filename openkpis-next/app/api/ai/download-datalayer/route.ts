import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

type DataLayerRequestBody = {
  items: {
    kpis?: Array<{ name: string }>;
    metrics?: Array<{ name: string }>;
    dimensions?: Array<{ name: string }>;
  };
  analyticsSolution: string;
  submittedItems?: string[];
};

type MappingValue = Record<string, unknown>;

const kpisTable = withTablePrefix('kpis');
const eventsTable = withTablePrefix('events');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { items, analyticsSolution, submittedItems }: DataLayerRequestBody = await request.json();

    if (!items || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Items and analytics solution are required' },
        { status: 400 }
      );
    }

    const submittedNames = new Set((submittedItems ?? []).map((name) => name.toLowerCase()));
    const dataLayer: {
      solution: string;
      events: Array<{ name: string; mapping: MappingValue }>;
      dataLayer: Record<string, unknown>;
      timestamp: string;
      note: string;
    } = {
      solution: analyticsSolution,
      events: [],
      dataLayer: {},
      timestamp: new Date().toISOString(),
      note: 'Only published items are included. Newly submitted items will appear after editor approval and publishing.',
    };

    const collectNames = (list: Array<{ name: string }> | undefined) =>
      (list ?? [])
        .map((entry) => entry.name?.trim())
        .filter((name): name is string => Boolean(name && !submittedNames.has(name.toLowerCase())));

    const requestedKpis = collectNames(items.kpis);

    const solutionLower = analyticsSolution.toLowerCase();

    if (requestedKpis.length > 0) {
      const { data: allKpis } = await supabase
        .from(kpisTable)
        .select('name, data_layer_mapping, ga4_implementation, adobe_implementation')
        .eq('status', 'published');

      const matchingKpis = (allKpis ?? []).filter((kpi) => {
        const kpiNameLower = kpi.name.toLowerCase();
        return requestedKpis.some((itemName) => {
          const lower = itemName.toLowerCase();
          return (
            kpiNameLower === lower ||
            kpiNameLower.includes(lower) ||
            lower.includes(kpiNameLower)
          );
        });
      });

      matchingKpis.forEach((kpi) => {
        if (kpi.data_layer_mapping) {
          try {
            const mapping =
              typeof kpi.data_layer_mapping === 'string'
                ? (JSON.parse(kpi.data_layer_mapping) as MappingValue)
                : kpi.data_layer_mapping;
            Object.assign(dataLayer.dataLayer, mapping);
          } catch {
            // ignore malformed JSON
          }
        }
        if (kpi.ga4_implementation && solutionLower.includes('ga4')) {
          dataLayer.dataLayer[`${kpi.name}_ga4`] = kpi.ga4_implementation;
        }
        if (kpi.adobe_implementation && solutionLower.includes('adobe')) {
          dataLayer.dataLayer[`${kpi.name}_adobe`] = kpi.adobe_implementation;
        }
      });
    }

    const { data: events } = await supabase
      .from(eventsTable)
      .select('name, data_layer_mapping')
      .eq('status', 'published')
      .limit(50);

    (events ?? []).forEach((event) => {
      if (!event.data_layer_mapping) return;
      try {
        const mapping =
          typeof event.data_layer_mapping === 'string'
            ? (JSON.parse(event.data_layer_mapping) as MappingValue)
            : event.data_layer_mapping;
        dataLayer.events.push({
          name: event.name,
          mapping,
        });
      } catch {
        // ignore malformed JSON
      }
    });

    return new NextResponse(JSON.stringify(dataLayer, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="datalayer-events-${analyticsSolution.replace(/\s+/g, '-').toLowerCase()}.json"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate data layer file';
    console.error('[Download DataLayer] Error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

