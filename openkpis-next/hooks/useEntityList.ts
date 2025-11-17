import { useEffect, useState } from 'react';
import type { EntityKind, AnyEntity } from '@/src/types/entities';
import { listEntities } from '@/lib/repository/entityRepository';

interface UseEntityListOptions {
  kind: EntityKind;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  includeCreatedBy?: string[];
  limit?: number;
}

export function useEntityList(options: UseEntityListOptions) {
  const [items, setItems] = useState<AnyEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Re-fetch on auth changes to avoid stale views after login/logout
  useEffect(() => {
    const bump = () => setRefreshVersion((v) => v + 1);
    const onAuth = () => bump();
    window.addEventListener('openkpis-auth-change', onAuth as EventListener);
    return () => {
      window.removeEventListener('openkpis-auth-change', onAuth as EventListener);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const data = await listEntities({
          kind: options.kind,
          status: options.status,
          search: options.search,
          includeCreatedBy: options.includeCreatedBy,
          limit: options.limit ?? 100,
        });
        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load items');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [options.kind, options.status, options.search, options.includeCreatedBy, options.limit, refreshVersion]);

  return { items, loading, error };
}





