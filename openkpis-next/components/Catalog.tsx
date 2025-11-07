'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase, STATUS, getCurrentUser } from '@/lib/supabase';

interface Item {
  id: string;
  title: string;
  description?: string;
  slug: string;
  tags?: string[];
  category?: string[];
  industry?: string[];
  status?: 'draft' | 'published' | 'archived';
}

interface CatalogProps {
  section: 'kpis' | 'dimensions' | 'events' | 'metrics' | 'dashboards';
}

export default function Catalog({ section }: CatalogProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [cat, setCat] = useState('');
  const [ind, setInd] = useState('');

  useEffect(() => {
    loadData();
  }, [section]);

  async function loadData() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const userName = currentUser?.user_metadata?.user_name || currentUser?.email;

      let query = supabase.from(section).select('*');

      if (userName) {
        query = query.or(`status.eq.published,created_by.eq.${userName}`);
      } else {
        query = query.eq('status', STATUS.PUBLISHED);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Supabase error:', error);
        setItems([]);
        return;
      }

      const transformedItems: Item[] = (data || []).map(item => ({
        id: item.id,
        title: item.name + (item.status === 'draft' ? ' (Draft)' : ''),
        description: item.description,
        slug: item.slug,
        tags: item.tags || [],
        category: item.category ? [item.category] : [],
        industry: item.industry || [],
        status: item.status,
      }));

      setItems(transformedItems);
    } catch (err) {
      console.error('Error loading data:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const tags = useMemo(() => Array.from(new Set(items.flatMap(i => i.tags || []))).sort(), [items]);
  const cats = useMemo(() => Array.from(new Set(items.flatMap(i => i.category || []))).sort(), [items]);
  const inds = useMemo(() => Array.from(new Set(items.flatMap(i => i.industry || []))).sort(), [items]);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return items.filter(i => {
      const searchableText = [
        i.title,
        i.description,
        ...(i.tags || []),
        ...(i.category || []),
        ...(i.industry || [])
      ].filter(Boolean).join(' ').toLowerCase();

      const matchQ = !qlc || searchableText.includes(qlc);
      const matchTag = !tag || (i.tags || []).includes(tag);
      const matchCat = !cat || (i.category || []).includes(cat);
      const matchInd = !ind || (i.industry || []).includes(ind);

      return matchQ && matchTag && matchCat && matchInd;
    });
  }, [items, q, tag, cat, ind]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const baseUrl = section === 'metrics' ? '/metrics' : `/${section}`;
  const newUrl = section === 'dashboards' ? '/dashboards/new' : `${baseUrl}/new`;
  const sectionName = section.charAt(0).toUpperCase() + section.slice(1);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{sectionName}</h2>
        <Link
          href={newUrl}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '500',
          }}
        >
          Add New {sectionName.slice(0, -1)}
        </Link>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--ifm-color-emphasis-50)',
        borderRadius: '8px',
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Search
          </label>
          <input
            type="text"
            placeholder={`Search ${sectionName}...`}
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Tag
          </label>
          <select
            value={tag}
            onChange={e => setTag(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All</option>
            {tags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Category
          </label>
          <select
            value={cat}
            onChange={e => setCat(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {inds.length > 0 && (
          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
              Industry
            </label>
            <select
              value={ind}
              onChange={e => setInd(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            >
              <option value="">All</option>
              {inds.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
        {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {filtered.map(item => {
          const href = item.status === 'published'
            ? `${baseUrl}/${item.slug}`
            : section === 'kpis' ? `/kpis/${item.slug}/edit` : `${baseUrl}/${item.slug}`;

          return (
            <Link
              key={item.id}
              href={href}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                backgroundColor: 'var(--ifm-background-color)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid var(--ifm-color-emphasis-200)',
                transition: 'all 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
              }}
              >
                <h3 style={{
                  margin: '0 0 0.75rem 0',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                }}>
                  {item.title}
                </h3>
                {item.description && (
                  <p style={{
                    color: 'var(--ifm-color-emphasis-600)',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.description}
                  </p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                  {item.category && item.category[0] && (
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-100)',
                      borderRadius: '4px',
                    }}>
                      {item.category[0]}
                    </span>
                  )}
                  {item.tags && item.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'var(--ifm-color-emphasis-100)',
                        borderRadius: '4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ifm-color-emphasis-600)' }}>
          <p>No items found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

