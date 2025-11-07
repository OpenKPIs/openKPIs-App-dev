'use client';

import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AddToAnalysisButtonProps {
  itemType: 'kpi' | 'event' | 'dimension' | 'metric' | 'dashboard';
  itemId: string;
  itemSlug: string;
  itemName: string;
}

export default function AddToAnalysisButton({
  itemType,
  itemId,
  itemSlug,
  itemName,
}: AddToAnalysisButtonProps) {
  const [inBasket, setInBasket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user || typeof window !== 'undefined') {
      checkBasketStatus();
    }
  }, [user, itemId, itemType]);

  async function checkUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  function getSessionId() {
    if (typeof window === 'undefined') return null;
    let sessionId = sessionStorage.getItem('openkpis_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('openkpis_session_id', sessionId);
    }
    return sessionId;
  }

  async function checkBasketStatus() {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      
      let query = supabase
        .from('analysis_basket')
        .select('id')
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        setLoading(false);
        return;
      }

      const { data, error } = await query.single();

      if (!error && data) {
        setInBasket(true);
      }
    } catch (err) {
      // Not in basket
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBasket() {
    setLoading(true);
    try {
      const sessionId = getSessionId();

      if (inBasket) {
        // Remove from basket
        let deleteQuery = supabase
          .from('analysis_basket')
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
        const insertData: any = {
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

        const { error } = await supabase.from('analysis_basket').insert(insertData);

        if (!error) {
          setInBasket(true);
          // Optionally navigate to analysis page
          // router.push('/analysis');
        }
      }
    } catch (err) {
      console.error('Error toggling basket:', err);
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
        border: '1px solid var(--ifm-color-primary)',
        backgroundColor: inBasket ? 'var(--ifm-color-primary)' : 'transparent',
        color: inBasket ? 'white' : 'var(--ifm-color-primary)',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = inBasket
            ? 'var(--ifm-color-primary-dark)'
            : 'var(--ifm-color-emphasis-100)';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = inBasket
            ? 'var(--ifm-color-primary)'
            : 'transparent';
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
      <span>{inBasket ? 'In Analysis' : 'Add to Analysis'}</span>
    </button>
  );
}

