'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAI } from '@/lib/contexts/AIContext';
import { useTrackingPlan } from '@/lib/contexts/TrackingPlanContext';
import { supabase } from '@/lib/supabase';
import { withTablePrefix } from '@/src/types/entities';

/* ─── Types ── */
type EntityType = 'kpi' | 'metric' | 'dimension';
type Status = 'idle' | 'generating' | 'done' | 'error';

interface CustomField { key: string; label: string; hint: string; }
interface GeneratedItem { name: string; [key: string]: string | string[] | boolean | undefined; }
interface SchemaField { key: string; label: string; hint: string; }

const ENTITY_LABELS: Record<EntityType, { label: string; badge: string; color: string }> = {
  kpi:       { label: 'KPI',       badge: 'badge-kpi',    color: '#818cf8' },
  metric:    { label: 'Metric',    badge: 'badge-metric',  color: '#4ade80' },
  dimension: { label: 'Dimension', badge: 'badge-dim',     color: '#fbbf24' },
};

const ARRAY_FIELDS = new Set(['tags','industry','dashboard_usage','aliases','related_kpis','related_metrics','related_dimensions','derived_kpis','derived_dimensions','derived_metrics','reviewed_by']);

function toDisplay(val: unknown): string {
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object' && val !== null) return JSON.stringify(val, null, 2);
  return String(val ?? '');
}

/* ─── Result Card ── */
function ResultCard({ item, schema, entityType, index }: { item: GeneratedItem; schema: SchemaField[]; entityType: EntityType; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [data, setData] = useState<GeneratedItem>(item);
  const cfg = ENTITY_LABELS[entityType];

  const codeFields = new Set(['sql_query','formula','w3_data_layer','ga4_data_layer','adobe_client_data_layer','xdm_mapping']);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', overflow: 'hidden', animation: 'fadeSlide 0.25s ease', animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', textAlign: 'left', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: cfg.color + '22', color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
          {index + 1}
        </span>
        <span style={{ fontWeight: 700, fontSize: '1rem', flex: 1, color: 'var(--text)' }}>{data.name}</span>
        <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
        <span className="badge badge-done">AI ✓</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginLeft: '0.25rem' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 1.25rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {schema.map(field => {
            const val = data[field.key];
            const isCode = codeFields.has(field.key);
            return (
              <div key={field.key} style={{ gridColumn: isCode || field.key === 'description' || field.key === 'business_use_case' || field.key === 'calculation_notes' ? '1 / -1' : 'auto' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  {field.label}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '0.4rem', opacity: 0.6 }}>{field.hint.slice(0, 60)}…</span>
                </label>
                {isCode ? (
                  <textarea
                    className="mono"
                    value={toDisplay(val)}
                    onChange={e => setData(d => ({ ...d, [field.key]: e.target.value }))}
                    rows={4}
                    style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', lineHeight: 1.6, resize: 'vertical', width: '100%', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={toDisplay(val)}
                    onChange={e => setData(d => ({ ...d, [field.key]: e.target.value }))}
                    style={{ padding: '0.55rem 0.85rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Content Wrapper ── */
function PlannerContent() {
  const [namesText, setNamesText] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('kpi');
  const [industry, setIndustry] = useState('');
  const [platform, setPlatform] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');
  const { cart, clearCart } = useTrackingPlan();

  const { settings, setSettingsOpen, activeKey, activeModel } = useAI();
  const providerLabel = { openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', custom: 'Custom' }[settings.provider];

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [results, setResults] = useState<GeneratedItem[]>([]);
  const [schema, setSchema] = useState<SchemaField[]>([]);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [planName, setPlanName] = useState('My Tracking Plan');
  const [planDescription, setPlanDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (planId) {
      supabase.from(withTablePrefix('tracking_plans')).select('*').eq('id', planId).single().then(({ data }: { data: any }) => {
        if (data) {
          setPlanName(data.name);
          setPlanDescription(data.description || '');
          if (data.items && data.items.length > 0) {
            setResults(data.items);
            setNamesText(data.items.map((i: { name: string }) => i.name).join('\n'));
          }
        }
      });
    } else if (cart.length > 0 && namesText === '') {
      setNamesText(cart.map(i => i.name).join('\n'));
    }
  }, [planId, cart]);

  const itemNames = namesText.split('\n').map(s => s.trim()).filter(Boolean);



  const generate = useCallback(async () => {
    if (itemNames.length === 0) return;
    setStatus('generating');
    setError('');
    setResults([]);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemNames,
          entityType,
          context: { industry, platform, extraContext },
          customFields,
          provider: settings.provider,
          model: activeModel,
          apiKey: activeKey, // Passed securely from the browser's context!
          baseUrl: settings.baseUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      setResults(json.results as GeneratedItem[]);
      setSchema(json.schema as SchemaField[]);
      setStatus('done');
      if (cart.length > 0 && !planId) {
        clearCart();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [itemNames, entityType, industry, platform, extraContext, customFields, settings, activeModel, activeKey]);

  const exportAll = (format: 'json' | 'csv') => {
    const cleaned = results.map(item => {
      const out: Record<string, unknown> = { ...item };
      ARRAY_FIELDS.forEach(f => {
        const v = out[f];
        if (typeof v === 'string') out[f] = v.split(',').map((s: string) => s.trim()).filter(Boolean);
      });
      return out;
    });
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(cleaned, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `openkpis-${entityType}s-export.json`; a.click();
    } else {
      if (cleaned.length === 0) return;
      const allKeys = Array.from(new Set(cleaned.flatMap(Object.keys)));
      const csv = [allKeys.join(','), ...cleaned.map(row => allKeys.map(k => JSON.stringify(Array.isArray(row[k]) ? (row[k] as string[]).join('; ') : (row[k] ?? ''))).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `openkpis-${entityType}s-export.csv`; a.click();
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/planner/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: planId || undefined,
          name: planName,
          description: planDescription,
          items: results,
          customFields
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      
      setSaveModalOpen(false);
      alert('Plan saved successfully!');
      if (!planId) {
        router.push(`/planner?id=${data.data.id}`);
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error saving plan');
    } finally {
      setIsSaving(false);
    }
  };

  const visualizeInAnalyst = () => {
    // Map the results to the ItemsInAnalysis structure expected by the AI Analyst
    const targetKey = entityType + 's';
    const itemsForAnalyst = {
      kpis: [],
      metrics: [],
      dimensions: [],
      [targetKey]: results.map(r => ({
        name: r.name,
        description: r.description,
        category: r.category || 'General',
        tags: typeof r.tags === 'string' ? r.tags.split(',').map(s => s.trim()) : (Array.isArray(r.tags) ? r.tags : []),
      }))
    };
    
    // Save to sessionStorage keys used by AIAnalystClient
    sessionStorage.setItem('ai-items', JSON.stringify(itemsForAnalyst));
    if (industry || extraContext) {
      sessionStorage.setItem('ai-req', JSON.stringify(`Industry: ${industry}. ${extraContext}`));
    } else {
      sessionStorage.setItem('ai-req', JSON.stringify(`Analyze the tracking plan requirements.`));
    }
    if (platform) sessionStorage.setItem('ai-sol', JSON.stringify(platform));

    router.push('/ai-analyst?step=2');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', minHeight: 'calc(100vh - 60px)' }}>
      {/* ─── Left Sidebar ─── */}
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#fff' }}>✦</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text)' }}>Tracking Planner</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Generate & Merge to Standard</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {/* Entity Type */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Entity Type</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['kpi', 'metric', 'dimension'] as EntityType[]).map(t => (
                <button key={t} onClick={() => setEntityType(t)}
                  style={{ flex: 1, padding: '0.55rem 0', borderRadius: '8px', border: `1.5px solid ${entityType === t ? ENTITY_LABELS[t].color : 'var(--border)'}`, background: entityType === t ? ENTITY_LABELS[t].color + '15' : 'transparent', color: entityType === t ? ENTITY_LABELS[t].color : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: entityType === t ? 700 : 400, cursor: 'pointer' }}>
                  {ENTITY_LABELS[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Item Names */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
              {ENTITY_LABELS[entityType].label} Names <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.6 }}>(one per line)</span>
            </label>
            <textarea
              value={namesText}
              onChange={e => setNamesText(e.target.value)}
              onFocus={() => setFocusedInput('namesText')}
              onBlur={() => setFocusedInput(null)}
              placeholder={`Conversion Rate\nBounce Rate\nRevenue per User\nCustomer Lifetime Value`}
              rows={8}
              style={{ padding: '0.75rem', lineHeight: 1.7, resize: 'vertical', fontSize: '0.875rem', width: '100%', borderRadius: '8px', border: focusedInput === 'namesText' ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: focusedInput === 'namesText' ? '0 0 0 1px var(--primary)' : 'none', outline: 'none', background: 'var(--surface)', color: 'var(--text)', transition: 'all 0.2s ease' }}
            />
            {itemNames.length > 0 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
                {itemNames.length} {ENTITY_LABELS[entityType].label}{itemNames.length > 1 ? 's' : ''} to document
              </div>
            )}
            <button
              onClick={generate}
              disabled={status === 'generating' || itemNames.length === 0}
              style={{ width: '100%', padding: '0.65rem', background: status === 'generating' ? 'var(--surface2)' : 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: status === 'generating' ? 'none' : '0 2px 10px var(--primary-glow)', cursor: status === 'generating' || itemNames.length === 0 ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
            >
              {status === 'generating' ? <><span className="spinner" />Planning…</> : <><span>✦</span> Generate Plan</>}
            </button>
          </div>

          {/* Context */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Context <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.6 }}>(optional)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input value={industry} onChange={e => setIndustry(e.target.value)} onFocus={() => setFocusedInput('industry')} onBlur={() => setFocusedInput(null)} placeholder="Industry (e.g. eCommerce, SaaS)" style={{ padding: '0.55rem 0.75rem', width: '100%', borderRadius: '8px', border: focusedInput === 'industry' ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: focusedInput === 'industry' ? '0 0 0 1px var(--primary)' : 'none', outline: 'none', background: 'var(--surface)', color: 'var(--text)', transition: 'all 0.2s ease' }} />
              <select value={platform} onChange={e => setPlatform(e.target.value)} onFocus={() => setFocusedInput('platform')} onBlur={() => setFocusedInput(null)} style={{ padding: '0.55rem 0.75rem', width: '100%', borderRadius: '8px', border: focusedInput === 'platform' ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: focusedInput === 'platform' ? '0 0 0 1px var(--primary)' : 'none', outline: 'none', background: 'var(--surface)', color: 'var(--text)', transition: 'all 0.2s ease' }}>
                <option value="">Analytics Platform (optional)</option>
                <option value="Google Analytics 4">Google Analytics 4</option>
                <option value="Adobe Analytics">Adobe Analytics</option>
                <option value="Adobe Experience Platform">Adobe AEP (XDM)</option>
                <option value="Custom / Other">Custom / Other</option>
              </select>
              <textarea value={extraContext} onChange={e => setExtraContext(e.target.value)} onFocus={() => setFocusedInput('extraContext')} onBlur={() => setFocusedInput(null)} placeholder="Any extra context for the AI…" rows={2} style={{ padding: '0.55rem 0.75rem', resize: 'none', width: '100%', borderRadius: '8px', border: focusedInput === 'extraContext' ? '1px solid var(--primary)' : '1px solid var(--border)', boxShadow: focusedInput === 'extraContext' ? '0 0 0 1px var(--primary)' : 'none', outline: 'none', background: 'var(--surface)', color: 'var(--text)', transition: 'all 0.2s ease' }} />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#a5b4fc' }}>✦ {providerLabel}</span>
            <button onClick={() => setSettingsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', textDecoration: 'underline', fontSize: '0.7rem', padding: 0, cursor: 'pointer' }}>change setting</button>
          </div>
          <button
            onClick={generate}
            disabled={status === 'generating' || itemNames.length === 0}
            style={{ width: '100%', padding: '0.875rem', background: status === 'generating' ? 'var(--surface2)' : 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: status === 'generating' ? 'none' : '0 4px 20px var(--primary-glow)', cursor: status === 'generating' || itemNames.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            {status === 'generating' ? <><span className="spinner" />Planning…</> : <><span>✦</span> Generate Plan</>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>
              {results.length > 0 ? `${results.length} ${ENTITY_LABELS[entityType].label}${results.length > 1 ? 's' : ''} Planned` : 'Tracking Plan'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {results.length > 0 ? 'Review your tracking specifications. Drafts are automatically proposed for standard review.' : 'Enter names on the left and click Generate Plan to get started.'}
            </p>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setSaveModalOpen(true)} style={{ padding: '0.55rem 1.25rem', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>💾 Save</button>
              <button onClick={visualizeInAnalyst} style={{ padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px var(--primary-glow)' }}>✦ Visualize Dashboard</button>
              <button onClick={() => exportAll('json')} style={{ padding: '0.55rem 1.25rem', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>⬇ JSON</button>
              <button onClick={() => exportAll('csv')} style={{ padding: '0.55rem 1.25rem', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>⬇ CSV</button>
            </div>
          )}
        </div>

        {/* Error */}
        {status === 'error' && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.875rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* Empty State */}
        {status === 'idle' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '6rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--primary)' }}>📝</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)' }}>Start an Analytics Plan</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.7 }}>
              Paste a list of items on the left. The AI will pull from the existing OpenKPIs catalog, or draft net-new Tracking Specs for you.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              {['Conversion Rate', 'Sessions', 'Revenue', 'Add to Cart Event'].map(ex => (
                <button
                  key={ex}
                  onClick={() => setNamesText(prev => prev ? prev + '\n' + ex : ex)}
                  style={{ padding: '0.35rem 0.85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  + {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generating State */}
        {status === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {itemNames.map((name, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem 1.25rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeSlide 0.2s ease both', animationDelay: `${i * 0.05}s` }}>
                <span className="spinner" />
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Retrieving standard or generating new draft…</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && schema.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((item, i) => (
              <ResultCard key={i} item={item} schema={schema} entityType={entityType} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Save Modal */}
      {saveModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '12px', width: '400px', maxWidth: '90vw', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Save Tracking Plan</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Plan Name</label>
              <input value={planName} onChange={e => setPlanName(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Description (Optional)</label>
              <textarea value={planDescription} onChange={e => setPlanDescription(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setSaveModalOpen(false)} style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSavePlan} disabled={isSaving || !planName} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: (isSaving || !planName) ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                {isSaving ? 'Saving...' : 'Save Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>}>
      <PlannerContent />
    </React.Suspense>
  );
}
