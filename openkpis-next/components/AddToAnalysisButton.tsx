'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { withTablePrefix } from '@/src/types/entities';

interface AddToAnalysisButtonProps {
  itemType: 'kpi' | 'event' | 'dimension' | 'metric' | 'dashboard';
  itemId: string;
  itemSlug: string;
  itemName: string;
  variant?: 'icon' | 'full';
}

const analysisBasketTable = withTablePrefix('analysis_basket');

export default function AddToAnalysisButton({
  itemType,
  itemId,
  itemSlug,
  itemName,
  variant = 'full',
}: AddToAnalysisButtonProps) {
  const [inBasket, setInBasket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }
    void loadUser();
  }, []);

  useEffect(() => {
    let active = true;
    async function checkBasketStatus() {
      setLoading(true);
      try {
        const sessionId = getSessionId();

        let query = supabase
          .from(analysisBasketTable)
          .select('id')
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (user) {
          query = query.eq('user_id', user.id);
        } else if (sessionId) {
          query = query.eq('session_id', sessionId);
        } else {
          if (active) {
            setInBasket(false);
            setLoading(false);
          }
          return;
        }

        const { data, error } = await query.single();

        if (active) {
          if (!error && data) {
            setInBasket(true);
          } else {
            setInBasket(false);
          }
        }
      } catch {
        if (active) {
          setInBasket(false);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (typeof window !== 'undefined') {
      void checkBasketStatus();
    }

    return () => {
      active = false;
    };
  }, [user, itemId, itemType]);

  function getSessionId() {
    if (typeof window === 'undefined') return null;
    let sessionId = sessionStorage.getItem('openkpis_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('openkpis_session_id', sessionId);
    }
    return sessionId;
  }

  async function handleToggleBasket() {
    setLoading(true);
    try {
      const sessionId = getSessionId();

      if (inBasket) {
        // Remove from basket
        let deleteQuery = supabase
          .from(analysisBasketTable)
          .delete()
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (user) {
          deleteQuery = deleteQuery.eq('user_id', user.id);
        } else if (sessionId) {
          deleteQuery = deleteQuery.eq('session_id', sessionId);
        }

        const { error } = await deleteQuery;

        if (!error) {
          setInBasket(false);
        }
      } else {
        // Add to basket
        const insertData: Record<string, unknown> = {
          item_type: itemType,
          item_id: itemId,
          item_slug: itemSlug,
          item_name: itemName,
        };

        if (user) {
          insertData.user_id = user.id;
        } else if (sessionId) {
          insertData.session_id = sessionId;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from(analysisBasketTable) as any).insert(insertData);

        if (!error) {
          setInBasket(true);
          // Optionally navigate to analysis page
          // router.push('/analysis');
        }
      }
    } catch (error) {
      console.error('Error toggling basket:', error);
      alert('Failed to update analysis basket. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleBasket}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: variant === 'icon' ? 'none' : '1px solid var(--ifm-color-primary)',
        backgroundColor: variant === 'icon' 
          ? 'transparent' 
          : inBasket ? 'var(--ifm-color-primary)' : 'transparent',
        color: inBasket ? (variant === 'icon' ? 'var(--ifm-color-primary)' : 'white') : (variant === 'icon' ? 'var(--text-muted)' : 'var(--ifm-color-primary)'),
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          if (variant === 'icon') {
            e.currentTarget.style.color = 'var(--ifm-color-primary)';
          } else {
            e.currentTarget.style.backgroundColor = inBasket
              ? 'var(--ifm-color-primary-dark)'
              : 'var(--ifm-color-emphasis-100)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          if (variant === 'icon') {
            e.currentTarget.style.color = inBasket ? 'var(--ifm-color-primary)' : 'var(--text-muted)';
          } else {
            e.currentTarget.style.backgroundColor = inBasket
              ? 'var(--ifm-color-primary)'
              : 'transparent';
          }
        }
      }}
      aria-label={inBasket ? 'Remove from Analysis' : 'Add to Analysis'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {inBasket ? (
          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        ) : (
          <path d="M12 5v14M5 12h14" />
        )}
      </svg>
      {variant !== 'icon' && <span>{inBasket ? 'In Analysis' : 'Add to Analysis'}</span>}
    </button>
  );
}

