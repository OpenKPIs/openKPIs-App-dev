'use client';

import React, { useState, useMemo } from 'react';
import type { AIExpanded, Suggestion, ExistingItem } from '../types';

interface Step2ExpandedRequirementsProps {
  userRequirement: string;
  aiExpanded: AIExpanded | null;
  editingAiExpanded: boolean;
  setEditingAiExpanded: (value: boolean) => void;
  setAiExpanded: (value: AIExpanded | null) => void;
  suggestions: {
    kpis: Suggestion[];
    metrics: Suggestion[];
    dimensions: Suggestion[];
  };
  existingItems: {
    kpis: ExistingItem[];
    metrics: ExistingItem[];
    dimensions: ExistingItem[];
  };
  itemsInAnalysis: {
    kpis: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
    metrics: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
    dimensions: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
  };
  onAddToAnalysis: (type: 'kpi' | 'metric' | 'dimension', item: Suggestion) => void;
  onAddExistingToAnalysis: (type: 'kpis' | 'metrics' | 'dimensions', item: ExistingItem) => void;
  onRemoveFromAnalysis: (type: 'kpis' | 'metrics' | 'dimensions', itemNames: string[]) => void;
  onNext: () => void;
}

export default function Step2ExpandedRequirements({
  userRequirement,
  aiExpanded,
  editingAiExpanded,
  setEditingAiExpanded,
  setAiExpanded,
  suggestions,
  existingItems,
  itemsInAnalysis,
  onAddToAnalysis,
  onAddExistingToAnalysis,
  onRemoveFromAnalysis,
  onNext,
}: Step2ExpandedRequirementsProps) {
  const [editedExpanded, setEditedExpanded] = useState<AIExpanded | null>(aiExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<'kpis' | 'metrics' | 'dimensions' | null>('kpis');
  const [selectedSuggested, setSelectedSuggested] = useState<{
    kpis: Set<string>;
    metrics: Set<string>;
    dimensions: Set<string>;
  }>({
    kpis: new Set(),
    metrics: new Set(),
    dimensions: new Set(),
  });
  
  // Track selected items in analysis recap for removal
  const [selectedInAnalysis, setSelectedInAnalysis] = useState<{
    kpis: Set<string>;
    metrics: Set<string>;
    dimensions: Set<string>;
  }>({
    kpis: new Set(),
    metrics: new Set(),
    dimensions: new Set(),
  });
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });

  // Detect which items are new (not in existingItems)
  const newItems = useMemo(() => {
    const newKpis = new Set<string>();
    const newMetrics = new Set<string>();
    const newDimensions = new Set<string>();

    const existingNames = {
      kpis: new Set(existingItems.kpis.map(k => k.name.toLowerCase())),
      metrics: new Set(existingItems.metrics.map(m => m.name.toLowerCase())),
      dimensions: new Set(existingItems.dimensions.map(d => d.name.toLowerCase())),
    };

    suggestions.kpis.forEach((kpi) => {
      if (!existingNames.kpis.has(kpi.name.toLowerCase())) {
        newKpis.add(kpi.name);
      }
    });

    suggestions.metrics.forEach((metric) => {
      if (!existingNames.metrics.has(metric.name.toLowerCase())) {
        newMetrics.add(metric.name);
      }
    });

    suggestions.dimensions.forEach((dim) => {
      if (!existingNames.dimensions.has(dim.name.toLowerCase())) {
        newDimensions.add(dim.name);
      }
    });

    return {
      kpis: newKpis,
      metrics: newMetrics,
      dimensions: newDimensions,
    };
  }, [suggestions, existingItems]);

  // Filter existing items by search query
  const filteredExistingItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return {
      kpis: existingItems.kpis.filter(item => item.name.toLowerCase().includes(query)),
      metrics: existingItems.metrics.filter(item => item.name.toLowerCase().includes(query)),
      dimensions: existingItems.dimensions.filter(item => item.name.toLowerCase().includes(query)),
    };
  }, [existingItems, searchQuery]);

  const handleSaveEdit = () => {
    setAiExpanded(editedExpanded);
    setEditingAiExpanded(false);
  };

  const handleCancelEdit = () => {
    setEditedExpanded(aiExpanded);
    setEditingAiExpanded(false);
  };

  const toggleCheckbox = (type: 'kpis' | 'metrics' | 'dimensions', itemName: string) => {
    setSelectedSuggested(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return { ...prev, [type]: newSet };
    });
  };

  const handleBulkAddToAnalysis = () => {
    // Add selected items to analysis (check suggestions first, then existing items)
    selectedSuggested.kpis.forEach(kpiName => {
      // Check if it's a suggested item first
      const suggestedItem = suggestions.kpis.find(k => k.name === kpiName);
      if (suggestedItem) {
        onAddToAnalysis('kpi', suggestedItem);
      } else {
        // If not found in suggestions, check existing items
        const existingItem = filteredExistingItems.kpis.find(k => k.name === kpiName);
        if (existingItem) {
          onAddExistingToAnalysis('kpis', existingItem);
        }
      }
    });

    selectedSuggested.metrics.forEach(metricName => {
      const suggestedItem = suggestions.metrics.find(m => m.name === metricName);
      if (suggestedItem) {
        onAddToAnalysis('metric', suggestedItem);
      } else {
        const existingItem = filteredExistingItems.metrics.find(m => m.name === metricName);
        if (existingItem) {
          onAddExistingToAnalysis('metrics', existingItem);
        }
      }
    });

    selectedSuggested.dimensions.forEach(dimName => {
      const suggestedItem = suggestions.dimensions.find(d => d.name === dimName);
      if (suggestedItem) {
        onAddToAnalysis('dimension', suggestedItem);
      } else {
        const existingItem = filteredExistingItems.dimensions.find(d => d.name === dimName);
        if (existingItem) {
          onAddExistingToAnalysis('dimensions', existingItem);
        }
      }
    });

    // Clear selections
    setSelectedSuggested({
      kpis: new Set(),
      metrics: new Set(),
      dimensions: new Set(),
    });
  };

  const toggleAnalysisItemSelection = (type: 'kpis' | 'metrics' | 'dimensions', itemName: string) => {
    setSelectedInAnalysis(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return { ...prev, [type]: newSet };
    });
  };

  const handleBulkRemoveFromAnalysis = () => {
    // Remove selected items from analysis
    if (selectedInAnalysis.kpis.size > 0) {
      onRemoveFromAnalysis('kpis', Array.from(selectedInAnalysis.kpis));
    }
    if (selectedInAnalysis.metrics.size > 0) {
      onRemoveFromAnalysis('metrics', Array.from(selectedInAnalysis.metrics));
    }
    if (selectedInAnalysis.dimensions.size > 0) {
      onRemoveFromAnalysis('dimensions', Array.from(selectedInAnalysis.dimensions));
    }

    // Clear selections
    setSelectedInAnalysis({
      kpis: new Set(),
      metrics: new Set(),
      dimensions: new Set(),
    });
  };

  const showTooltip = (e: React.MouseEvent, item: Suggestion | ExistingItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      content: (
        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.9)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', maxWidth: '300px' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.name}</div>
          {item.description && <div>{item.description}</div>}
        </div>
      ),
    });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  };

  const getChipColor = (type: string) => {
    const colors: Record<string, string> = {
      goal: 'var(--ifm-color-primary)',
      questions: 'var(--ifm-color-info)',
      scope: 'var(--ifm-color-success)',
      time_horizon: 'var(--ifm-color-warning)',
      breakdowns: 'var(--ifm-color-danger)',
      constraints: 'var(--ifm-color-emphasis-700)',
    };
    return colors[type] || 'var(--ifm-color-emphasis-400)';
  };

  const hasSelectedItems = selectedSuggested.kpis.size > 0 || selectedSuggested.metrics.size > 0 || selectedSuggested.dimensions.size > 0;
  const hasSelectedInAnalysis = selectedInAnalysis.kpis.size > 0 || selectedInAnalysis.metrics.size > 0 || selectedInAnalysis.dimensions.size > 0;

  return (
    <div>
      <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ifm-font-color-base)', letterSpacing: '-0.02em' }}>
          Step 2: KPI Suggestions
        </h2>
      </div>

      {/* User Requirement Echo - Reduced font size */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '12px', border: '1px solid var(--ifm-color-emphasis-200)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          You said:
        </div>
        <div style={{ fontSize: '0.9375rem', color: 'var(--ifm-font-color-base)', lineHeight: '1.6' }}>
          "{userRequirement}"
        </div>
      </div>

      {/* AI-Expanded Requirement - Fixed Goal formatting */}
      {aiExpanded && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI understood:
            </div>
            {!editingAiExpanded && (
              <button
                onClick={() => setEditingAiExpanded(true)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  background: 'white',
                  color: 'var(--ifm-font-color-base)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Edit
              </button>
            )}
          </div>

          {editingAiExpanded ? (
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '2px solid var(--ifm-color-primary)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Goal</label>
                <textarea
                  value={editedExpanded?.goal || ''}
                  onChange={(e) => setEditedExpanded({ ...editedExpanded!, goal: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px', fontFamily: 'inherit', fontSize: '0.875rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button onClick={handleCancelEdit} style={{ padding: '0.5rem 1rem', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: '6px', background: 'white', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSaveEdit} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '6px', background: 'var(--ifm-color-primary)', color: 'white', cursor: 'pointer' }}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--ifm-color-emphasis-200)' }}>
              {/* Goal - Better formatted */}
              <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Goal
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--ifm-font-color-base)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  {aiExpanded.goal}
                </div>
              </div>

              {/* Questions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Questions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {aiExpanded.questions.map((q, i) => (
                    <div key={i} style={{ fontSize: '0.875rem', padding: '0.625rem 0.875rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)', lineHeight: '1.6' }}>
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Scope
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {aiExpanded.scope.map((s, i) => (
                    <span key={i} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', background: 'var(--ifm-color-primary)', color: 'white', borderRadius: '6px', fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time Horizon */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Time Horizon
                </div>
                <div style={{ fontSize: '0.875rem', padding: '0.625rem 0.875rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)', lineHeight: '1.6' }}>
                  {aiExpanded.time_horizon}
                </div>
              </div>

              {/* Breakdowns */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Breakdowns
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {aiExpanded.breakdowns.map((b, i) => (
                    <span key={i} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: '6px' }}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Constraints
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {aiExpanded.constraints.map((c, i) => (
                    <span key={i} style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: '6px' }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4-Column Layout: Existing Items, Suggested KPIs, Suggested Dimensions, Suggested Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr 1fr 1fr',
          gap: '1.5rem',
          marginTop: '2rem',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Column 1: Accordion with Existing Items */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid var(--ifm-color-emphasis-200)',
            padding: '1rem',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'sticky',
            top: '1rem',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Existing Items
          </h3>
          
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          />
          
          {/* Accordion Sections */}
          {(['kpis', 'metrics', 'dimensions'] as const).map((itemType) => (
            <div key={itemType} style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => setActiveAccordion(activeAccordion === itemType ? null : itemType)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor:
                    activeAccordion === itemType ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-100)',
                  color: activeAccordion === itemType ? 'white' : 'var(--ifm-font-color-base)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {itemType.charAt(0).toUpperCase() + itemType.slice(1)} ({filteredExistingItems[itemType].length})
                </span>
                <span>{activeAccordion === itemType ? '−' : '+'}</span>
              </button>
              
              {activeAccordion === itemType && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {filteredExistingItems[itemType].length > 0 ? (
                    filteredExistingItems[itemType].map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                        onClick={() => onAddExistingToAnalysis(itemType, item)}
                        onMouseEnter={(e) => showTooltip(e as any, item)}
                        onMouseLeave={hideTooltip}
                      >
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <input
                          type="checkbox"
                          checked={selectedSuggested[itemType === 'kpis' ? 'kpis' : itemType === 'metrics' ? 'metrics' : 'dimensions'].has(item.name)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCheckbox(itemType === 'kpis' ? 'kpis' : itemType === 'metrics' ? 'metrics' : 'dimensions', item.name);
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            marginLeft: '0.5rem',
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
                      No {itemType} found
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Column 2: Suggested KPIs */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid var(--ifm-color-primary)',
            }}
          >
            Suggested KPIs ({suggestions.kpis.length})
            {newItems.kpis.size > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ifm-color-warning)', marginLeft: '0.5rem' }}>
                ({newItems.kpis.size} new)
              </span>
            )}
          </h3>
          {suggestions.kpis.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.kpis.map((kpi, index) => {
                const isNew = newItems.kpis.has(kpi.name);
                const isInAnalysis = itemsInAnalysis.kpis.some(i => i.name === kpi.name);
                return (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: isNew ? '#fff4e6' : isInAnalysis ? '#e6f7ff' : 'white',
                      borderRadius: '6px',
                      border: `1px solid ${isNew ? '#ffa500' : isInAnalysis ? '#1890ff' : 'var(--ifm-color-emphasis-200)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      position: 'relative',
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    {isNew && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.375rem',
                          backgroundColor: '#ffa500',
                          color: 'white',
                          borderRadius: '3px',
                          fontWeight: 600,
                        }}
                      >
                        NEW
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={selectedSuggested.kpis.has(kpi.name)}
                      onChange={() => toggleCheckbox('kpis', kpi.name)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {kpi.name}
                    </span>
                    <button
                      onMouseEnter={(e) => showTooltip(e, kpi)}
                      onMouseLeave={hideTooltip}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--ifm-color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '24px',
                      }}
                      title="View details"
                    >
                      ℹ️
                    </button>
                    {isInAnalysis && (
                      <span style={{ fontSize: '0.75rem', color: '#1890ff', fontWeight: 500 }}>
                        Added
                      </span>
                    )}
                  </div>
                );
              })}
              {newItems.kpis.size > 0 && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fff9e6',
                  borderRadius: '6px',
                  border: '1px solid #ffa500',
                  fontSize: '0.75rem',
                  color: '#8b6914',
                }}>
                  <strong>Note:</strong> New KPIs marked above will be submitted to OpenKPIs repository when you "Add to Analysis". They'll be created as draft items for editor review.
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
              No KPIs suggested yet
            </p>
          )}
        </div>

        {/* Column 3: Suggested Dimensions */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid var(--ifm-color-primary)',
            }}
          >
            Suggested Dimensions ({suggestions.dimensions.length})
            {newItems.dimensions.size > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ifm-color-warning)', marginLeft: '0.5rem' }}>
                ({newItems.dimensions.size} new)
              </span>
            )}
          </h3>
          {suggestions.dimensions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.dimensions.map((dimension, index) => {
                const isNew = newItems.dimensions.has(dimension.name);
                const isInAnalysis = itemsInAnalysis.dimensions.some(i => i.name === dimension.name);
                return (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: isNew ? '#fff4e6' : isInAnalysis ? '#e6f7ff' : 'white',
                      borderRadius: '6px',
                      border: `1px solid ${isNew ? '#ffa500' : isInAnalysis ? '#1890ff' : 'var(--ifm-color-emphasis-200)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      position: 'relative',
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    {isNew && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.375rem',
                          backgroundColor: '#ffa500',
                          color: 'white',
                          borderRadius: '3px',
                          fontWeight: 600,
                        }}
                      >
                        NEW
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={selectedSuggested.dimensions.has(dimension.name)}
                      onChange={() => toggleCheckbox('dimensions', dimension.name)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dimension.name}
                    </span>
                    <button
                      onMouseEnter={(e) => showTooltip(e, dimension)}
                      onMouseLeave={hideTooltip}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--ifm-color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '24px',
                      }}
                      title="View details"
                    >
                      ℹ️
                    </button>
                    {isInAnalysis && (
                      <span style={{ fontSize: '0.75rem', color: '#1890ff', fontWeight: 500 }}>
                        Added
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
              No dimensions suggested yet
            </p>
          )}
        </div>

        {/* Column 4: Suggested Metrics */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid var(--ifm-color-primary)',
            }}
          >
            Suggested Metrics ({suggestions.metrics.length})
            {newItems.metrics.size > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--ifm-color-warning)', marginLeft: '0.5rem' }}>
                ({newItems.metrics.size} new)
              </span>
            )}
          </h3>
          {suggestions.metrics.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.metrics.map((metric, index) => {
                const isNew = newItems.metrics.has(metric.name);
                const isInAnalysis = itemsInAnalysis.metrics.some(i => i.name === metric.name);
                return (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: isNew ? '#fff4e6' : isInAnalysis ? '#e6f7ff' : 'white',
                      borderRadius: '6px',
                      border: `1px solid ${isNew ? '#ffa500' : isInAnalysis ? '#1890ff' : 'var(--ifm-color-emphasis-200)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      position: 'relative',
                      minWidth: 0,
                      width: '100%',
                    }}
                  >
                    {isNew && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '0.65rem',
                          padding: '0.125rem 0.375rem',
                          backgroundColor: '#ffa500',
                          color: 'white',
                          borderRadius: '3px',
                          fontWeight: 600,
                        }}
                      >
                        NEW
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={selectedSuggested.metrics.has(metric.name)}
                      onChange={() => toggleCheckbox('metrics', metric.name)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {metric.name}
                    </span>
                    <button
                      onMouseEnter={(e) => showTooltip(e, metric)}
                      onMouseLeave={hideTooltip}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: 'var(--ifm-color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '24px',
                      }}
                      title="View details"
                    >
                      ℹ️
                    </button>
                    {isInAnalysis && (
                      <span style={{ fontSize: '0.75rem', color: '#1890ff', fontWeight: 500 }}>
                        Added
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
              No metrics suggested yet
            </p>
          )}
        </div>
      </div>

      {/* Added to Analysis - View Cart Section */}
      {(itemsInAnalysis.kpis.length > 0 || itemsInAnalysis.metrics.length > 0 || itemsInAnalysis.dimensions.length > 0) && (
        <div style={{
          marginTop: '2rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f0f7ff',
          borderRadius: '12px',
          border: '2px solid #1890ff',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--ifm-font-color-base)',
              margin: 0,
            }}>
              Added to Analysis
            </h3>
            {hasSelectedInAnalysis && (
              <button
                onClick={handleBulkRemoveFromAnalysis}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              >
                Remove Selected ({selectedInAnalysis.kpis.size + selectedInAnalysis.metrics.size + selectedInAnalysis.dimensions.size})
              </button>
            )}
          </div>
          
          {/* KPIs Row */}
          {itemsInAnalysis.kpis.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ifm-color-emphasis-700)',
              }}>
                KPIs ({itemsInAnalysis.kpis.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {itemsInAnalysis.kpis.map((kpi, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: selectedInAnalysis.kpis.has(kpi.name) ? '#ffebee' : 'white',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      border: selectedInAnalysis.kpis.has(kpi.name) ? '2px solid #dc2626' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleAnalysisItemSelection('kpis', kpi.name)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInAnalysis.kpis.has(kpi.name)}
                      onChange={() => toggleAnalysisItemSelection('kpis', kpi.name)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span>{kpi.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions Row */}
          {itemsInAnalysis.dimensions.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ifm-color-emphasis-700)',
              }}>
                Dimensions ({itemsInAnalysis.dimensions.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {itemsInAnalysis.dimensions.map((dimension, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: selectedInAnalysis.dimensions.has(dimension.name) ? '#ffebee' : 'white',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      border: selectedInAnalysis.dimensions.has(dimension.name) ? '2px solid #dc2626' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleAnalysisItemSelection('dimensions', dimension.name)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInAnalysis.dimensions.has(dimension.name)}
                      onChange={() => toggleAnalysisItemSelection('dimensions', dimension.name)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span>{dimension.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Row */}
          {itemsInAnalysis.metrics.length > 0 && (
            <div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ifm-color-emphasis-700)',
              }}>
                Metrics ({itemsInAnalysis.metrics.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {itemsInAnalysis.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: selectedInAnalysis.metrics.has(metric.name) ? '#ffebee' : 'white',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      border: selectedInAnalysis.metrics.has(metric.name) ? '2px solid #dc2626' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleAnalysisItemSelection('metrics', metric.name)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInAnalysis.metrics.has(metric.name)}
                      onChange={() => toggleAnalysisItemSelection('metrics', metric.name)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span>{metric.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

       {/* Bulk Add Button and Next Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--ifm-color-emphasis-100)' }}>
        {hasSelectedItems && (
          <button
            onClick={handleBulkAddToAnalysis}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Add Selected to Analysis ({selectedSuggested.kpis.size + selectedSuggested.metrics.size + selectedSuggested.dimensions.size})
          </button>
        )}
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={onNext}
            style={{
              padding: '0.875rem 2.5rem',
              backgroundColor: 'var(--ifm-color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
          >
            Next: Generate Insights →
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.content && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
