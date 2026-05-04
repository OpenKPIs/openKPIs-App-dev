'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import GitHubSignIn from './GitHubSignIn';
import PrismHighlighter from './PrismHighlighter';
import { config } from '@/lib/config';
import { useAI } from '@/lib/contexts/AIContext';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigating, setNavigating] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const { setSettingsOpen } = useAI();
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() && !navigating) {
      setNavigating('/search');
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleNavClick = useCallback((href: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (navigating) {
      e.preventDefault();
      return;
    }
    setNavigating(href);
    // Reset after a short delay to allow navigation
    setTimeout(() => setNavigating(null), 1000);
  }, [navigating]);

  return (
    <header className="site-header">
      <PrismHighlighter />
      <div className="header-inner">
        {/* Logo & Brand */}
        <Link href="/" prefetch={false} className="brand-link">
          {/* Uptrend Chart Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="brand-icon">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          <span className="brand-title">
            OpenKPIs
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setCatalogOpen(true)}
            onMouseLeave={() => setCatalogOpen(false)}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
          >
            <span className="nav-link" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Catalog
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
            
            {catalogOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--ifm-background-surface, #ffffff)', border: '1px solid var(--border, var(--ifm-color-emphasis-200))', borderRadius: '8px', padding: '0.5rem', display: 'flex', flexDirection: 'column', minWidth: '160px', zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <Link href="/kpis" className="nav-link" onClick={() => setCatalogOpen(false)}>KPIs</Link>
                <Link href="/dimensions" className="nav-link" onClick={() => setCatalogOpen(false)}>Dimensions</Link>
                <Link href="/events" className="nav-link" onClick={() => setCatalogOpen(false)}>Events</Link>
                <Link href="/metrics" className="nav-link" onClick={() => setCatalogOpen(false)}>Metrics</Link>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }} />

          <Link 
            href="/udl" 
            prefetch={false} 
            className={`nav-link${navigating === '/udl' ? ' nav-link--loading' : ''}`}
            onClick={(e) => handleNavClick('/udl', e)}
          >
            Unified Data Layer
          </Link>

          <Link 
            href="/planner" 
            prefetch={false} 
            className={`nav-link${navigating === '/planner' ? ' nav-link--loading' : ''}`}
            onClick={(e) => handleNavClick('/planner', e)}
          >
            Tracking Planner
          </Link>

          <Link 
            href="/ai-analyst" 
            prefetch={false} 
            className={`nav-link${navigating === '/ai-analyst' ? ' nav-link--loading' : ''}`}
            onClick={(e) => handleNavClick('/ai-analyst', e)}
          >
            AI Analyst
          </Link>



          {/* Industries and Categories removed for now */}
          <input
            type="text"
            id="site-search"
            name="search"
            aria-label="Search"
            autoComplete="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            suppressHydrationWarning
            className="input desktop-search"
          />
        </nav>

        {/* Right Side: Leaderboard, GitHub Sign-In, GitHub Link */}
        <div className="right-actions">
          {/* Leaderboard link */}
          <Link 
            href="/leaderboard" 
            prefetch={false} 
            className={`nav-link${navigating === '/leaderboard' ? ' nav-link--loading' : ''}`}
            onClick={(e) => handleNavClick('/leaderboard', e)}
          >
            Leaderboard
          </Link>

          <div className="desktop-auth">
            <GitHubSignIn />
          </div>

          {/* GitHub Link */}
          <a href={config.github.contentRepoUrl} target="_blank" rel="noopener noreferrer" className="github-link desktop-github">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} suppressHydrationWarning className={`mobile-menu-button${mobileMenuOpen ? ' is-open' : ''}`}>
            <span className="menu-bar menu-bar--top" />
            <span className="menu-bar menu-bar--mid" />
            <span className="menu-bar menu-bar--bot" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-menu-nav">
            <Link 
              href="/kpis" 
              prefetch={false} 
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              KPIs
            </Link>
            <Link 
              href="/dimensions" 
              prefetch={false} 
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dimensions
            </Link>
            <Link 
              href="/events" 
              prefetch={false} 
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/metrics" 
              prefetch={false} 
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Metrics
            </Link>
            <Link 
              href="/leaderboard" 
              prefetch={false} 
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            {/* Dashboard link removed from mobile menu */}
            {/* Profile link removed from mobile menu; available in user dropdown */}
            {/* Editor link moved to GitHubSignIn dropdown */}
            <div className="mobile-menu-divider">
              <GitHubSignIn />
            </div>
          </nav>
        </div>
      )}

    </header>
  );
}

