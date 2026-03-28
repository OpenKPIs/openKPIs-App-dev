'use client';

import React, { useState } from 'react';
import type { DashboardSuggestion } from '../types';
import DynamicEChart from '@/components/DynamicEChart';

interface Step4DashboardsProps {
  dashboards: DashboardSuggestion[];
  loading: boolean;
  onSaveAnalysis: (activeTabIndex: number) => void;
  activeData: Record<string, unknown>[];
}

export default function Step4Dashboards({
  dashboards,
  loading,
  onSaveAnalysis,
  activeData,
}: Step4DashboardsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ifm-font-color-base)', letterSpacing: '-0.02em' }}>
          Step 4: Dashboard Recommendations
        </h2>
        <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
          Dashboards are recommended based on your selected insights. Each dashboard is organized into logical sections with recommended metrics and visualizations.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
          Generating dashboard recommendations...
        </div>
      ) : dashboards.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
          No dashboards generated yet. Please select insights in the previous step and click &ldquo;Next: Dashboard Recommendations&rdquo;.
        </div>
      ) : (
        <div>
          {/* Chrome-style Tabs */}
          <div style={{
            display: 'flex',
            gap: '0',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)',
            backgroundColor: 'var(--ifm-color-emphasis-50)',
            padding: '0.5rem 0.5rem 0 0.5rem',
            borderRadius: '8px 8px 0 0',
            overflowX: 'auto',
            overflowY: 'hidden',
          }}>
            {dashboards.map((dashboard, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                type="button"
                style={{
                  padding: '0.625rem 1.25rem',
                  border: 'none',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  backgroundColor: activeTab === index ? 'white' : 'transparent',
                  color: activeTab === index ? 'var(--ifm-font-color-base)' : 'var(--ifm-color-emphasis-600)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === index ? '600' : '400',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  marginRight: '0.25rem',
                  boxShadow: activeTab === index ? '0 -2px 4px rgba(0,0,0,0.05)' : 'none',
                  borderBottom: activeTab === index ? '2px solid white' : '2px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== index) {
                    e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== index) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {dashboard.title || `Dashboard ${index + 1}`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{
            border: '1px solid var(--ifm-color-emphasis-200)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            background: 'white',
          }}>
            {dashboards.map((dashboard, index) => activeTab === index && (
              <div key={index}>
                {/* Dashboard Header */}
                <div style={{
                  padding: '1.5rem',
                  background: 'var(--ifm-color-emphasis-50)',
                  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-font-color-base)' }}>
                    {dashboard.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--ifm-color-emphasis-700)', lineHeight: '1.6' }}>
                    {dashboard.purpose}
                  </p>
                </div>

                {/* Dashboard Content */}
                <div style={{ padding: '1.5rem' }}>
                {dashboard.sections && dashboard.sections.length > 0 ? (
                  // Render visual dashboard sections with DynamicECharts
                  dashboard.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{ marginBottom: '2rem' }}>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '2px solid var(--ifm-color-emphasis-200)',
                        color: 'var(--ifm-font-color-base)',
                      }}>
                        {section.title}
                      </h4>
                      {section.insights_covered.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-600)' }}>
                            Insights Covered:
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {section.insights_covered.map((insightId, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.375rem 0.75rem',
                                  background: 'var(--ifm-color-emphasis-100)',
                                  borderRadius: '6px',
                                }}
                              >
                                {insightId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {section.tiles.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
                          {section.tiles.map((tile, tileIndex) => (
                            <div
                              key={tileIndex}
                              style={{
                                padding: '1.5rem',
                                border: '1px solid var(--ifm-color-emphasis-200)',
                                borderRadius: '12px',
                                background: '#ffffff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1, // Let it naturally fill space within its row
                                minWidth: '380px',
                                width: tile.chart === 'sankey' || tile.chart === 'table' ? '100%' : 'calc(50% - 0.75rem)',
                                minHeight: '380px', // Guarantee enough vertical space for ECharts to look good
                                resize: 'both',     // The Magic Handle!
                                overflow: 'hidden' // Required for CSS resize to appear
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ifm-font-color-base)' }}>
                                  {tile.metric}
                                </div>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', background: 'var(--ifm-color-emphasis-100)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--ifm-color-emphasis-600)' }}>
                                  {tile.chart}
                                </span>
                              </div>
                              {tile.by && tile.by.length > 0 && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.5rem' }}>
                                  Breakdown: {tile.by.join(', ')}
                                </div>
                              )}
                              <div style={{ flex: 1, marginTop: '1rem' }}>
                                <DynamicEChart 
                                  chartType={tile.chart} 
                                  xAxisColumn={tile.xAxisColumn} 
                                  yAxisColumn={tile.yAxisColumn}
                                  groupColumn={tile.groupColumn}
                                  sankeyNodes={tile.sankeyNodes}
                                  sankeyLinks={tile.sankeyLinks}
                                  gaugeMin={tile.gaugeMin}
                                  gaugeMax={tile.gaugeMax}
                                  title={tile.metric}
                                  data={activeData} 
                                  suggestedMockValues={tile.suggestedMockValues}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : dashboard.markdown ? (
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      lineHeight: '1.8',
                      color: 'var(--ifm-font-color-base)',
                    }}
                    dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(dashboard.markdown) }}
                  />
                ) : (
                  <div style={{ color: 'var(--ifm-color-emphasis-600)', fontStyle: 'italic' }}>No layout defined</div>
                )}
                {dashboard.layout_notes && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'var(--ifm-color-emphasis-50)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: 'var(--ifm-color-emphasis-700)',
                    fontStyle: 'italic',
                  }}>
                    <strong>Layout Notes:</strong> {dashboard.layout_notes}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--ifm-color-emphasis-100)' }}>
        <button
          onClick={() => onSaveAnalysis(activeTab)}
          disabled={dashboards.length === 0}
          style={{
            padding: '0.875rem 2rem',
            border: '1px solid var(--ifm-color-primary)',
            borderRadius: '10px',
            background: dashboards.length > 0 ? 'white' : 'var(--ifm-color-emphasis-100)',
            color: dashboards.length > 0 ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)',
            cursor: dashboards.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.9375rem',
            fontWeight: 600,
            opacity: dashboards.length > 0 ? 1 : 0.5,
          }}
        >
          💾 Save to My Analysis
        </button>
      </div>
    </div>
  );
}

// Simple markdown to HTML converter (basic implementation)
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 1rem; color: var(--ifm-font-color-base);">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: 600; margin: 2rem 0 1rem; color: var(--ifm-font-color-base);">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.75rem; font-weight: 700; margin: 2rem 0 1rem; color: var(--ifm-font-color-base);">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li style="margin: 0.5rem 0;">$1</li>')
    .replace(/(<li.*<\/li>)/s, '<ul style="margin: 1rem 0; padding-left: 1.5rem;">$1</ul>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p style="margin: 1rem 0;">')
    .replace(/\n/gim, '<br />');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p style="margin: 1rem 0;">' + html + '</p>';
  }

  return html;
}


