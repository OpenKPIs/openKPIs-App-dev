'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

export type ChartType =
  | 'line' | 'area' | 'bar' | 'stacked-bar'
  | 'pie' | 'scatter' | 'funnel'
  | 'gauge' | 'sankey' | 'scorecard' | 'table';

export interface SankeyNode { name: string }
export interface SankeyLink { source: string; target: string; value: number }

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
  suggestedMockValues?: string[];
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

/** Returns true if the column name or its values look like dates/time */
function isDateLike(colName: string, data: Record<string, unknown>[]): boolean {
  if (/date|week|month|day|time|period|quarter|year/i.test(colName)) return true;
  if (data.length === 0) return false;
  const sample = String(data[0][colName] ?? '');
  return /^\d{4}[-/]\d{1,2}/.test(sample) || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(sample);
}

/** Format a date string for clean axis label display */
function formatDateLabel(val: unknown): string {
  const str = String(val ?? '');
  if (!str) return str;
  // Try to parse as date
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  suggestedMockValues,
}: DynamicEChartProps) {
  const cols = data && data.length > 0 ? Object.keys(data[0]) : [];
  
  // Robust fallback: gracefully handle AI schema hallucinations or cached old schemas
  const safeXCol = xAxisColumn && cols.includes(xAxisColumn) ? xAxisColumn : cols[0] || '';
  const safeYCol = yAxisColumn && cols.includes(yAxisColumn) ? yAxisColumn : cols.find(c => data && data.length > 0 && typeof data[0][c] === 'number') || cols[1] || safeXCol || '';
  const safeGroupColumn = groupColumn && cols.includes(groupColumn) ? groupColumn : undefined;
  
  const xCol = safeXCol;
  const yCol = safeYCol;
  const activeGroupColumn = safeGroupColumn;

  // Enhance generic strings with AI-suggested semantic values (e.g. Products, Segments)
  const chartData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (!suggestedMockValues || suggestedMockValues.length === 0) return data;
    
    // Check if the primary categorical x-axis or group axis is a generic string
    const xIsGenericString = xCol && String(xCol).includes('string');
    const groupIsGenericString = activeGroupColumn && String(activeGroupColumn).includes('string');
    
    if (!xIsGenericString && !groupIsGenericString) return data;
    
    return data.map((row, i) => {
      const newRow = { ...row };
      if (xIsGenericString) {
         newRow[xCol] = suggestedMockValues[i % suggestedMockValues.length];
      }
      if (groupIsGenericString) {
         newRow[activeGroupColumn] = suggestedMockValues[(i + 1) % suggestedMockValues.length];
      }
      return newRow;
    });
  }, [data, suggestedMockValues, xCol, activeGroupColumn]);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '0.875rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ddd' }}>
        No data available for this visualization.
      </div>
    );
  }

  const COLORS = ['#1e88e5', '#ff9800', '#f44336', '#4caf50', '#9c27b0', '#00bcd4', '#ff5722', '#607d8b'];

  // ─── FORMATTING HELPERS ──────────────────────────────────────────────────
  const isCurrency = yCol.includes('currency') || yCol.includes('revenue') || yCol.includes('mrr');
  const isPercentage = yCol.includes('percentage') || yCol.includes('rate');
  
  const formatValue = (val: number | string) => {
    const num = toNumber(val);
    if (isCurrency) return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (isPercentage) return `${num}%`;
    return num.toLocaleString();
  };

  // ─── SCORECARD ───────────────────────────────────────────────────────────
  if (chartType === 'scorecard') {
    const lastVal = toNumber(chartData[chartData.length - 1][yCol]);
    const prev    = chartData.length > 1 ? toNumber(chartData[chartData.length - 2][yCol]) : null;
    const delta   = prev !== null ? ((lastVal - prev) / (prev || 1)) * 100 : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '160px', gap: '0.25rem' }}>
        {title && <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>}
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>{formatValue(lastVal)}</div>
        {delta !== null && (
          <div style={{ fontSize: '0.8rem', color: delta >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}% vs prev
          </div>
        )}
        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{yCol}</div>
      </div>
    );
  }

  if (chartType === 'table') {
    const displayCols = [xCol, yCol, activeGroupColumn].filter(Boolean) as string[];
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
            {chartData.slice(0, 50).map((row, i) => (
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
        {chartData.length > 50 && <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px solid #e5e7eb' }}>Showing 50 of {chartData.length} rows</div>}
      </div>
    );
  }

  // ─── GAUGE ───────────────────────────────────────────────────────────────
  if (chartType === 'gauge') {
    const val = toNumber(chartData[chartData.length - 1][yCol]);
    const pct = Math.min(100, Math.max(0, ((val - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
    const option = {
      tooltip: { formatter: '{a} <br/>{b} : {c}%' },
      series: [{
        name: yCol, type: 'gauge',
        min: gaugeMin, max: gaugeMax,
        progress: { show: true },
        detail: { valueAnimation: true, formatter: isPercentage ? '{value}%' : isCurrency ? '${value}' : '{value}' },
        data: [{ value: Math.round(pct), name: yCol }],
        axisLine: { lineStyle: { width: 10, color: [[0.3, '#ef4444'], [0.7, '#f59e0b'], [1, '#22c55e']] } },
      }],
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  // ─── FUNNEL ──────────────────────────────────────────────────────────────
  if (chartType === 'funnel') {
    const funnelData = chartData.map((row, i) => ({
      name: String(row[xCol] ?? `Stage ${i + 1}`),
      value: toNumber(row[yCol]),
    })).sort((a, b) => b.value - a.value);
    const option = {
      tooltip: { trigger: 'item', formatter: (params: { seriesName: string; name: string; value: number }) => `${params.seriesName} <br/>${params.name} : ${formatValue(params.value)}` },
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
    let nodes: SankeyNode[] = sankeyNodes ?? [];
    let links: SankeyLink[] = sankeyLinks ?? [];

    if (nodes.length === 0 && chartData.length > 0 && activeGroupColumn) {
      // Auto-derive: xCol = source, yCol = target (or activeGroupColumn), numeric col = value
      const numericCol = cols.find(c => typeof chartData[0][c] === 'number' || !isNaN(parseFloat(String(chartData[0][c]))));
      const nameSet = new Set<string>();
      chartData.forEach(row => { nameSet.add(String(row[xCol])); nameSet.add(String(row[yCol])); });
      nodes = Array.from(nameSet).map(n => ({ name: n }));
      links = chartData.map(row => ({
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
  if (chartType === 'stacked-bar' && activeGroupColumn) {
    const groups = [...new Set(chartData.map(r => String(r[activeGroupColumn])))];
    const xVals  = [...new Set(chartData.map(r => String(r[xCol])))];
    const seriesArr = groups.map((grp, gi) => ({
      name: grp, type: 'bar', stack: 'total',
      itemStyle: { color: COLORS[gi % COLORS.length] },
      data: xVals.map(xv => {
        const row = chartData.find(r => String(r[xCol]) === xv && String(r[activeGroupColumn]) === grp);
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
  const isTimeSeries = chartType === 'line' || chartType === 'area';

  // For line/area: auto-promote a date column if xCol isn't already temporal
  const resolvedXCol = (() => {
    if (!isTimeSeries) return xCol;
    if (isDateLike(xCol, chartData)) return xCol;
    // Find a better date column
    const dateCol = cols.find(c => isDateLike(c, chartData));
    return dateCol ?? xCol;
  })();

  const xAxisData = chartData.map(row => {
    const val = row[resolvedXCol];
    return isTimeSeries && isDateLike(resolvedXCol, chartData) ? formatDateLabel(val) : val;
  });
  const seriesData = chartData.map(row => toNumber(row[yCol]));


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
    const pieData = chartData.map((row, i) => ({
      name: String(row[xCol] ?? `Item ${i + 1}`),
      value: toNumber(row[yCol]),
      itemStyle: { color: COLORS[i % COLORS.length] },
    }));
    const option = {
      tooltip: { trigger: 'item', formatter: (params: { name: string; value: number; percent: number }) => `${params.name}: <b>${formatValue(params.value)}</b> (${params.percent}%)` },
      legend: { orient: 'vertical', left: 'left', type: 'scroll' },
      series: [{ name: yCol, type: 'pie', radius: ['35%', '65%'], center: ['60%', '50%'], data: pieData, label: { formatter: (params: { name: string; value: number }) => `${params.name}: ${formatValue(params.value)}` } }],
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  const baseOption: Record<string, unknown> = {
    tooltip: { trigger: 'axis', valueFormatter: (value: number | string) => formatValue(value) },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: xAxisData, axisLabel: { width: 80, overflow: 'truncate' } },
    yAxis: { type: 'value', axisLabel: { formatter: (value: number) => formatValue(value) } },
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
