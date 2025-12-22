import { withTablePrefix } from '@/src/types/entities';
import type { KPI } from '@/lib/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const kpisTable = withTablePrefix('kpis');

type KpiRow = KPI & {
  tags?: string[] | string | null;
  industry?: string[] | string | null;
  related_kpis?: string[] | string | null;
  dashboard_usage?: string[] | string | null;
};

export type NormalizedKpi = Omit<KpiRow, 'tags' | 'industry' | 'related_kpis' | 'dashboard_usage'> & {
  tags: string[];
  industry: string[];
  related_kpis: string[];
  dashboard_usage: string[];
};

function toStringArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((entry): entry is string => typeof entry === 'string');
        }
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  return [];
}

export function normalizeKpi(row: KpiRow): NormalizedKpi {
  return {
    ...row,
    tags: toStringArray(row.tags),
    industry: toStringArray(row.industry),
    related_kpis: toStringArray(row.related_kpis),
    dashboard_usage: toStringArray(row.dashboard_usage),
  };
}

export async function fetchKpiBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<NormalizedKpi | null> {
  const { data, error } = await supabase
    .from(kpisTable)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return null;
  }

  if (!data) {
    return null;
  }

  return normalizeKpi(data as KpiRow);
}

export { kpisTable };
