'use client';

/**
 * EntityEditForm - Consolidated Edit Form Component
 * Handles editing for all entity types: KPI, Metric, Dimension, Event, Dashboard
 * Based on the working KPI form structure
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthClientProvider';
import type { EntityType } from '@/lib/config/entityFormConfigs';
import { getEntityFormConfig, shouldShowField, type EntityFormConfig } from '@/lib/config/entityFormConfigs';
import type { NormalizedKpi } from '@/lib/server/kpis';
import type { NormalizedMetric } from '@/lib/server/metrics';
import type { NormalizedDimension } from '@/lib/server/dimensions';
import type { NormalizedEvent } from '@/lib/server/events';
import type { NormalizedDashboard } from '@/lib/server/dashboards';

type DependenciesData = {
  Events?: string[];
  Metrics?: string[];
  Dimensions?: string[];
  KPIs?: string[];
};

type BaseFormData = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  [key: string]: unknown;
};

type EntityEditFormProps<T> = {
  entity: T;
  entityType: EntityType;
  slug: string;
  canEdit: boolean;
  entityId: string;
};

// Helper to normalize entity data to form data
function normalizeEntityToFormData<T extends NormalizedKpi | NormalizedMetric | NormalizedDimension | NormalizedEvent | NormalizedDashboard>(
  entity: T,
  entityType: EntityType
): Record<string, unknown> {
  const baseData: Record<string, unknown> = {
    name: entity.name || '',
    description: entity.description || '',
    category: entity.category || '',
    tags: (entity as { tags?: string[] }).tags ?? [],
  };

  // Handle entity-specific fields
  if (entityType === 'kpi') {
    const kpi = entity as NormalizedKpi;
    return {
      ...baseData,
      formula: kpi.formula || '',
      industry: Array.isArray(kpi.industry) ? (kpi.industry[0] || '') : (kpi.industry || ''),
      priority: kpi.priority || '',
      core_area: kpi.core_area || '',
      scope: kpi.scope || '',
      measure_type: kpi.measure_type || '',
      aggregation_window: kpi.aggregation_window || '',
      ga4_event: kpi.ga4_event || '',
      adobe_event: kpi.adobe_event || '',
      w3_data_layer: kpi.w3_data_layer || '',
      ga4_data_layer: kpi.ga4_data_layer || '',
      adobe_client_data_layer: kpi.adobe_client_data_layer || '',
      xdm_mapping: kpi.xdm_mapping || '',
      dependencies: kpi.dependencies || '',
      dependenciesData: parseDependencies(kpi.dependencies),
      source_data: kpi.source_data || '',
      report_attributes: kpi.report_attributes || '',
      dashboard_usage: Array.isArray(kpi.dashboard_usage) ? kpi.dashboard_usage.join(';') : (typeof kpi.dashboard_usage === 'string' ? kpi.dashboard_usage : ''),
      segment_eligibility: kpi.segment_eligibility || '',
      related_kpis: Array.isArray(kpi.related_kpis) ? kpi.related_kpis.join(';') : (typeof kpi.related_kpis === 'string' ? kpi.related_kpis : ''),
      sql_query: kpi.sql_query || '',
      calculation_notes: kpi.calculation_notes || '',
      business_use_case: kpi.business_use_case || '',
      data_sensitivity: kpi.data_sensitivity || '',
      pii_flag: kpi.pii_flag ?? false,
    };
  }

  if (entityType === 'metric') {
    const metric = entity as NormalizedMetric;
    return {
      ...baseData,
      formula: metric.formula || '',
      industry: typeof metric.industry === 'string' ? metric.industry : '',
      priority: metric.priority || '',
      core_area: metric.core_area || '',
      scope: metric.scope || '',
      measure_type: metric.measure_type || '',
      aggregation_window: metric.aggregation_window || '',
      ga4_event: metric.ga4_event || '',
      adobe_event: metric.adobe_event || '',
      w3_data_layer: metric.w3_data_layer || '',
      ga4_data_layer: metric.ga4_data_layer || '',
      adobe_client_data_layer: metric.adobe_client_data_layer || '',
      xdm_mapping: metric.xdm_mapping || '',
      dependencies: metric.dependencies || '',
      dependenciesData: parseDependencies(metric.dependencies),
      source_data: metric.source_data || '',
      report_attributes: metric.report_attributes || '',
      dashboard_usage: Array.isArray(metric.dashboard_usage) ? metric.dashboard_usage.join(';') : (typeof metric.dashboard_usage === 'string' ? metric.dashboard_usage : ''),
      segment_eligibility: metric.segment_eligibility || '',
      related_metrics: Array.isArray(metric.related_metrics) ? metric.related_metrics.join(';') : (typeof metric.related_metrics === 'string' ? metric.related_metrics : ''),
      derived_kpis: Array.isArray(metric.derived_kpis) ? metric.derived_kpis.join(';') : (typeof metric.derived_kpis === 'string' ? metric.derived_kpis : ''),
      sql_query: metric.sql_query || '',
      calculation_notes: metric.calculation_notes || '',
      business_use_case: metric.business_use_case || '',
      data_sensitivity: metric.data_sensitivity || '',
      pii_flag: metric.pii_flag ?? false,
    };
  }

  if (entityType === 'dimension') {
    const dimension = entity as NormalizedDimension;
    return {
      ...baseData,
      formula: (dimension as { formula?: string }).formula || '',
      industry: typeof dimension.industry === 'string' ? dimension.industry : '',
      priority: dimension.priority || '',
      core_area: dimension.core_area || '',
      scope: dimension.scope || '',
      data_type: dimension.data_type || '',
      aggregation_window: dimension.aggregation_window || '',
      ga4_event: dimension.ga4_event || '',
      adobe_event: dimension.adobe_event || '',
      w3_data_layer: dimension.w3_data_layer || '',
      ga4_data_layer: dimension.ga4_data_layer || '',
      adobe_client_data_layer: dimension.adobe_client_data_layer || '',
      xdm_mapping: dimension.xdm_mapping || '',
      dependencies: dimension.dependencies || '',
      dependenciesData: parseDependencies(dimension.dependencies),
      source_data: dimension.source_data || '',
      report_attributes: dimension.report_attributes || '',
      dashboard_usage: Array.isArray(dimension.dashboard_usage) ? dimension.dashboard_usage.join(';') : (typeof dimension.dashboard_usage === 'string' ? dimension.dashboard_usage : ''),
      segment_eligibility: dimension.segment_eligibility || '',
      related_dimensions: Array.isArray(dimension.related_dimensions) ? dimension.related_dimensions.join(';') : (typeof dimension.related_dimensions === 'string' ? dimension.related_dimensions : ''),
      derived_dimensions: Array.isArray(dimension.derived_dimensions) ? dimension.derived_dimensions.join(';') : (typeof dimension.derived_dimensions === 'string' ? dimension.derived_dimensions : ''),
      sql_query: dimension.sql_query || '',
      calculation_notes: dimension.calculation_notes || '',
      business_use_case: dimension.business_use_case || '',
      data_sensitivity: dimension.data_sensitivity || '',
      pii_flag: dimension.pii_flag ?? false,
    };
  }

  if (entityType === 'event') {
    const event = entity as NormalizedEvent;
    return {
      ...baseData,
      event_serialization: (event as { event_serialization?: string }).event_serialization || '',
      industry: typeof event.industry === 'string' ? event.industry : '',
      priority: event.priority || '',
      core_area: event.core_area || '',
      scope: event.scope || '',
      event_type: event.event_type || '',
      aggregation_window: event.aggregation_window || '',
      ga4_event: event.ga4_event || '',
      adobe_event: event.adobe_event || '',
      w3_data_layer: event.w3_data_layer || '',
      ga4_data_layer: event.ga4_data_layer || '',
      adobe_client_data_layer: event.adobe_client_data_layer || '',
      xdm_mapping: event.xdm_mapping || '',
      parameters: event.parameters || '',
      dependencies: event.dependencies || '',
      dependenciesData: parseDependencies(event.dependencies),
      source_data: event.source_data || '',
      report_attributes: event.report_attributes || '',
      dashboard_usage: Array.isArray(event.dashboard_usage) ? event.dashboard_usage.join(';') : (typeof event.dashboard_usage === 'string' ? event.dashboard_usage : ''),
      segment_eligibility: event.segment_eligibility || '',
      related_dimensions: Array.isArray(event.related_dimensions) ? event.related_dimensions.join(';') : (typeof event.related_dimensions === 'string' ? event.related_dimensions : ''),
      derived_dimensions: Array.isArray(event.derived_dimensions) ? event.derived_dimensions.join(';') : (typeof event.derived_dimensions === 'string' ? event.derived_dimensions : ''),
      derived_metrics: Array.isArray(event.derived_metrics) ? event.derived_metrics.join(';') : (typeof event.derived_metrics === 'string' ? event.derived_metrics : ''),
      derived_kpis: Array.isArray(event.derived_kpis) ? event.derived_kpis.join(';') : (typeof event.derived_kpis === 'string' ? event.derived_kpis : ''),
      calculation_notes: event.calculation_notes || '',
      business_use_case: event.business_use_case || '',
      data_sensitivity: event.data_sensitivity || '',
      pii_flag: event.pii_flag ?? false,
    };
  }

  if (entityType === 'dashboard') {
    const dashboard = entity as NormalizedDashboard;
    return {
      ...baseData,
    };
  }

  return baseData;
}

function parseDependencies(deps: string | null | undefined): DependenciesData {
  try {
    if (deps) {
      const parsed = JSON.parse(deps);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          Events: Array.isArray(parsed.Events) ? parsed.Events : [],
          Metrics: Array.isArray(parsed.Metrics) ? parsed.Metrics : [],
          Dimensions: Array.isArray(parsed.Dimensions) ? parsed.Dimensions : [],
          KPIs: Array.isArray(parsed.KPIs) ? parsed.KPIs : [],
        };
      }
    }
  } catch {
    // If not valid JSON, return empty structure
  }
  return {
    Events: [],
    Metrics: [],
    Dimensions: [],
    KPIs: [],
  };
}

export default function EntityEditForm<T extends NormalizedKpi | NormalizedMetric | NormalizedDimension | NormalizedEvent | NormalizedDashboard>({
  entity,
  entityType,
  slug,
  canEdit,
  entityId,
}: EntityEditFormProps<T>) {
  const router = useRouter();
  const { user } = useAuth();
  const config = getEntityFormConfig(entityType);

  const initialFormState = useMemo(() => normalizeEntityToFormData(entity, entityType), [entity, entityType]);

  const [formData, setFormData] = useState<Record<string, unknown>>(initialFormState);
  const [activeTab, setActiveTab] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [dependencyInputs, setDependencyInputs] = useState<Record<string, string>>({
    Events: '',
    Metrics: '',
    Dimensions: '',
    KPIs: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    const tags = (formData.tags as string[]) || [];
    if (!trimmed || tags.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, tags: [...tags, trimmed] }));
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const tags = (formData.tags as string[]) || [];
    setFormData((prev) => ({ ...prev, tags: tags.filter((t) => t !== tag) }));
  };

  const handleAddDependency = (section: keyof DependenciesData) => {
    const input = dependencyInputs[section].trim();
    if (!input) return;
    
    const depsData = (formData.dependenciesData as DependenciesData) || {};
    const currentItems = depsData[section] || [];
    if (currentItems.includes(input)) return;
    
    setFormData((prev) => ({
      ...prev,
      dependenciesData: {
        ...depsData,
        [section]: [...currentItems, input],
      },
    }));
    
    setDependencyInputs((prev) => ({ ...prev, [section]: '' }));
  };

  const handleRemoveDependency = (section: keyof DependenciesData, item: string) => {
    const depsData = (formData.dependenciesData as DependenciesData) || {};
    setFormData((prev) => ({
      ...prev,
      dependenciesData: {
        ...depsData,
        [section]: (depsData[section] || []).filter((i) => i !== item),
      },
    }));
  };

  // Handle browser navigation warning when saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (savingRef.current) {
        e.preventDefault();
        e.returnValue = 'Your changes are being saved. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  async function handleSave() {
    if (!user) {
      setError('You need to sign in to save changes.');
      return;
    }

    setSaving(true);
    savingRef.current = true;
    setError(null);

    // Create abort controller for the request
    abortControllerRef.current = new AbortController();

    try {
      // Convert dependenciesData to JSON string before saving
      const dependenciesJson = JSON.stringify(formData.dependenciesData || {});
      const dataToSave = {
        ...formData,
        dependencies: dependenciesJson,
      };

      const response = await fetch(config.apiEndpoint(entityId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToSave }),
        signal: abortControllerRef.current.signal,
        // Use keepalive to allow request to complete even if page is closed
        keepalive: true,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || `Failed to save ${config.entityName}.`);
      }

      // Only redirect if we're still on the page
      if (!abortControllerRef.current.signal.aborted) {
        router.push(config.redirectPath(slug));
      }
    } catch (err) {
      // Don't show error if request was aborted (user navigated away)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[EntityEditForm] Save request aborted - user navigated away');
        // The save may still complete on the server due to keepalive
        return;
      }
      setError(err instanceof Error ? err.message : `Failed to update ${config.entityName}.`);
    } finally {
      setSaving(false);
      savingRef.current = false;
      abortControllerRef.current = null;
    }
  }

  if (!canEdit) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Editing unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          You do not have permission to edit this {config.entityName}. Please contact an administrator if you believe this is an error.
        </p>
        <Link href={config.backPath(slug)} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to {config.entityName}
        </Link>
      </main>
    );
  }

  // Ensure tabs exist - defensive check
  const tabs = config.tabs && config.tabs.length > 0 ? config.tabs : ['Basic Info'];
  
  // Get fields for current tab
  const currentTabFields = config.fields.filter(
    (field) => field.tab === activeTab && shouldShowField(field, entityType)
  );

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link
        href={config.backPath(slug)}
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
        ← Cancel Editing
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>
          Edit {config.entityName}: {(formData.name as string) || entity.name}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: saving ? 'var(--ifm-color-emphasis-400)' : 'var(--ifm-color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {saving ? 'Saving…' : 'Save All'}
          </button>
          {saving && (
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', textAlign: 'right', fontWeight: 500 }}>
              ⚠️ Please wait - do not close this page while saving
            </span>
          )}
          <span style={{ fontSize: '0.825rem', color: 'var(--ifm-color-emphasis-600)', textAlign: 'right' }}>
            Saved as draft, will be Published only after the Editorial Review.
          </span>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {tabs.length > 1 && (
        <div style={{
          borderBottom: '1px solid var(--ifm-color-emphasis-200)',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === idx ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
                  color: activeTab === idx ? 'var(--ifm-color-primary)' : 'var(--ifm-font-color-base)',
                  fontWeight: activeTab === idx ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ minHeight: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {currentTabFields.map((field, index) => {
            const fieldValue = formData[field.name];
            
            if (field.type === 'text') {
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <input
                    type="text"
                    value={(fieldValue as string) || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: field.style?.fontFamily === 'monospace' ? 'monospace' : 'inherit',
                    }}
                  />
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <textarea
                    value={(fieldValue as string) || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: field.style?.fontFamily === 'monospace' ? 'monospace' : 'inherit',
                    }}
                  />
                </div>
              );
            }

            if (field.type === 'select') {
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <select
                    value={(fieldValue as string) || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    required={field.required}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="">None</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.type === 'checkbox') {
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={(fieldValue as boolean) || false}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.checked }))}
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: 'pointer',
                      }}
                    />
                    <span>{field.label}</span>
                  </label>
                </div>
              );
            }

            if (field.type === 'tags') {
              const tags = (fieldValue as string[]) || [];
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                    }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--ifm-color-primary)',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#fff',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '1rem',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            if (field.type === 'semicolon-list') {
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <input
                    type="text"
                    value={(fieldValue as string) || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              );
            }

            if (field.type === 'dependencies') {
              const depsData = (formData.dependenciesData as DependenciesData) || {};
              return (
                <div key={`${field.name}-${field.label}-${index}`}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem', fontStyle: 'italic' }}>
                    Prerequisite: List the dependencies required for this {config.entityName}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', backgroundColor: 'var(--ifm-color-emphasis-50)' }}>
                    {(['Events', 'Metrics', 'Dimensions', 'KPIs'] as const).map((section) => (
                      <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {section}:
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={dependencyInputs[section]}
                            onChange={(e) => setDependencyInputs((prev) => ({ ...prev, [section]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddDependency(section);
                              }
                            }}
                            placeholder={`Add ${section.toLowerCase()} and press Enter`}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              border: '1px solid var(--ifm-color-emphasis-300)',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDependency(section)}
                            style={{
                              padding: '0.75rem 1rem',
                              backgroundColor: 'var(--ifm-color-primary)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Add
                          </button>
                        </div>
                        {depsData[section] && depsData[section]!.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {depsData[section]!.map((item) => (
                              <span
                                key={item}
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  backgroundColor: 'var(--ifm-color-primary)',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDependency(section, item)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontSize: '1rem',
                                    lineHeight: 1,
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </main>
  );
}

