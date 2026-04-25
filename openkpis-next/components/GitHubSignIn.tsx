'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signInWithGitHub } from '@/lib/supabase/auth';
import { useAuth } from '@/app/providers/AuthClientProvider';
import { useAI } from '@/lib/contexts/AIContext';

export default function GitHubSignIn() {
  const { user, role } = useAuth();
  const { setSettingsOpen } = useAI();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  React.useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      // Don't close if clicking on the button or inside the dropdown
      if (
        !dropdownRef.current?.contains(target) && 
        !buttonRef.current?.contains(target)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleResize = () => {
      if (dropdownOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          right: window.innerWidth - rect.right + window.scrollX,
        });
      }
    };
    document.addEventListener('click', handleDocumentClick);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('resize', handleResize);
    };
  }, [dropdownOpen]);

  function toggleDropdown() {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right + window.scrollX,
      });
    }
    setDropdownOpen(!dropdownOpen);
  }

  async function handleSignIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await signInWithGitHub();
  }

  async function handleSignOut(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(false); // Close dropdown immediately
    
    try {
      // Clear local state first
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || '';
          if (k.startsWith('sb-') || k.includes('supabase')) toRemove.push(k);
        }
        toRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
      
      // Call sign-out API
      const resp = await fetch('/auth/signout', { method: 'POST' });
      if (!resp.ok) {
        const payload = await resp.json().catch(() => ({}));
        console.error('Sign out error:', payload);
        alert(payload?.error || 'Failed to sign out. Please try again.');
        return;
      }
      
      // Clear cookies
      try {
        document.cookie = 'openkpis_return_url=; Path=/; Max-Age=0; SameSite=Lax';
      } catch {}
      
      // Dispatch sign-out event
      window.dispatchEvent(new CustomEvent('openkpis-sign-out'));
      
      // Force a hard redirect to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still redirect even if there's an error
      window.location.href = '/';
    }
  }

  const renderSignedIn = () => {
    const userName = user?.user_metadata?.user_name || user?.user_metadata?.full_name || 'User';
    const avatarUrl = user?.user_metadata?.avatar_url;
    const userEmail = user?.email;

    return (
      <div ref={dropdownRef} className="auth-slot">
        <button
          suppressHydrationWarning
          ref={buttonRef}
          onClick={toggleDropdown}
          type="button"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          aria-controls="user-menu"
          className="user-button"
          style={dropdownOpen ? { position: 'relative', zIndex: 10001 } : undefined}
        >
          {avatarUrl && (
            <Image
              src={avatarUrl}
              alt={userName}
              width={32}
              height={32}
              className="user-avatar"
              unoptimized
            />
          )}
          <span className="user-name">{userName}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--ifm-font-color-base)" className="chevron">
            <path d="M6 9L1 4h10z" />
          </svg>
        </button>

        {dropdownOpen && (
          <div
            id="user-menu"
            role="menu"
            className="dropdown-panel"
            style={{ top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px`, maxWidth: 'calc(100vw - 2rem)' }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setDropdownOpen(false);
                buttonRef.current?.focus();
              }
            }}
          >
            <div className="dropdown-header">
              <div className="dropdown-user-row">
                {avatarUrl && (
                  <Image
                    src={avatarUrl}
                    alt={userName}
                    width={64}
                    height={64}
                    className="avatar-lg"
                    unoptimized
                  />
                )}
                <div className="dropdown-user-info">
                  <div className="dropdown-username">
                    {userName}
                  </div>
                  {userEmail && <div className="user-email">{userEmail}</div>}
                </div>
              </div>
            </div>

            <div className="dropdown-section">
              {['editor', 'admin'].includes((role || '').toLowerCase()) && (
                <Link href="/editor/review" prefetch={false} role="menuitem" className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5V4H2V2.5zM2 5h12v8.5A1.5 1.5 0 0112.5 15h-9A1.5 1.5 0 012 13.5V5zm3 2a.5.5 0 000 1h6a.5.5 0 000-1H5z" />
                  </svg>
                  <span>Editor Review</span>
                </Link>
              )}
              <Link href="/kpis/new" prefetch={false} role="menuitem" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a1 1 0 011 1v6h6a1 1 0 110 2H9v6a1 1 0 11-2 0V9H1a1 1 0 110-2h6V1a1 1 0 011-1z" />
                </svg>
                <span>Create New KPI</span>
              </Link>
              <Link href="/myprofile" prefetch={false} role="menuitem" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 100-6 3 3 0 000 6z" />
                  <path fillRule="evenodd" d="M14 14s-1-4-6-4-6 4-6 4 2 2 6 2 6-2 6-2z" />
                </svg>
                <span>My Profile</span>
              </Link>
              <Link href="/analysis" prefetch={false} role="menuitem" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm2 1a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H4z" />
                  <path d="M6 6a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 016 6zM6 9a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3A.5.5 0 016 9z" />
                </svg>
                <span>My Analysis</span>
              </Link>
              <button 
                onClick={() => {
                  setSettingsOpen(true);
                  setDropdownOpen(false);
                }}
                className="dropdown-item"
                style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                <span style={{ fontSize: '1rem', marginRight: '8px' }}>⚙️</span>
                <span>AI Settings</span>
              </button>
            </div>

            <div className="dropdown-separator">
              <button 
                onClick={handleSignOut} 
                onMouseDown={(e) => e.preventDefault()} // Prevent dropdown from closing
                className="dropdown-item dropdown-item--danger"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2a1 1 0 00-1 1v10a1 1 0 001 1h5a1 1 0 100-2H4V4h4a1 1 0 100-2H3zm9.707 4.293a1 1 0 00-1.414 1.414L12.586 9H7a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3z" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSignedOut = () => {
    return (
      <div className="auth-slot">
        <button
          onClick={handleSignIn}
          className="btn btn-primary"
          aria-label="Sign in with GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span>Sign in</span>
        </button>
      </div>
    );
  };

  return user ? renderSignedIn() : renderSignedOut();
}

