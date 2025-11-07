'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getCurrentUser, STATUS } from '@/lib/supabase';

export default function NewKPIPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    formula: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);

    if (!currentUser) {
      setError('Please sign in to create a KPI');
    }
  }

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to create a KPI');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userName = user.user_metadata?.user_name || user.email;
      const slug = formData.slug || generateSlug(formData.name);

      // Check if slug already exists
      const { data: existing } = await supabase
        .from('kpis')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        setError('A KPI with this name already exists. Please choose a different name.');
        setSaving(false);
        return;
      }

      const { data: kpi, error: insertError } = await supabase
        .from('kpis')
        .insert({
          name: formData.name,
          description: formData.description,
          slug: slug,
          formula: formData.formula,
          category: formData.category,
          tags: formData.tags,
          status: formData.status,
          created_by: userName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message || 'Failed to create KPI');
        setSaving(false);
        return;
      }

      // Sync to GitHub in background if published
      if (formData.status === 'published') {
        fetch(`/api/kpis/${kpi.id}/sync-github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'created' }),
        }).catch(err => {
          console.error('GitHub sync error:', err);
        });
      }

      // Redirect to edit page
      router.push(`/kpis/${slug}/edit`);
    } catch (err: any) {
      setError(err.message || 'Failed to create KPI');
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

  if (!user) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>
          Create New KPI
        </h1>
        <div style={{
          padding: '2rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
            Please sign in to create a new KPI
          </p>
          <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>
            You need to be signed in with GitHub to contribute KPIs to the repository.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link
        href="/kpis"
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
        ← Back to KPIs
      </Link>

      <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '2rem' }}>
        Create New KPI
      </h1>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            KPI Name <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, name: e.target.value }));
              if (!formData.slug) {
                setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
              }
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
            placeholder="e.g., Order Conversion Rate"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              backgroundColor: 'var(--ifm-color-emphasis-50)',
            }}
            placeholder="auto-generated-from-name"
          />
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
            URL-friendly identifier (auto-generated from name)
          </p>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Description
          </label>
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
            placeholder="Brief description of the KPI..."
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Formula
          </label>
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
            placeholder="e.g., (Orders / Visitors) * 100"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Category
          </label>
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
            <option value="Conversion">Conversion</option>
            <option value="Revenue">Revenue</option>
            <option value="Engagement">Engagement</option>
            <option value="Retention">Retention</option>
            <option value="Acquisition">Acquisition</option>
            <option value="Performance">Performance</option>
            <option value="Quality">Quality</option>
            <option value="Efficiency">Efficiency</option>
            <option value="Satisfaction">Satisfaction</option>
            <option value="Growth">Growth</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Tags
          </label>
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
                  type="button"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Status
          </label>
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
          <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
            Draft: Only visible to you. Published: Visible to everyone and synced to GitHub.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {saving ? 'Creating...' : 'Create KPI'}
          </button>
          <Link
            href="/kpis"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'transparent',
              color: 'var(--ifm-font-color-base)',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

