'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, getCurrentUser } from '@/lib/supabase';
import Catalog from '@/components/Catalog';

export default function AnalysisPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [basketItems, setBasketItems] = useState<any[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [savedInsights, setSavedInsights] = useState<any[]>([]);
  const [savedDashboards, setSavedDashboards] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [activeTab, setActiveTab] = useState<'basket' | 'analyses' | 'insights' | 'dashboards'>('basket');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    loadBasketItems();
    if (user) {
      loadSavedData();
    }
  }, [user]);

  async function loadSavedData() {
    setLoadingSaved(true);
    try {
      const response = await fetch('/api/ai/get-saved-analyses');
      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(data.analyses || []);
        setSavedInsights(data.insights || []);
        setSavedDashboards(data.dashboards || []);
      }
    } catch (err) {
      console.error('Error loading saved data:', err);
    } finally {
      setLoadingSaved(false);
    }
  }

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

  async function loadBasketItems() {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      
      let query = supabase
        .from('analysis_basket')
        .select('*')
        .order('added_at', { ascending: false });

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (!error && data) {
        setBasketItems(data);
      }
    } catch (err) {
      console.error('Error loading basket items:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveItem(itemId: string, itemType: string) {
    try {
      const sessionId = getSessionId();
      
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
        setBasketItems((prev) => prev.filter((item) => !(item.item_id === itemId && item.item_type === itemType)));
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  }

  async function handleClearAll() {
    if (!confirm('Are you sure you want to clear all items from your analysis?')) {
      return;
    }

    try {
      const sessionId = getSessionId();
      
      let deleteQuery = supabase.from('analysis_basket').delete();

      if (user) {
        deleteQuery = deleteQuery.eq('user_id', user.id);
      } else if (sessionId) {
        deleteQuery = deleteQuery.eq('session_id', sessionId);
      }

      const { error } = await deleteQuery;

      if (!error) {
        setBasketItems([]);
      }
    } catch (err) {
      console.error('Error clearing basket:', err);
    }
  }

  async function handleDownload(type: 'sql' | 'datalayer' | 'excel', solution?: 'ga4' | 'adobe' | 'amplitude') {
    try {
      const sessionId = getSessionId();
      const params = new URLSearchParams({ type });
      if (solution) params.append('solution', solution);
      
      const response = await fetch(`/api/analysis/download?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: basketItems }),
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis_${type}${solution ? `_${solution}` : ''}.${type === 'excel' ? 'xlsx' : type === 'sql' ? 'sql' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading:', err);
      alert('Failed to download. Please try again.');
    }
  }

  // Group items by type
  const itemsByType = {
    kpis: basketItems.filter((item) => item.item_type === 'kpi'),
    events: basketItems.filter((item) => item.item_type === 'event'),
    dimensions: basketItems.filter((item) => item.item_type === 'dimension'),
    metrics: basketItems.filter((item) => item.item_type === 'metric'),
    dashboards: basketItems.filter((item) => item.item_type === 'dashboard'),
  };

  const totalItems = basketItems.length;

  if (loading) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          My Analysis
        </h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Manage your analysis basket, saved AI analyses, insights, and dashboards
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '2px solid var(--ifm-color-emphasis-200)',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('basket')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'basket' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
            color: activeTab === 'basket' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
            cursor: 'pointer',
            fontWeight: activeTab === 'basket' ? '600' : '400',
            marginBottom: '-2px',
          }}
        >
          Analysis Basket ({totalItems})
        </button>
        <button
          onClick={() => setActiveTab('analyses')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'analyses' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
            color: activeTab === 'analyses' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
            cursor: 'pointer',
            fontWeight: activeTab === 'analyses' ? '600' : '400',
            marginBottom: '-2px',
          }}
        >
          Saved AI Analyses ({savedAnalyses.length})
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'insights' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
            color: activeTab === 'insights' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
            cursor: 'pointer',
            fontWeight: activeTab === 'insights' ? '600' : '400',
            marginBottom: '-2px',
          }}
        >
          Saved Insights ({savedInsights.length})
        </button>
        <button
          onClick={() => setActiveTab('dashboards')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'dashboards' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
            color: activeTab === 'dashboards' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
            cursor: 'pointer',
            fontWeight: activeTab === 'dashboards' ? '600' : '400',
            marginBottom: '-2px',
          }}
        >
          Saved Dashboards ({savedDashboards.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basket' && (
        <div>
          {/* Download Actions */}
      {totalItems > 0 && (
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--ifm-color-emphasis-50)',
            borderRadius: '12px',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Download Analysis
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={() => handleDownload('sql')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Download SQL Compilation
            </button>
            <button
              onClick={() => handleDownload('datalayer', 'ga4')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Download GA4 Data Layer
            </button>
            <button
              onClick={() => handleDownload('datalayer', 'adobe')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Download Adobe Data Layer
            </button>
            <button
              onClick={() => handleDownload('datalayer', 'amplitude')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Download Amplitude Data Layer
            </button>
            <button
              onClick={() => handleDownload('excel')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--ifm-color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Download Excel Dashboard
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#d32f2f',
                border: '1px solid #d32f2f',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Items by Type */}
      {totalItems === 0 ? (
        <div
          style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          <p>Your analysis basket is empty.</p>
          <p style={{ marginTop: '0.5rem' }}>Add KPIs, Events, Dimensions, or Metrics to get started.</p>
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
          {itemsByType.kpis.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                KPIs ({itemsByType.kpis.length})
              </h2>
              <div>
                {itemsByType.kpis.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/kpis/${item.item_slug}`}
                      style={{
                        color: 'var(--ifm-color-primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {item.item_name}
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.item_id, item.item_type)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {itemsByType.events.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Events ({itemsByType.events.length})
              </h2>
              <div>
                {itemsByType.events.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/events/${item.item_slug}`}
                      style={{
                        color: 'var(--ifm-color-primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {item.item_name}
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.item_id, item.item_type)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {itemsByType.dimensions.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Dimensions ({itemsByType.dimensions.length})
              </h2>
              <div>
                {itemsByType.dimensions.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/dimensions/${item.item_slug}`}
                      style={{
                        color: 'var(--ifm-color-primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {item.item_name}
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.item_id, item.item_type)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {itemsByType.metrics.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Metrics ({itemsByType.metrics.length})
              </h2>
              <div>
                {itemsByType.metrics.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/metrics/${item.item_slug}`}
                      style={{
                        color: 'var(--ifm-color-primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {item.item_name}
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.item_id, item.item_type)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {itemsByType.dashboards.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
                Dashboards ({itemsByType.dashboards.length})
              </h2>
              <div>
                {itemsByType.dashboards.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Link
                      href={`/dashboards/${item.item_slug}`}
                      style={{
                        color: 'var(--ifm-color-primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {item.item_name}
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.item_id, item.item_type)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'analyses' && (
        <div>
          {loadingSaved ? (
            <p>Loading saved analyses...</p>
          ) : savedAnalyses.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
              <p>No saved AI analyses yet.</p>
              <p style={{ marginTop: '0.5rem' }}>Create an analysis using the AI Analyst to save it here.</p>
              <Link
                href="/ai-analyst"
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
                Go to AI Analyst
              </Link>
            </div>
          ) : (
            <div>
              {savedAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: 'var(--ifm-color-emphasis-50)',
                    borderRadius: '12px',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {analysis.title || 'Untitled Analysis'}
                      </h3>
                      <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {analysis.analytics_solution && `Solution: ${analysis.analytics_solution}`}
                      </p>
                      <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
                        Created: {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/ai-analyst?analysisId=${analysis.id}`}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--ifm-color-primary)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      View Analysis
                    </Link>
                  </div>
                  {analysis.requirements && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>Requirements:</strong>
                      <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)', marginTop: '0.25rem' }}>
                        {analysis.requirements}
                      </p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    {analysis.selected_insights && analysis.selected_insights.length > 0 && (
                      <span>Insights: {analysis.selected_insights.length}</span>
                    )}
                    {analysis.dashboard_ids && analysis.dashboard_ids.length > 0 && (
                      <span>Dashboards: {analysis.dashboard_ids.length}</span>
                    )}
                    {analysis.selected_items && (
                      <>
                        {analysis.selected_items.kpis && analysis.selected_items.kpis.length > 0 && (
                          <span>KPIs: {analysis.selected_items.kpis.length}</span>
                        )}
                        {analysis.selected_items.metrics && analysis.selected_items.metrics.length > 0 && (
                          <span>Metrics: {analysis.selected_items.metrics.length}</span>
                        )}
                        {analysis.selected_items.dimensions && analysis.selected_items.dimensions.length > 0 && (
                          <span>Dimensions: {analysis.selected_items.dimensions.length}</span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div>
          {loadingSaved ? (
            <p>Loading saved insights...</p>
          ) : savedInsights.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
              <p>No saved insights yet.</p>
              <p style={{ marginTop: '0.5rem' }}>Generate insights using the AI Analyst and save them here.</p>
              <Link
                href="/ai-analyst"
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
                Go to AI Analyst
              </Link>
            </div>
          ) : (
            <div>
              {savedInsights.map((insight) => (
                <div
                  key={insight.id}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: 'var(--ifm-color-emphasis-50)',
                    borderRadius: '12px',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      {insight.group_name && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--ifm-color-primary)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginRight: '0.5rem',
                        }}>
                          {insight.group_name}
                        </span>
                      )}
                      {insight.signal_strength && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: insight.signal_strength === 'high' ? '#10b981' : insight.signal_strength === 'medium' ? '#f59e0b' : '#6b7280',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}>
                          {insight.signal_strength}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                    {insight.title}
                  </h3>
                  {insight.rationale && (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.5rem' }}>
                      {insight.rationale}
                    </p>
                  )}
                  {insight.chart_hint && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                      <strong>Chart:</strong> {insight.chart_hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'dashboards' && (
        <div>
          {loadingSaved ? (
            <p>Loading saved dashboards...</p>
          ) : savedDashboards.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
              <p>No saved dashboards yet.</p>
              <p style={{ marginTop: '0.5rem' }}>Generate dashboards using the AI Analyst and save them here.</p>
              <Link
                href="/ai-analyst"
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
                Go to AI Analyst
              </Link>
            </div>
          ) : (
            <div>
              {savedDashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  style={{
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                    backgroundColor: 'var(--ifm-color-emphasis-50)',
                    borderRadius: '12px',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {dashboard.name}
                      </h3>
                      {dashboard.description && (
                        <p style={{ fontSize: '0.9375rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.5rem' }}>
                          {dashboard.description}
                        </p>
                      )}
                      <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
                        Created: {new Date(dashboard.created_at).toLocaleDateString()}
                        {dashboard.status && ` • Status: ${dashboard.status}`}
                      </p>
                    </div>
                    <Link
                      href={`/dashboards/${dashboard.slug}`}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--ifm-color-primary)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

