'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthClientProvider';
import DynamicEChart from '@/components/DynamicEChart';
import type { NormalizedDashboard } from '@/lib/server/dashboards';
import { mockDatasets } from '@/app/ai-analyst/data/mockDatasets';
import { ResponsiveGridLayout as _ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ResponsiveGridLayout = _ResponsiveGridLayout as any;

/* ─── Types ────────────────────────────────────────────────────── */
type ItemType = 'kpi' | 'metric' | 'dimension';
type Granularity = 'day' | 'week' | 'month';

interface PaletteItem {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  itemType: ItemType;
}

interface CanvasTile {
  id: string;
  itemName: string;
  itemType: ItemType;
  chartType: string;
  xAxisColumn: string;
  yAxisColumn: string;
  groupColumn?: string;
  granularity: Granularity;
  gaugeMin?: number;
  gaugeMax?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface CanvasSection {
  id: string;
  title: string;
  tiles: CanvasTile[];
}

const CHART_TYPES = [
  { value: 'line',        label: '📈 Line' },
  { value: 'area',        label: '🌊 Area' },
  { value: 'bar',         label: '📊 Bar' },
  { value: 'stacked-bar', label: '📚 Stacked Bar' },
  { value: 'pie',         label: '🥧 Pie' },
  { value: 'scatter',     label: '🔵 Scatter' },
  { value: 'funnel',      label: '🔽 Funnel' },
  { value: 'gauge',       label: '🎯 Gauge' },
  { value: 'scorecard',   label: '🏆 Scorecard' },
  { value: 'table',       label: '📋 Table' },
  { value: 'sankey',      label: '〰️ Sankey' },
];

const ACTIVE_DATA = Array.isArray(mockDatasets) && mockDatasets.length > 0 
  ? mockDatasets[0].data 
  : [];
const DATA_COLS = ACTIVE_DATA.length > 0 ? Object.keys(ACTIVE_DATA[0]) : ['date', 'sessions', 'users', 'revenue'];
function uid() { return Math.random().toString(36).slice(2, 9); }

function defaultTile(item: PaletteItem): CanvasTile {
  const isKpi = item.itemType === 'kpi';
  const isDim = item.itemType === 'dimension';
  const xCol = DATA_COLS.find(c => /date|week|month|day|time/i.test(c)) ?? DATA_COLS[0];
  const yCol = DATA_COLS.find(c => c !== xCol) ?? DATA_COLS[1] ?? DATA_COLS[0];
  return {
    id: uid(),
    itemName: item.name,
    itemType: item.itemType,
    chartType: isKpi ? 'scorecard' : isDim ? 'bar' : 'line',
    xAxisColumn: xCol,
    yAxisColumn: yCol,
    granularity: 'day',
    w: isKpi ? 3 : 6,
    h: isKpi ? 1 : 3,
    x: 0,
    y: Infinity,
  };
}

/* ─── Sub-components ───────────────────────────────────────────── */
const BADGE_COLORS: Record<ItemType, { bg: string; color: string }> = {
  kpi:       { bg: '#dbeafe', color: '#1e40af' },
  metric:    { bg: '#dcfce7', color: '#166534' },
  dimension: { bg: '#fef3c7', color: '#92400e' },
};

function TypeBadge({ type }: { type: ItemType }) {
  const s = BADGE_COLORS[type];
  return (
    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.15rem 0.4rem', borderRadius: '4px', background: s.bg, color: s.color }}>
      {type}
    </span>
  );
}

function TileConfigPopover({ tile, cols, onUpdate, onRemove, onClose }: {
  tile: CanvasTile;
  cols: string[];
  onUpdate: (patch: Partial<CanvasTile>) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const isTimeSeries = tile.chartType === 'line' || tile.chartType === 'area';

  return (
    <div ref={ref} style={{ position: 'absolute', top: '2.5rem', right: 0, zIndex: 100, background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: '1.25rem', width: '280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Configure Chart</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', color: '#6b7280' }}>✕</button>
      </div>

      {/* Chart Type */}
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>CHART TYPE</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '1rem' }}>
        {CHART_TYPES.map(ct => (
          <button key={ct.value} onClick={() => onUpdate({ chartType: ct.value })}
            style={{ padding: '0.35rem 0.5rem', border: `1.5px solid ${tile.chartType === ct.value ? '#2563eb' : '#e5e7eb'}`, borderRadius: '6px', background: tile.chartType === ct.value ? '#eff6ff' : '#fff', color: tile.chartType === ct.value ? '#1d4ed8' : '#374151', cursor: 'pointer', fontSize: '0.72rem', fontWeight: tile.chartType === ct.value ? 700 : 400, transition: 'all 0.12s', textAlign: 'left' }}>
            {ct.label}
          </button>
        ))}
      </div>

      {/* X Axis */}
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>X AXIS {isTimeSeries && <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>(use date/time column)</span>}</label>
      <select value={tile.xAxisColumn} onChange={e => onUpdate({ xAxisColumn: e.target.value })}
        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
        {cols.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Y Axis */}
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>Y AXIS (numeric)</label>
      <select value={tile.yAxisColumn} onChange={e => onUpdate({ yAxisColumn: e.target.value })}
        style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
        {cols.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Time Granularity — Line/Area only */}
      {isTimeSeries && (
        <>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.4rem' }}>GRANULARITY</label>
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
            {(['day', 'week', 'month'] as Granularity[]).map(g => (
              <button key={g} onClick={() => onUpdate({ granularity: g })}
                style={{ flex: 1, padding: '0.3rem 0', border: `1.5px solid ${tile.granularity === g ? '#2563eb' : '#e5e7eb'}`, borderRadius: '6px', background: tile.granularity === g ? '#eff6ff' : '#fff', color: tile.granularity === g ? '#1d4ed8' : '#374151', cursor: 'pointer', fontSize: '0.73rem', fontWeight: tile.granularity === g ? 700 : 400, textTransform: 'capitalize' }}>
                {g}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Remove */}
      <button onClick={onRemove}
        style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #fca5a5', borderRadius: '6px', background: '#fff1f1', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>
        🗑 Remove tile
      </button>
    </div>
  );
}

function CanvasTileCard({ tile, cols, onUpdate, onRemove, onDragStart }: {
  tile: CanvasTile;
  cols: string[];
  onUpdate: (patch: Partial<CanvasTile>) => void;
  onRemove: () => void;
  onDragStart: () => void;
}) {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{ 
        position: 'relative', 
        border: '1px solid rgba(229, 231, 235, 0.5)', 
        borderRadius: '16px', 
        background: '#ffffff', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)', 
        overflow: 'hidden', 
        cursor: 'grab',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.25rem 0.5rem', borderBottom: '1px solid rgba(243, 244, 246, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
          <TypeBadge type={tile.itemType} />
          <span style={{ fontWeight: 650, fontSize: '0.95rem', color: '#0f172a', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.itemName}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.65rem', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.2rem 0.5rem', color: '#475569', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{tile.chartType}</span>
          <button onClick={() => setShowConfig(v => !v)}
            style={{ width: '28px', height: '28px', border: '1px solid transparent', borderRadius: '8px', background: showConfig ? '#e0e7ff' : 'transparent', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: showConfig ? '#4338ca' : '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.background = showConfig ? '#e0e7ff' : '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = showConfig ? '#e0e7ff' : 'transparent'}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '0.75rem 1rem 1rem' }}>
        <DynamicEChart
          chartType={tile.chartType}
          xAxisColumn={tile.xAxisColumn}
          yAxisColumn={tile.yAxisColumn}
          groupColumn={tile.groupColumn}
          title={tile.itemName}
          data={ACTIVE_DATA}
        />
      </div>

      {/* Config Popover */}
      {showConfig && (
        <TileConfigPopover
          tile={tile}
          cols={cols}
          onUpdate={patch => onUpdate(patch)}
          onRemove={() => { onRemove(); setShowConfig(false); }}
          onClose={() => setShowConfig(false)}
        />
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────── */
interface Props {
  dashboard: NormalizedDashboard;
  slug: string;
}

export default function DashboardCanvasEditor({ dashboard, slug }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* Palette */
  const [palette, setPalette] = useState<{ kpis: PaletteItem[]; metrics: PaletteItem[]; dimensions: PaletteItem[] } | null>(null);
  const [paletteTab, setPaletteTab] = useState<ItemType>('kpi');
  const [search, setSearch] = useState('');
  const [loadingPalette, setLoadingPalette] = useState(true);

  /* Canvas */
  const [sections, setSections] = useState<CanvasSection[]>(() => {
    const existing = dashboard.layout_json ?? [];
    if (existing.length === 0) return [{ id: uid(), title: 'Overview', tiles: [] }];
    // Reconstruct sections from flat layout_json
    const sectionMap: Record<string, CanvasSection> = {};
    const order: string[] = [];
    for (const raw of existing) {
      const t = raw as Record<string, unknown>;
      const sTitle = (t.section_title as string) || 'Overview';
      if (!sectionMap[sTitle]) { sectionMap[sTitle] = { id: uid(), title: sTitle, tiles: [] }; order.push(sTitle); }
      sectionMap[sTitle].tiles.push({
        id: uid(),
        itemName: (t.metric as string) || 'Untitled',
        itemType: (t.itemType as ItemType) || 'metric',
        chartType: (t.chart as string) || 'line',
        xAxisColumn: (t.xAxisColumn as string) || DATA_COLS[0],
        yAxisColumn: (t.yAxisColumn as string) || (DATA_COLS[1] ?? DATA_COLS[0]),
        groupColumn: t.groupColumn as string | undefined,
        granularity: (t.granularity as Granularity) || 'day',
        gaugeMin: t.gaugeMin as number | undefined,
        gaugeMax: t.gaugeMax as number | undefined,
        x: t.x as number | undefined,
        y: t.y as number | undefined,
        w: t.w as number | undefined,
        h: t.h as number | undefined,
      });
    }
    return order.map(t => sectionMap[t]);
  });

  /* Save state */
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  /* DnD */
  const dragPaletteItem = useRef<PaletteItem | null>(null);
  const dragTileRef = useRef<{ sectionId: string; tileId: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null); // sectionId

  useEffect(() => {
    fetch('/api/items/palette')
      .then(r => r.json())
      .then((d: { kpis: PaletteItem[]; metrics: PaletteItem[]; dimensions: PaletteItem[] }) => {
        setPalette({
          kpis: d.kpis.map(x => ({ ...x, itemType: 'kpi' as ItemType })),
          metrics: d.metrics.map(x => ({ ...x, itemType: 'metric' as ItemType })),
          dimensions: d.dimensions.map(x => ({ ...x, itemType: 'dimension' as ItemType })),
        });
        setLoadingPalette(false);
      })
      .catch(() => setLoadingPalette(false));
  }, []);

  const filteredPalette = (() => {
    if (!palette) return [];
    const list = paletteTab === 'kpi' ? palette.kpis : paletteTab === 'metric' ? palette.metrics : palette.dimensions;
    if (!search.trim()) return list;
    return list.filter(x => x.name.toLowerCase().includes(search.toLowerCase()));
  })();

  const addSection = () => setSections(s => [...s, { id: uid(), title: `Section ${s.length + 1}`, tiles: [] }]);

  const updateSection = (sectionId: string, patch: Partial<CanvasSection>) =>
    setSections(s => s.map(sec => sec.id === sectionId ? { ...sec, ...patch } : sec));

  const removeSection = (sectionId: string) => setSections(s => s.filter(sec => sec.id !== sectionId));

  const addTile = useCallback((sectionId: string, item: PaletteItem) => {
    setSections(s => s.map(sec => sec.id === sectionId ? { ...sec, tiles: [...sec.tiles, defaultTile(item)] } : sec));
  }, []);

  const updateTile = (sectionId: string, tileId: string, patch: Partial<CanvasTile>) =>
    setSections(s => s.map(sec => sec.id === sectionId ? {
      ...sec,
      tiles: sec.tiles.map(t => t.id === tileId ? { ...t, ...patch } : t)
    } : sec));

  const removeTile = (sectionId: string, tileId: string) =>
    setSections(s => s.map(sec => sec.id === sectionId ? { ...sec, tiles: sec.tiles.filter(t => t.id !== tileId) } : sec));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (sectionId: string, layout: any[]) => {
    setSections(s => s.map(sec => {
      if (sec.id !== sectionId) return sec;
      const tMap = new Map(layout.map(l => [l.i, l]));
      return { ...sec, tiles: sec.tiles.map(t => {
        const lo = tMap.get(t.id);
        return lo ? { ...t, x: lo.x, y: lo.y, w: lo.w, h: lo.h } : t;
      })};
    }));
  };

  const handleDropOnSection = (sectionId: string) => {
    if (dragPaletteItem.current) { addTile(sectionId, dragPaletteItem.current); }
    dragPaletteItem.current = null;
    setDropTarget(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSavedMsg('');
    // Flatten sections back to layout_json
    const layout_json = sections.flatMap(sec =>
      sec.tiles.map(tile => ({
        section_title: sec.title,
        metric: tile.itemName,
        itemType: tile.itemType,
        chart: tile.chartType,
        xAxisColumn: tile.xAxisColumn,
        yAxisColumn: tile.yAxisColumn,
        groupColumn: tile.groupColumn,
        granularity: tile.granularity,
        gaugeMin: tile.gaugeMin,
        gaugeMax: tile.gaugeMax,
        x: tile.x,
        y: tile.y,
        w: tile.w,
        h: tile.h,
      }))
    );
    try {
      const res = await fetch(`/api/items/dashboard/${dashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { layout_json } }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedMsg('Saved!');
      setTimeout(() => router.push(`/dashboards/${slug}`), 800);
    } catch {
      setSavedMsg('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Render ─── */
  return (
    <div style={{ display: 'grid', gridTemplateColumns: sidebarOpen ? '260px 1fr' : '0px 1fr', gridTemplateRows: 'auto 1fr', minHeight: 'calc(100vh - 60px)', background: '#f8fafc', transition: 'grid-template-columns 0.3s ease' }}>

      {/* ─── Top Bar ─── */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', background: '#fff', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#6b7280', padding: '0 0.5rem' }}>
          {sidebarOpen ? '◀' : '▶'}
        </button>
        <Link href={`/dashboards/${slug}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          ← Cancel
        </Link>
        <span style={{ color: '#d1d5db' }}>|</span>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Editing: {dashboard.name}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#22c55e', fontWeight: 600, opacity: savedMsg ? 1 : 0, transition: 'opacity 0.3s' }}>{savedMsg}</span>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '0.5rem 1.5rem', background: saving ? '#9ca3af' : '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {saving ? 'Saving…' : '💾 Save Layout'}
        </button>
      </div>

      {/* ─── Left Panel ─── */}
      <div style={{ background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: sidebarOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0.75rem 0' }}>
          {(['kpi', 'metric', 'dimension'] as ItemType[]).map(tab => (
            <button key={tab} onClick={() => setPaletteTab(tab)}
              style={{ flex: 1, padding: '0.5rem 0.25rem', border: 'none', borderBottom: `2.5px solid ${paletteTab === tab ? '#2563eb' : 'transparent'}`, background: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: paletteTab === tab ? 700 : 400, color: paletteTab === tab ? '#2563eb' : '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
              {tab === 'kpi' ? 'KPIs' : tab === 'metric' ? 'Metrics' : 'Dimensions'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: '0.75rem' }}>
          <input type="text" placeholder={`Search ${paletteTab}s…`} value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.8rem', color: '#374151', boxSizing: 'border-box' }} />
        </div>

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {loadingPalette ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>Loading…</div>
          ) : filteredPalette.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>No {paletteTab}s found</div>
          ) : filteredPalette.map(item => (
            <div
              key={item.id}
              draggable
              onDragStart={() => { dragPaletteItem.current = item; }}
              onDragEnd={() => { dragPaletteItem.current = null; }}
              onClick={() => { if (sections.length === 1) addTile(sections[0].id, item); else setSections(s => s.map((sec, i) => i === 0 ? { ...sec, tiles: [...sec.tiles, defaultTile(item)] } : sec)); }}
              style={{ padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', cursor: 'grab', userSelect: 'none', transition: 'all 0.12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <TypeBadge type={item.itemType} />
                <span style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              {item.category && <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{item.category}</div>}
            </div>
          ))}
        </div>

        {/* Tip */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid #f3f4f6', fontSize: '0.68rem', color: '#9ca3af', lineHeight: 1.4 }}>
          💡 Drag items onto a section or click to add to the first section
        </div>
      </div>

      {/* ─── Canvas ─── */}
      <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {sections.map(section => (
          <div key={section.id}
            onDragOver={e => { e.preventDefault(); setDropTarget(section.id); }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={() => handleDropOnSection(section.id)}
            style={{ border: `2px dashed ${dropTarget === section.id ? '#2563eb' : '#e5e7eb'}`, borderRadius: '16px', background: dropTarget === section.id ? 'rgba(37,99,235,0.03)' : '#fff', transition: 'all 0.15s', overflow: 'hidden' }}
          >
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              <input
                value={section.title}
                onChange={e => updateSection(section.id, { title: e.target.value })}
                style={{ flex: 1, border: 'none', background: 'none', fontWeight: 700, fontSize: '1rem', color: '#111', outline: 'none', cursor: 'text' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{section.tiles.length} tile{section.tiles.length !== 1 ? 's' : ''}</span>
              <button onClick={() => removeSection(section.id)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                Remove section
              </button>
            </div>

            {/* Tiles Grid with React Grid Layout */}
            <div style={{ padding: '0.5rem' }}>
              <ResponsiveGridLayout
                className="layout"
                rowHeight={120}
                margin={[16, 16]}
                isDraggable={true}
                isResizable={true}
                resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onLayoutChange={(layout: any[]) => handleLayoutChange(section.id, layout)}
              >
                {section.tiles.map(tile => (
                  <div key={tile.id} data-grid={{ x: tile.x ?? 0, y: tile.y ?? Infinity, w: tile.w ?? (tile.itemType === 'kpi' ? 4 : 8), h: tile.h ?? (tile.itemType === 'kpi' ? 1.5 : 3) }}>
                    <div style={{ height: '100%', width: '100%', display: 'flex' }}>
                       <CanvasTileCard
                         tile={tile}
                         cols={DATA_COLS}
                         onUpdate={patch => updateTile(section.id, tile.id, patch)}
                         onRemove={() => removeTile(section.id, tile.id)}
                         onDragStart={() => { dragTileRef.current = { sectionId: section.id, tileId: tile.id }; }}
                       />
                    </div>
                  </div>
                ))}
              </ResponsiveGridLayout>

              {/* Drop Zone Hint if Empty */}
              {section.tiles.length === 0 && (
                <div style={{ margin: '1rem', border: '2px dashed #d1d5db', borderRadius: '12px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⊕</div>
                  Click on an item from the Palette to add it here
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Section Button */}
        <button onClick={addSection}
          style={{ padding: '0.875rem', border: '2px dashed #d1d5db', borderRadius: '12px', background: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; }}>
          + Add Section
        </button>
      </div>
    </div>
  );
}
