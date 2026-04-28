'use client';

import React, { useState, useEffect } from 'react';
import { useAI, Provider } from '@/lib/contexts/AIContext';

const DEFAULT_PROVIDER_MODELS: Record<Provider, { id: string; label: string }[]> = {
  openai: [
    { id: 'gpt-5.4',          label: 'GPT-5.4 ★ (Mar 2026 — latest)' },
    { id: 'gpt-5.4-mini',     label: 'GPT-5.4 mini (fast & cost-efficient)' },
    { id: 'gpt-5.3',          label: 'GPT-5.3 "Garlic"' },
    { id: 'o3',               label: 'o3 (reasoning — best)' },
    { id: 'o3-pro',           label: 'o3-pro (reasoning — max)' },
    { id: 'o4-mini',          label: 'o4-mini (reasoning — fast)' },
    { id: 'gpt-4.1',          label: 'GPT-4.1' },
    { id: 'gpt-4o',           label: 'GPT-4o (legacy)' },
  ],
  anthropic: [
    { id: 'claude-opus-4-6',   label: 'Claude Opus 4.6 ★ (Feb 2026 — latest)' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Feb 2026)' },
    { id: 'claude-haiku-4-5',  label: 'Claude Haiku 4.5' },
    { id: 'claude-3-7-sonnet-latest', label: 'Claude 3.7 Sonnet (legacy)' },
  ],
  google: [
    { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview ★ (Mar 2026)' },
    { id: 'gemini-3-flash',         label: 'Gemini 3 Flash (preview)' },
    { id: 'gemini-2.5-pro',         label: 'Gemini 2.5 Pro (stable)' },
    { id: 'gemini-2.5-flash',       label: 'Gemini 2.5 Flash (stable)' },
  ]
};

const KEY_PLACEHOLDERS: Record<Provider, string> = {
  openai:    'sk-...',
  anthropic: 'sk-ant-...',
  google:    'AIza...',
};

const KEY_LINKS: Record<Provider, { label: string; url: string }> = {
  openai:    { label: 'Get key →', url: 'https://platform.openai.com/api-keys' },
  anthropic: { label: 'Get key →', url: 'https://console.anthropic.com/settings/keys' },
  google:    { label: 'Get key →', url: 'https://aistudio.google.com/app/apikey' },
};

export default function AISettingsModal() {
  const { settings, updateSettings, isSettingsOpen, setSettingsOpen } = useAI();
  const [tab, setTab] = useState<'model' | 'keys'>('model');
  const [dynamicModels, setDynamicModels] = useState<{id: string, label: string}[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Derive active key safely
  const activeKey =
    settings.provider === 'openai' ? settings.openaiKey :
    settings.provider === 'anthropic' ? settings.anthropicKey :
    settings.provider === 'google' ? settings.googleKey : '';

  useEffect(() => {
    let isMounted = true;
    setIsLoadingModels(true);
    fetch(`/api/models?provider=${settings.provider}`, {
      headers: { 'Authorization': `Bearer ${activeKey}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.models && data.models.length > 0) {
          setDynamicModels(data.models);
          // If current model isn't in list, select first available
          if (!data.models.find((m: { id: string; label: string }) => m.id === settings.model)) {
            updateSettings({ model: data.models[0].id, customModel: '' });
          }
        } else {
          setDynamicModels(DEFAULT_PROVIDER_MODELS[settings.provider] || []);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failed to fetch models:', err);
        setDynamicModels(DEFAULT_PROVIDER_MODELS[settings.provider] || []);
      })
      .finally(() => {
        if (isMounted) setIsLoadingModels(false);
      });

    return () => { isMounted = false; };
  }, [settings.provider, activeKey, updateSettings, settings.model]);

  if (!isSettingsOpen) return null;

  const activeModelId = settings.customModel.trim() || settings.model;

  const tabBtn = (t: 'model' | 'keys', label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        flex: 1, padding: '0.55rem',
        background: tab === t ? 'var(--primary, #3b82f6)' : 'transparent',
        border: 'none', borderRadius: 8,
        color: tab === t ? '#fff' : 'var(--text-muted, #9ca3af)',
        fontWeight: tab === t ? 700 : 400,
        fontSize: '0.85rem', cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );

  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' };
  const sel: React.CSSProperties = { padding: '0.6rem 0.75rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border, #374151)', background: 'var(--surface, #1f2937)', color: 'var(--text, #f3f4f6)' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', borderRadius: '12px', padding: '2rem', width: '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text, #f3f4f6)', margin: 0 }}>⚙️ AI Settings (BYOK)</h2>
          <p style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Keys are stored securely in your browser&apos;s local storage and never touch our servers.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2, #111827)', borderRadius: 10, padding: 4 }}>
          {tabBtn('model', '🤖 Model')}
          {tabBtn('keys', '🔑 API Keys')}
        </div>

        {tab === 'model' && (<>
          <div>
            <label style={lbl}>Provider</label>
            <select
              value={settings.provider}
              onChange={e => {
                const p = e.target.value as Provider;
                updateSettings({ provider: p, customModel: '' });
              }}
              style={sel}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="google">Google (Gemini)</option>
            </select>
          </div>

          <div>
            <label style={lbl}>Model {isLoadingModels && <span style={{fontSize:'0.65rem', fontWeight:400, color:'#fbbf24', marginLeft:'4px'}}>(Fetching latest...)</span>}</label>
            <select 
              value={settings.model} 
              onChange={e => updateSettings({ model: e.target.value, customModel: '' })} 
              style={sel}
              disabled={isLoadingModels}
            >
              {dynamicModels.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Custom model ID <span style={{ fontWeight: 400, opacity: 0.6 }}>(overrides dropdown)</span></label>
            <input
              value={settings.customModel}
              onChange={e => updateSettings({ customModel: e.target.value })}
              placeholder={`optional — leave blank to use ${settings.model}`}
              style={{ ...sel, fontFamily: 'monospace', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ padding: '0.6rem 0.85rem', background: 'var(--surface2, #111827)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted, #9ca3af)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#a5b4fc' }}>✦</span>
            Will use: <strong style={{ color: 'var(--text, #f3f4f6)' }}>{activeModelId || '(no model)'}</strong>
            {activeKey ? <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.7rem' }}>✓ key set</span> : <span style={{ marginLeft: 'auto', color: '#fbbf24', fontSize: '0.7rem' }}>⚠ no key</span>}
          </div>
        </>)}

        {tab === 'keys' && (<>
          {([
            { provider: 'openai'    as Provider, field: 'openaiKey'    as const, label: 'OpenAI API Key' },
            { provider: 'anthropic' as Provider, field: 'anthropicKey' as const, label: 'Anthropic API Key' },
            { provider: 'google'    as Provider, field: 'googleKey'    as const, label: 'Google Gemini API Key' },
          ] as const).map(({ provider, field, label }) => {
            const link = KEY_LINKS[provider];
            return (
              <div key={field} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>{label}</label>
                  {link && <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--primary, #3b82f6)', textDecoration: 'underline' }}>{link.label}</a>}
                </div>
                <input
                  type="password"
                  value={settings[field] as string}
                  onChange={e => updateSettings({ [field]: e.target.value })}
                  placeholder={KEY_PLACEHOLDERS[provider]}
                  style={{ ...sel, borderColor: settings[field] ? '#4ade80' : 'var(--border, #374151)' }}
                />
              </div>
            );
          })}
        </>)}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            onClick={() => setSettingsOpen(false)}
            style={{ padding: '0.55rem 1.5rem', background: 'var(--primary, #3b82f6)', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
