import { useEffect, useState } from 'react';
import type { EntityKind, AnyEntity } from '@/src/types/entities';
import { listEntities } from '@/lib/repository/entityRepository';

interface UseEntityListOptions {
  kind: EntityKind;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  createdBy?: string;
  limit?: number;
}

export function useEntityList(options: UseEntityListOptions) {
  const [items, setItems] = useState<AnyEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Safety timer: never leave the UI stuck in loading state
    const safety = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3000);
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await listEntities({
          kind: options.kind,
          status: options.status,
          search: options.search,
          createdBy: options.createdBy,
          limit: options.limit ?? 100,
        });
        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load items');
      } finally {
        clearTimeout(safety);
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      clearTimeout(safety);
      cancelled = true;
    };
  }, [options.kind, options.status, options.search, options.createdBy, options.limit]);

  return { items, loading, error };
}





