'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthClientProvider';
import type { NormalizedMetric } from '@/lib/server/metrics';

const CATEGORIES = ['Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition', 'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'];
const INDUSTRIES = ['Retail', 'E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance', 'Media', 'Technology', 'Manufacturing', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const KPI_TYPES = ['Counter', 'Rate', 'Ratio', 'Percentage', 'Average', 'Sum'];
const SCOPES = ['User', 'Session', 'Event', 'Global'];

type DependenciesData = {
  Events?: string[];
  Metrics?: string[];
  Dimensions?: string[];
  KPIs?: string[];
};

type FormData = {
  name: string;
  description: string;
  formula: string;
  category: string;
  tags: string[];
  industry: string;
  priority: string;
  core_area: string;
  scope: string;
  measure_type: string;
  aggregation_window: string;
  ga4_event: string;
  adobe_event: string;
  w3_data_layer: string;
  ga4_data_layer: string;
  adobe_client_data_layer: string;
  xdm_mapping: string;
  dependencies: string; // Stored as JSON string
  dependenciesData: DependenciesData; // Internal structured data
  source_data: string;
  report_attributes: string;
  dashboard_usage: string;
  segment_eligibility: string;
  related_metrics: string; // Changed from related_kpis
  derived_kpis: string; // New field
  sql_query: string;
  calculation_notes: string;
  business_use_case: string;
  data_sensitivity: string;
  pii_flag: boolean;
};

type AdditionalMetricFields = {
  dependencies?: string | null;
  source_data?: string | null;
  report_attributes?: string | null;
  dashboard_usage?: string | null;
  segment_eligibility?: string | null;
  measure_type?: string | null;
  related_metrics?: string[] | string | null;
  derived_kpis?: string[] | string | null;
};

export type EditableMetric = NormalizedMetric & AdditionalMetricFields;

type MetricEditClientProps = {
  metric: EditableMetric;
  slug: string;
  canEdit: boolean;
};

export default function MetricEditClient({ metric, slug, canEdit }: MetricEditClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const initialFormState: FormData = useMemo(
    () => ({
      name: metric.name || '',
      description: metric.description || '',
      formula: metric.formula || '',
      category: metric.category || '',
      tags: metric.tags ?? [],
      industry: typeof metric.industry === 'string' ? metric.industry : '', // String, not array
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
      dependenciesData: (() => {
        try {
          if (metric.dependencies) {
            const parsed = JSON.parse(metric.dependencies);
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
      })(),
      source_data: metric.source_data || '',
      report_attributes: metric.report_attributes || '',
      dashboard_usage: Array.isArray(metric.dashboard_usage) 
        ? metric.dashboard_usage.join(';')
        : (typeof metric.dashboard_usage === 'string' ? metric.dashboard_usage : ''),
      segment_eligibility: metric.segment_eligibility || '',
      related_metrics: Array.isArray(metric.related_metrics) 
        ? metric.related_metrics.join(';')
        : (typeof metric.related_metrics === 'string' ? metric.related_metrics : ''),
      derived_kpis: Array.isArray(metric.derived_kpis) 
        ? metric.derived_kpis.join(';')
        : (typeof metric.derived_kpis === 'string' ? metric.derived_kpis : ''),
      sql_query: metric.sql_query || '',
      calculation_notes: metric.calculation_notes || '',
      business_use_case: metric.business_use_case || '',
      data_sensitivity: metric.data_sensitivity || '',
      pii_flag: metric.pii_flag ?? false,
    }),
    [metric],
  );

  const [formData, setFormData] = useState<FormData>(initialFormState);
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

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || formData.tags.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleAddDependency = (section: keyof DependenciesData) => {
    const input = dependencyInputs[section].trim();
    if (!input) return;
    
    const currentItems = formData.dependenciesData[section] || [];
    if (currentItems.includes(input)) return;
    
    setFormData((prev) => ({
      ...prev,
      dependenciesData: {
        ...prev.dependenciesData,
        [section]: [...currentItems, input],
      },
    }));
    
    setDependencyInputs((prev) => ({ ...prev, [section]: '' }));
  };

  const handleRemoveDependency = (section: keyof DependenciesData, item: string) => {
    setFormData((prev) => ({
      ...prev,
      dependenciesData: {
        ...prev.dependenciesData,
        [section]: (prev.dependenciesData[section] || []).filter((i) => i !== item),
      },
    }));
  };


  async function handleSave() {
    if (!user) {
      setError('You need to sign in to save changes.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Convert dependenciesData to JSON string before saving
      const dependenciesJson = JSON.stringify(formData.dependenciesData);
      const dataToSave = {
        ...formData,
        dependencies: dependenciesJson,
      };

      const response = await fetch(`/api/items/metric/${metric.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataToSave }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'Failed to save Metric.');
      }

      router.push(`/metrics/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Metric.');
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Editing unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          You do not have permission to edit this Metric. Please contact an administrator if you believe this is an error.
        </p>
        <Link href={`/metrics/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Metric
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link
        href={`/metrics/${slug}`}
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
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Edit Metric: {formData.name || metric.name}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save All'}
          </button>
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

      <div style={{
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'SQL', 'Documentation'].map((tab, idx) => (
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

      <div style={{ minHeight: '400px' }}>
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Metric Name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Short definition and context"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Formula</label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => setFormData((prev) => ({ ...prev, formula: e.target.value }))}
                placeholder="Calculation logic in plain text"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tags</label>
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
                placeholder="Free-form labels (e.g., Engagement, Retail, Checkout)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {formData.tags.map((tag) => (
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
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Core Area</label>
              <input
                type="text"
                value={formData.core_area}
                onChange={(e) => setFormData((prev) => ({ ...prev, core_area: e.target.value }))}
                placeholder="e.g. Digital Analytics, Business Intelligence, Statistics, Data Science & AI etc."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Scope</label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData((prev) => ({ ...prev, scope: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {SCOPES.map((scope) => (
                  <option key={scope} value={scope}>
                    {scope}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Related Metrics</label>
              <input
                type="text"
                value={formData.related_metrics}
                onChange={(e) => setFormData((prev) => ({ ...prev, related_metrics: e.target.value }))}
                placeholder="Enter metrics separated by semicolons (e.g., metric1;metric2;metric3)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Derived KPIs</label>
              <input
                type="text"
                value={formData.derived_kpis}
                onChange={(e) => setFormData((prev) => ({ ...prev, derived_kpis: e.target.value }))}
                placeholder="Enter KPIs separated by semicolons (e.g., kpi1;kpi2;kpi3)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Source Data</label>
              <input
                type="text"
                value={formData.source_data}
                onChange={(e) => setFormData((prev) => ({ ...prev, source_data: e.target.value }))}
                placeholder="Digital Analytics, Business Intelligence, ERP, CRM etc."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Dependencies</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem', fontStyle: 'italic' }}>
                Prerequisite: List the dependencies required for this Metric
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
                    {formData.dependenciesData[section] && formData.dependenciesData[section]!.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {formData.dependenciesData[section]!.map((item) => (
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Report Attributes</label>
              <textarea
                value={formData.report_attributes}
                onChange={(e) => setFormData((prev) => ({ ...prev, report_attributes: e.target.value }))}
                rows={4}
                placeholder="Attributes in GA4/Adobe reports (Dimensions, Metrics, KPIs etc.)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Dashboard Usage</label>
              <input
                type="text"
                value={formData.dashboard_usage}
                onChange={(e) => setFormData((prev) => ({ ...prev, dashboard_usage: e.target.value }))}
                placeholder="Enter dashboards separated by semicolons (e.g., C-Suite;Merchandising;Traffic Analysis)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Segment Eligibility</label>
              <textarea
                value={formData.segment_eligibility}
                onChange={(e) => setFormData((prev) => ({ ...prev, segment_eligibility: e.target.value }))}
                rows={4}
                placeholder="Whether Metric can be used in segmentation (True/False)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Data Sensitivity</label>
              <select
                value={formData.data_sensitivity}
                onChange={(e) => setFormData((prev) => ({ ...prev, data_sensitivity: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                <option value="Public">Public</option>
                <option value="Internal">Internal</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={formData.pii_flag}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pii_flag: e.target.checked }))}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    cursor: 'pointer',
                  }}
                />
                <span>Contains PII (Personally Identifiable Information)</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Measure Type</label>
              <select
                value={formData.measure_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, measure_type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {KPI_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Aggregation Window</label>
              <input
                type="text"
                value={formData.aggregation_window}
                onChange={(e) => setFormData((prev) => ({ ...prev, aggregation_window: e.target.value }))}
                placeholder="Which aggregation are possible (Event, Session, User, Time based - Hourly/Daily/Monthly/Yearly)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GA4 Event</label>
              <textarea
                value={formData.ga4_event}
                onChange={(e) => setFormData((prev) => ({ ...prev, ga4_event: e.target.value }))}
                rows={6}
                placeholder="Google Analytics 4 event name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Adobe Event</label>
              <textarea
                value={formData.adobe_event}
                onChange={(e) => setFormData((prev) => ({ ...prev, adobe_event: e.target.value }))}
                rows={6}
                placeholder="Adobe Analytics event name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>W3 Data Layer</label>
              <textarea
                value={formData.w3_data_layer}
                onChange={(e) => setFormData((prev) => ({ ...prev, w3_data_layer: e.target.value }))}
                rows={8}
                placeholder="W3C Data Layer mapping (JSON format)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GA4 Data Layer</label>
              <textarea
                value={formData.ga4_data_layer}
                onChange={(e) => setFormData((prev) => ({ ...prev, ga4_data_layer: e.target.value }))}
                rows={8}
                placeholder="GA4 Data Layer mapping (JSON format)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Adobe Client Data Layer</label>
              <textarea
                value={formData.adobe_client_data_layer}
                onChange={(e) => setFormData((prev) => ({ ...prev, adobe_client_data_layer: e.target.value }))}
                rows={8}
                placeholder="Adobe Client Data Layer mapping (JSON format)"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>XDM Mapping</label>
              <textarea
                value={formData.xdm_mapping}
                onChange={(e) => setFormData((prev) => ({ ...prev, xdm_mapping: e.target.value }))}
                rows={8}
                placeholder="AEP XDM schema"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 5 && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>SQL Query</label>
            <textarea
              value={formData.sql_query}
              onChange={(e) => setFormData((prev) => ({ ...prev, sql_query: e.target.value }))}
              rows={15}
              placeholder="Standard SQL query"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            />
          </div>
        )}

        {activeTab === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Calculation Notes</label>
              <textarea
                value={formData.calculation_notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, calculation_notes: e.target.value }))}
                rows={8}
                placeholder="Specific caveats, or special considerations"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Use Case</label>
              <textarea
                value={formData.business_use_case}
                onChange={(e) => setFormData((prev) => ({ ...prev, business_use_case: e.target.value }))}
                rows={10}
                placeholder="Describe the business use case for this Metric"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
