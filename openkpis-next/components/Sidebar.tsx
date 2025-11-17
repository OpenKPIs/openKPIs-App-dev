'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, STATUS, getCurrentUser } from '@/lib/supabase';

interface SidebarItem {
  id: string;
  slug: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
}

interface SidebarProps {
  section: 'kpis' | 'dimensions' | 'events' | 'metrics';
}

export default function Sidebar({ section }: SidebarProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadItems();
  }, [section]);

  async function loadItems() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const userName = currentUser?.user_metadata?.user_name || currentUser?.email;

      let query = supabase.from(section).select('id, slug, name, status');

      if (userName) {
        query = query.or(`status.eq.published,created_by.eq.${userName}`);
      } else {
        query = query.eq('status', STATUS.PUBLISHED);
      }

      const { data, error } = await query.order('name');

      if (error) {
        console.error('Error loading sidebar items:', error);
        setItems([]);
        return;
      }

      setItems((data || []) as SidebarItem[]);
    } catch (err) {
      console.error('Error:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const basePath = `/${section}`;
  const currentSlug = pathname.split('/').pop() || '';

  return (
    <aside
      style={{
        position: 'sticky',
        top: '80px',
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: 'var(--ifm-background-color)',
        borderRight: '1px solid var(--ifm-color-emphasis-200)',
        padding: '1rem',
        fontSize: '0.9375rem',
        minWidth: 0,
        maxWidth: '100%',
      }}
      className="docs-sidebar"
    >
      <div
        style={{
          paddingRight: '0.5rem',
        }}
      >
        <nav>
          <Link
            href={basePath}
            prefetch={false}
            reloadDocument
            style={{
              display: 'block',
              padding: '0.625rem 1rem',
              margin: '0.125rem 0.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              color: pathname === basePath ? 'white' : 'var(--ifm-color-emphasis-700)',
              backgroundColor: pathname === basePath 
                ? 'var(--ifm-color-primary)' 
                : 'transparent',
              fontWeight: pathname === basePath ? '500' : '400',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (pathname !== basePath) {
                e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                e.currentTarget.style.color = 'var(--ifm-color-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== basePath) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--ifm-color-emphasis-700)';
              }
            }}
          >
            All {section.charAt(0).toUpperCase() + section.slice(1)}
          </Link>

          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-500)' }}>
              Loading...
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {items.map((item) => {
                const href = `${basePath}/${item.slug}`;
                const isActive = currentSlug === item.slug;

                return (
                  <li key={item.id} style={{ marginBottom: '0.125rem' }}>
                    <Link
                      href={href}
                      prefetch={false}
                      reloadDocument
                      style={{
                        display: 'block',
                        padding: '0.625rem 1rem',
                        margin: '0.125rem 0.5rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isActive ? 'white' : 'var(--ifm-color-emphasis-700)',
                        backgroundColor: isActive 
                          ? 'var(--ifm-color-primary)' 
                          : 'transparent',
                        fontWeight: isActive ? '500' : '400',
                        fontSize: '0.9375rem',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                          e.currentTarget.style.color = 'var(--ifm-color-primary)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--ifm-color-emphasis-700)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      {item.name}
                      {item.status === 'draft' && (
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.375rem',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#fbbf24',
                            color: isActive ? 'white' : '#78350f',
                            borderRadius: '3px',
                            fontWeight: '500',
                          }}
                        >
                          Draft
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && items.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-500)' }}>
              No items found
            </div>
          )}
        </nav>
      </div>

      <style jsx>{`
        .docs-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .docs-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .docs-sidebar::-webkit-scrollbar-thumb {
          background: var(--ifm-color-emphasis-300);
          border-radius: 3px;
        }
        .docs-sidebar::-webkit-scrollbar-thumb:hover {
          background: var(--ifm-color-emphasis-400);
        }
      `}</style>
    </aside>
  );
}

