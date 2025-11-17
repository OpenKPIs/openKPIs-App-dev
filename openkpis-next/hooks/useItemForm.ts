import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, supabase } from '@/lib/supabase';
import type { EntityKind } from '@/src/types/entities';
import { tableFor } from '@/src/types/entities';

export type ItemType = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';
export type ItemStatus = 'draft' | 'published';

export interface BaseItemFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  status: ItemStatus;
  formula?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const pluralize = (type: ItemType) => tableFor(type as EntityKind);

interface UseItemFormOptions {
  type: ItemType;
  initial?: Partial<BaseItemFormData>;
  afterCreateRedirect?: (created: { id: string; slug: string }) => string;
}

export function useItemForm({ type, initial, afterCreateRedirect }: UseItemFormOptions) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BaseItemFormData>({
    name: initial?.name || '',
    slug: initial?.slug || '',
    description: initial?.description || '',
    category: initial?.category || '',
    tags: initial?.tags || [],
    status: 'draft',
    formula: initial?.formula || '',
  });

  const [slugEdited, setSlugEdited] = useState<boolean>(false);

  useMemo(() => {
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (!currentUser) {
          setError('Please sign in to create an item.');
        }
      } catch {
        // Non-fatal for form rendering
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slugPreview = useMemo(
    () => generateSlug(formData.slug || formData.name),
    [formData.slug, formData.name]
  );

  const setField = useCallback(<K extends keyof BaseItemFormData>(key: K, value: BaseItemFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNameChange = useCallback((newName: string) => {
    setFormData((prev) => {
      const next: BaseItemFormData = { ...prev, name: newName };
      if (!slugEdited) {
        next.slug = generateSlug(newName);
      }
      return next;
    });
  }, [slugEdited]);

  const handleSlugChange = useCallback((newSlug: string) => {
    setSlugEdited(true);
    setFormData((prev) => ({ ...prev, slug: newSlug }));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError('Please sign in to create an item.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userName = user?.user_metadata?.user_name || user?.email || 'unknown';
      const plural = pluralize(type);
      const slug = formData.slug || generateSlug(formData.name);

      const { data: existing } = await (supabase
        .from(plural) as any)
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        setError('An item with this slug already exists. Please choose a different name.');
        setSaving(false);
        return;
      }

      const insertPayload: Record<string, any> = {
        name: formData.name,
        description: formData.description,
        slug,
        category: formData.category,
        tags: formData.tags,
        status: 'draft',
        created_by: userName,
        created_at: new Date().toISOString(),
      };

      if (type === 'kpi' || type === 'metric') {
        insertPayload.formula = formData.formula || null;
      }

      const { data: created, error: insertError } = await (supabase
        .from(plural) as any)
        .insert(insertPayload)
        .select()
        .single();

      if (insertError || !created) {
        setError(insertError?.message || 'Failed to create item.');
        setSaving(false);
        return;
      }

      try {
        fetch(`/api/${plural}/${created.id}/sync-github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'created' }),
        }).catch(() => {});
      } catch {}

      const redirectTo = afterCreateRedirect?.({ id: created.id, slug }) ?? `/${plural}`;
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || 'Failed to create item.');
      setSaving(false);
      return;
    }
  }

  return {
    user,
    loading,
    saving,
    error,
    formData,
    setField,
    setFormData,
    slugPreview,
    handleNameChange,
    handleSlugChange,
    handleSubmit,
  };
}
