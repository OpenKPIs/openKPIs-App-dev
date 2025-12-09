'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import FormField from '@/components/forms/FormField';
import TextInput from '@/components/forms/TextInput';
import Textarea from '@/components/forms/Textarea';
import Select from '@/components/forms/Select';
import TagsInput from '@/components/forms/TagsInput';
import SlugInput from '@/components/forms/SlugInput';
import SubmitBar from '@/components/forms/SubmitBar';
import GitHubForkModal from '@/components/forms/GitHubForkModal';
import { useItemForm } from '@/hooks/useItemForm';

export default function NewDimensionPage() {
  const {
    user,
    saving,
    error,
    formData,
    setField,
    handleNameChange,
    handleSlugChange,
    handleSubmit,
    handleCreate,
    forkPreferenceEnabled,
    forkPreferenceLoading,
    handleForkPreferenceChange,
    showForkModal,
    setShowForkModal,
    forkProgress,
    currentMode,
  } = useItemForm({
    type: 'dimension',
    afterCreateRedirect: ({ slug }) => `/dimensions/${slug}/edit`,
  });

  if (!user) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>Create New Dimension</h1>
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Please sign in to create a new Dimension</p>
          <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
            You need to be signed in with GitHub to contribute Dimensions to the repository.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link
        href="/dimensions"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--ifm-color-primary)',
          textDecoration: 'none',
          marginBottom: '1rem',
          fontSize: '0.875rem',
        }}
      >
        ← Back to Dimensions
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>Create New Dimension</h1>

      {error ? (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormField label="Name" required>
          <TextInput
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., Country"
            required
          />
        </FormField>

        <FormField label="Slug" description="URL-friendly identifier (auto-generated from name)">
          <SlugInput nameValue={formData.name} slugValue={formData.slug} onChange={handleSlugChange} />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={formData.description}
            onChange={(v) => setField('description', v)}
            placeholder="Brief description of the Dimension..."
            rows={4}
          />
        </FormField>

        <FormField label="Category">
          <Select
            value={formData.category}
            onChange={(v) => setField('category', v)}
            options={[
              { label: 'None', value: '' },
              { label: 'Conversion', value: 'Conversion' },
              { label: 'Revenue', value: 'Revenue' },
              { label: 'Engagement', value: 'Engagement' },
              { label: 'Retention', value: 'Retention' },
              { label: 'Acquisition', value: 'Acquisition' },
              { label: 'Performance', value: 'Performance' },
              { label: 'Quality', value: 'Quality' },
              { label: 'Efficiency', value: 'Efficiency' },
              { label: 'Satisfaction', value: 'Satisfaction' },
              { label: 'Growth', value: 'Growth' },
              { label: 'Other', value: 'Other' },
            ]}
          />
        </FormField>

        <FormField label="Tags">
          <TagsInput value={formData.tags} onChange={(v) => setField('tags', v)} />
        </FormField>

        <SubmitBar 
          submitting={saving} 
          submitLabel="Create" 
          cancelHref="/dimensions"
          forkPreferenceEnabled={forkPreferenceEnabled}
          forkPreferenceLoading={forkPreferenceLoading}
          onForkPreferenceChange={handleForkPreferenceChange}
          onCreate={handleCreate}
        />
      </form>

      <GitHubForkModal
        isOpen={showForkModal}
        onClose={() => setShowForkModal(false)}
        isProcessing={saving}
        progress={forkProgress}
        mode={currentMode}
      />
    </main>
  );
}
