import { withTablePrefix } from '@/src/types/entities';
import type { Event } from '@/lib/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const eventsTable = withTablePrefix('events');

type EventRow = Event & {
  tags?: string[] | string | null;
  related_dimensions?: string[] | string | null;
  derived_dimensions?: string[] | string | null;
  derived_metrics?: string[] | string | null;
  derived_kpis?: string[] | string | null;
  dashboard_usage?: string[] | string | null;
};

export type NormalizedEvent = Omit<EventRow, 'tags' | 'related_dimensions' | 'derived_dimensions' | 'derived_metrics' | 'derived_kpis' | 'dashboard_usage'> & {
  tags: string[];
  related_dimensions: string[];
  derived_dimensions: string[];
  derived_metrics: string[];
  derived_kpis: string[];
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

export function normalizeEvent(row: EventRow): NormalizedEvent {
  return {
    ...row,
    tags: toStringArray(row.tags),
    related_dimensions: toStringArray(row.related_dimensions),
    derived_dimensions: toStringArray(row.derived_dimensions),
    derived_metrics: toStringArray(row.derived_metrics),
    derived_kpis: toStringArray(row.derived_kpis),
    dashboard_usage: toStringArray(row.dashboard_usage),
  };
}

export async function fetchEventBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<NormalizedEvent | null> {
  const { data, error } = await supabase
    .from(eventsTable)
    .select('*')
    .eq('slug', slug)
    .maybeSingle<EventRow>();

  if (error || !data) {
    return null;
  }

  return normalizeEvent(data);
}

export { eventsTable };
