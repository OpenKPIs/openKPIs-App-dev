'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import GitHubSignIn from './GitHubSignIn';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'var(--ifm-background-color)',
        borderBottom: '1px solid var(--ifm-color-emphasis-200)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          overflowX: 'hidden',
        }}
      >
        {/* Logo & Brand */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          {/* Uptrend Chart Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--ifm-color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--ifm-color-primary)',
            }}
          >
            OpenKPIs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flex: 1,
          }}
          className="desktop-nav"
        >
          <Link
            href="/kpis"
            style={{
              padding: '0.5rem 0.75rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9375rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            KPIs
          </Link>
          <Link
            href="/dimensions"
            style={{
              padding: '0.5rem 0.75rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9375rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Dimensions
          </Link>
          <Link
            href="/events"
            style={{
              padding: '0.5rem 0.75rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9375rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Events
          </Link>
          <Link
            href="/metrics"
            style={{
              padding: '0.5rem 0.75rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9375rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Metrics
          </Link>
          <Link
            href="/dashboards"
            style={{
              padding: '0.5rem 0.75rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9375rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Dashboards
          </Link>

          <Link
            href="/ai-analysis"
            style={{
              padding: '0.5rem 0.75rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              fontSize: '0.9375rem',
              borderRadius: '6px',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            AI Analyst
          </Link>

          {/* Industries Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setIndustriesOpen(true)}
            onMouseLeave={() => setIndustriesOpen(false)}
          >
            <button
              suppressHydrationWarning
              style={{
                padding: '0.5rem 0.75rem',
                textDecoration: 'none',
                color: 'var(--ifm-font-color-base)',
                fontSize: '0.9375rem',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Industries
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 9L1 4h10z" />
              </svg>
            </button>
            {industriesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.25rem',
                  backgroundColor: 'var(--ifm-background-color)',
                  border: '1px solid var(--ifm-color-emphasis-200)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '160px',
                  padding: '0.5rem 0',
                }}
              >
                <Link
                  href="/kpis?industry=retail"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Retail
                </Link>
                <Link
                  href="/kpis?industry=saas"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  SaaS
                </Link>
                <Link
                  href="/kpis?industry=ecommerce"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  E-commerce
                </Link>
                <Link
                  href="/kpis?industry=healthcare"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Healthcare
                </Link>
              </div>
            )}
          </div>

          {/* Categories Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button
              suppressHydrationWarning
              style={{
                padding: '0.5rem 0.75rem',
                textDecoration: 'none',
                color: 'var(--ifm-font-color-base)',
                fontSize: '0.9375rem',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              Categories
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 9L1 4h10z" />
              </svg>
            </button>
            {categoriesOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.25rem',
                  backgroundColor: 'var(--ifm-background-color)',
                  border: '1px solid var(--ifm-color-emphasis-200)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  minWidth: '160px',
                  padding: '0.5rem 0',
                }}
              >
                <Link
                  href="/kpis?category=conversion"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Conversion
                </Link>
                <Link
                  href="/kpis?category=revenue"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Revenue
                </Link>
                <Link
                  href="/kpis?category=engagement"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Engagement
                </Link>
                <Link
                  href="/kpis?category=retention"
                  style={{
                    display: 'block',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--ifm-font-color-base)',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Retention
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side: Search, GitHub Sign-In, GitHub Link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            suppressHydrationWarning
            style={{
              padding: '0.4rem 0.6rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              width: '120px',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-font-color-base)',
              outline: 'none',
            }}
            className="desktop-search"
          />

          {/* GitHub Sign-In */}
          <div className="desktop-auth">
            <GitHubSignIn />
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/devyendarm/OpenKPIs"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.5rem',
              textDecoration: 'none',
              color: 'var(--ifm-font-color-base)',
              display: 'flex',
              alignItems: 'center',
            }}
            className="desktop-github"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            suppressHydrationWarning
            style={{
              display: 'none',
              padding: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              flexDirection: 'column',
              gap: '4px',
            }}
            className="mobile-menu-button"
          >
            <span
              style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--ifm-font-color-base)',
                transition: 'all 0.3s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none',
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--ifm-font-color-base)',
                transition: 'all 0.3s',
                opacity: mobileMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--ifm-font-color-base)',
                transition: 'all 0.3s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid var(--ifm-color-emphasis-200)',
            padding: '1rem',
            backgroundColor: 'var(--ifm-background-color)',
          }}
          className="mobile-menu"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/kpis" style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
              KPIs
            </Link>
            <Link href="/dimensions" style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
              Dimensions
            </Link>
            <Link href="/events" style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
              Events
            </Link>
            <Link href="/metrics" style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
              Metrics
            </Link>
            <Link href="/dashboards" style={{ padding: '0.75rem', textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
              Dashboards
            </Link>
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--ifm-color-emphasis-200)' }}>
              <GitHubSignIn />
            </div>
          </nav>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav,
          .desktop-search,
          .desktop-auth,
          .desktop-github {
            display: none !important;
          }
          .mobile-menu-button {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}

