import { withTablePrefix } from '@/src/types/entities';
import type { SupabaseClient } from '@supabase/supabase-js';

const dashboardsTable = withTablePrefix('dashboards');

type DashboardRow = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[] | string | null;
  status: 'draft' | 'published' | 'archived';
  created_by?: string | null;
  created_at?: string | null;
  last_modified_by?: string | null;
  last_modified_at?: string | null;
  layout_json?: Record<string, unknown>[] | null;
};

export type NormalizedDashboard = Omit<DashboardRow, 'tags'> & {
  tags: string[];
  layout_json?: Record<string, unknown>[] | null;
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

export function normalizeDashboard(row: DashboardRow): NormalizedDashboard {
  return {
    ...row,
    tags: toStringArray(row.tags),
  };
}

export async function fetchDashboardBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<NormalizedDashboard | null> {
  const { data, error } = await supabase
    .from(dashboardsTable)
    .select('*')
    .eq('slug', slug)
    .maybeSingle<DashboardRow>();

  if (error || !data) {
    return null;
  }

  return normalizeDashboard(data);
}

export { dashboardsTable };
