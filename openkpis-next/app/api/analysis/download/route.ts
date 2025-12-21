import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

type ItemType = 'kpi' | 'event' | 'dimension' | 'metric' | 'dashboard';

type AnalysisItem = {
  item_type: ItemType;
  item_id: string;
};

type ExportableEntity = {
  id: string;
  slug: string | null;
  name: string;
  sql_query?: string | null;
  W3_data_layer?: string | Record<string, unknown> | null;
  GA4_data_layer?: string | Record<string, unknown> | null;
  Adobe_client_data_layer?: string | Record<string, unknown> | null;
  xdm_mapping?: string | Record<string, unknown> | null;
  ga4_event?: string | null;
  adobe_event?: string | null;
  description?: string | null;
  category?: string | null;
  formula?: string | null;
  status?: string | null;
  created_at?: string | null;
  item_type?: ItemType;
  // Legacy fields for backward compatibility (events table might still use these)
  data_layer_mapping?: string | Record<string, unknown> | null;
  amplitude_implementation?: string | null;
};

type DownloadRequestBody = {
  items: AnalysisItem[];
};

export async function POST(request: NextRequest) {
  try {
    const { items }: DownloadRequestBody = await request.json();
    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'sql';
    const solution = searchParams.get('solution');

    const supabase = await createClient();

    // Fetch full item data from database
    const itemData: ExportableEntity[] = [];
    for (const item of items) {
      const tableName = (() => {
        switch (item.item_type) {
          case 'kpi':
            return withTablePrefix('kpis');
          case 'event':
            return withTablePrefix('events');
          case 'dimension':
            return withTablePrefix('dimensions');
          case 'metric':
            return withTablePrefix('metrics');
          default:
            return withTablePrefix('dashboards');
        }
      })();

      const { data } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', item.item_id)
        .single();

      if (data) {
        itemData.push({ ...data, item_type: item.item_type });
      }
    }

    let content = '';
    let contentType = 'text/plain';
    let filename = 'analysis';

    if (type === 'sql') {
      // Combine all SQL queries
      content = itemData
        .map((item) => {
          if (item.sql_query) {
            return `-- ${item.name}\n-- ${item.item_type?.toUpperCase() || 'UNKNOWN'}\n${item.sql_query}\n\n`;
          }
          return null;
        })
        .filter(Boolean)
        .join('---\n\n');
      
      contentType = 'text/sql';
      filename = 'analysis_compiled.sql';
    } else if (type === 'datalayer') {
      // Consolidated data layer based on solution
      const dataLayer: Record<string, unknown> = {};
      
      itemData.forEach((item) => {
        if (solution === 'ga4') {
          // For KPIs: Use GA4_data_layer if available, otherwise W3_data_layer, fallback to legacy data_layer_mapping
          const ga4Mapping = item.GA4_data_layer || item.W3_data_layer || item.data_layer_mapping;
          if (ga4Mapping) {
            try {
              const mapping = typeof ga4Mapping === 'string' 
                ? JSON.parse(ga4Mapping) 
                : ga4Mapping;
              Object.assign(dataLayer, mapping);
            } catch {
              // If not JSON, treat as text
              if (item.slug) {
                dataLayer[item.slug] = ga4Mapping;
              }
            }
          }
          // Add GA4 event if available
          if (item.ga4_event && item.slug) {
            dataLayer[`${item.slug}_event`] = item.ga4_event;
          }
        } else if (solution === 'adobe') {
          // For KPIs: Use Adobe_client_data_layer if available, otherwise XDM mapping
          const adobeMapping = item.Adobe_client_data_layer || item.xdm_mapping;
          if (adobeMapping) {
            try {
              const mapping = typeof adobeMapping === 'string'
                ? JSON.parse(adobeMapping as string)
                : adobeMapping;
              Object.assign(dataLayer, mapping);
            } catch {
              if (item.slug) {
                dataLayer[item.slug] = adobeMapping;
              }
            }
          }
          // Add Adobe event if available
          if (item.adobe_event && item.slug) {
            dataLayer[`${item.slug}_event`] = item.adobe_event;
          }
        } else if (solution === 'amplitude') {
          // Legacy support: amplitude_implementation (for events or old KPIs)
          if (item.amplitude_implementation && item.slug) {
            dataLayer[item.slug] = item.amplitude_implementation;
          }
        }
      });

      content = JSON.stringify(dataLayer, null, 2);
      contentType = 'application/json';
      filename = `data_layer_${solution}.json`;
    } else if (type === 'excel') {
      // Excel export - simplified JSON structure for now
      // In production, use a library like xlsx
      const excelData = itemData.map((item) => ({
        Type: item.item_type,
        Name: item.name,
        Description: item.description || '',
        Category: item.category || '',
        Formula: item.formula || '',
        SQL: item.sql_query || '',
        Status: item.status || '',
        Created: item.created_at || '',
      }));

      content = JSON.stringify(excelData, null, 2);
      contentType = 'application/json';
      filename = 'analysis_dashboard.json';
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate download';
    console.error('Error generating download:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

