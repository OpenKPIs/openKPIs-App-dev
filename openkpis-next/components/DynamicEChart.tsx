'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

export type ChartType =
  | 'line' | 'area' | 'bar' | 'stacked-bar'
  | 'pie' | 'scatter' | 'funnel'
  | 'gauge' | 'sankey' | 'scorecard' | 'table';

interface SankeyNode { name: string }
interface SankeyLink { source: string; target: string; value: number }

interface DynamicEChartProps {
  chartType: ChartType | string;
  xAxisColumn?: string;
  yAxisColumn?: string;
  groupColumn?: string;          // for stacked-bar / multi-series
  title?: string;
  data: Record<string, unknown>[];
  // Sankey-specific optional structured override
  sankeyNodes?: SankeyNode[];
  sankeyLinks?: SankeyLink[];
  // Gauge-specific
  gaugeMin?: number;
  gaugeMax?: number;
}

/** Parse a cell value to a number, stripping currency symbols etc. */
function toNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export default function DynamicEChart({
  chartType = 'line',
  xAxisColumn,
  yAxisColumn,
  groupColumn,
  title,
  data,
  sankeyNodes,
  sankeyLinks,
  gaugeMin = 0,
  gaugeMax = 100,
}: DynamicEChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '0.875rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ddd' }}>
        No data available for this visualization.
      </div>
    );
  }

  const cols = Object.keys(data[0]);
  const xCol = xAxisColumn || cols[0];
  const yCol = yAxisColumn || cols[1] || xCol;

  const COLORS = ['#1e88e5', '#ff9800', '#f44336', '#4caf50', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

  // ─── SCORECARD ───────────────────────────────────────────────────────────
  if (chartType === 'scorecard') {
    const lastVal = toNumber(data[data.length - 1][yCol]);
    const prev    = data.length > 1 ? toNumber(data[data.length - 2][yCol]) : null;
    const delta   = prev !== null ? ((lastVal - prev) / (prev || 1)) * 100 : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '160px', gap: '0.25rem' }}>
        {title && <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>}
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>{lastVal.toLocaleString()}</div>
        {delta !== null && (
          <div style={{ fontSize: '0.8rem', color: delta >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs prev
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{yCol}</div>
      </div>
    );
  }

  // ─── DATA TABLE ──────────────────────────────────────────────────────────
  if (chartType === 'table') {
    const displayCols = [xCol, yCol, groupColumn].filter(Boolean) as string[];
    const allCols = displayCols.length > 0 ? displayCols : cols.slice(0, 6);
    return (
      <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
            <tr>
              {allCols.map(col => (
                <th key={col} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', color: '#374151' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 50).map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                {allCols.map(col => (
                  <td key={col} style={{ padding: '0.4rem 0.75rem', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 50 && <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px solid #e5e7eb' }}>Showing 50 of {data.length} rows</div>}
      </div>
    );
  }

  // ─── GAUGE ───────────────────────────────────────────────────────────────
  if (chartType === 'gauge') {
    const val = toNumber(data[data.length - 1][yCol]);
    const pct = Math.min(100, Math.max(0, ((val - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
    const option = {
      tooltip: { formatter: '{a} <br/>{b} : {c}%' },
      series: [{
        name: yCol, type: 'gauge',
        min: gaugeMin, max: gaugeMax,
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}' },
        data: [{ value: Math.round(pct), name: yCol }],
        axisLine: { lineStyle: { width: 10, color: [[0.3, '#ef4444'], [0.7, '#f59e0b'], [1, '#22c55e']] } },
      }],
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  // ─── FUNNEL ──────────────────────────────────────────────────────────────
  if (chartType === 'funnel') {
    const funnelData = data.map((row, i) => ({
      name: String(row[xCol] ?? `Stage ${i + 1}`),
      value: toNumber(row[yCol]),
    })).sort((a, b) => b.value - a.value);
    const option = {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}' },
      series: [{
        name: yCol, type: 'funnel',
        left: '10%', width: '80%', minSize: '0%', maxSize: '100%',
        sort: 'descending', gap: 2,
        label: { show: true, position: 'inside' },
        data: funnelData,
        color: COLORS,
      }],
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  // ─── SANKEY ──────────────────────────────────────────────────────────────
  if (chartType === 'sankey') {
    // Use AI-generated nodes/links if provided, otherwise auto-derive from data
    let nodes: SankeyNode[] = sankeyNodes ?? [];
    let links: SankeyLink[] = sankeyLinks ?? [];

    if (nodes.length === 0 && data.length > 0 && groupColumn) {
      // Auto-derive: xCol = source, yCol = target (or groupColumn), numeric col = value
      const numericCol = cols.find(c => typeof data[0][c] === 'number' || !isNaN(parseFloat(String(data[0][c]))));
      const nameSet = new Set<string>();
      data.forEach(row => { nameSet.add(String(row[xCol])); nameSet.add(String(row[yCol])); });
      nodes = Array.from(nameSet).map(n => ({ name: n }));
      links = data.map(row => ({
        source: String(row[xCol]),
        target: String(row[yCol]),
        value: toNumber(row[numericCol ?? yCol]),
      }));
    }

    if (nodes.length === 0) {
      return <div style={{ padding: '1.5rem', color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center' }}>Sankey requires source → target flow data. Use 3 columns: source, target, value.</div>;
    }

    const option = {
      tooltip: { trigger: 'item', triggerOn: 'mousemove' },
      series: [{
        type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' },
        data: nodes, links,
        lineStyle: { color: 'source', curveness: 0.5 },
      }],
    };
    return <ReactECharts option={option} style={{ height: '360px', width: '100%' }} notMerge lazyUpdate />;
  }

  // ─── STACKED BAR ─────────────────────────────────────────────────────────
  if (chartType === 'stacked-bar' && groupColumn) {
    const groups = [...new Set(data.map(r => String(r[groupColumn])))];
    const xVals  = [...new Set(data.map(r => String(r[xCol])))];
    const seriesArr = groups.map((grp, gi) => ({
      name: grp, type: 'bar', stack: 'total',
      itemStyle: { color: COLORS[gi % COLORS.length] },
      data: xVals.map(xv => {
        const row = data.find(r => String(r[xCol]) === xv && String(r[groupColumn]) === grp);
        return row ? toNumber(row[yCol]) : 0;
      }),
    }));
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: groups },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: xVals },
      yAxis: { type: 'value' },
      series: seriesArr,
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  // ─── STANDARD AXIS CHARTS (line, area, bar, scatter) ─────────────────────
  const xAxisData = data.map(row => row[xCol]);
  const seriesData = data.map(row => toNumber(row[yCol]));

  const echartsType = chartType === 'area' ? 'line'
    : chartType === 'bar' || chartType === 'stacked-bar' ? 'bar'
    : chartType === 'scatter' ? 'scatter'
    : 'line';

  const seriesDef: Record<string, unknown> = {
    data: seriesData,
    type: echartsType,
    smooth: true,
    itemStyle: { borderRadius: echartsType === 'bar' ? [4, 4, 0, 0] : 0, color: COLORS[0] },
    ...(chartType === 'area' ? { areaStyle: { opacity: 0.25 } } : {}),
  };

  // ─── PIE ─────────────────────────────────────────────────────────────────
  if (chartType === 'pie') {
    const pieData = data.map((row, i) => ({
      name: String(row[xCol] ?? `Item ${i + 1}`),
      value: toNumber(row[yCol]),
      itemStyle: { color: COLORS[i % COLORS.length] },
    }));
    const option = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', type: 'scroll' },
      series: [{ name: yCol, type: 'pie', radius: ['35%', '65%'], center: ['60%', '50%'], data: pieData, label: { formatter: '{b}: {d}%' } }],
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  const baseOption: Record<string, unknown> = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: xAxisData, axisLabel: { width: 80, overflow: 'truncate' } },
    yAxis: { type: 'value' },
    series: [seriesDef],
  };

  return (
    <ReactECharts
      option={baseOption}
      style={{ height: '300px', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
