import { withTablePrefix } from '@/src/types/entities';
import type { Dimension } from '@/lib/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const dimensionsTable = withTablePrefix('dimensions');

type DimensionRow = Dimension & {
  tags?: string[] | string | null;
  related_dimensions?: string[] | string | null;
  derived_dimensions?: string[] | string | null;
  dashboard_usage?: string[] | string | null;
};

export type NormalizedDimension = Omit<DimensionRow, 'tags' | 'related_dimensions' | 'derived_dimensions' | 'dashboard_usage'> & {
  tags: string[];
  related_dimensions: string[];
  derived_dimensions: string[];
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

export function normalizeDimension(row: DimensionRow): NormalizedDimension {
  return {
    ...row,
    tags: toStringArray(row.tags),
    related_dimensions: toStringArray(row.related_dimensions),
    derived_dimensions: toStringArray(row.derived_dimensions),
    dashboard_usage: toStringArray(row.dashboard_usage),
  };
}

export async function fetchDimensionBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<NormalizedDimension | null> {
  const { data, error } = await supabase
    .from(dimensionsTable)
    .select('*')
    .eq('slug', slug)
    .maybeSingle<DimensionRow>();

  if (error || !data) {
    return null;
  }

  return normalizeDimension(data);
}

export { dimensionsTable };
