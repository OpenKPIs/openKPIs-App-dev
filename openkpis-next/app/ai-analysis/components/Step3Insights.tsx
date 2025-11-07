'use client';

import React from 'react';
import type { GroupedInsight, AIExpanded } from '../types';

interface Step3InsightsProps {
  insights: GroupedInsight[];
  selectedInsights: Set<string>;
  setSelectedInsights: (insights: Set<string>) => void;
  aiExpanded: AIExpanded | null;
  requirements: string;
  analyticsSolution: string;
  loading: boolean;
  onGenerateMore: () => void;
  onSaveAnalysis: () => void;
  onNext: () => void;
}

const GROUP_ORDER = ['Acquisition', 'Engagement', 'Conversion', 'Monetization', 'Retention'];
const GROUP_COLORS: Record<string, string> = {
  Acquisition: 'var(--ifm-color-primary)',
  Engagement: 'var(--ifm-color-primary)',
  Conversion: 'var(--ifm-color-primary)',
  Monetization: 'var(--ifm-color-primary)',
  Retention: 'var(--ifm-color-primary)',
};

const SIGNAL_COLORS: Record<string, string> = {
  low: 'var(--ifm-color-emphasis-400)',
  medium: 'var(--ifm-color-warning)',
  high: 'var(--ifm-color-success)',
};

export default function Step3Insights({
  insights,
  selectedInsights,
  setSelectedInsights,
  aiExpanded,
  requirements,
  analyticsSolution,
  loading,
  onGenerateMore,
  onSaveAnalysis,
  onNext,
}: Step3InsightsProps) {
  const toggleInsight = (id: string) => {
    const newSelected = new Set(selectedInsights);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInsights(newSelected);
  };

  // Group insights, handling case-insensitive matching and unknown groups
  const normalizeGroupName = (group: string): string => {
    const normalized = group.trim();
    // Try to find a match in GROUP_ORDER (case-insensitive)
    const match = GROUP_ORDER.find(g => g.toLowerCase() === normalized.toLowerCase());
    return match || normalized; // Return matched group or original if no match
  };

  // First, group all insights by normalized group name
  const insightsByGroup = new Map<string, GroupedInsight[]>();
  
  insights.forEach(insight => {
    // Handle missing or empty group names
    const groupName = insight.group?.trim() || 'Other';
    const normalizedGroup = normalizeGroupName(groupName);
    if (!insightsByGroup.has(normalizedGroup)) {
      insightsByGroup.set(normalizedGroup, []);
    }
    insightsByGroup.get(normalizedGroup)!.push(insight);
  });

  // Build grouped insights array: first show predefined groups in order, then others
  const groupedInsights: Array<{ group: string; insights: GroupedInsight[] }> = [];
  const addedGroups = new Set<string>();
  
  // Add predefined groups in order (if they have insights)
  // Since normalizeGroupName already matches to GROUP_ORDER names, we can directly get them
  GROUP_ORDER.forEach(group => {
    const groupInsights = insightsByGroup.get(group);
    if (groupInsights && groupInsights.length > 0) {
      groupedInsights.push({ group, insights: groupInsights });
      addedGroups.add(group);
    }
  });

  // Add any remaining groups (that weren't in GROUP_ORDER or didn't match)
  insightsByGroup.forEach((groupInsights, group) => {
    if (!addedGroups.has(group) && groupInsights.length > 0) {
      groupedInsights.push({ group, insights: groupInsights });
    }
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ifm-font-color-base)', letterSpacing: '-0.02em' }}>
            Step 3: AI-Generated Insights
          </h2>
          <button
            onClick={onGenerateMore}
            disabled={loading}
            style={{
              padding: '0.625rem 1.25rem',
              border: '1px solid var(--ifm-color-primary)',
              borderRadius: '8px',
              background: 'white',
              color: 'var(--ifm-color-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Generating...' : '+ Generate More Insights'}
          </button>
        </div>
        <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
          Select the insights you want to include in your dashboard. Each insight includes signal strength, data requirements, and recommended chart type.
        </p>
      </div>

      {insights.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
          No insights generated yet. Click "Generate More Insights" to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groupedInsights.map(({ group, insights: groupInsights }) => {
            const hasColor = group && GROUP_COLORS.hasOwnProperty(group);
            const backgroundColor = hasColor ? GROUP_COLORS[group] : 'var(--ifm-color-emphasis-100)';
            const textColor = hasColor ? 'white' : 'var(--ifm-font-color-base)';
            
            return (
            <div key={group} style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{
                padding: '1rem 1.5rem',
                background: backgroundColor,
                color: textColor,
                fontSize: '1rem',
                fontWeight: '600',
                borderBottom: '1px solid var(--ifm-color-emphasis-200)',
              }}>
                {group || 'Other'} ({groupInsights.length})
              </div>
              <div style={{ padding: '1rem' }}>
                {groupInsights.map((insight) => (
                  <div
                    key={insight.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      marginBottom: '0.75rem',
                      background: selectedInsights.has(insight.id) ? 'var(--ifm-color-emphasis-50)' : 'white',
                      border: `2px solid ${selectedInsights.has(insight.id) ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => toggleInsight(insight.id)}
                    onMouseEnter={(e) => {
                      if (!selectedInsights.has(insight.id)) {
                        e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedInsights.has(insight.id)) {
                        e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInsights.has(insight.id)}
                      onChange={() => toggleInsight(insight.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-font-color-base)' }}>
                        {insight.title}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                        {insight.rationale}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          background: SIGNAL_COLORS[insight.signal_strength] || 'var(--ifm-color-emphasis-300)',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: '500',
                        }}>
                          Signal: {insight.signal_strength}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          background: 'var(--ifm-color-emphasis-100)',
                          borderRadius: '4px',
                        }}>
                          Chart: {insight.chart_hint}
                        </span>
                        {insight.data_requirements.length > 0 && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: 'var(--ifm-color-emphasis-100)',
                            borderRadius: '4px',
                          }}>
                            Data: {insight.data_requirements.length} required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid var(--ifm-color-emphasis-100)' }}>
        <button
          onClick={onSaveAnalysis}
          disabled={selectedInsights.size === 0}
          style={{
            padding: '0.875rem 2rem',
            border: '1px solid var(--ifm-color-primary)',
            borderRadius: '10px',
            background: selectedInsights.size > 0 ? 'white' : 'var(--ifm-color-emphasis-100)',
            color: selectedInsights.size > 0 ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)',
            cursor: selectedInsights.size > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.9375rem',
            fontWeight: 600,
            opacity: selectedInsights.size > 0 ? 1 : 0.5,
          }}
        >
          💾 Save to My Analysis
        </button>
        <button
          onClick={onNext}
          disabled={selectedInsights.size === 0}
          style={{
            padding: '0.875rem 2.5rem',
            backgroundColor: selectedInsights.size > 0 ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-300)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: selectedInsights.size > 0 ? 'pointer' : 'not-allowed',
            fontSize: '0.9375rem',
            fontWeight: 600,
          }}
        >
          Next: Dashboard Recommendations →
        </button>
      </div>
    </div>
  );
}
