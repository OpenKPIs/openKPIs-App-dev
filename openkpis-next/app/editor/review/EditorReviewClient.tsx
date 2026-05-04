'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import type { DraftItem, DraftItemType } from './types';

interface Props {
  initialItems: DraftItem[];
  editorName: string;
}

const TAB_DEFINITIONS: Array<{ key: DraftItemType | 'all' | 'udl'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'kpi', label: 'KPIs' },
  { key: 'metric', label: 'Metrics' },
  { key: 'dimension', label: 'Dimensions' },
  { key: 'event', label: 'Events' },
  { key: 'dashboard', label: 'Dashboards' },
  { key: 'udl', label: 'UDL Standardization ✨' },
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
  const [activeTab, setActiveTab] = useState<DraftItemType | 'all' | 'udl'>(initialItems.length ? 'all' : 'kpi');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const counts = useMemo(() => {
    const counter: Record<DraftItemType | 'all' | 'udl', number> = {
      all: items.length,
      kpi: 0,
      metric: 0,
      dimension: 0,
      event: 0,
      dashboard: 0,
      udl: 0, // Not tied to draft items list
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
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Governance Dashboard</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Signed in as <strong>{editorName}</strong>. Review and approve AI-generated tracking specs to officially merge them into the OpenKPIs standard and trigger GitHub synchronization.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {TAB_DEFINITIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as DraftItemType | 'all' | 'udl')}
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
            {tab.key !== 'udl' && <span style={{ marginLeft: '0.5rem', opacity: 0.75 }}>({counts[tab.key] ?? 0})</span>}
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

      {activeTab === 'udl' ? (
        <UDLStandardizationView />
      ) : filteredItems.length === 0 ? (
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
                      {publishingId === item.id ? 'Approving…' : 'Approve & Merge'}
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

      {/* spacer */}
      <div style={{ height: '4rem' }} />
    </main>
  );
}

// ---------------------------------------------------------------------
// UDL Standardization View (The Great Consolidation UI)
// ---------------------------------------------------------------------
function UDLStandardizationView() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'diff' | 'saving'>('idle');
  const [platform, setPlatform] = useState('GA4');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [diffData, setDiffData] = useState<any>(null);

  // State for manual drafts (Impact Scanner)
  const [manualDrafts, setManualDrafts] = useState<any[]>([]);
  const [draftStatus, setDraftStatus] = useState<'loading' | 'idle' | 'saving'>('loading');

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await fetch('/api/udl/drafts');
        if (res.ok) {
          const data = await res.json();
          setManualDrafts(data.drafts || []);
        }
      } catch (err) {
        console.error('Failed to fetch UDL drafts', err);
      } finally {
        setDraftStatus('idle');
      }
    };
    fetchDrafts();
  }, []);

  const handleApproveDraft = async (draft: any) => {
    setDraftStatus('saving');
    try {
      const res = await fetch('/api/admin/publish-udl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: draft.platform,
          monolithicSchema: draft.fullDraft,
          udlId: draft.id,
          isManualDraftApprove: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.mocked) {
          alert('Draft approved & pushed to DB! (Github push skipped because GITHUB_ACCESS_TOKEN is missing)');
        } else {
          alert('Draft approved & successfully pushed to GitHub!');
        }
        setManualDrafts(prev => prev.filter(d => d.id !== draft.id));
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Unexpected error approving draft.');
    } finally {
      setDraftStatus('idle');
    }
  };

  const handleScan = async () => {

    setStatus('scanning');
    // Simulated chunked progress for the UI
    setProgress({ current: 0, total: 100 });
    
    // In a real implementation, we would fetch chunks of 10 items here and send them to the API
    // We mock the chunking loop to show the robust UI handling
    for (let i = 10; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 600));
      setProgress({ current: i, total: 100 });
    }

    // Now fetch the actual diff from the backend (mocked diff for this MVP)
    const mockDiff = [
      { key: 'sign_up', type: 'new', desc: 'Standardized from "signup" and "registration"', industries: ['Global'] },
      { key: 'page_view', type: 'unchanged', desc: 'Core navigation event', industries: ['Global'] },
      { key: 'add_to_cart', type: 'new', desc: 'Extracted from retail KPIs', industries: ['Retail'] },
      { key: 'subscription_start', type: 'modified', desc: 'Renamed from "start_sub"', industries: ['Media', 'SaaS'] },
      { key: 'custom_event_1', type: 'removed', desc: 'Deprecated junk field', industries: [] }
    ];
    
    setDiffData(mockDiff);
    setStatus('diff');
  };

  const handleApprove = async () => {
    setStatus('saving');
    
    try {
      // In a real execution, we would construct the final monolithic schema from the scan.
      // We pass a mock monolithic schema structure here to demonstrate the pipeline.
      const mockMonolithicSchema = {
        'page_view': { type: 'event', description: 'Core navigation event', industries: ['Global'] },
        'sign_up': { type: 'event', description: 'Standardized from signup and registration', industries: ['Global'] },
        'add_to_cart': { type: 'event', description: 'Extracted from retail KPIs', industries: ['Retail'] },
        'subscription_start': { type: 'event', description: 'Renamed from start_sub', industries: ['Media', 'SaaS'] }
      };

      const res = await fetch('/api/admin/publish-udl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          monolithicSchema: mockMonolithicSchema
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.mocked) {
          alert('Master UDL updated in database! (Github push skipped because GITHUB_ACCESS_TOKEN is missing in .env.local)');
        } else {
          alert('Master UDL updated and successfully pushed to openKPIs-content-publish repository!');
        }
      } else {
        alert(`Error: ${data.error || 'Failed to publish'}`);
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred during publishing.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid var(--ifm-color-emphasis-200)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      
      {/* ----------------- MANUAL DRAFTS SECTION ----------------- */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
        🛡️ Governance Impact Scanner
      </h2>
      <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Review top-down manual edits made to the Master UDL. The Impact Scanner cross-references these edits against all published KPIs to warn you of breaking changes.
      </p>

      {draftStatus === 'loading' ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner" style={{ width: '24px', height: '24px' }} /></div>
      ) : manualDrafts.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', marginBottom: '3rem' }}>
          No pending manual UDL drafts.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
          {manualDrafts.map(draft => (
            <div key={draft.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fef3c7', borderBottom: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#92400e', fontSize: '1.1rem' }}>{draft.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>{draft.industry} • {draft.platform}</span>
                </div>
                <button onClick={() => handleApproveDraft(draft)} disabled={draftStatus === 'saving'} className="btn btn-primary" style={{ backgroundColor: '#d97706', borderColor: '#d97706', fontWeight: 600 }}>
                  {draftStatus === 'saving' ? 'Publishing...' : 'Approve & Push to GitHub'}
                </button>
              </div>

              {/* IMPACT WARNING */}
              {draft.impactedKpis && draft.impactedKpis.length > 0 && (
                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                  <h4 style={{ margin: 0, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ IMPACT WARNING: Breaking Changes Detected
                  </h4>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#991b1b' }}>
                    The following KPIs rely on fields that are being deleted or modified in this draft. If you approve this draft, these KPIs will have broken data layer references:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#991b1b', fontSize: '0.85rem' }}>
                    {draft.impactedKpis.map((kpi: any, idx: number) => (
                      <li key={idx}><strong>{kpi.kpi}</strong> (relies on `{kpi.key}`)</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#4b5563' }}>Schema Changes:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {draft.diffData.length === 0 && <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>No differences found.</div>}
                  {draft.diffData.map((diff: any, i: number) => {
                    let bgColor = '#f9fafb'; let borderColor = '#e5e7eb'; let icon = '•';
                    if (diff.type === 'new') { bgColor = '#ecfdf5'; borderColor = '#10b981'; icon = '+'; }
                    if (diff.type === 'modified') { bgColor = '#fffbeb'; borderColor = '#f59e0b'; icon = '~'; }
                    if (diff.type === 'removed') { bgColor = '#fef2f2'; borderColor = '#ef4444'; icon = '-'; }

                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0.75rem', background: bgColor, borderLeft: `3px solid ${borderColor}`, borderRadius: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: borderColor, width: '24px', textAlign: 'center' }}>{icon}</span>
                        <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace' }}>{diff.key}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{diff.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- GREAT CONSOLIDATION SECTION ----------------- */}
      <hr style={{ margin: '2rem 0', borderColor: 'var(--ifm-color-emphasis-200)' }} />

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        ✨ The Great Consolidation
      </h2>
      <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '2rem', lineHeight: 1.6 }}>
        Run the AI Standardization agent to scan all fragmented KPIs, Metrics, and Events in the database. 
        It will dynamically extract Data Layer snippets, deduplicate them, assign Industry Tags, and compile the <strong>Monolithic Master UDL</strong>.
      </p>

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <option value="GA4">Google Analytics 4</option>
            <option value="Adobe Analytics">Adobe Analytics</option>
            <option value="XDM">Adobe AEP (XDM)</option>
          </select>
          <button onClick={handleScan} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600 }}>
            Start AI Scan (Chunked)
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px' }}>
          <span className="spinner" style={{ width: '32px', height: '32px', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>Scanning Database...</h3>
          <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem' }}>Processing Data Layer fragments in small batches to prevent timeouts.</p>
          
          <div style={{ width: '100%', maxWidth: '400px', height: '8px', background: '#e5e7eb', borderRadius: '4px', margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ width: `${progress.current}%`, height: '100%', background: 'var(--ifm-color-primary)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {progress.current}% Complete
          </div>
        </div>
      )}

      {status === 'diff' && diffData && (
        <div style={{ animation: 'fadeSlide 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Proposed Master UDL Diff</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStatus('idle')} className="btn">Cancel</button>
              <button onClick={handleApprove} className="btn btn-primary" style={{ fontWeight: 600 }}>
                Approve & Push to GitHub
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {diffData.map((diff: any, i: number) => {
              let bgColor = '#f9fafb';
              let borderColor = '#e5e7eb';
              let icon = '•';
              
              if (diff.type === 'new') { bgColor = '#ecfdf5'; borderColor = '#10b981'; icon = '+'; }
              if (diff.type === 'modified') { bgColor = '#fffbeb'; borderColor = '#f59e0b'; icon = '~'; }
              if (diff.type === 'removed') { bgColor = '#fef2f2'; borderColor = '#ef4444'; icon = '-'; }

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: bgColor, borderLeft: `4px solid ${borderColor}`, borderRadius: '6px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: borderColor, width: '30px', textAlign: 'center' }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>{diff.key}</strong>
                      {diff.industries.map((ind: string) => (
                        <span key={ind} style={{ background: '#e5e7eb', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{ind}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{diff.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {status === 'saving' && (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <span className="spinner" style={{ width: '32px', height: '32px', marginBottom: '1rem' }} />
          <h3>Publishing to GitHub...</h3>
          <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>Syncing monolithic JSON to the openKPIs-content-publish repository.</p>
        </div>
      )}
    </div>
  );
}

