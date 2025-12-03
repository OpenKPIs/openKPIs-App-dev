import type { User } from '@supabase/supabase-js';

import { createClient } from '@/lib/supabase/server';
import type { AnyEntity, EntityKind } from '@/src/types/entities';
import { sqlTableFor, tableFor } from '@/src/types/entities';

export interface ListEntitiesServerOptions {
  kind: EntityKind;
  includeIdentifiers?: string[];
  search?: string;
  limit?: number;
}

async function runQuery(
  table: string,
  options: ListEntitiesServerOptions,
) {
  // Use regular client (not admin) - we're just reading published content
  // RLS policies should allow anyone to read published content
  const supabase = await createClient();

  let query = supabase.from(table).select('*');

  const orParts: string[] = ['status.ilike.published'];
  if (options.includeIdentifiers?.length) {
    const identifiers = Array.from(
      new Set(
        options.includeIdentifiers
          .map((identifier) => identifier?.replace(/,/g, '').trim())
          .filter((identifier): identifier is string => Boolean(identifier)),
      ),
    );
    for (const identifier of identifiers) {
      orParts.push(`created_by.eq.${identifier}`);
    }
  }
  query = query.or(orParts.join(','));

  if (options.search) {
    const q = `%${options.search}%`;
    query = query.ilike('name', q);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  query = query
    .order('last_modified_at', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error(`[listEntitiesForServer] Query error for table ${table}:`, error);
    throw new Error(error.message || `Failed to list entities from ${table}`);
  }
  return (data || []) as AnyEntity[];
}

export async function listEntitiesForServer(
  options: ListEntitiesServerOptions,
): Promise<AnyEntity[]> {
  const preferredTable = sqlTableFor(options.kind);
  const fallbackTable = tableFor(options.kind);
  const candidates = preferredTable === fallbackTable
    ? [preferredTable]
    : [preferredTable, fallbackTable];

  let lastError: Error | null = null;
  for (const table of candidates) {
    try {
      return await runQuery(table, options);
    } catch (error: unknown) {
      const normalized = error instanceof Error ? error : new Error('Unknown query error');
      lastError = normalized;
      const message = normalized.message || '';
      if (!message.includes('schema cache')) {
        break;
      }
    }
  }

  throw lastError ?? new Error('Failed to list entities');
}

export function sanitizeIdentifier(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.replace(/,/g, '').trim() || null;
}

export function collectUserIdentifiers(user: User | null): string[] {
  const identifiers = new Set<string>();
  const username = sanitizeIdentifier(user?.user_metadata?.user_name as string | undefined);
  const email = sanitizeIdentifier(user?.email || undefined);
  if (username) identifiers.add(username);
  if (email) identifiers.add(email);
  return Array.from(identifiers);
}





}





}





}





}





}





}





}





}





}





}





}





}





}





}





}





}





}




