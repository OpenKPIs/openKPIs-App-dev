'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getCurrentUser, STATUS } from '@/lib/supabase';

const CATEGORIES = ['Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition', 'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'];
const INDUSTRIES = ['Retail', 'E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance', 'Media', 'Technology', 'Manufacturing', 'Other'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const KPI_TYPES = ['Counter', 'Rate', 'Ratio', 'Percentage', 'Average', 'Sum'];
const SCOPES = ['User', 'Session', 'Event', 'Global'];

interface FormData {
  name: string;
  description: string;
  formula: string;
  category: string;
  tags: string[];
  industry: string;
  priority: string;
  core_area: string;
  scope: string;
  kpi_type: string;
  measure: string;
  aggregation_window: string;
  ga4_implementation: string;
  adobe_implementation: string;
  amplitude_implementation: string;
  data_layer_mapping: string;
  xdm_mapping: string;
  dependencies: string;
  bi_source_system: string;
  report_attributes: string;
  dashboard_usage: string;
  segment_eligibility: string;
  related_kpis: string[];
  sql_query: string;
  calculation_notes: string;
  details: string;
  status: 'draft' | 'published';
}

export default function KPIEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    formula: '',
    category: '',
    tags: [],
    industry: '',
    priority: '',
    core_area: '',
    scope: '',
    kpi_type: '',
    measure: '',
    aggregation_window: '',
    ga4_implementation: '',
    adobe_implementation: '',
    amplitude_implementation: '',
    data_layer_mapping: '',
    xdm_mapping: '',
    dependencies: '',
    bi_source_system: '',
    report_attributes: '',
    dashboard_usage: '',
    segment_eligibility: '',
    related_kpis: [],
    sql_query: '',
    calculation_notes: '',
    details: '',
    status: 'draft',
  });

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  async function loadData() {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    const { data, error: kpiError } = await supabase
      .from('kpis')
      .select('*')
      .eq('slug', slug)
      .single();

    if (kpiError || !data) {
      setError('KPI not found');
      setLoading(false);
      return;
    }

    // Check if user can edit
    const userName = currentUser?.user_metadata?.user_name || currentUser?.email;
    const ownership = data as { created_by?: string | null };
    if (ownership.created_by !== userName) {
      setError('You can only edit KPIs you created');
      setLoading(false);
      return;
    }

    const kpiRecord = data as Record<string, any>;
    setKpi(kpiRecord);
    setFormData({
      name: kpiRecord.name || '',
      description: kpiRecord.description || '',
      formula: kpiRecord.formula || '',
      category: kpiRecord.category || '',
      tags: kpiRecord.tags || [],
      industry: kpiRecord.industry || '',
      priority: kpiRecord.priority || '',
      core_area: kpiRecord.core_area || '',
      scope: kpiRecord.scope || '',
      kpi_type: kpiRecord.kpi_type || '',
      measure: kpiRecord.measure || '',
      aggregation_window: kpiRecord.aggregation_window || '',
      ga4_implementation: kpiRecord.ga4_implementation || '',
      adobe_implementation: kpiRecord.adobe_implementation || '',
      amplitude_implementation: kpiRecord.amplitude_implementation || '',
      data_layer_mapping: kpiRecord.data_layer_mapping || '',
      xdm_mapping: kpiRecord.xdm_mapping || '',
      dependencies: kpiRecord.dependencies || '',
      bi_source_system: kpiRecord.bi_source_system || '',
      report_attributes: kpiRecord.report_attributes || '',
      dashboard_usage: kpiRecord.dashboard_usage || '',
      segment_eligibility: kpiRecord.segment_eligibility || '',
      related_kpis: kpiRecord.related_kpis || [],
      sql_query: kpiRecord.sql_query || '',
      calculation_notes: kpiRecord.calculation_notes || '',
      details: kpiRecord.details || '',
      status: kpiRecord.status || 'draft',
    });
    setLoading(false);
  }

  async function handleSave() {
    if (!user || !kpi) {
      setError('Please sign in to edit');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const userName = user.user_metadata?.user_name || user.email;

      const updateData: any = {
        ...formData,
        last_modified_by: userName,
        last_modified_at: new Date().toISOString(),
      };

      const { error: updateError } = await (supabase
        .from('kpis') as any)
        .update(updateData)
        .eq('id', kpi.id);

      if (updateError) {
        setError(updateError.message || 'Failed to update KPI');
        setSaving(false);
        return;
      }

      // Only sync to GitHub/MDX if status is 'published'
      if (formData.status === 'published') {
        // Trigger GitHub sync via API
        const syncResponse = await fetch(`/api/kpis/${kpi.id}/sync-github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'edited' }),
        });
        
        if (syncResponse.ok) {
          setSuccess('KPI updated and synced to GitHub!');
        } else {
          setSuccess('KPI updated. GitHub sync may be pending.');
        }
      } else {
        setSuccess('KPI saved as draft. Publish to sync to GitHub.');
      }

      setTimeout(() => {
        router.push(`/kpis/${slug}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update KPI');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (error && !kpi) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPIs
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link
        href={`/kpis/${slug}`}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600' }}>Edit KPI: {formData.name}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {success && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          {success}
        </div>
      )}
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

      {/* Tabs */}
      <div style={{
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['Basic Info', 'Business Context', 'Technical', 'Platform Implementation', 'Data Mappings', 'SQL', 'Documentation'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === idx ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
                color: activeTab === idx ? 'var(--ifm-color-primary)' : 'var(--ifm-font-color-base)',
                fontWeight: activeTab === idx ? '600' : '400',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: '400px' }}>
        {/* Basic Info */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Formula</label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tags</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
                      setTagInput('');
                    }
                  }
                }}
                placeholder="Add a tag and press Enter"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'white',
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        )}

        {/* Business Context */}
        {activeTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {PRIORITIES.map(pri => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Core Area</label>
              <input
                type="text"
                value={formData.core_area}
                onChange={(e) => setFormData(prev => ({ ...prev, core_area: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Scope</label>
              <select
                value={formData.scope}
                onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {SCOPES.map(sc => (
                  <option key={sc} value={sc}>{sc}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Technical */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>KPI Type</label>
              <select
                value={formData.kpi_type}
                onChange={(e) => setFormData(prev => ({ ...prev, kpi_type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">None</option>
                {KPI_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Measure</label>
              <input
                type="text"
                value={formData.measure}
                onChange={(e) => setFormData(prev => ({ ...prev, measure: e.target.value }))}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Aggregation Window</label>
              <input
                type="text"
                value={formData.aggregation_window}
                onChange={(e) => setFormData(prev => ({ ...prev, aggregation_window: e.target.value }))}
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

        {/* Platform Implementation */}
        {activeTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>GA4 Implementation</label>
              <textarea
                value={formData.ga4_implementation}
                onChange={(e) => setFormData(prev => ({ ...prev, ga4_implementation: e.target.value }))}
                rows={6}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Adobe Implementation</label>
              <textarea
                value={formData.adobe_implementation}
                onChange={(e) => setFormData(prev => ({ ...prev, adobe_implementation: e.target.value }))}
                rows={6}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Amplitude Implementation</label>
              <textarea
                value={formData.amplitude_implementation}
                onChange={(e) => setFormData(prev => ({ ...prev, amplitude_implementation: e.target.value }))}
                rows={6}
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

        {/* Data Mappings */}
        {activeTab === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Data Layer Mapping</label>
              <textarea
                value={formData.data_layer_mapping}
                onChange={(e) => setFormData(prev => ({ ...prev, data_layer_mapping: e.target.value }))}
                rows={8}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>XDM Mapping</label>
              <textarea
                value={formData.xdm_mapping}
                onChange={(e) => setFormData(prev => ({ ...prev, xdm_mapping: e.target.value }))}
                rows={8}
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

        {/* SQL */}
        {activeTab === 5 && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SQL Query</label>
            <textarea
              value={formData.sql_query}
              onChange={(e) => setFormData(prev => ({ ...prev, sql_query: e.target.value }))}
              rows={15}
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

        {/* Documentation */}
        {activeTab === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Calculation Notes</label>
              <textarea
                value={formData.calculation_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, calculation_notes: e.target.value }))}
                rows={8}
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
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Details</label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                rows={10}
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

