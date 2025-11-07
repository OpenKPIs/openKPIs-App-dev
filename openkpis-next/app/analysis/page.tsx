'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type BasketItem = {
  id: string;
  item_type: 'kpi' | 'event' | 'dimension' | 'metric' | 'dashboard';
  item_id: string;
  item_slug: string;
  item_name: string;
  added_at: string;
};

type SavedAnalysis = {
  id: string;
  title: string | null;
  requirements: string | null;
  analytics_solution: string | null;
  selected_items: {
    kpis?: Array<{ name: string }>;
    metrics?: Array<{ name: string }>;
    dimensions?: Array<{ name: string }>;
  } | null;
  selected_insights: string[] | null;
  dashboard_ids: string[] | null;
  created_at: string;
};

type SavedInsight = {
  id: string;
  title: string;
  group_name?: string | null;
  rationale?: string | null;
  chart_hint?: string | null;
  signal_strength?: string | null;
  created_at: string;
};

type SavedDashboard = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  status?: string | null;
  created_at: string;
};

const TABS = [
  { key: 'basket', label: 'Analysis Basket' },
  { key: 'analyses', label: 'Saved AI Analyses' },
  { key: 'insights', label: 'Saved Insights' },
  { key: 'dashboards', label: 'Saved Dashboards' },
] as const;

type TabKey = typeof TABS[number]['key'];

type ItemsByType = {
  kpis: BasketItem[];
  events: BasketItem[];
  dimensions: BasketItem[];
  metrics: BasketItem[];
  dashboards: BasketItem[];
};

const PRIMARY_BUTTON: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--ifm-color-primary)',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const SECONDARY_BUTTON: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'transparent',
  color: '#d32f2f',
  border: '1px solid #d32f2f',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const LINK_BUTTON: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--ifm-color-primary)',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const CARD_STYLE: React.CSSProperties = {
  padding: '1.5rem',
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: '12px',
  backgroundColor: 'var(--ifm-color-emphasis-50)',
  marginBottom: '1.5rem',
};

const MUTED_TEXT: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--ifm-color-emphasis-600)',
  marginBottom: '0.5rem',
};

export default function AnalysisPage() {
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>([]);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('basket');
  const [loadingBasket, setLoadingBasket] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    void loadBasketItems();
    void loadSavedLists();
  }, []);

  const itemsByType = useMemo<ItemsByType>(
    () => ({
      kpis: basketItems.filter((item) => item.item_type === 'kpi'),
      events: basketItems.filter((item) => item.item_type === 'event'),
      dimensions: basketItems.filter((item) => item.item_type === 'dimension'),
      metrics: basketItems.filter((item) => item.item_type === 'metric'),
      dashboards: basketItems.filter((item) => item.item_type === 'dashboard'),
    }),
    [basketItems]
  );

  async function loadBasketItems() {
    setLoadingBasket(true);
    try {
      const sessionId = ensureSessionId();
      const { data: auth } = await supabase.auth.getUser();

      let query = supabase
        .from('analysis_basket')
        .select('*')
        .order('added_at', { ascending: false });

      if (auth?.user?.id) {
        query = query.eq('user_id', auth.user.id);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBasketItems(data ?? []);
    } catch (error) {
      console.error('Error loading basket items:', error);
    } finally {
      setLoadingBasket(false);
    }
  }

  async function loadSavedLists() {
    setLoadingSaved(true);
    try {
      const response = await fetch('/api/ai/get-saved-analyses');
      if (!response.ok) throw new Error('Failed to load saved analyses');
      const json = await response.json();
      setSavedAnalyses(json.analyses ?? []);
      setSavedInsights(json.insights ?? []);
      setSavedDashboards(json.dashboards ?? []);
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setLoadingSaved(false);
    }
  }

  async function handleRemoveItem(itemId: string, itemType: BasketItem['item_type']) {
    try {
      const sessionId = ensureSessionId();
      const { data: auth } = await supabase.auth.getUser();

      let deleteQuery = supabase
        .from('analysis_basket')
        .delete()
        .eq('item_type', itemType)
        .eq('item_id', itemId);

      if (auth?.user?.id) {
        deleteQuery = deleteQuery.eq('user_id', auth.user.id);
      } else if (sessionId) {
        deleteQuery = deleteQuery.eq('session_id', sessionId);
      }

      const { error } = await deleteQuery;
      if (error) throw error;

      setBasketItems((prev) => prev.filter((item) => !(item.item_id === itemId && item.item_type === itemType)));
    } catch (error) {
      console.error('Error removing item from analysis basket:', error);
    }
  }

  async function handleClearAll() {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to clear all items from your analysis?');
      if (!confirmed) return;
    }

    try {
      const sessionId = ensureSessionId();
      const { data: auth } = await supabase.auth.getUser();

      let deleteQuery = supabase.from('analysis_basket').delete();

      if (auth?.user?.id) {
        deleteQuery = deleteQuery.eq('user_id', auth.user.id);
      } else if (sessionId) {
        deleteQuery = deleteQuery.eq('session_id', sessionId);
      }

      const { error } = await deleteQuery;
      if (error) throw error;

      setBasketItems([]);
    } catch (error) {
      console.error('Error clearing analysis basket:', error);
    }
  }

  async function handleDownload(
    type: 'sql' | 'datalayer' | 'excel',
    solution?: 'ga4' | 'adobe' | 'amplitude'
  ) {
    try {
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
      const anchor = document.createElement('a');
      anchor.href = url;
      const suffix = solution ? `_${solution}` : '';
      anchor.download = `analysis_${type}${suffix}.${type === 'excel' ? 'xlsx' : type === 'sql' ? 'sql' : 'json'}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading analysis export:', error);
      if (typeof window !== 'undefined') {
        window.alert('Failed to download. Please try again.');
      }
    }
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>My Analysis</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Manage your analysis basket, saved AI analyses, insights, and dashboards.
        </p>
      </header>

      <nav
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--ifm-color-emphasis-200)',
          marginBottom: '2rem',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom:
                activeTab === tab.key
                  ? '2px solid var(--ifm-color-primary)'
                  : '2px solid transparent',
              color:
                activeTab === tab.key
                  ? 'var(--ifm-color-primary)'
                  : 'var(--ifm-color-emphasis-600)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 600 : 400,
              marginBottom: '-2px',
            }}
          >
            {tab.label}
            {tab.key === 'basket' && ` (${basketItems.length})`}
            {tab.key === 'analyses' && ` (${savedAnalyses.length})`}
            {tab.key === 'insights' && ` (${savedInsights.length})`}
            {tab.key === 'dashboards' && ` (${savedDashboards.length})`}
          </button>
        ))}
      </nav>

      {activeTab === 'basket' && (
        <BasketTab
          itemsByType={itemsByType}
          totalItems={basketItems.length}
          loading={loadingBasket}
          onDownload={handleDownload}
          onClear={handleClearAll}
          onRemove={handleRemoveItem}
        />
      )}

      {activeTab === 'analyses' && (
        <SavedList
          loading={loadingSaved}
          items={savedAnalyses}
          emptyMessage="No saved AI analyses yet."
          renderEmptyLink={<Link href="/ai-analyst" style={LINK_BUTTON}>Go to AI Analyst</Link>}
          renderItem={(analysis) => (
            <article key={analysis.id} style={CARD_STYLE}>
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{analysis.title || 'Untitled Analysis'}</h3>
                  {analysis.analytics_solution && (
                    <p style={MUTED_TEXT}>Solution: {analysis.analytics_solution}</p>
                  )}
                  <p style={MUTED_TEXT}>Created: {new Date(analysis.created_at).toLocaleDateString()}</p>
                </div>
                <Link href={`/ai-analyst?analysisId=${analysis.id}`} style={LINK_BUTTON}>
                  View Analysis
                </Link>
              </header>
              {analysis.requirements && (
                <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)' }}>
                  {analysis.requirements}
                </p>
              )}
              <footer
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontSize: '0.875rem',
                  color: 'var(--ifm-color-emphasis-600)',
                  marginTop: '1rem',
                }}
              >
                {analysis.selected_insights?.length ? (
                  <span>Insights: {analysis.selected_insights.length}</span>
                ) : null}
                {analysis.dashboard_ids?.length ? (
                  <span>Dashboards: {analysis.dashboard_ids.length}</span>
                ) : null}
                {analysis.selected_items?.kpis?.length ? (
                  <span>KPIs: {analysis.selected_items.kpis.length}</span>
                ) : null}
                {analysis.selected_items?.metrics?.length ? (
                  <span>Metrics: {analysis.selected_items.metrics.length}</span>
                ) : null}
                {analysis.selected_items?.dimensions?.length ? (
                  <span>Dimensions: {analysis.selected_items.dimensions.length}</span>
                ) : null}
              </footer>
            </article>
          )}
        />
      )}

      {activeTab === 'insights' && (
        <SavedList
          loading={loadingSaved}
          items={savedInsights}
          emptyMessage="No saved insights yet."
          renderEmptyLink={<Link href="/ai-analyst" style={LINK_BUTTON}>Go to AI Analyst</Link>}
          renderItem={(insight) => (
            <article key={insight.id} style={CARD_STYLE}>
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {insight.group_name && (
                    <span style={pillStyle('var(--ifm-color-primary)')}>
                      {insight.group_name}
                    </span>
                  )}
                  {insight.signal_strength && (
                    <span style={pillStyle(strengthColor(insight.signal_strength))}>
                      {insight.signal_strength}
                    </span>
                  )}
                </div>
                <span style={MUTED_TEXT}>{new Date(insight.created_at).toLocaleDateString()}</span>
              </header>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>{insight.title}</h3>
              {insight.rationale && (
                <p style={{ fontSize: '0.9375rem', color: 'var(--ifm-color-emphasis-700)' }}>
                  {insight.rationale}
                </p>
              )}
              {insight.chart_hint && (
                <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem' }}>
                  <strong>Chart:</strong> {insight.chart_hint}
                </p>
              )}
            </article>
          )}
        />
      )}

      {activeTab === 'dashboards' && (
        <SavedList
          loading={loadingSaved}
          items={savedDashboards}
          emptyMessage="No saved dashboards yet."
          renderEmptyLink={<Link href="/ai-analyst" style={LINK_BUTTON}>Go to AI Analyst</Link>}
          renderItem={(dashboard) => (
            <article key={dashboard.id} style={CARD_STYLE}>
              <header
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {dashboard.name}
                  </h3>
                  {dashboard.description && (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.5rem' }}>
                      {dashboard.description}
                    </p>
                  )}
                  <p style={MUTED_TEXT}>
                    Created: {new Date(dashboard.created_at).toLocaleDateString()}
                    {dashboard.status ? ` • Status: ${dashboard.status}` : ''}
                  </p>
                </div>
                <Link href={`/dashboards/${dashboard.slug}`} style={LINK_BUTTON}>
                  View Dashboard
                </Link>
              </header>
            </article>
          )}
        />
      )}
    </main>
  );
}

function ensureSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = window.sessionStorage.getItem('openkpis_session_id');
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem('openkpis_session_id', sessionId);
  }
  return sessionId;
}

type BasketTabProps = {
  itemsByType: ItemsByType;
  totalItems: number;
  loading: boolean;
  onDownload: (type: 'sql' | 'datalayer' | 'excel', solution?: 'ga4' | 'adobe' | 'amplitude') => Promise<void>;
  onClear: () => Promise<void>;
  onRemove: (itemId: string, itemType: BasketItem['item_type']) => Promise<void>;
};

function BasketTab({ itemsByType, totalItems, loading, onDownload, onClear, onRemove }: BasketTabProps) {
  if (loading) {
    return <p>Loading analysis...</p>;
  }

  if (totalItems === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
        <p>Your analysis basket is empty.</p>
        <p style={{ marginTop: '0.5rem' }}>Add KPIs, Events, Dimensions, or Metrics to get started.</p>
        <Link href="/kpis" style={LINK_BUTTON}>
          Browse KPIs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <aside style={{ padding: '1.5rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Download Analysis</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button style={PRIMARY_BUTTON} onClick={() => onDownload('sql')}>
            Download SQL
          </button>
          <button style={PRIMARY_BUTTON} onClick={() => onDownload('datalayer', 'ga4')}>
            GA4 Data Layer
          </button>
          <button style={PRIMARY_BUTTON} onClick={() => onDownload('datalayer', 'adobe')}>
            Adobe Data Layer
          </button>
          <button style={PRIMARY_BUTTON} onClick={() => onDownload('datalayer', 'amplitude')}>
            Amplitude Data Layer
          </button>
          <button style={PRIMARY_BUTTON} onClick={() => onDownload('excel')}>
            Excel Dashboard
          </button>
          <button style={SECONDARY_BUTTON} onClick={onClear}>
            Clear All
          </button>
        </div>
      </aside>

      {renderCategory('KPIs', itemsByType.kpis, 'kpi', onRemove)}
      {renderCategory('Events', itemsByType.events, 'event', onRemove)}
      {renderCategory('Dimensions', itemsByType.dimensions, 'dimension', onRemove)}
      {renderCategory('Metrics', itemsByType.metrics, 'metric', onRemove)}
      {renderCategory('Dashboards', itemsByType.dashboards, 'dashboard', onRemove)}
    </div>
  );
}

type SavedListProps<T> = {
  items: T[];
  loading: boolean;
  emptyMessage: string;
  renderEmptyLink: React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
};

function SavedList<T>({ items, loading, emptyMessage, renderEmptyLink, renderItem }: SavedListProps<T>) {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!items.length) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
        <p>{emptyMessage}</p>
        <div style={{ marginTop: '1rem' }}>{renderEmptyLink}</div>
      </div>
    );
  }

  return <div>{items.map((item) => renderItem(item))}</div>;
}

function renderCategory(
  title: string,
  items: BasketItem[],
  type: BasketItem['item_type'],
  onRemove: BasketTabProps['onRemove']
) {
  if (!items.length) return null;

  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        {title} ({items.length})
      </h2>
      <div>
        {items.map((item) => (
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
              href={`/${type === 'dashboard' ? 'dashboards' : `${type}s`}/${item.item_slug}`}
              style={{ color: 'var(--ifm-color-primary)', textDecoration: 'none', fontWeight: 500 }}
            >
              {item.item_name}
            </Link>
            <button
              type="button"
              onClick={() => onRemove(item.item_id, type)}
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
  );
}

function pillStyle(backgroundColor: string): React.CSSProperties {
  return {
    padding: '0.25rem 0.75rem',
    backgroundColor,
    color: 'white',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 600,
  };
}

function strengthColor(strength: string): string {
  switch (strength.toLowerCase()) {
    case 'high':
      return '#16a34a';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#6b7280';
    default:
      return 'var(--ifm-color-primary)';
  }
}

