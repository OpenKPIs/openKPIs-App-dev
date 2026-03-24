'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DynamicEChartProps {
  chartType: string;
  xAxisColumn?: string;
  yAxisColumn?: string;
  title?: string;
  data: Record<string, unknown>[];
}

export default function DynamicEChart({ chartType, xAxisColumn, yAxisColumn, title, data }: DynamicEChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '0.875rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ddd' }}>
        No data available for this visualization.
      </div>
    );
  }

  // Fallbacks if no axis mapping provided
  const xCol = xAxisColumn || Object.keys(data[0])[0];
  const yCol = yAxisColumn || Object.keys(data[0])[1] || xCol;

  const xAxisData = data.map(row => row[xCol]);
  const seriesData = data.map(row => {
    const val = row[yCol];
    if (typeof val === 'string') {
      const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  });

  if (chartType === 'scorecard') {
    const lastVal = seriesData[seriesData.length - 1] ?? 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '160px', gap: '0.25rem' }}>
        {title && <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>}
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
          {typeof lastVal === 'number' ? lastVal.toLocaleString() : String(lastVal || 0)}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{yCol}</div>
      </div>
    );
  }

  const baseOption: Record<string, unknown> = {
    tooltip: { trigger: chartType === 'pie' ? 'item' : 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    color: ['#1e88e5', '#ff9800', '#f44336', '#4caf50'],
    series: [
      {
        data: seriesData,
        type: chartType === 'pie' ? 'pie' : chartType === 'bar' ? 'bar' : chartType === 'scatter' ? 'scatter' : 'line',
        itemStyle: { borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0 },
        smooth: true,
        ...(chartType === 'pie' ? {
          data: data.map(row => ({
            name: row[xCol],
            value: typeof row[yCol] === 'string'
              ? parseFloat((row[yCol] as string).replace(/[^0-9.-]+/g, ''))
              : row[yCol]
          })),
          radius: '70%',
          center: ['50%', '50%'],
          type: 'pie'
        } : {})
      }
    ]
  };

  if (chartType !== 'pie') {
    baseOption.xAxis = {
      type: 'category',
      data: xAxisData,
      axisLabel: { width: 80, overflow: 'truncate' }
    };
    baseOption.yAxis = { type: 'value' };
  }

  return (
    <ReactECharts
      option={baseOption}
      style={{ height: '300px', width: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
