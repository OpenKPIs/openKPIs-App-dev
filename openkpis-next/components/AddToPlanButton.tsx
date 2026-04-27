'use client';

import React from 'react';
import { useTrackingPlan } from '@/lib/contexts/TrackingPlanContext';

interface AddToPlanButtonProps {
  item: {
    id: string;
    type: 'kpi' | 'metric' | 'dimension' | 'event';
    name: string;
  };
  variant?: 'icon' | 'full';
}

export default function AddToPlanButton({ item, variant = 'full' }: AddToPlanButtonProps) {
  const { isItemInCart, addToCart, removeFromCart } = useTrackingPlan();
  const inCart = isItemInCart(item.id);

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      removeFromCart(item.id);
    } else {
      addToCart(item);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleCart}
        title={inCart ? "Remove from Tracking Plan" : "Add to Tracking Plan"}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: inCart ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.25rem',
          transition: 'color 0.2s ease',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill={inCart ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {inCart ? (
            <path d="M20 6L9 17l-5-5" />
          ) : (
            <>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </>
          )}
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={toggleCart}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: inCart ? 'var(--primary)' : 'var(--border)',
        background: inCart ? 'var(--primary-light)' : 'var(--surface)',
        color: inCart ? 'var(--primary)' : 'var(--text)',
        fontWeight: 600,
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={inCart ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {inCart ? (
          <path d="M20 6L9 17l-5-5" />
        ) : (
          <>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </>
        )}
      </svg>
      {inCart ? 'Added to Plan' : 'Add to Plan'}
    </button>
  );
}
