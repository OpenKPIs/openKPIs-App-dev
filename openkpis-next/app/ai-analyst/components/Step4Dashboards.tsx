'use client';

import React, { useState, useRef } from 'react';
import type { DashboardSuggestion } from '../types';
import DynamicEChart from '@/components/DynamicEChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Step4DashboardsProps {
  dashboards: DashboardSuggestion[];
  loading: boolean;
  onSaveAnalysis: (activeTabIndex: number) => void;
  activeData: Record<string, unknown>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedItems?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insights?: any[];
  requirements?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyticsSolution?: any;
}

export default function Step4Dashboards({
  dashboards,
  loading,
  onSaveAnalysis,
  activeData,
  selectedItems,
  insights,
  requirements,
  analyticsSolution
}: Step4DashboardsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'px', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AI_Analyst_Report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert("Failed to export PDF format.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ifm-font-color-base)', letterSpacing: '-0.02em' }}>
            Step 4: AI Dashboard Preview
          </h2>
          <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
             Review your AI-generated layout. Click &quot;Save to Workspace&quot; to export this design to the main Dashboard engine for full interactive editing.
          </p>
        </div>
        <div>
           <button 
             onClick={handleDownloadPDF} 
             disabled={isExporting}
             style={{ padding: '0.75rem 1.5rem', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '8px', cursor: isExporting ? 'wait' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' }}
           >
             {isExporting ? 'Exporting...' : '📄 Save Session to PDF'}
           </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
          Generating dashboard recommendations...
        </div>
      ) : dashboards.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
          No dashboards generated yet. Please select insights in the previous step to map visuals.
        </div>
      ) : (
        <div ref={containerRef}>
          {/* Chrome-style Tabs */}
          <div style={{
            display: 'flex',
            gap: '0',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)',
            backgroundColor: 'var(--ifm-color-emphasis-50)',
            padding: '0.5rem 0.5rem 0 0.5rem',
            borderRadius: '8px 8px 0 0',
            overflowX: 'auto',
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
                  borderBottom: activeTab === index ? '2px solid white' : '2px solid transparent',
                }}
              >
                {dashboard.title || `Dashboard ${index + 1}`}
              </button>
            ))}
          </div>

          {/* Static Tab Content */}
          <div style={{
            border: '1px solid var(--ifm-color-emphasis-200)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            background: 'white',
          }}>
            {dashboards.map((dashboard, index) => activeTab === index && (
              <div key={index}>
                <div style={{
                  padding: '1.5rem',
                  background: 'var(--ifm-color-emphasis-50)',
                  borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-font-color-base)' }}>
                    {dashboard.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--ifm-color-emphasis-700)' }}>
                    {dashboard.purpose}
                  </p>
                  
                  {selectedItems && (
                     <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {selectedItems.kpis?.length > 0 && (
                          <div style={{ flex: 1, minWidth: '200px', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#8b5cf6'}}></span> Selected KPIs</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {selectedItems.kpis.map((k: any, i: number) => <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.6rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155' }}>{k.name}</span>)}
                            </div>
                          </div>
                        )}
                        {selectedItems.metrics?.length > 0 && (
                          <div style={{ flex: 1, minWidth: '200px', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#3b82f6'}}></span> Selected Metrics</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {selectedItems.metrics.map((m: any, i: number) => <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.6rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155' }}>{m.name}</span>)}
                            </div>
                          </div>
                        )}
                        {selectedItems.dimensions?.length > 0 && (
                          <div style={{ flex: 1, minWidth: '200px', background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><span style={{width:'8px',height:'8px',borderRadius:'50%',background:'#10b981'}}></span> Selected Dimensions</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {selectedItems.dimensions.map((d: any, i: number) => <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.6rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155' }}>{d.name}</span>)}
                            </div>
                          </div>
                        )}
                     </div>
                  )}
                  
                  {insights && insights.length > 0 && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderLeft: '3px solid #3b82f6', borderRadius: '4px' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.75rem' }}>AI Insights Generating this Dashboard</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {insights.map((insight, idx) => (
                          <li key={idx}><strong>{insight.title}</strong>: {insight.rationale}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                {dashboard.sections && dashboard.sections.length > 0 ? (
                  dashboard.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} style={{ marginBottom: '2rem' }}>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        paddingBottom: '0.5rem',
                        borderBottom: '2px solid var(--ifm-color-emphasis-200)',
                      }}>
                        {section.title}
                      </h4>
                      
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
                                flexGrow: 1,
                                minWidth: '380px',
                                width: tile.chart === 'sankey' || tile.chart === 'table' ? '100%' : 'calc(50% - 0.75rem)',
                                minHeight: '380px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--ifm-font-color-base)' }}>
                                  {tile.metric}
                                </div>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', background: 'var(--ifm-color-emphasis-100)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                  {tile.chart}
                                </span>
                              </div>
                              <div style={{ flex: 1, marginTop: '1rem' }}>
                                <DynamicEChart 
                                  chartType={tile.chart} 
                                  xAxisColumn={tile.xAxisColumn} 
                                  yAxisColumn={tile.yAxisColumn}
                                  groupColumn={tile.groupColumn}
                                  title={tile.metric}
                                  data={activeData} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--ifm-color-emphasis-600)', fontStyle: 'italic' }}>No layout defined</div>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button triggers DB commit and navigation to the Dashboard Section */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--ifm-color-emphasis-100)' }}>
        <button
          onClick={() => onSaveAnalysis(activeTab)}
          disabled={dashboards.length === 0}
          style={{
            padding: '0.875rem 2rem',
            border: 'none',
            borderRadius: '10px',
            background: dashboards.length > 0 ? '#2563eb' : 'var(--ifm-color-emphasis-100)',
            color: dashboards.length > 0 ? '#ffffff' : 'var(--ifm-color-emphasis-500)',
            fontWeight: '600',
            cursor: dashboards.length > 0 ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: dashboards.length > 0 ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
          }}
        >
          {dashboards.length > 0 ? '💾 Save & Continue to Dashboard Editor' : 'Waiting...'}
        </button>
      </div>
    </div>
  );
}
