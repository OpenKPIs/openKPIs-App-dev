import { supabase } from '@/lib/supabase';
import type { EntityKind, AnyEntity } from '@/src/types/entities';
import { tableFor } from '@/src/types/entities';
import { normalizeTags, normalizeString } from '@/lib/parse';

export interface ListParams {
  kind: EntityKind;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  createdBy?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

export async function listEntities(params: ListParams): Promise<AnyEntity[]> {
  const table = tableFor(params.kind);
  let query = supabase.from(table).select('*');

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.createdBy) {
    query = query.eq('created_by', params.createdBy);
  }

  if (params.search) {
    const q = `%${params.search}%`;
    query = query.or(`name.ilike.${q},description.ilike.${q},slug.ilike.${q}`);
  }

  if (params.orderBy) {
    query = query.order(params.orderBy, { ascending: !!params.ascending });
  } else {
    query = query.order('last_modified_at', { ascending: false }).order('created_at', { ascending: false });
  }

  if (params.limit !== undefined) query = query.limit(params.limit);
  if (params.offset !== undefined) query = (query as any).range(params.offset, (params.offset || 0) + (params.limit || 50) - 1);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as AnyEntity[];
}

export async function getEntityBySlug(kind: EntityKind, slug: string): Promise<AnyEntity | null> {
  const table = tableFor(kind);
  const { data } = await supabase.from(table).select('*').eq('slug', slug).maybeSingle();
  return data ? (data as AnyEntity) : null;
}

export interface UpsertParams {
  kind: EntityKind;
  payload: Record<string, any>;
}

export async function upsertEntity(params: UpsertParams): Promise<AnyEntity | null> {
  const table = tableFor(params.kind);
  const clean: Record<string, any> = { ...params.payload };
  if ('tags' in clean) clean.tags = normalizeTags(clean.tags);
  if ('description' in clean) clean.description = normalizeString(clean.description);
  if ('category' in clean) clean.category = normalizeString(clean.category);

  const { data, error } = await (supabase.from(table) as any)
    .upsert(clean, { onConflict: 'slug' })
    .select()
    .maybeSingle();

  if (error) return null;
  return data ? (data as AnyEntity) : null;
}





