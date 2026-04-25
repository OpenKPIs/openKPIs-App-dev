'use client';

import React, { useState, useCallback } from 'react';

/* ─── Types ── */
type EntityType = 'kpi' | 'metric' | 'dimension';
type Status = 'idle' | 'generating' | 'done' | 'error';
type Provider = 'openai' | 'anthropic' | 'google' | 'custom';

const PROVIDER_MODELS: Record<Provider, { id: string; label: string }[]> = {
  openai: [
    { id: 'gpt-5.4',          label: 'GPT-5.4 ★ (Mar 2026 — latest)' },
    { id: 'gpt-5.4-mini',     label: 'GPT-5.4 mini (fast & cost-efficient)' },
    { id: 'gpt-5.3',          label: 'GPT-5.3 "Garlic"' },
    { id: 'o3',               label: 'o3 (reasoning — best)' },
    { id: 'o3-pro',           label: 'o3-pro (reasoning — max)' },
    { id: 'o4-mini',          label: 'o4-mini (reasoning — fast)' },
    { id: 'gpt-4.1',          label: 'GPT-4.1' },
    { id: 'gpt-4.1-mini',     label: 'GPT-4.1 mini' },
    { id: 'gpt-4o',           label: 'GPT-4o' },
  ],
  anthropic: [
    { id: 'claude-opus-4-6',   label: 'Claude Opus 4.6 ★ (Feb 2026 — latest)' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Feb 2026)' },
    { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5' },
    { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet (prev gen)' },
    { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (prev gen)' },
  ],
  google: [
    { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview ★ (Mar 2026 — latest)' },
    { id: 'gemini-3-flash',         label: 'Gemini 3 Flash (preview)' },
    { id: 'gemini-2.5-pro',         label: 'Gemini 2.5 Pro (stable)' },
    { id: 'gemini-2.5-flash',       label: 'Gemini 2.5 Flash (stable)' },
    { id: 'gemini-2.5-flash-lite',  label: 'Gemini 2.5 Flash-Lite' },
  ],
  custom: [],
};

const KEY_PLACEHOLDERS: Record<Provider, string> = {
  openai:    'sk-...',
  anthropic: 'sk-ant-...',
  google:    'AIza...',
  custom:    'your-api-key',
};

const KEY_LINKS: Record<Provider, { label: string; url: string } | null> = {
  openai:    { label: 'Get key →', url: 'https://platform.openai.com/api-keys' },
  anthropic: { label: 'Get key →', url: 'https://console.anthropic.com/settings/keys' },
  google:    { label: 'Get key →', url: 'https://aistudio.google.com/app/apikey' },
  custom:    null,
};

interface SettingsData {
  provider: Provider;
  model: string;
  customModel: string;
  baseUrl: string;
  openaiKey: string;
  anthropicKey: string;
  googleKey: string;
  customKey: string;
  kpiFile: string;
  metricFile: string;
  dimensionFile: string;
}

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

/* ─── Settings Modal ── */
function SettingsModal({ settings, onSave, onClose }: { settings: SettingsData; onSave: (s: SettingsData) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<SettingsData>(settings);
  const [tab, setTab] = useState<'model' | 'keys' | 'files'>('model');
  const set = (patch: Partial<SettingsData>) => setDraft(d => ({ ...d, ...patch }));
  const models = PROVIDER_MODELS[draft.provider];
  const isCustom = draft.provider === 'custom';
  const activeModelId = draft.customModel.trim() || draft.model;
  const activeKey = draft.provider === 'openai' ? draft.openaiKey : draft.provider === 'anthropic' ? draft.anthropicKey : draft.provider === 'google' ? draft.googleKey : draft.customKey;

  const tabBtn = (t: 'model' | 'keys' | 'files', label: string) => (
    <button onClick={() => setTab(t)} style={{ flex: 1, padding: '0.55rem', background: tab === t ? 'var(--primary)' : 'transparent', border: 'none', borderRadius: 8, color: tab === t ? '#fff' : 'var(--text-muted)', fontWeight: tab === t ? 700 : 400, fontSize: '0.85rem', cursor: 'pointer' }}>{label}</button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>⚙️ AI Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Keys stay in browser memory only — never stored on any server.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', borderRadius: 10, padding: 4 }}>
          {tabBtn('model', '🤖 Model')}
          {tabBtn('keys', '🔑 API Keys')}
          {tabBtn('files', '📁 Files')}
        </div>

        {tab === 'model' && (<>
          {/* Provider */}
          <div>
            <label style={lbl}>Provider</label>
            <select value={draft.provider} onChange={e => { const p = e.target.value as Provider; set({ provider: p, model: PROVIDER_MODELS[p][0]?.id ?? '', customModel: '' }); }} style={sel}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
              <option value="custom">Custom / OpenAI-compatible</option>
            </select>
          </div>

          {/* Model dropdown */}
          {!isCustom && models.length > 0 && (
            <div>
              <label style={lbl}>Model</label>
              <select value={draft.model} onChange={e => set({ model: e.target.value, customModel: '' })} style={sel}>
                {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
          )}

          {/* Custom model override */}
          <div>
            <label style={lbl}>Custom model ID <span style={{ fontWeight: 400, opacity: 0.6 }}>(overrides dropdown)</span></label>
            <input value={draft.customModel} onChange={e => set({ customModel: e.target.value })}
              placeholder={isCustom ? 'llama3, mistral, ...' : `optional — leave blank to use ${draft.model}`}
              style={{ ...sel, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem' }} />
          </div>

          {/* Base URL for custom */}
          {isCustom && (
            <div>
              <label style={lbl}>Base URL</label>
              <input value={draft.baseUrl} onChange={e => set({ baseUrl: e.target.value })} placeholder="http://localhost:11434/v1" style={sel} />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Ollama, Together, OpenRouter, Groq, Fireworks…</p>
            </div>
          )}

          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--surface2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#a5b4fc' }}>✦</span>
            Will use: <strong style={{ color: 'var(--text)' }}>{activeModelId || '(no model)'}</strong>
            {activeKey ? <span style={{ marginLeft: 'auto', color: 'var(--accent-green)', fontSize: '0.7rem' }}>✓ key set</span> : <span style={{ marginLeft: 'auto', color: 'var(--accent-amber)', fontSize: '0.7rem' }}>⚠ no key — go to API Keys tab</span>}
          </div>
        </>)}

        {tab === 'keys' && (<>
          {([
            { provider: 'openai'    as Provider, field: 'openaiKey'    as const, label: 'OpenAI',             note: 'For GPT-5.4, o3, GPT-4.1 etc.' },
            { provider: 'anthropic' as Provider, field: 'anthropicKey' as const, label: 'Anthropic (Claude)', note: 'For Claude Opus 4.6, Sonnet 4.6 etc.' },
            { provider: 'google'    as Provider, field: 'googleKey'    as const, label: 'Google (Gemini)',    note: 'For Gemini 3.1 Pro, 2.5 Flash etc.' },
            { provider: 'custom'    as Provider, field: 'customKey'    as const, label: 'Custom endpoint',   note: 'For Ollama, OpenRouter, Groq etc.' },
          ] as const).map(({ provider, field, label, note }) => {
            const link = KEY_LINKS[provider];
            return (
              <div key={field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>{label}</label>
                  {link && <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{link.label}</a>}
                </div>
                <input type="password" value={draft[field] as string} onChange={e => set({ [field]: e.target.value })}
                  placeholder={KEY_PLACEHOLDERS[provider]}
                  style={{ ...sel, borderColor: draft[field] ? 'var(--accent-green)' : 'var(--border)', boxShadow: draft[field] ? '0 0 0 1px rgba(34,197,94,0.2)' : 'none' }} />
                <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{note}{draft[field] ? ' ✓' : ''}</p>
              </div>
            );
          })}
        </>)}

        {tab === 'files' && (<>
          {[
            { label: 'KPI CSV File Location', field: 'kpiFile', placeholder: './documents/kpis.csv' },
            { label: 'Metric CSV File Location', field: 'metricFile', placeholder: './documents/metrics.csv' },
            { label: 'Dimension CSV File Location', field: 'dimensionFile', placeholder: './documents/dimensions.csv' },
          ].map(cfg => (
            <div key={cfg.field}>
              <label style={lbl}>{cfg.label}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={(draft as any)[cfg.field] || ''} onChange={e => set({ [cfg.field]: e.target.value })} placeholder={cfg.placeholder} style={sel} />
                <button 
                  onClick={() => fetch('/api/documents/open', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filePath: (draft as any)[cfg.field] || cfg.placeholder }) })} 
                  style={{ padding: '0 0.8rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  📁 Open
                </button>
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.5rem' }}>
            Data generated will be appended to these respective files when you click <b>Add to Document</b>. The file will be automatically created with headers if it doesn't exist.
          </p>
        </>)}



        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.55rem 1.25rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cancel</button>
          <button onClick={() => { onSave(draft); onClose(); }} style={{ padding: '0.55rem 1.5rem', background: 'var(--primary)', borderRadius: 'var(--radius)', color: '#fff', fontWeight: 600, fontSize: '0.875rem' }}>Save</button>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' };
const sel: React.CSSProperties = { padding: '0.6rem 0.75rem', width: '100%', borderRadius: 'var(--radius)' };

/* ─── Result Card ── */
function ResultCard({ item, schema, entityType, index, documentPath }: { item: GeneratedItem; schema: SchemaField[]; entityType: EntityType; index: number; documentPath: string }) {
  const [expanded, setExpanded] = useState(index === 0);
  const [data, setData] = useState<GeneratedItem>(item);
  const cfg = ENTITY_LABELS[entityType];

  const codeFields = new Set(['sql_query','formula','w3_data_layer','ga4_data_layer','adobe_client_data_layer','xdm_mapping']);

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', overflow: 'hidden', animation: 'fadeSlide 0.25s ease', animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
      {/* Card Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'none', textAlign: 'left' }}
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
                    style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem', lineHeight: 1.6, resize: 'vertical' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={toDisplay(val)}
                    onChange={e => setData(d => ({ ...d, [field.key]: e.target.value }))}
                    style={{ padding: '0.55rem 0.85rem' }}
                  />
                )}
              </div>
            );
          })}

          {/* End of field maps */}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ── */
export default function WriterPage() {
  const [namesText, setNamesText] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('kpi');
  const [industry, setIndustry] = useState('');
  const [platform, setPlatform] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [settings, setSettings] = useState<SettingsData>({
    provider: 'openai',
    model: 'gpt-5.4',
    customModel: '',
    baseUrl: '',
    openaiKey: '',
    anthropicKey: '',
    googleKey: '',
    customKey: '',
    kpiFile: './documents/kpis.csv',
    metricFile: './documents/metrics.csv',
    dimensionFile: './documents/dimensions.csv',
  });
  
  React.useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (Object.keys(data).length > 0) setSettings(s => ({ ...s, ...data }));
    }).catch(console.error);
  }, []);

  const handleSaveSettings = async (newSettings: SettingsData) => {
    setSettings(newSettings);
    setShowSettings(false);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
  };

  const [showSettings, setShowSettings] = useState(false);
  const activeModel = settings.customModel.trim() || settings.model;
  const providerLabel = { openai: 'OpenAI', anthropic: 'Anthropic', google: 'Google', custom: 'Custom' }[settings.provider];
  const activeKey = settings.provider === 'openai' ? settings.openaiKey : settings.provider === 'anthropic' ? settings.anthropicKey : settings.provider === 'google' ? settings.googleKey : settings.customKey;

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [results, setResults] = useState<GeneratedItem[]>([]);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [isGloballySaved, setIsGloballySaved] = useState(false);

  const itemNames = namesText.split('\n').map(s => s.trim()).filter(Boolean);

  const addCustomField = () => {
    if (!newFieldLabel.trim()) return;
    const key = newFieldLabel.trim().toLowerCase().replace(/\s+/g, '_');
    if (customFields.some(f => f.key === key)) return;
    setCustomFields(f => [...f, { key, label: newFieldLabel.trim(), hint: 'Custom field — fill it in as needed.' }]);
    setNewFieldLabel('');
  };

  const generate = useCallback(async () => {
    if (itemNames.length === 0) return;
    setStatus('generating');
    setError('');
    setResults([]);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemNames,
          entityType,
          context: { industry, platform, extraContext },
          customFields,
          provider: settings.provider,
          model: activeModel,
          apiKey: activeKey,
          baseUrl: settings.baseUrl || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');
      setResults(json.results as GeneratedItem[]);
      setSchema(json.schema as SchemaField[]);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  }, [itemNames, entityType, industry, platform, extraContext, customFields, settings, activeModel]);

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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', minHeight: '100vh' }}>
      {showSettings && <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />}

      {/* ─── Left Sidebar ─── */}
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✦</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>OpenKPIs Writer</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI-Powered Measurement Documenter</div>
            </div>
            <button onClick={() => setShowSettings(true)} style={{ marginLeft: 'auto', width: 30, height: 30, background: 'var(--surface2)', borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }} title="Settings">⚙</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {/* Entity Type */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Entity Type</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['kpi', 'metric', 'dimension'] as EntityType[]).map(t => (
                <button key={t} onClick={() => setEntityType(t)}
                  style={{ flex: 1, padding: '0.55rem 0', borderRadius: 'var(--radius)', border: `1.5px solid ${entityType === t ? ENTITY_LABELS[t].color : 'var(--border)'}`, background: entityType === t ? ENTITY_LABELS[t].color + '15' : 'transparent', color: entityType === t ? ENTITY_LABELS[t].color : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: entityType === t ? 700 : 400 }}>
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
              placeholder={`Conversion Rate\nBounce Rate\nRevenue per User\nCustomer Lifetime Value`}
              rows={8}
              style={{ padding: '0.75rem', lineHeight: 1.7, resize: 'vertical', fontSize: '0.875rem' }}
            />
            {itemNames.length > 0 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {itemNames.length} {ENTITY_LABELS[entityType].label}{itemNames.length > 1 ? 's' : ''} to document
              </div>
            )}
          </div>

          {/* Context */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Context <span style={{ fontWeight: 400, textTransform: 'none', opacity: 0.6 }}>(optional)</span></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Industry (e.g. eCommerce, SaaS)" style={{ padding: '0.55rem 0.75rem' }} />
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={{ padding: '0.55rem 0.75rem' }}>
                <option value="">Analytics Platform (optional)</option>
                <option value="Google Analytics 4">Google Analytics 4</option>
                <option value="Adobe Analytics">Adobe Analytics</option>
                <option value="Adobe Customer Journey Analytics">Adobe CJA</option>
                <option value="Both GA4 and Adobe Analytics">GA4 + Adobe Analytics</option>
                <option value="Custom / Other">Custom / Other</option>
              </select>
              <textarea value={extraContext} onChange={e => setExtraContext(e.target.value)} placeholder="Any extra context for the AI…" rows={2} style={{ padding: '0.55rem 0.75rem', resize: 'none' }} />
            </div>
          </div>

          {/* Custom Fields */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>Custom Fields</label>
            {customFields.map((f, i) => (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.6rem', background: 'var(--surface2)', borderRadius: 8, marginBottom: '0.35rem', border: '1px solid var(--border)' }}>
                <span style={{ flex: 1, fontSize: '0.8rem' }}>{f.label}</span>
                <button onClick={() => setCustomFields(c => c.filter((_, j) => j !== i))} style={{ color: 'var(--accent-red)', background: 'none', fontSize: '0.8rem', padding: '0 0.2rem' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomField()}
                placeholder="+ Field name" style={{ padding: '0.45rem 0.65rem', flex: 1 }} />
              <button onClick={addCustomField} style={{ padding: '0.45rem 0.75rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--primary)', fontSize: '0.85rem' }}>+</button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#a5b4fc' }}>✦ {providerLabel}</span>
            <button onClick={() => setShowSettings(true)} style={{ background: 'none', color: 'var(--text-dim)', textDecoration: 'underline', fontSize: '0.7rem', padding: 0 }}>change</button>
          </div>
          {!activeKey && (
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-amber)', marginBottom: '0.5rem' }}>
              ⚠ No key for {providerLabel} — <button onClick={() => setShowSettings(true)} style={{ background: 'none', color: 'var(--accent-amber)', textDecoration: 'underline', fontSize: '0.72rem', padding: 0 }}>Settings → API Keys</button>
            </div>
          )}
          <button
            onClick={generate}
            disabled={status === 'generating' || itemNames.length === 0}
            style={{ width: '100%', padding: '0.875rem', background: status === 'generating' ? 'var(--surface2)' : 'linear-gradient(135deg, var(--primary), #a855f7)', borderRadius: 'var(--radius)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: status === 'generating' ? 'none' : '0 4px 20px var(--primary-glow)' }}
          >
            {status === 'generating' ? <><span className="spinner" />Generating…</> : <><span>✦</span> Generate {itemNames.length > 0 ? `${itemNames.length} ` : ''}{ENTITY_LABELS[entityType].label}{itemNames.length > 1 ? 's' : ''}</>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {results.length > 0 ? `${results.length} ${ENTITY_LABELS[entityType].label}${results.length > 1 ? 's' : ''} Generated` : 'Results'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {results.length > 0 ? 'Review and edit each field. All changes are local — export when ready.' : 'Enter names on the left and click Generate to get started.'}
            </p>
          </div>
          {results.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={async () => {
                  const cleaned = results.map(item => {
                    const clean = { ...item };
                    ARRAY_FIELDS.forEach(f => {
                      const v = clean[f];
                      if (typeof v === 'string') clean[f] = v.split(',').map((s: string) => s.trim()).filter(Boolean);
                    });
                    return clean;
                  });
                  const activeDoc = entityType === 'kpi' ? (settings.kpiFile || './documents/kpis.csv') : entityType === 'metric' ? (settings.metricFile || './documents/metrics.csv') : (settings.dimensionFile || './documents/dimensions.csv');
                  try {
                    const res = await fetch('/api/documents', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ filePath: activeDoc, data: cleaned }),
                    });
                    if (res.ok) {
                      setIsGloballySaved(true);
                      setTimeout(() => setIsGloballySaved(false), 2000);
                    } else {
                      let errText = 'Failed to save to document';
                      try {
                        const json = await res.json();
                        if (json.error) errText += `: ${json.error}`;
                      } catch(e) {}
                      alert(errText);
                    }
                  } catch (e) {
                    alert('Error saving document: ' + String(e));
                  }
                }}
                style={{ padding: '0.55rem 1.25rem', background: isGloballySaved ? 'var(--surface)' : 'var(--surface2)', borderRadius: 'var(--radius)', border: `1px solid ${isGloballySaved ? 'var(--accent-green)' : 'var(--border)'}`, color: isGloballySaved ? 'var(--accent-green)' : 'var(--text)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s ease' }}
              >
                {isGloballySaved ? '✓ Added' : '➕ Add to Document'}
              </button>
              <button onClick={() => exportAll('json')} style={{ padding: '0.55rem 1.25rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⬇ JSON</button>
              <button onClick={() => exportAll('csv')} style={{ padding: '0.55rem 1.25rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⬇ CSV</button>
            </div>
          )}
        </div>

        {/* Error */}
        {status === 'error' && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: '#fca5a5', fontSize: '0.875rem' }}>
            ⚠ {error}
          </div>
        )}

        {/* Empty State */}
        {status === 'idle' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '6rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>✦</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>Ready to document</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.7 }}>
              Paste a list of KPI, Metric or Dimension names on the left. The AI will write complete definitions for every field — description, formula, GA4/Adobe events, SQL queries, business use cases, and more.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
              {['Conversion Rate', 'Sessions', 'Revenue', 'Channel', 'Bounce Rate', 'ROAS'].map(ex => (
                <span key={ex} style={{ padding: '0.35rem 0.85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ex}</span>
              ))}
            </div>
          </div>
        )}

        {/* Generating State */}
        {status === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {itemNames.map((name, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeSlide 0.2s ease both', animationDelay: `${i * 0.05}s` }}>
                <span className="spinner" />
                <span style={{ fontWeight: 600 }}>{name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Generating all fields…</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && schema.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((item, i) => {
              const activeDoc = entityType === 'kpi' ? (settings.kpiFile || './documents/kpis.csv') : entityType === 'metric' ? (settings.metricFile || './documents/metrics.csv') : (settings.dimensionFile || './documents/dimensions.csv');
              return <ResultCard key={i} item={item} schema={schema} entityType={entityType} index={i} documentPath={activeDoc} />;
            })}
          </div>
        )}
      </main>
    </div>
  );
}
