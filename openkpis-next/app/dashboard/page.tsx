'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/lib/supabase';
import Catalog from '@/components/Catalog';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'contributions'>('favorites');
  const [favorites, setFavorites] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalKPIs: 0,
    totalEvents: 0,
    totalDimensions: 0,
    totalMetrics: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
      loadContributions();
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  async function checkUser() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    setUser(currentUser);
  }

  async function loadFavorites() {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Load favorites with full item details
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('item_type, item_id, item_slug')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (likesError) throw likesError;

      // Fetch full item details for each like
      const favoritesWithDetails = [];
      for (const like of likes || []) {
        const tableName = like.item_type === 'kpi' ? 'kpis' :
                         like.item_type === 'event' ? 'events' :
                         like.item_type === 'dimension' ? 'dimensions' :
                         like.item_type === 'metric' ? 'metrics' : null;

        if (tableName) {
          const { data: item } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', like.item_id)
            .single();

          if (item) {
            favoritesWithDetails.push({
              ...like,
              item_data: item,
            });
          }
        }
      }

      setFavorites(favoritesWithDetails);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadContributions() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setContributions(data);
      }
    } catch (err) {
      console.error('Error loading contributions:', err);
    }
  }

  async function loadStats() {
    if (!user) return;

    try {
      // Load user profile stats
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setStats({
          totalKPIs: profile.total_kpis || 0,
          totalEvents: profile.total_events || 0,
          totalDimensions: profile.total_dimensions || 0,
          totalMetrics: profile.total_metrics || 0,
          totalLikes: profile.total_likes || 0,
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.user_name || user.user_metadata?.full_name || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  // Group favorites by type
  const favoritesByType = {
    kpis: favorites.filter((f) => f.item_type === 'kpi' && f.item_data),
    events: favorites.filter((f) => f.item_type === 'event' && f.item_data),
    dimensions: favorites.filter((f) => f.item_type === 'dimension' && f.item_data),
    metrics: favorites.filter((f) => f.item_type === 'metric' && f.item_data),
    dashboards: favorites.filter((f) => f.item_type === 'dashboard' && f.item_data),
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={userName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid var(--ifm-color-primary)',
              }}
            />
          )}
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {userName}
            </h1>
            <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--ifm-color-primary)' }}>
              {stats.totalKPIs}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>KPIs</div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--ifm-color-primary)' }}>
              {stats.totalEvents}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>Events</div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--ifm-color-primary)' }}>
              {stats.totalDimensions}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>
              Dimensions
            </div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--ifm-color-primary)' }}>
              {stats.totalMetrics}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>Metrics</div>
          </div>
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--ifm-color-primary)' }}>
              {favorites.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>Favorites</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)' }}>
          <button
            onClick={() => setActiveTab('favorites')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color:
                activeTab === 'favorites'
                  ? 'var(--ifm-color-primary)'
                  : 'var(--ifm-color-emphasis-700)',
              borderBottom:
                activeTab === 'favorites' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'favorites' ? 600 : 400,
            }}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('contributions')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color:
                activeTab === 'contributions'
                  ? 'var(--ifm-color-primary)'
                  : 'var(--ifm-color-emphasis-700)',
              borderBottom:
                activeTab === 'contributions'
                  ? '2px solid var(--ifm-color-primary)'
                  : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'contributions' ? 600 : 400,
            }}
          >
            Contributions
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--ifm-color-emphasis-600)',
              }}
            >
              <p>No favorites yet. Start exploring and like items you find useful!</p>
              <Link
                href="/kpis"
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--ifm-color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
              >
                Browse KPIs
              </Link>
            </div>
          ) : (
            <div>
              {favoritesByType.kpis.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Favorite KPIs ({favoritesByType.kpis.length})
                  </h2>
                  <Catalog
                    items={favoritesByType.kpis.map((f) => ({
                      id: f.item_id,
                      slug: f.item_slug,
                      name: f.item_data?.name || 'Unknown',
                      description: f.item_data?.description,
                      category: f.item_data?.category,
                    }))}
                    itemType="kpis"
                  />
                </section>
              )}

              {favoritesByType.events.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Favorite Events ({favoritesByType.events.length})
                  </h2>
                  <Catalog
                    items={favoritesByType.events.map((f) => ({
                      id: f.item_id,
                      slug: f.item_slug,
                      name: f.item_data?.name || 'Unknown',
                      description: f.item_data?.description,
                      category: f.item_data?.category,
                    }))}
                    itemType="events"
                  />
                </section>
              )}

              {favoritesByType.dimensions.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Favorite Dimensions ({favoritesByType.dimensions.length})
                  </h2>
                  <Catalog
                    items={favoritesByType.dimensions.map((f) => ({
                      id: f.item_id,
                      slug: f.item_slug,
                      name: f.item_data?.name || 'Unknown',
                      description: f.item_data?.description,
                      category: f.item_data?.category,
                    }))}
                    itemType="dimensions"
                  />
                </section>
              )}

              {favoritesByType.metrics.length > 0 && (
                <section style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                    Favorite Metrics ({favoritesByType.metrics.length})
                  </h2>
                  <Catalog
                    items={favoritesByType.metrics.map((f) => ({
                      id: f.item_id,
                      slug: f.item_slug,
                      name: f.item_data?.name || 'Unknown',
                      description: f.item_data?.description,
                      category: f.item_data?.category,
                    }))}
                    itemType="metrics"
                  />
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'contributions' && (
        <div>
          {contributions.length === 0 ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--ifm-color-emphasis-600)',
              }}
            >
              <p>No contributions yet. Start creating or editing KPIs!</p>
              <Link
                href="/kpis/new"
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--ifm-color-primary)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
              >
                Create New KPI
              </Link>
            </div>
          ) : (
            <div>
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'var(--ifm-color-emphasis-50)',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {contribution.action} {contribution.item_type}: {contribution.item_slug}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                      {new Date(contribution.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Link
                    href={`/${contribution.item_type}/${contribution.item_slug}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

