'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getCurrentUser } from '@/lib/supabase';

type Status = 'draft' | 'published';

interface FormData {
  name: string;
  description: string;
  formula: string;
  category: string;
  tags: string[];
  status: Status;
}

export default function MetricEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [metric, setMetric] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    formula: '',
    category: '',
    tags: [],
    status: 'draft',
  });

  useEffect(() => {
    if (slug) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function loadData() {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    const { data, error: selErr } = await supabase
      .from('metrics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (selErr || !data) {
      setError('Metric not found');
      setLoading(false);
      return;
    }

    const userName = currentUser?.user_metadata?.user_name || currentUser?.email;
    const ownership = data as { created_by?: string | null };
    if (ownership.created_by !== userName) {
      setError('You can only edit Metrics you created');
      setLoading(false);
      return;
    }

    setMetric(data as any);
    const rec = data as Partial<{
      name: string;
      description: string;
      formula: string;
      category: string;
      tags: string[];
      status: Status;
    }>;
    setFormData({
      name: rec?.name || '',
      description: rec?.description || '',
      formula: rec?.formula || '',
      category: rec?.category || '',
      tags: (rec?.tags as string[]) || [],
      status: (rec?.status as Status) || 'draft',
    });
    setLoading(false);
  }

  async function handleSave() {
    if (!user || !metric) {
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

      const { error: updErr } = await (supabase
        .from('metrics') as any)
        .update(updateData)
        .eq('id', metric.id);

      if (updErr) {
        setError(updErr.message || 'Failed to update Metric');
        setSaving(false);
        return;
      }

      if (formData.status === 'published') {
        const syncResponse = await fetch(`/api/metrics/${metric.id}/sync-github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'edited' }),
        });
        if (syncResponse.ok) {
          setSuccess('Metric updated and synced to GitHub!');
        } else {
          setSuccess('Metric updated. GitHub sync may be pending.');
        }
      } else {
        setSuccess('Metric saved as draft. Publish to sync to GitHub.');
      }

      setTimeout(() => {
        router.push(`/metrics/${slug}`);
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Failed to update Metric');
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

  if (error && !metric) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error</h1>
        <p>{error}</p>
        <Link href="/metrics" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Metrics
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600' }}>Edit Metric: {formData.name}</h1>
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
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {success && (
        <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.25rem' }}>
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
            {['Conversion','Revenue','Engagement','Retention','Acquisition','Performance','Quality','Efficiency','Satisfaction','Growth','Other'].map(cat => (
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
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Status }))}
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
    </main>
  );
}





