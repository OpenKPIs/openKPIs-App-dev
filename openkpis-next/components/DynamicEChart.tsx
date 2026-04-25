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

  // Premium Vibrant Color Palette (Indigos, Pinks, Cyans, Ambers, Emeralds)
  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#84cc16'];

  // ─── FORMATTING HELPERS ──────────────────────────────────────────────────
  const isCurrency = yCol.includes('currency') || yCol.includes('revenue') || yCol.includes('mrr');
  const isPercentage = yCol.includes('percentage') || yCol.includes('rate');
  
  const formatValue = (val: number | string) => {
    const num = toNumber(val);
    if (isCurrency) return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (isPercentage) return `${num}%`;
    return num.toLocaleString();
  };

  // ─── SCORECARD WITH SPARKLINE ──────────────────────────────────────────────
  if (chartType === 'scorecard') {
    const lastVal = toNumber(chartData[chartData.length - 1][yCol]);
    const prev    = chartData.length > 1 ? toNumber(chartData[chartData.length - 2][yCol]) : null;
    const delta   = prev !== null ? ((lastVal - prev) / (prev || 1)) * 100 : null;
    const isPositive = delta !== null && delta >= 0;

    // Sparkline config for background trend
    const sparklineData = chartData.map(r => toNumber(r[yCol]));
    const sparkColor = isPositive ? '#10b981' : '#f43f5e';
    const sparklineOption = {
      animation: true,
      tooltip: { show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
      series: [{
        type: 'line', data: sparklineData, smooth: 0.4, 
        symbol: 'none', lineStyle: { width: 3, color: sparkColor },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: `${sparkColor}30` }, { offset: 1, color: `${sparkColor}00` }]
          }
        }
      }]
    };

    return (
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: '100%', minHeight: '160px', gap: '0.6rem', padding: '1.5rem' }}>
        {/* Absolute positioned sparkline taking the lower half of the card */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', zIndex: 0, opacity: 0.8 }}>
          <ReactECharts option={sparklineOption} style={{ height: '100%', width: '100%' }} notMerge />
        </div>
        
        <div style={{ zIndex: 1 }}>
          {title && <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{title}</div>}
          <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>{formatValue(lastVal)}</div>
          {delta !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.85rem', padding: '0.25rem 0.6rem', borderRadius: '1rem', background: isPositive ? '#d1fae5' : '#ffe4e6', color: isPositive ? '#047857' : '#be123c', fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                {isPositive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>vs previous</span>
            </div>
          )}
        </div>
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
                <th key={col} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap', color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chartData.slice(0, 50).map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: '#fff', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                {allCols.map(col => (
                  <td key={col} style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', color: '#334155', fontWeight: 500 }}>
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {chartData.length > 50 && <div style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 500 }}>Showing 50 of {chartData.length} records</div>}
      </div>
    );
  }

  // ─── COMMON ECHARTS TOOLTIP THEME ───
  const tooltipTheme = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1,
    textStyle: { color: '#1e293b', fontSize: 13, fontWeight: 500 },
    padding: [10, 14],
    borderRadius: 8,
    extraCssText: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05); backdrop-filter: blur(8px);'
  };

  // ─── GAUGE ───────────────────────────────────────────────────────────────
  if (chartType === 'gauge') {
    const val = toNumber(chartData[chartData.length - 1][yCol]);
    const pct = Math.min(100, Math.max(0, ((val - gaugeMin) / (gaugeMax - gaugeMin)) * 100));
    const option = {
      tooltip: { ...tooltipTheme, formatter: '{a} <br/>{b} : {c}%' },
      series: [{
        name: yCol, type: 'gauge',
        min: gaugeMin, max: gaugeMax,
        progress: { show: true, width: 14, itemStyle: { color: COLORS[0] } },
        axisLine: { lineStyle: { width: 14, color: [[1, '#f1f5f9']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: '#0f172a' } },
        detail: { valueAnimation: true, formatter: isPercentage ? '{value}%' : isCurrency ? '${value}' : '{value}', fontSize: 32, fontWeight: 800, color: '#0f172a', offsetCenter: [0, '30%'] },
        data: [{ value: Math.round(pct), name: yCol }],
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
      tooltip: { ...tooltipTheme, trigger: 'item', formatter: (params: { seriesName: string; name: string; value: number }) => `<div style="font-weight:700;margin-bottom:4px;color:#94a3b8;font-size:0.7rem;text-transform:uppercase;">${params.seriesName}</div><div style="display:flex;justify-content:space-between;gap:1.5rem;"><span>${params.name}</span> <span style="font-weight:700;color:#fff;">${formatValue(params.value)}</span></div>` },
      series: [{
        name: yCol, type: 'funnel',
        left: '10%', width: '80%', minSize: '0%', maxSize: '100%',
        sort: 'descending', gap: 4,
        label: { show: true, position: 'inside', formatter: '{b} ({d}%)', color: '#fff', fontWeight: 600, textBorderColor: 'transparent' },
        itemStyle: { borderColor: '#fff', borderWidth: 1, borderRadius: 4 },
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
      return <div style={{ padding: '1.5rem', color: '#9ca3af', fontSize: '0.875rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>Sankey requires source → target flow data. Use 3 columns: source, target, value.</div>;
    }

    const option = {
      tooltip: { ...tooltipTheme, trigger: 'item', triggerOn: 'mousemove' },
      series: [{
        type: 'sankey', layout: 'none', emphasis: { focus: 'adjacency' },
        data: nodes, links,
        itemStyle: { borderWidth: 0, borderRadius: 4 },
        lineStyle: { color: 'source', curveness: 0.5, opacity: 0.2 },
        color: COLORS,
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
      itemStyle: { color: COLORS[gi % COLORS.length], borderRadius: [0, 0, 0, 0] },
      data: xVals.map(xv => {
        const row = chartData.find(r => String(r[xCol]) === xv && String(r[activeGroupColumn]) === grp);
        return row ? toNumber(row[yCol]) : 0;
      }),
    }));
    // Cap the top corners of the highest block
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seriesArr[seriesArr.length - 1].itemStyle.borderRadius = [6, 6, 0, 0] as any;

    const option = {
      tooltip: { ...tooltipTheme, trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(148, 163, 184, 0.1)' } } },
      legend: { data: groups, icon: 'circle', itemWidth: 10, itemHeight: 10, textStyle: { color: '#64748b', fontWeight: 600, fontSize: 12 }, bottom: 0 },
      grid: { left: '2%', right: '4%', top: '8%', bottom: '12%', containLabel: true },
      xAxis: { type: 'category', data: xVals, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#64748b', fontWeight: 600, margin: 12 }, axisTick: { show: false } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }, axisLabel: { color: '#94a3b8', fontWeight: 500, formatter: (value: number) => formatValue(value) } },
      series: seriesArr,
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  // ─── STANDARD AXIS CHARTS (line, area, bar, scatter) ─────────────────────
  const isTimeSeries = chartType === 'line' || chartType === 'area';

  const resolvedXCol = (() => {
    if (!isTimeSeries) return xCol;
    if (isDateLike(xCol, chartData)) return xCol;
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

  // Enterprise specific style wrappers using dynamic echarts injected objects
  const createGradient = (color: string) => ({
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{ offset: 0, color: `${color}40` }, { offset: 1, color: `${color}00` }] // hex transparency
  });

  const seriesDef: Record<string, unknown> = {
    name: yCol,
    data: seriesData,
    type: echartsType,
    smooth: echartsType === 'line' ? 0.4 : false, // beautifully curved interpolation
    symbol: echartsType === 'line' ? 'circle' : 'emptyCircle',
    symbolSize: echartsType === 'line' ? 8 : 12,
    showSymbol: false,
    lineStyle: { width: 3, cap: 'round', join: 'round' },
    itemStyle: { borderRadius: echartsType === 'bar' ? [6, 6, 0, 0] : 0, color: COLORS[0], borderWidth: 2 },
    ...(chartType === 'area' ? { areaStyle: { opacity: 1, color: createGradient(COLORS[0]) } } : {}),
  };

  // ─── DONUT (PIE) ─────────────────────────────────────────────────────────
  if (chartType === 'pie') {
    const pieData = chartData.map((row, i) => ({
      name: String(row[xCol] ?? `Item ${i + 1}`),
      value: toNumber(row[yCol]),
      itemStyle: { color: COLORS[i % COLORS.length] },
    }));
    const option = {
      tooltip: { ...tooltipTheme, trigger: 'item', formatter: (params: { name: string; value: number; percent: number; marker: string }) => `<div style="font-weight:600">${params.marker} ${params.name}</div><div style="margin-top:4px;font-weight:800;font-size:1.1rem">${formatValue(params.value)} <span style="font-weight:500;font-size:0.8rem;color:#64748b">(${params.percent}%)</span></div>` },
      legend: { orient: 'vertical', right: '5%', top: 'center', itemGap: 14, textStyle: { color: '#64748b', fontWeight: 600 }, icon: 'circle' },
      series: [{ 
        name: yCol, type: 'pie', 
        radius: ['55%', '80%'], // Donut style
        center: ['40%', '50%'], 
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        data: pieData, 
        label: { show: false }, // Hide ugly outer lines, use modern legend and tooltip instead
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } }
      }],
    };
    return <ReactECharts option={option} style={{ height: '300px', width: '100%' }} notMerge lazyUpdate />;
  }

  const baseOption: Record<string, unknown> = {
    tooltip: { 
      ...tooltipTheme, 
      trigger: 'axis', 
      axisPointer: { type: echartsType === 'bar' ? 'shadow' : 'line', shadowStyle: { color: 'rgba(148, 163, 184, 0.1)' } },
      valueFormatter: (value: number | string) => formatValue(value) 
    },
    grid: { left: '2%', right: '4%', bottom: '4%', top: '10%', containLabel: true },
    xAxis: { 
      type: 'category', data: xAxisData, 
      axisLabel: { color: '#64748b', fontWeight: 600, width: 80, overflow: 'truncate' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value', 
      axisLabel: { color: '#94a3b8', fontWeight: 500, formatter: (value: number) => formatValue(value) },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
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
