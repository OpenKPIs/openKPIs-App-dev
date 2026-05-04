import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch UDLs that have a pending draft
    const { data: udls, error: udlError } = await supabase
      .from(withTablePrefix('unified_data_layers'))
      .select('id, name, platform, industry, master_schema, draft_schema')
      .not('draft_schema', 'is', null);

    if (udlError) throw udlError;
    if (!udls || udls.length === 0) return NextResponse.json({ drafts: [] });

    // For impact scanning, fetch all published KPIs to see what fields they use
    const { data: kpis, error: kpiError } = await supabase
      .from(withTablePrefix('kpis'))
      .select('name, slug, ga4_data_layer, adobe_client_data_layer, xdm_mapping')
      .eq('status', 'published');

    if (kpiError) throw kpiError;

    const drafts = udls.map(udl => {
      const master = udl.master_schema || {};
      const draft = udl.draft_schema || {};
      
      const diffData: any[] = [];
      const impactedKpis: { key: string; kpi: string }[] = [];

      // Find removed or modified keys
      Object.keys(master).forEach(key => {
        if (!draft[key]) {
          diffData.push({ key, type: 'removed', desc: 'Field deleted from UDL', industries: [udl.industry] });
          // Impact Scan: Check if any KPI relies on this removed key
          kpis?.forEach(kpi => {
             const dlStr = JSON.stringify(kpi.ga4_data_layer || {}) + JSON.stringify(kpi.adobe_client_data_layer || {}) + JSON.stringify(kpi.xdm_mapping || {});
             if (dlStr.includes(`"${key}"`)) {
               impactedKpis.push({ key, kpi: kpi.name });
             }
          });
        } else if (JSON.stringify(master[key]) !== JSON.stringify(draft[key])) {
          diffData.push({ key, type: 'modified', desc: 'Field properties altered', industries: [udl.industry] });
          // Minor impact scan
          kpis?.forEach(kpi => {
             const dlStr = JSON.stringify(kpi.ga4_data_layer || {}) + JSON.stringify(kpi.adobe_client_data_layer || {}) + JSON.stringify(kpi.xdm_mapping || {});
             if (dlStr.includes(`"${key}"`)) {
               impactedKpis.push({ key, kpi: kpi.name });
             }
          });
        } else {
          diffData.push({ key, type: 'unchanged', desc: 'No changes', industries: [udl.industry] });
        }
      });

      // Find new keys
      Object.keys(draft).forEach(key => {
        if (!master[key]) {
          diffData.push({ key, type: 'new', desc: 'New field added', industries: [udl.industry] });
        }
      });

      return {
        id: udl.id,
        name: udl.name,
        platform: udl.platform,
        industry: udl.industry,
        diffData,
        impactedKpis,
        fullDraft: draft
      };
    });

    return NextResponse.json({ drafts });

  } catch (error) {
    console.error('API /api/udl/drafts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
