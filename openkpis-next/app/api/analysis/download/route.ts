import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'sql';
    const solution = searchParams.get('solution');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch full item data from database
    const itemData = [];
    for (const item of items) {
      let tableName = item.item_type === 'kpi' ? 'kpis' : 
                     item.item_type === 'event' ? 'events' :
                     item.item_type === 'dimension' ? 'dimensions' :
                     item.item_type === 'metric' ? 'metrics' :
                     'dashboards';

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
            return `-- ${item.name}\n-- ${item.item_type.toUpperCase()}\n${item.sql_query}\n\n`;
          }
          return null;
        })
        .filter(Boolean)
        .join('---\n\n');
      
      contentType = 'text/sql';
      filename = 'analysis_compiled.sql';
    } else if (type === 'datalayer') {
      // Consolidated data layer based on solution
      const dataLayer: any = {};
      
      itemData.forEach((item) => {
        if (solution === 'ga4' && item.data_layer_mapping) {
          // Parse and merge GA4 mappings
          try {
            const mapping = typeof item.data_layer_mapping === 'string' 
              ? JSON.parse(item.data_layer_mapping) 
              : item.data_layer_mapping;
            Object.assign(dataLayer, mapping);
          } catch (e) {
            // If not JSON, treat as text
            dataLayer[item.slug] = item.data_layer_mapping;
          }
        } else if (solution === 'adobe' && item.xdm_mapping) {
          // Parse and merge Adobe XDM mappings
          try {
            const mapping = typeof item.xdm_mapping === 'string'
              ? JSON.parse(item.xdm_mapping)
              : item.xdm_mapping;
            Object.assign(dataLayer, mapping);
          } catch (e) {
            dataLayer[item.slug] = item.xdm_mapping;
          }
        } else if (solution === 'amplitude' && item.amplitude_implementation) {
          dataLayer[item.slug] = item.amplitude_implementation;
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
  } catch (error) {
    console.error('Error generating download:', error);
    return NextResponse.json({ error: 'Failed to generate download' }, { status: 500 });
  }
}

