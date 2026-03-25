import { createAdminClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const kpisTable = withTablePrefix('kpis');
    const metricsTable = withTablePrefix('metrics');
    const dimensionsTable = withTablePrefix('dimensions');

    const [kpisRes, metricsRes, dimensionsRes] = await Promise.all([
      supabase.from(kpisTable).select('id, name, slug, category, description').eq('status', 'published').order('name').limit(200),
      supabase.from(metricsTable).select('id, name, slug, category, description').eq('status', 'published').order('name').limit(200),
      supabase.from(dimensionsTable).select('id, name, slug, category, description').eq('status', 'published').order('name').limit(200),
    ]);

    return NextResponse.json({
      kpis: kpisRes.data ?? [],
      metrics: metricsRes.data ?? [],
      dimensions: dimensionsRes.data ?? [],
    });
  } catch (err) {
    console.error('[palette] error:', err);
    return NextResponse.json({ kpis: [], metrics: [], dimensions: [] }, { status: 500 });
  }
}
