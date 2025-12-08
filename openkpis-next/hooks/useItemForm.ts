import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { EntityKind } from '@/src/types/entities';
import { tableFor, withTablePrefix } from '@/src/types/entities';
import { useAuth } from '@/app/providers/AuthClientProvider';

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
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forkPreferenceEnabled, setForkPreferenceEnabled] = useState<boolean | null>(null);
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkPreferenceLoading, setForkPreferenceLoading] = useState(true);

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

  const slugPreview = useMemo(
    () => generateSlug(formData.slug || formData.name),
    [formData.slug, formData.name]
  );

  // Load user's GitHub fork preference
  useEffect(() => {
    if (!user) {
      setForkPreferenceLoading(false);
      return;
    }

    async function loadPreference() {
      try {
        const response = await fetch('/api/user/settings/github-contributions', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setForkPreferenceEnabled(data.enabled === true);
        }
      } catch (error) {
        console.warn('Failed to load GitHub fork preference:', error);
      } finally {
        setForkPreferenceLoading(false);
      }
    }

    loadPreference();
  }, [user]);


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

  // Shared submission logic
  const submitItem = useCallback(async (githubContributionMode?: 'internal_app' | 'fork_pr') => {
    const currentUser = user;
    if (!currentUser) {
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
      const slug = formData.slug || generateSlug(formData.name);

      // Call unified API route that handles:
      // 1. Item creation
      // 2. Contribution record creation
      // 3. GitHub sync
      const response = await fetch('/api/items/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          name: formData.name.trim(),
          slug,
          description: formData.description || undefined,
          category: formData.category || undefined,
          tags: formData.tags || [],
          formula: formData.formula || undefined,
          githubContributionMode, // Pass the mode explicitly
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        const errorMessage = data.error || `Failed to create ${type}. Status: ${response.status}`;
        setError(errorMessage);
        setSaving(false);
        return;
      }

      if (!data.success || !data.item) {
        setError('Item was created but response was invalid. Please refresh and check.');
        setSaving(false);
        return;
      }

      // Log GitHub sync status (non-blocking)
      if (data.github && !data.github.success) {
        console.warn('GitHub sync failed (non-critical):', data.github.error);
        // Don't show error to user - item was created successfully
      }

      // Reset saving state
      setSaving(false);

      // Use window.location.href for full page reload to ensure clean state
      // This avoids race conditions with router.push()
      const redirectTo = afterCreateRedirect?.({ 
        id: data.item.id, 
        slug: data.item.slug 
      }) ?? `/${pluralize(type)}`;
      
      window.location.href = redirectTo;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create item.';
      setError(message);
      setSaving(false);
    }
  }, [formData, user, type, afterCreateRedirect]);

  // Handle Quick Create (always uses GitHub App flow - existing behavior)
  const handleQuickCreate = useCallback(() => {
    submitItem('internal_app'); // Explicitly use GitHub App flow (existing behavior)
  }, [submitItem]);

  // Handle Fork + Create (fork+PR mode)
  const handleForkCreate = useCallback(() => {
    // If preference not enabled, show modal first
    if (forkPreferenceEnabled === false || forkPreferenceEnabled === null) {
      setShowForkModal(true);
    } else {
      // Preference enabled, proceed with fork+PR
      submitItem('fork_pr');
    }
  }, [submitItem, forkPreferenceEnabled]);

  // Handle form submit (for Enter key, defaults to Quick Create)
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleQuickCreate();
  }, [handleQuickCreate]);

  // Handle modal confirm (when user enables fork preference)
  const handleForkModalConfirmAfterEnable = useCallback(async (dontShowAgain: boolean) => {
    try {
      const response = await fetch('/api/user/settings/github-contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enabled: true }),
      });

      if (response.ok) {
        setForkPreferenceEnabled(true);
        setShowForkModal(false);
        
        // Store "don't show again" in localStorage if requested
        if (dontShowAgain) {
          localStorage.setItem('openkpis_fork_modal_dismissed', 'true');
        }
        
        // After enabling preference, proceed with fork+PR creation
        submitItem('fork_pr');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to enable GitHub contributions');
      }
    } catch (error) {
      console.error('Failed to enable GitHub fork contributions:', error);
      setError('Failed to enable GitHub contributions. Please try again.');
    }
  }, [submitItem]);

  return {
    user,
    loading: authLoading,
    saving,
    error,
    formData,
    setField,
    setFormData,
    slugPreview,
    handleNameChange,
    handleSlugChange,
    handleSubmit,
    // Fork+PR related
    handleQuickCreate,
    handleForkCreate,
    forkPreferenceEnabled,
    forkPreferenceLoading,
    showForkModal,
    setShowForkModal,
    handleForkModalConfirm: handleForkModalConfirmAfterEnable,
  };
}
