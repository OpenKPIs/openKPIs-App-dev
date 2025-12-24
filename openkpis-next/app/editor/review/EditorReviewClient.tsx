'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { DraftItem, DraftItemType } from './types';

interface Props {
  initialItems: DraftItem[];
  editorName: string;
}

const TAB_DEFINITIONS: Array<{ key: DraftItemType | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'kpi', label: 'KPIs' },
  { key: 'metric', label: 'Metrics' },
  { key: 'dimension', label: 'Dimensions' },
  { key: 'event', label: 'Events' },
  { key: 'dashboard', label: 'Dashboards' },
];

const TYPE_PATH: Record<DraftItemType, string> = {
  kpi: 'kpis',
  metric: 'metrics',
  dimension: 'dimensions',
  event: 'events',
  dashboard: 'dashboards',
};

const DISPLAY_LABEL: Record<DraftItemType, string> = {
  kpi: 'KPI',
  metric: 'Metric',
  dimension: 'Dimension',
  event: 'Event',
  dashboard: 'Dashboard',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return value;
  }
}

export default function EditorReviewClient({ initialItems, editorName }: Props) {
  const [items, setItems] = useState<DraftItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<DraftItemType | 'all'>(initialItems.length ? 'all' : 'kpi');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const counts = useMemo(() => {
    const counter: Record<DraftItemType | 'all', number> = {
      all: items.length,
      kpi: 0,
      metric: 0,
      dimension: 0,
      event: 0,
      dashboard: 0,
    };
    items.forEach((item) => {
      counter[item.type] = (counter[item.type] || 0) + 1;
    });
    return counter;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter((item) => item.type === activeTab);
  }, [items, activeTab]);

  async function handlePublish(item: DraftItem) {
    if (publishingId) return;

    setPublishingId(item.id);
    setMessage(null);

    try {
      const response = await fetch('/api/editor/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: item.type, itemId: item.id }),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        setItems((prev) => prev.filter((draft) => !(draft.id === item.id && draft.type === item.type)));
        setMessage({ type: 'success', text: `${item.name || item.slug || 'Item'} published successfully.` });
      } else if (response.status === 207) {
        setMessage({
          type: 'warning',
          text:
            payload?.error ||
            `${item.name || item.slug || 'Item'} saved but GitHub sync did not complete. Please retry once credentials are verified.`,
        });
      } else {
        setMessage({ type: 'error', text: payload?.error || 'Failed to publish item.' });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to publish item.';
      setMessage({ type: 'error', text: message });
    } finally {
      setPublishingId(null);
    }
  }

  async function handleReject(item: DraftItem) {
    if (rejectingId) return;

    setRejectingId(item.id);
    setMessage(null);

    try {
      const response = await fetch('/api/editor/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemType: item.type, itemId: item.id }),
      });

      const payload = await response.json().catch(() => ({}));

      if (response.ok) {
        setItems((prev) => prev.filter((draft) => !(draft.id === item.id && draft.type === item.type)));
        setMessage({ type: 'success', text: `${item.name || item.slug || 'Item'} rejected and removed from review queue.` });
      } else {
        setMessage({ type: 'error', text: payload?.error || 'Failed to reject item.' });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to reject item.';
      setMessage({ type: 'error', text: message });
    } finally {
      setRejectingId(null);
    }
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Editor Review Queue</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Signed in as <strong>{editorName}</strong>. Publish drafts to make them available to the community and sync with GitHub.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TAB_DEFINITIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as DraftItemType | 'all')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              border: activeTab === tab.key ? '1px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-200)',
              backgroundColor: activeTab === tab.key ? 'var(--ifm-color-primary)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--ifm-font-color-base)',
              cursor: 'pointer',
            }}
          >
            {tab.label}
            <span style={{ marginLeft: '0.5rem', opacity: 0.75 }}>({counts[tab.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {message && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid',
            borderColor:
              message.type === 'success'
                ? '#047857'
                : message.type === 'error'
                ? '#b91c1c'
                : '#d97706',
            backgroundColor:
              message.type === 'success'
                ? '#ecfdf5'
                : message.type === 'error'
                ? '#fee2e2'
                : '#fffbeb',
            color:
              message.type === 'success'
                ? '#065f46'
                : message.type === 'error'
                ? '#7f1d1d'
                : '#92400e',
          }}
        >
          {message.text}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div
          style={{
            padding: '3rem',
            border: '1px dashed var(--ifm-color-emphasis-300)',
            borderRadius: '8px',
            textAlign: 'center',
            color: 'var(--ifm-color-emphasis-600)',
          }}
        >
          <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>No drafts awaiting review in this category.</p>
          <p style={{ fontSize: '0.95rem' }}>Check other tabs or encourage contributors to submit more items.</p>
        </div>
      ) : (
        <section className="editor-list">
          {filteredItems.map((item) => {
            const section = TYPE_PATH[item.type];
            const slug = item.slug || item.id;

            return (
              <article
                key={`${item.type}-${item.id}`}
                className="card editor-card"
                style={{ padding: '1.25rem' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span className="badge">
                      {DISPLAY_LABEL[item.type]}
                    </span>
                    {item.github_pr_number ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
                        PR #{item.github_pr_number}
                      </span>
                    ) : null}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                    {item.name || slug}
                  </h2>
                  <dl
                    style={{
                      marginTop: '0.75rem',
                      display: 'grid',
                      gridTemplateColumns: 'max-content auto',
                      rowGap: '0.35rem',
                      columnGap: '0.75rem',
                      fontSize: '0.9rem',
                      color: 'var(--ifm-color-emphasis-700)',
                    }}
                  >
                    <dt>Slug</dt>
                    <dd style={{ margin: 0 }}>{slug}</dd>
                    <dt>Author</dt>
                    <dd style={{ margin: 0 }}>{item.created_by || 'Unknown'}</dd>
                    <dt>Last Updated</dt>
                    <dd style={{ margin: 0 }}>{formatDate(item.updated_at || item.created_at)}</dd>
                  </dl>
                </div>

                <div className="editor-actions">
                  <div className="editor-action-row">
                    <Link href={`/${section}/${slug}`} className="btn">
                      View
                    </Link>
                    <Link href={`/${section}/${slug}/edit`} className="btn">
                      Edit
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <button
                      onClick={() => handlePublish(item)}
                      disabled={publishingId === item.id || rejectingId === item.id}
                      className="btn btn-primary"
                      type="button"
                    >
                      {publishingId === item.id ? 'Publishing…' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      disabled={publishingId === item.id || rejectingId === item.id}
                      className="btn"
                      type="button"
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fca5a5',
                      }}
                    >
                      {rejectingId === item.id ? 'Rejecting…' : 'Reject'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
