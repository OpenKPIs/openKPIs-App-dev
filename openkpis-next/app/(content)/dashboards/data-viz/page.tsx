'use client';

import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import DynamicEChart from '@/components/DynamicEChart';

interface ParsedDataset {
  fileName: string;
  rows: Record<string, unknown>[];
  columns: string[];
}

interface ChartConfig {
  cols: string[];          // [x] | [x, y] | [x, y, group]
  chartType: string;
  title: string;
}

const CHART_TYPES_BY_COUNT: Record<number, { value: string; label: string }[]> = {
  1: [{ value: 'scorecard', label: '🎯 Scorecard' }],
  2: [
    { value: 'line',    label: '📈 Line' },
    { value: 'bar',     label: '📊 Bar' },
    { value: 'pie',     label: '🥧 Pie' },
    { value: 'scatter', label: '🔵 Scatter' },
  ],
  3: [
    { value: 'bar',     label: '📊 Grouped Bar' },
    { value: 'line',    label: '📈 Multi-Line' },
  ],
};

function defaultChartType(count: number): string {
  const options = CHART_TYPES_BY_COUNT[count] ?? CHART_TYPES_BY_COUNT[2];
  return options[0].value;
}

export default function DataVizPage() {
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column selection – ordered (order matters: 1st = X, 2nd = Y, 3rd = group)
  const [selected, setSelected] = useState<string[]>([]);
  const [chartType, setChartType] = useState<string>('line');
  const [chartTitle, setChartTitle] = useState<string>('');
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File exceeds the 5MB limit.'); return; }
    setError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result as string;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
        if (rows.length === 0) throw new Error('The file appears empty.');
        setDataset({ fileName: file.name, rows, columns: Object.keys(rows[0]) });
        setSelected([]);
        setCharts([]);
        setChartTitle('');
        setChartType('line');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleColumn = (col: string) => {
    setSelected(prev => {
      if (prev.includes(col)) {
        const next = prev.filter(c => c !== col);
        setChartType(defaultChartType(Math.max(next.length, 1)));
        return next;
      }
      if (prev.length >= 3) return prev; // max 3
      const next = [...prev, col];
      setChartType(defaultChartType(next.length));
      return next;
    });
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setSelected(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };

  const availableChartTypes = useMemo(() => CHART_TYPES_BY_COUNT[selected.length] ?? [], [selected.length]);

  const xCol = selected[0] ?? '';
  const yCol = selected[1] ?? '';

  const autoTitle = xCol && yCol ? `${yCol} by ${xCol}` : xCol ? xCol : '';

  const addChart = () => {
    if (selected.length < 1) return;
    setCharts(prev => [...prev, { cols: selected, chartType, title: chartTitle || autoTitle }]);
    setChartTitle('');
  };

  const removeChart = (idx: number) => setCharts(prev => prev.filter((_, i) => i !== idx));

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data Viz</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', lineHeight: 1.6, margin: 0 }}>
          Upload your data, select 1–3 columns from the panel, pick a chart type, and build your visualization canvas.
        </p>
      </div>

      {/* Upload Zone */}
      {!dataset ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{ border: '2px dashed var(--ifm-color-primary)', borderRadius: '16px', padding: '3rem', textAlign: 'center', background: 'rgba(30,136,229,0.03)', cursor: 'pointer', marginBottom: '2rem' }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📂</div>
          <p style={{ fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            {uploading ? 'Parsing…' : 'Click to upload or drag & drop'}
          </p>
          <p style={{ color: 'var(--ifm-color-emphasis-500)', fontSize: '0.875rem', margin: 0 }}>CSV or Excel (.xlsx) up to 5MB</p>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.875rem 1.25rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px' }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#15803d' }}>{dataset.fileName}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>{dataset.rows.length} rows · {dataset.columns.length} columns</p>
          </div>
          <button onClick={() => { setDataset(null); setSelected([]); setCharts([]); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', border: '1px solid #86efac', borderRadius: '6px', background: 'white', color: '#15803d', cursor: 'pointer' }}>
            Change file
          </button>
        </div>
      )}

      {error && <div style={{ padding: '1rem', background: '#fff1f1', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

      {dataset && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start', marginBottom: '2.5rem' }}>

          {/* ─── COLUMN PANEL ─── */}
          <div style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '14px', overflow: 'hidden', background: '#fff', position: 'sticky', top: '80px' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--ifm-color-emphasis-100)', background: 'var(--ifm-color-emphasis-50)' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ifm-color-emphasis-700)' }}>Columns</p>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)' }}>Click to select up to 3</p>
            </div>
            <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '420px', overflowY: 'auto' }}>
              {dataset.columns.map(col => {
                const idx = selected.indexOf(col);
                const isSelected = idx !== -1;
                const badge = idx === 0 ? 'X' : idx === 1 ? 'Y' : idx === 2 ? 'Z' : null;
                return (
                  <button
                    key={col}
                    onClick={() => toggleColumn(col)}
                    disabled={!isSelected && selected.length >= 3}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
                      background: isSelected ? 'rgba(30,136,229,0.07)' : 'var(--ifm-color-emphasis-50)',
                      cursor: (!isSelected && selected.length >= 3) ? 'not-allowed' : 'pointer',
                      opacity: (!isSelected && selected.length >= 3) ? 0.4 : 1,
                      fontSize: '0.8125rem', fontFamily: 'monospace',
                      textAlign: 'left', width: '100%',
                      transition: 'all 0.15s',
                    }}
                  >
                    {badge && (
                      <span style={{ minWidth: '20px', height: '20px', borderRadius: '50%', background: 'var(--ifm-color-primary)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
                        {badge}
                      </span>
                    )}
                    {!badge && <span style={{ minWidth: '20px', height: '20px', borderRadius: '50%', border: '2px solid #d1d5db', display: 'inline-block' }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Order Display */}
            {selected.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--ifm-color-emphasis-100)', background: 'var(--ifm-color-emphasis-50)' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase' }}>Selected ({selected.length}/3)</p>
                {selected.map((col, i) => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--ifm-color-primary)', minWidth: '14px' }}>{['X', 'Y', 'Z'][i]}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{col}</span>
                    <button onClick={() => moveUp(i)} disabled={i === 0} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', border: 'none', background: 'none', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1 }}>▲</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── BUILDER CANVAS ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {selected.length === 0 ? (
              <div style={{ border: '2px dashed var(--ifm-color-emphasis-200)', borderRadius: '14px', padding: '4rem 2rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-500)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>👈</div>
                <p style={{ margin: 0, fontWeight: 500 }}>Select columns from the panel to get started</p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.825rem' }}>Pick 1 column for a scorecard, 2 for charts, 3 for grouped views</p>
              </div>
            ) : (
              <>
                {/* Hint banner */}
                <div style={{ padding: '0.6rem 1rem', background: 'rgba(30,136,229,0.06)', border: '1px solid rgba(30,136,229,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--ifm-color-primary)' }}>
                  {selected.length === 1 && '🎯 1 column selected — scorecard view'}
                  {selected.length === 2 && `📊 2 columns — X: ${selected[0]} · Y: ${selected[1]}`}
                  {selected.length === 3 && `📊 3 columns — X: ${selected[0]} · Y: ${selected[1]} · Group: ${selected[2]}`}
                </div>

                {/* Chart type selector */}
                {availableChartTypes.length > 1 && (
                  <div>
                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}>Chart Type</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {availableChartTypes.map(t => (
                        <button key={t.value} onClick={() => setChartType(t.value)}
                          style={{ padding: '0.45rem 0.9rem', border: `2px solid ${chartType === t.value ? 'var(--ifm-color-primary)' : '#e5e7eb'}`, borderRadius: '8px', background: chartType === t.value ? 'rgba(30,136,229,0.08)' : '#fff', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: chartType === t.value ? 700 : 400, color: chartType === t.value ? 'var(--ifm-color-primary)' : 'inherit', transition: 'all 0.15s' }}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Title <span style={{ fontWeight: 400, color: 'var(--ifm-color-emphasis-500)' }}>(optional)</span></label>
                  <input type="text" placeholder={autoTitle || 'Chart title…'}
                    value={chartTitle} onChange={e => setChartTitle(e.target.value)}
                    style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' }} />
                </div>

                {/* Live preview */}
                <div style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '12px', padding: '1.25rem', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-600)' }}>
                      Live Preview — {chartTitle || autoTitle}
                    </span>
                    <button onClick={addChart}
                      style={{ padding: '0.5rem 1.5rem', background: 'var(--ifm-color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
                      Add to Canvas ↓
                    </button>
                  </div>
                  <DynamicEChart chartType={chartType} xAxisColumn={xCol} yAxisColumn={yCol} title={chartTitle || autoTitle} data={dataset.rows} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── CANVAS OUTPUT GRID ─── */}
      {charts.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingTop: '1rem', borderTop: '2px solid var(--ifm-color-emphasis-100)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>My Canvas ({charts.length} chart{charts.length > 1 ? 's' : ''})</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
            {charts.map((chart, idx) => (
              <div key={idx} style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '12px', padding: '1.25rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600 }}>{chart.title}</span>
                  <button onClick={() => removeChart(idx)}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fff1f1', color: '#b91c1c', cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
                <DynamicEChart chartType={chart.chartType} xAxisColumn={chart.cols[0]} yAxisColumn={chart.cols[1] ?? chart.cols[0]} title={chart.title} data={dataset!.rows} />
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-400)' }}>
                  {chart.chartType} · {chart.cols.join(' → ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
