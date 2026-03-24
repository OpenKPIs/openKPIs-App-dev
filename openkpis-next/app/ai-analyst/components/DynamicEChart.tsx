'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DynamicEChartProps {
  chartType: string;
  xAxisColumn?: string;
  yAxisColumn?: string;
  data: Record<string, unknown>[];
}

export default function DynamicEChart({ chartType, xAxisColumn, yAxisColumn, data }: DynamicEChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>No data provided for this visualization.</div>;
  }

  // Fallbacks if AI fails to provide a column schema map
  const xCol = xAxisColumn || Object.keys(data[0])[0];
  const yCol = yAxisColumn || Object.keys(data[0])[1] || xCol;

  const xAxisData = data.map(row => row[xCol]);
  const seriesData = data.map(row => {
    const val = row[yCol];
    // Clean string numbers (e.g. '$50.00' -> 50)
    if (typeof val === 'string') {
       const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
       return isNaN(parsed) ? val : parsed;
    }
    return val;
  });
  
  if (chartType === 'scorecard') {
    const lastVal = seriesData[seriesData.length - 1] ?? 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '150px' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{yCol} (Latest)</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--ifm-color-primary)' }}>
          {typeof lastVal === 'number' ? lastVal.toLocaleString() : String(lastVal || 0)}
        </div>
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
        // For pie charts, format differently
        ...(chartType === 'pie' ? {
          data: data.map(row => ({ name: row[xCol], value: typeof row[yCol] === 'string' ? parseFloat((row[yCol] as string).replace(/[^0-9.-]+/g, "")) : row[yCol] })),
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
