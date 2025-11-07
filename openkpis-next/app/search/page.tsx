'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, STATUS } from '@/lib/supabase';

interface SearchResult {
  type: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string[];
  industry: string[];
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [searchQuery]);

  async function performSearch() {
    setIsSearching(true);
    try {
      const query = searchQuery.trim().toLowerCase();

      const [kpisResult, eventsResult, dimensionsResult, metricsResult] = await Promise.all([
        supabase.from('kpis').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`),
        supabase.from('events').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`),
        supabase.from('dimensions').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`),
        supabase.from('metrics').select('*').eq('status', STATUS.PUBLISHED).or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      ]);

      const allResults: SearchResult[] = [
        ...((kpisResult.data || []) as Array<any>).map(item => ({
          type: 'KPI',
          title: item.name,
          description: item.description || '',
          url: `/kpis/${item.slug}`,
          tags: item.tags || [],
          category: item.category ? [item.category] : [],
          industry: item.industry || []
        })),
        ...((eventsResult.data || []) as Array<any>).map(item => ({
          type: 'Event',
          title: item.name,
          description: item.description || '',
          url: `/events/${item.slug}`,
          tags: item.tags || [],
          category: item.category ? [item.category] : [],
          industry: []
        })),
        ...((dimensionsResult.data || []) as Array<any>).map(item => ({
          type: 'Dimension',
          title: item.name,
          description: item.description || '',
          url: `/dimensions/${item.slug}`,
          tags: item.tags || [],
          category: item.category ? [item.category] : [],
          industry: []
        })),
        ...((metricsResult.data || []) as Array<any>).map(item => ({
          type: 'Metric',
          title: item.name,
          description: item.description || '',
          url: `/metrics/${item.slug}`,
          tags: item.tags || [],
          category: item.category ? [item.category] : [],
          industry: []
        }))
      ];

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('search') as string;
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1.5rem' }}>
        Search
      </h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            name="search"
            placeholder="Search KPIs, Dimensions, Events, Metrics..."
            defaultValue={searchQuery}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>
      </form>

      {searchQuery && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            {isSearching ? 'Searching...' : `Results for "${searchQuery}" (${results.length})`}
          </h2>

          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.url}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{
                    backgroundColor: result.type === 'KPI' ? '#3B82F6' : result.type === 'Dimension' ? '#10B981' : result.type === 'Event' ? '#8B5CF6' : '#F59E0B',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginRight: '1rem',
                    flexShrink: 0,
                  }}>
                    {result.type}
                  </span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                      {result.title}
                    </h3>
                    {result.description && (
                      <p style={{ margin: '0 0 0.5rem 0', color: 'var(--ifm-color-emphasis-600)', lineHeight: '1.4' }}>
                        {result.description}
                      </p>
                    )}
                    {result.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {result.tags.slice(0, 5).map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--ifm-color-emphasis-100)',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '3px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-emphasis-600)' }}>
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {!searchQuery && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--ifm-color-emphasis-600)' }}>
          <p>Enter a search term to find KPIs, Dimensions, Events, and Metrics.</p>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-600)' }}>Loading search...</p>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

