'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { config } from '@/lib/config';

interface GitHubStats {
  stars: number;
  forks: number;
}

interface SearchResult {
  type: 'KPI' | 'Event' | 'Dimension' | 'Metric';
  title: string;
  description?: string;
  url: string;
  tags?: string[];
  category?: string[];
  industry?: string[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [githubStats, setGithubStats] = useState<GitHubStats>({ stars: 0, forks: 0 });
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch GitHub stats (client-side only)
  useEffect(() => {
    if (!mounted) return;
    
    const fetchGitHubStats = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${config.github.appRepoFull}`);
        if (response.ok) {
          const data = await response.json();
          setGithubStats({
            stars: data.stargazers_count,
            forks: data.forks_count
          });
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
      }
    };

    fetchGitHubStats();
  }, [mounted]);

  // Search functionality (placeholder - will be connected to Supabase later)
  useEffect(() => {
    if (!mounted) return;
    
    if (searchQuery.trim()) {
      setIsSearching(true);
      // TODO: Connect to Supabase search
      const timer = setTimeout(() => {
        setIsSearching(false);
        setSearchResults([]);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, mounted]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section
        className="hero-banner"
        style={{
          padding: '4rem 1rem 3rem',
          textAlign: 'center',
          backgroundImage: 'url(/img/backgroud_img.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          minHeight: '300px'
        }}
      >
        <div
          className="hero-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            zIndex: 1
          }}
        />
        <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 3, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '600',
              marginBottom: '1rem',
              marginTop: 0,
              color: '#3578e5',
              lineHeight: '1.2',
              textShadow: '1px 1px 3px rgba(255, 255, 255, 0.8)'
            }}
          >
            Measure with Open KPIs
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              marginBottom: '1.5rem',
              color: '#000000',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 1.5rem',
              textShadow: '1px 1px 2px rgba(255, 255, 255, 0.6)'
            }}
          >
            Standardized KPI definitions, dimensions, and events for modern analytics. 
            Build consistent metrics across your organization with our open-source library.
          </p>

          {/* Search Bar */}
          <div style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search KPIs, dimensions, and events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                suppressHydrationWarning
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 2vw, 1rem) 1rem clamp(0.875rem, 2vw, 1rem) 3rem',
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  border: '2px solid #3B82F6',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#171717',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1D4ED8';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <svg
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1.25rem',
                  height: '1.25rem',
                  color: '#666'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Search Results Dropdown */}
            {searchQuery && (
              <div
                style={{
                  position: 'relative',
                  top: '0',
                  left: '0',
                  width: '100%',
                  maxWidth: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  padding: '0.3rem',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  backdropFilter: 'blur(10px)',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  marginTop: '0.2rem'
                }}
              >
                {isSearching ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '0.5rem',
                      color: '#666',
                      fontSize: '0.7rem'
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        border: '2px solid #ddd',
                        borderTop: '2px solid #3578e5',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '0.3rem'
                      }}
                    />
                    Searching...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h4
                      style={{
                        margin: '0 0 0.3rem 0',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#171717'
                      }}
                    >
                      Search Results ({searchResults.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {searchResults.map((result, index) => (
                        <Link
                          key={index}
                          href={result.url}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.05rem 0.05rem 0.05rem 0.1rem',
                            border: '1px solid #e0e0e0',
                            borderRadius: '3px',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#007bff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: result.type === 'KPI' ? '#3B82F6' : result.type === 'Dimension' ? '#10B981' : '#F59E0B',
                              color: 'white',
                              padding: '0.15rem 0.3rem 0.15rem 0.5rem',
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              fontWeight: '600',
                              marginRight: '0.3rem'
                            }}
                          >
                            {result.type}
                          </span>
                          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                            <strong style={{ color: '#171717', fontSize: '0.7rem', display: 'block', textAlign: 'left' }}>
                              {result.title}
                            </strong>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.6rem',
                                color: '#666',
                                lineHeight: '1.2',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'left'
                              }}
                            >
                              {result.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '0.5rem',
                      color: '#666',
                      fontSize: '0.7rem'
                    }}
                  >
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GitHub Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href={config.github.contentRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                padding: 'clamp(0.75rem, 2vw, 0.875rem) clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '8px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#3578e5',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              <svg style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              Star
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  fontWeight: '600'
                }}
              >
                {githubStats.stars.toLocaleString()}
              </span>
            </a>
            <a
              href={`${config.github.contentRepoUrl}/fork`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                padding: 'clamp(0.75rem, 2vw, 0.875rem) clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '8px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#3578e5',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              <svg style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Fork
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  fontWeight: '600'
                }}
              >
                {githubStats.forks.toLocaleString()}
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section style={{ padding: '2rem 1rem 3rem', backgroundColor: '#fff' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {/* KPIs Card */}
            <Link
              href="/kpis"
              prefetch={false}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(249, 115, 22, 0.15)';
                  e.currentTarget.style.borderColor = '#F97316';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>
                  <div
                    style={{
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      backgroundColor: '#F97316',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 'clamp(0.5rem, 2vw, 0.75rem)',
                      color: 'white'
                    }}
                  >
                    <svg width="clamp(16px, 3vw, 20px)" height="clamp(16px, 3vw, 20px)" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#171717' }}>
                    KPIs
                  </h3>
                </div>
                <p style={{ color: '#666', marginBottom: 0, lineHeight: '1.5', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', flex: 1 }}>
                  Standardized KPI definitions with formulas, implementation guides, and platform equivalents.
                </p>
              </div>
            </Link>

            {/* Dimensions Card */}
            <Link
              href="/dimensions"
              prefetch={false}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.borderColor = '#10B981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>
                  <div
                    style={{
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      backgroundColor: '#10B981',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 'clamp(0.5rem, 2vw, 0.75rem)',
                      color: 'white'
                    }}
                  >
                    <svg width="clamp(16px, 3vw, 20px)" height="clamp(16px, 3vw, 20px)" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#171717' }}>
                    Dimensions
                  </h3>
                </div>
                <p style={{ color: '#666', marginBottom: 0, lineHeight: '1.5', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', flex: 1 }}>
                  Data attributes and segmentation variables used across KPIs for consistent analysis.
                </p>
              </div>
            </Link>

            {/* Events Card */}
            <Link
              href="/events"
              prefetch={false}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: 'clamp(1rem, 3vw, 1.5rem)',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.borderColor = '#8B5CF6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'clamp(0.75rem, 2vw, 1rem)' }}>
                  <div
                    style={{
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      backgroundColor: '#8B5CF6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 'clamp(0.5rem, 2vw, 0.75rem)',
                      color: 'white'
                    }}
                  >
                    <svg width="clamp(16px, 3vw, 20px)" height="clamp(16px, 3vw, 20px)" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: '600', color: '#171717' }}>
                    Events
                  </h3>
                </div>
                <p style={{ color: '#666', marginBottom: 0, lineHeight: '1.5', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)', flex: 1 }}>
                  Tracking events and parameters needed to calculate KPIs across different platforms.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* GitHub CTA Section */}
      <section
        style={{
          backgroundColor: '#f5f5f5',
          padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4vw, 2rem)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '1rem',
              fontWeight: '600',
              color: '#171717'
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
              color: '#666',
              marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
              lineHeight: '1.6'
            }}
          >
            Fork our repository and start using standardized KPIs in your analytics today.
          </p>
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={config.github.contentRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
                borderRadius: '8px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#3578e5',
                color: 'white',
                textDecoration: 'none'
              }}
            >
              <svg style={{ width: 'clamp(1rem, 2.5vw, 1.25rem)', height: 'clamp(1rem, 2.5vw, 1.25rem)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              Fork Repository
            </a>
            <Link
              href="/kpis"
              prefetch={false}
              style={{
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
                borderRadius: '8px',
                fontWeight: '500',
                backgroundColor: 'transparent',
                border: '2px solid #3578e5',
                color: '#3578e5',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Browse Documentation
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
