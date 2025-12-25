'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthClientProvider';

interface EditPublishedButtonProps {
  itemType: 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';
  itemId: string;
  itemSlug: string;
}

/**
 * Button to create a draft from a published item and edit it
 * This allows any authenticated user to edit published items
 */
export default function EditPublishedButton({ itemType, itemId, itemSlug }: EditPublishedButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null; // Don't show button if user is not authenticated
  }

  async function handleEditPublished() {
    if (isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      // Create a draft from the published item
      const response = await fetch(`/api/items/${itemType}/${itemId}/create-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create draft');
      }

      // Redirect to edit page for the draft
      // The draft will have the same slug, so we can use it directly
      router.push(`/${itemType}s/${itemSlug}/edit`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create draft';
      setError(message);
      setIsCreating(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <button
        onClick={handleEditPublished}
        disabled={isCreating}
        className="btn btn-primary"
        style={{
          opacity: isCreating ? 0.6 : 1,
          cursor: isCreating ? 'not-allowed' : 'pointer',
        }}
      >
        {isCreating ? 'Creating Draft...' : 'Edit'}
      </button>
      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}

