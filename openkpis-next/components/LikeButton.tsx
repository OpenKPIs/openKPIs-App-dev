'use client';

import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';

interface LikeButtonProps {
  itemType: 'kpi' | 'event' | 'dimension' | 'metric' | 'dashboard';
  itemId: string;
  itemSlug: string;
}

export default function LikeButton({ itemType, itemId, itemSlug }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      fetchLikeCount();
    } else {
      fetchLikeCount();
      setLoading(false);
    }
  }, [user, itemId, itemType]);

  async function checkUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  async function checkLikeStatus() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (!error && data) {
        setLiked(true);
      }
    } catch (err) {
      console.error('Error checking like status:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLikeCount() {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (!error && count !== null) {
        setLikeCount(count);
      }
    } catch (err) {
      console.error('Error fetching like count:', err);
    }
  }

  async function handleToggleLike() {
    if (!user) {
      alert('Please sign in to like items');
      return;
    }

    setLoading(true);
    try {
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (!error) {
          setLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Like
        const { error } = await (supabase
          .from('likes') as any)
          .insert({
            user_id: user.id,
            item_type: itemType,
            item_id: itemId,
            item_slug: itemSlug,
          });

        if (!error) {
          setLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      alert('Failed to update like. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading || !user}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: 'none',
        backgroundColor: liked ? 'var(--ifm-color-primary)' : 'transparent',
        color: liked ? 'white' : 'var(--ifm-color-emphasis-700)',
        borderRadius: '6px',
        cursor: user ? 'pointer' : 'not-allowed',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (user && !loading) {
          e.currentTarget.style.backgroundColor = liked
            ? 'var(--ifm-color-primary-dark)'
            : 'var(--ifm-color-emphasis-100)';
        }
      }}
      onMouseLeave={(e) => {
        if (user && !loading) {
          e.currentTarget.style.backgroundColor = liked
            ? 'var(--ifm-color-primary)'
            : 'transparent';
        }
      }}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}

