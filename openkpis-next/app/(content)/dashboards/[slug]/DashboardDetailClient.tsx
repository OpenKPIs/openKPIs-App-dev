'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DynamicEChart from '@/components/DynamicEChart';
import type { SankeyNode, SankeyLink } from '@/components/DynamicEChart';
import { mockDatasets } from '@/app/ai-analyst/data/mockDatasets';
import { ResponsiveGridLayout as _ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = _ResponsiveGridLayout as any;

const data = mockDatasets[0].data;

export default function DashboardDetailClient({ tiles }: { tiles: Record<string, unknown>[] }) {
  const [platform, setPlatform] = useState<'ga4' | 'adobe'>('ga4');

  const sections = groupTilesBySection(tiles);

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Sleek Enterprise Preview Banner & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        padding: '1.25rem 2rem',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02), 0 1px 4px rgba(0, 0, 0, 0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px solid #bfdbfe'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📊</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem', color: '#111827', fontWeight: 600, letterSpacing: '-0.3px' }}>
                Preview Mode
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sample Data
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.2rem' }}>
              Data columns automatically remap based on your active platform architecture.
            </div>
          </div>
        </div>

        {/* Platform Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '2rem', borderLeft: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>Data Infrastructure</span>
          <div style={{ position: 'relative' }}>
            <select 
              value={platform} 
              onChange={e => setPlatform(e.target.value as 'ga4' | 'adobe')}
              style={{
                appearance: 'none',
                padding: '0.5rem 2.25rem 0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                background: '#f9fafb',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9ca3af'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; }}
            >
              <option value="ga4">Google Analytics (GA4)</option>
              <option value="adobe">Adobe Analytics</option>
            </select>
            <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280', fontSize: '0.7rem' }}>
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Grid Iteration */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {sections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                color: '#111827',
                marginBottom: '1.25rem', 
                paddingBottom: '0.75rem', 
                borderBottom: '1px solid #e5e7eb',
                letterSpacing: '-0.3px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ width: '4px', height: '18px', background: '#3b82f6', borderRadius: '4px' }} />
                {section.title as string}
              </h3>
            )}
            
            <div style={{ padding: '0.5rem' }}>
              <ResponsiveGridLayout
                 className="layout"
                 rowHeight={120}
                 margin={[16, 16]}
                 isDraggable={false}
                 isResizable={false}
                 cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              >
              {(section.tiles as Record<string, unknown>[]).map((tile, ti) => {
                const metricName = tile.metric as string || 'Untitled';
                const chartType = tile.chart as string || tile.chartType as string || 'line';
                
                // Use dynamic columns natively provided by AI JSON Engine
                const mappedX = tile.xAxisColumn as string;
                const mappedY = tile.yAxisColumn as string;
                const mappedGroup = tile.groupColumn as string;

                return (
                  <div key={ti} data-grid={{
                     x: (tile.x as number) ?? 0,
                     y: (tile.y as number) ?? Infinity,
                     w: (tile.w as number) ?? (chartType === 'scorecard' ? 4 : 8),
                     h: (tile.h as number) ?? (chartType === 'scorecard' ? 1.5 : 3)
                  }}>
                    <div style={{ 
                      height: '100%',
                      border: '1px solid rgba(229, 231, 235, 0.5)', 
                      borderRadius: '16px', 
                      padding: '1.5rem', 
                      background: '#ffffff', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.02)';
                    }}
                    >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid rgba(243, 244, 246, 0.6)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 650, fontSize: '1.05rem', color: '#0f172a', letterSpacing: '-0.02em' }}>{metricName}</span>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 600,
                        textTransform: 'uppercase', 
                        background: '#f1f5f9', 
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '6px', 
                        letterSpacing: '0.02em' 
                      }}>
                        {chartType}
                      </span>
                    </div>
                    {/* Interactive Chart */}
                    <div style={{ flex: 1, minHeight: '260px', marginTop: '0.5rem' }}>
                      <DynamicEChart 
                        chartType={chartType} 
                        xAxisColumn={mappedX} 
                        yAxisColumn={mappedY}
                        groupColumn={mappedGroup}
                        sankeyNodes={tile.sankeyNodes as SankeyNode[]}
                        sankeyLinks={tile.sankeyLinks as SankeyLink[]}
                        gaugeMin={tile.gaugeMin as number}
                        gaugeMax={tile.gaugeMax as number}
                        title={metricName}
                        data={data} 
                      />
                    </div>
                    {platform === 'adobe' && mappedX && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: '#9ca3af', 
                        marginTop: '1rem', 
                        textAlign: 'right',
                        borderTop: '1px solid #f3f4f6',
                        paddingTop: '0.75rem'
                      }}>
                        ✨ Automatically mapped to Adobe schemas
                      </div>
                    )}
                  </div>
                  </div>
                );
              })}
              </ResponsiveGridLayout>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Re-used utility from page.tsx to structure raw tiles into groups
type TileSection = { title?: string; tiles: Record<string, unknown>[] };
function groupTilesBySection(tiles: Record<string, unknown>[]): TileSection[] {
  const sections: TileSection[] = [];
  let current: TileSection = { tiles: [] };

  for (const tile of tiles) {
    if (tile.section_title) {
      if (current.tiles.length > 0 || current.title) sections.push(current);
      current = { title: String(tile.section_title), tiles: [] };
    }
    current.tiles.push(tile);
  }
  if (current.tiles.length > 0 || current.title) sections.push(current);
  if (sections.length === 0 && tiles.length > 0) return [{ tiles }];
  return sections;
}
