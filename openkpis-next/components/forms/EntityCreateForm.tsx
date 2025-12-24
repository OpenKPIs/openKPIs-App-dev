'use client';

/**
 * EntityCreateForm - Consolidated Create Form Component
 * Handles creation for all entity types: KPI, Metric, Dimension, Event, Dashboard
 */

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
import type { ItemType } from '@/hooks/useItemForm';

const CATEGORIES = [
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
];

const ENTITY_CONFIG: Record<ItemType, { 
  name: string; 
  plural: string; 
  backHref: string;
  redirectPath: (created: { id: string; slug: string }) => string;
  showFormula: boolean;
  showEventSerialization: boolean;
  namePlaceholder: string;
  descriptionPlaceholder: string;
}> = {
  kpi: {
    name: 'KPI',
    plural: 'KPIs',
    backHref: '/kpis',
    redirectPath: ({ slug }) => `/kpis/${slug}/edit`,
    showFormula: true,
    showEventSerialization: false,
    namePlaceholder: 'e.g., Order Conversion Rate',
    descriptionPlaceholder: 'Brief description of the KPI...',
  },
  metric: {
    name: 'Metric',
    plural: 'Metrics',
    backHref: '/metrics',
    redirectPath: ({ slug }) => `/metrics/${slug}/edit`,
    showFormula: true,
    showEventSerialization: false,
    namePlaceholder: 'e.g., Page Views',
    descriptionPlaceholder: 'Brief description of the Metric...',
  },
  dimension: {
    name: 'Dimension',
    plural: 'Dimensions',
    backHref: '/dimensions',
    redirectPath: ({ slug }) => `/dimensions/${slug}/edit`,
    showFormula: false,
    showEventSerialization: false,
    namePlaceholder: 'e.g., Product Category',
    descriptionPlaceholder: 'Brief description of the Dimension...',
  },
  event: {
    name: 'Event',
    plural: 'Events',
    backHref: '/events',
    redirectPath: ({ slug }) => `/events/${slug}/edit`,
    showFormula: false,
    showEventSerialization: true,
    namePlaceholder: 'e.g., Purchase Completed',
    descriptionPlaceholder: 'Brief description of the Event...',
  },
  dashboard: {
    name: 'Dashboard',
    plural: 'Dashboards',
    backHref: '/dashboards',
    redirectPath: ({ slug }) => `/dashboards/${slug}/edit`,
    showFormula: false,
    showEventSerialization: false,
    namePlaceholder: 'e.g., Executive Dashboard',
    descriptionPlaceholder: 'Brief description of the Dashboard...',
  },
};

type EntityCreateFormProps = {
  entityType: ItemType;
};

export default function EntityCreateForm({ entityType }: EntityCreateFormProps) {
  const config = ENTITY_CONFIG[entityType];
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
    type: entityType,
    afterCreateRedirect: config.redirectPath,
  });

  if (!user) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>Create New {config.name}</h1>
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Please sign in to create a new {config.name}</p>
          <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
            You need to be signed in with GitHub to contribute {config.plural} to the repository.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link
        href={config.backHref}
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
        ← Back to {config.plural}
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>Create New {config.name}</h1>

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
            placeholder={config.namePlaceholder}
            required
          />
        </FormField>

        <FormField label="Slug" description="URL-friendly identifier (auto-generated from name)">
          <SlugInput
            nameValue={formData.name}
            slugValue={formData.slug}
            onChange={handleSlugChange}
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            value={formData.description}
            onChange={(v) => setField('description', v)}
            placeholder={config.descriptionPlaceholder}
            rows={4}
          />
        </FormField>

        {config.showFormula && (
          <FormField label="Formula">
            <TextInput
              value={formData.formula || ''}
              onChange={(v) => setField('formula', v)}
              placeholder="e.g., (Orders / Visitors) * 100"
            />
          </FormField>
        )}

        {config.showEventSerialization && (
          <FormField label="Event Serialization">
            <TextInput
              value={formData.event_serialization || ''}
              onChange={(v) => setField('event_serialization', v)}
              placeholder="Event serialization format"
            />
          </FormField>
        )}

        <FormField label="Category">
          <Select
            value={formData.category}
            onChange={(v) => setField('category', v)}
            options={CATEGORIES}
          />
        </FormField>

        <FormField label="Tags">
          <TagsInput value={formData.tags} onChange={(v) => setField('tags', v)} />
        </FormField>

        <SubmitBar 
          submitting={saving} 
          submitLabel="Create" 
          cancelHref={config.backHref}
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

