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
  formula?: string; // For KPIs and Metrics
  event_serialization?: string; // For Events
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
  const [forkPreferenceEnabled, setForkPreferenceEnabled] = useState<boolean>(true); // Default to true
  const [showForkModal, setShowForkModal] = useState(false);
  const [forkProgress, setForkProgress] = useState(0);
  const [forkPreferenceLoading, setForkPreferenceLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState<'fork_pr' | 'internal_app'>('fork_pr'); // Track current mode for modal

  const [formData, setFormData] = useState<BaseItemFormData>({
    name: initial?.name || '',
    slug: initial?.slug || '',
    description: initial?.description || '',
    category: initial?.category || '',
    tags: initial?.tags || [],
    status: 'draft',
    // Only initialize formula for KPIs and Metrics, not Events
    formula: (type === 'event' ? undefined : (initial?.formula || '')),
    // Only initialize event_serialization for Events
    event_serialization: (type === 'event' ? ((initial as { event_serialization?: string })?.event_serialization || '') : undefined),
  });

  const [slugEdited, setSlugEdited] = useState<boolean>(false);

  const slugPreview = useMemo(
    () => generateSlug(formData.slug || formData.name),
    [formData.slug, formData.name]
  );

  // Detect create vs edit mode
  // Create mode: initial is undefined or empty
  // Edit mode: initial has data (but edit pages don't use this hook currently)
  const isCreateMode = !initial || Object.keys(initial).length === 0;

  // CRITICAL: In create mode, checkbox is ALWAYS checked by default
  // Never load from API - user must explicitly uncheck if they don't want fork+PR
  // Preference from DB is only used for edit flow, not create flow
  useEffect(() => {
    if (!user) {
      setForkPreferenceLoading(false);
      return;
    }

    // CREATE MODE: Always checkbox = true, never load from API
    if (isCreateMode) {
      setForkPreferenceEnabled(true);
      setForkPreferenceLoading(false);
      return;
    }

    // EDIT MODE: Load from API (if edit pages use this hook in future)
    // Currently edit pages don't use this hook, but keeping this for future compatibility
    async function loadPreference() {
      try {
        const response = await fetch('/api/user/settings/github-contributions', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          // Default to true if not set (null) or explicitly true
          // Only set to false if explicitly false
          const enabled = data.enabled !== false;
          setForkPreferenceEnabled(enabled);
        } else {
          // If API returns error, default to true (preferred mode)
          console.warn('Failed to load GitHub fork preference, defaulting to true');
          setForkPreferenceEnabled(true);
        }
      } catch (error) {
        console.warn('Failed to load GitHub fork preference:', error);
        // Default to true on error (preferred mode)
        setForkPreferenceEnabled(true);
      } finally {
        setForkPreferenceLoading(false);
      }
    }

    loadPreference();
  }, [user, isCreateMode]);


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
  const submitItem = useCallback(async (githubContributionMode: 'internal_app' | 'fork_pr') => {
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
    setCurrentMode(githubContributionMode);
    setShowForkModal(true); // Show progress modal for both flows
    setForkProgress(10); // Start progress

    try {
      const slug = formData.slug || generateSlug(formData.name);
      
      // Simulate progress (since we can't track actual GitHub API progress)
      setForkProgress(20); // Item creation started

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
          // Send formula for KPIs and Metrics, event_serialization for Events
          ...(type === 'event' 
            ? { event_serialization: formData.event_serialization || undefined }
            : { formula: formData.formula || undefined }
          ),
          githubContributionMode, // Pass the mode explicitly
        }),
      });
      
      setForkProgress(40); // API call in progress

      const data = await response.json();
      
      setForkProgress(60); // Response received

      if (!response.ok) {
        // Handle API errors
        const errorMessage = data.error || `Failed to create ${type}. Status: ${response.status}`;
        setError(errorMessage);
        setSaving(false);
        setShowForkModal(false);
        setForkProgress(0);
        return;
      }

      if (!data.success || !data.item) {
        setError('Item was created but response was invalid. Please refresh and check.');
        setSaving(false);
        setShowForkModal(false);
        setForkProgress(0);
        return;
      }

      setForkProgress(80); // Item created, GitHub sync in progress

      // Log GitHub sync status
      if (data.github) {
        if (data.github.success) {
          setForkProgress(95); // GitHub sync successful
        } else {
          // GitHub sync failed
          const githubError = data.github.error || 'GitHub sync failed';
          // Show error but don't block - item was created
          console.warn('GitHub sync failed:', githubError);
          if (githubContributionMode === 'fork_pr') {
            // For fork+PR, show warning but still redirect
            setError(`Item created successfully, but ${githubError}. You can view it in the editor.`);
          }
        }
      }

      // Reset saving state
      setSaving(false);
      setForkProgress(100); // Complete
      // Wait a moment to show 100% before redirecting
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowForkModal(false);

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
      setShowForkModal(false);
      setForkProgress(0);
    }
  }, [formData, user, type, afterCreateRedirect]);

  // Handle Create button click - uses checkbox state to determine mode
  const handleCreate = useCallback(() => {
    const mode = forkPreferenceEnabled ? 'fork_pr' : 'internal_app';
    submitItem(mode);
  }, [forkPreferenceEnabled, submitItem]);

  // Handle checkbox change (doesn't save, just updates local state)
  const handleForkPreferenceChange = useCallback((enabled: boolean) => {
    setForkPreferenceEnabled(enabled);
  }, []);

  // Handle form submit (for Enter key, uses checkbox state)
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreate();
  }, [handleCreate]);

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
    // Create handler
    handleCreate,
    // Fork preference
    forkPreferenceEnabled,
    forkPreferenceLoading,
    handleForkPreferenceChange,
    // Modal
    showForkModal,
    setShowForkModal,
    forkProgress,
    currentMode, // For modal to show correct messages
  };
}
