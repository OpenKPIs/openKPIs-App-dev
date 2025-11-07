'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase, STATUS, getCurrentUser } from '@/lib/supabase';

interface KPI {
  id: string;
  slug: string;
  name: string;
  description?: string;
  tags?: string[];
  category?: string;
  industry?: string[];
  status: 'draft' | 'published' | 'archived';
  created_by: string;
}

function KPIsPageContent() {
  const searchParams = useSearchParams();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Filters from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [industryFilter, setIndustryFilter] = useState(searchParams.get('industry') || '');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    try {
      // Get current user
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const userName = currentUser?.user_metadata?.user_name || currentUser?.email;

      // Build query
      let query = supabase.from('kpis').select('*');

      if (userName) {
        // Show published items OR items created by current user (including drafts)
        query = query.or(`status.eq.published,created_by.eq.${userName}`);
      } else {
        // Not signed in, only show published
        query = query.eq('status', STATUS.PUBLISHED);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Supabase error:', error);
        setKpis([]);
        return;
      }

      setKpis((data || []) as KPI[]);
    } catch (err) {
      console.error('Error loading KPIs:', err);
      setKpis([]);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique tags, categories, industries
  const tags = useMemo(() => 
    Array.from(new Set(kpis.flatMap(k => k.tags || []))).sort(),
    [kpis]
  );
  const categories = useMemo(() => 
    Array.from(new Set(kpis.map(k => k.category).filter(Boolean))).sort(),
    [kpis]
  );
  const industries = useMemo(() => 
    Array.from(new Set(kpis.flatMap(k => k.industry || []))).sort(),
    [kpis]
  );

  // Filter KPIs
  const filteredKPIs = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();
    return kpis.filter(kpi => {
      const searchableText = [
        kpi.name,
        kpi.description,
        ...(kpi.tags || []),
        kpi.category,
        ...(kpi.industry || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchQuery = !queryLower || searchableText.includes(queryLower);
      const matchTag = !tagFilter || (kpi.tags || []).includes(tagFilter);
      const matchCategory = !categoryFilter || kpi.category === categoryFilter;
      const matchIndustry = !industryFilter || (kpi.industry || []).includes(industryFilter);
      
      return matchQuery && matchTag && matchCategory && matchIndustry;
    });
  }, [kpis, searchQuery, tagFilter, categoryFilter, industryFilter]);

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading KPIs...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          KPIs
        </h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1.5rem' }}>
          Standardized KPI definitions with formulas, implementation guides, and platform equivalents.
        </p>

        {/* Add New Button */}
        <Link
          href="/kpis/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary-dark)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New KPI
        </Link>
      </div>

      {/* Filters */}
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
            placeholder="Search KPIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Tag
          </label>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All Tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Industry
          </label>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '0.375rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
            }}
          >
            <option value="">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
        {filteredKPIs.length} {filteredKPIs.length === 1 ? 'KPI' : 'KPIs'} found
      </div>

      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredKPIs.map(kpi => (
          <Link
            key={kpi.id}
            href={`/kpis/${kpi.slug}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{
              backgroundColor: 'var(--ifm-background-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              border: '1px solid var(--ifm-color-emphasis-200)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: 'var(--ifm-color-emphasis-900)',
                  flex: 1,
                }}>
                  {kpi.name}
                  {kpi.status === 'draft' && (
                    <span style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: '#fbbf24',
                      color: '#78350f',
                      borderRadius: '4px',
                      fontWeight: '500',
                    }}>
                      Draft
                    </span>
                  )}
                </h3>
              </div>
              
              {kpi.description && (
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
                  {kpi.description}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
                {kpi.category && (
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--ifm-color-emphasis-100)',
                    borderRadius: '4px',
                    color: 'var(--ifm-color-emphasis-700)',
                  }}>
                    {kpi.category}
                  </span>
                )}
                {kpi.tags && kpi.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-100)',
                      borderRadius: '4px',
                      color: 'var(--ifm-color-emphasis-700)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredKPIs.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ifm-color-emphasis-600)' }}>
          <p>No KPIs found. Try adjusting your filters.</p>
          {!user && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <Link href="/kpis/new" style={{ color: 'var(--ifm-color-primary)' }}>
                Create the first KPI
              </Link>
            </p>
          )}
        </div>
      )}
    </main>
  );
}

export default function KPIsPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading KPIs...</p>
        </main>
      }
    >
      <KPIsPageContent />
    </Suspense>
  );
}

