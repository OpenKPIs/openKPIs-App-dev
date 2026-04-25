'use client';

import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAI } from '@/lib/contexts/AIContext';
import Step1Requirements from './components/Step1Requirements';
import Step2ExpandedRequirements from './components/Step2ExpandedRequirements';
import Step3Insights from './components/Step3Insights';
import Step4Dashboards from './components/Step4Dashboards';
import { mockDatasets } from './data/mockDatasets';
import type {
  AIExpanded,
  AnalyticsSolution,
  DashboardSuggestion,
  ExistingItem,
  GroupedInsight,
  ItemsInAnalysis,
  Suggestion,
} from './types';

type SuggestionBuckets = {
  kpis: Suggestion[];
  metrics: Suggestion[];
  dimensions: Suggestion[];
};

interface AIAnalystClientProps {
  existingItems: {
    kpis: ExistingItem[];
    metrics: ExistingItem[];
    dimensions: ExistingItem[];
  };
}

const EMPTY_ITEMS: ItemsInAnalysis = {
  kpis: [],
  metrics: [],
  dimensions: [],
};

const EMPTY_SUGGESTIONS: SuggestionBuckets = {
  kpis: [],
  metrics: [],
  dimensions: [],
};

function normalizeSuggestion(item: Suggestion): Suggestion {
  return {
    name: item.name,
    description: item.description ?? '',
    category: item.category,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

function convertExistingToSuggestion(item: ExistingItem): Suggestion {
  return {
    name: item.name,
    description: item.description ?? '',
    category: item.category,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

// Helper hook to sync states to sessionStorage to prevent data loss on F5 refresh
function useSessionState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.sessionStorage.getItem(key);
      if (item) {
        if (item.startsWith('{"_isSet":true')) {
          return new Set(JSON.parse(item).data) as unknown as T;
        }
        return JSON.parse(item);
      }
    } catch {
      // Ignore parser errors during SSR
    }
    return initialValue;
  });

  const setMappedState = (value: T | ((val: T) => T)) => {
    setState((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      try {
        if (nextValue instanceof Set) {
          window.sessionStorage.setItem(key, JSON.stringify({ _isSet: true, data: Array.from(nextValue) }));
        } else {
          window.sessionStorage.setItem(key, JSON.stringify(nextValue));
        }
      } catch {
        // Ignore quota errors silently
      }
      return nextValue;
    });
  };

  return [state, setMappedState];
}

export default function AIAnalystClient({ existingItems }: AIAnalystClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeKey, activeModel } = useAI();

  // Read the active step directly from the URL query params so the 'Back' button works natively
  const urlStep = parseInt(searchParams.get('step') || '1', 10);
  const [step, setStepInternal] = useState<number>(urlStep);

  // Expose a step setter that pushes changes immediately to the URL router
  const setStep = (newStep: number) => {
    setStepInternal(newStep);
    router.push(`/ai-analyst?step=${newStep}`, { scroll: true });
  };

  // Sync state if the user clicks Back/Forward on the browser
  useEffect(() => {
    if (urlStep >= 1 && urlStep <= 4 && urlStep !== step) {
      setStepInternal(urlStep);
    }
  }, [urlStep, step]);

  const [analyticsSolution, setAnalyticsSolution] = useSessionState<AnalyticsSolution>('ai-sol', 'Google Analytics (GA4)');
  const [requirements, setRequirements] = useSessionState<string>('ai-req', '');
  const [kpiCount, setKpiCount] = useSessionState<number>('ai-kpi-cnt', 5);
  const [platforms, setPlatforms] = useSessionState<string[]>('ai-plat', []);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiExpanded, setAiExpanded] = useSessionState<AIExpanded | null>('ai-exp', null);
  const [editingAiExpanded, setEditingAiExpanded] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useSessionState<SuggestionBuckets>('ai-sug', EMPTY_SUGGESTIONS);
  const [itemsInAnalysis, setItemsInAnalysis] = useSessionState<ItemsInAnalysis>('ai-items', EMPTY_ITEMS);
  const [insights, setInsights] = useSessionState<GroupedInsight[]>('ai-ins', []);
  const [dashboards, setDashboards] = useSessionState<DashboardSuggestion[]>('ai-dash', []);
  const [selectedInsights, setSelectedInsights] = useSessionState<Set<string>>('ai-sel-ins', new Set());

  const [activeMockDatasetId] = useState<string>(mockDatasets[0].id);

  const existingItemsByType = useMemo(
    () => ({
      kpis: existingItems.kpis,
      metrics: existingItems.metrics,
      dimensions: existingItems.dimensions,
    }),
    [existingItems],
  );

  const handleAddToAnalysis = (type: 'kpi' | 'metric' | 'dimension', item: Suggestion) => {
    const targetKey = `${type}s` as keyof ItemsInAnalysis;
    const entry = {
      name: item.name,
      description: item.description,
      category: item.category,
      tags: item.tags ?? [],
    };
    setItemsInAnalysis((prev) => {
      const existing = prev[targetKey];
      if (existing.some((current) => current.name === entry.name)) {
        return prev;
      }
      return {
        ...prev,
        [targetKey]: [...existing, entry],
      };
    });
  };

  const handleRemoveFromAnalysis = (type: 'kpis' | 'metrics' | 'dimensions', itemNames: string[]) => {
    setItemsInAnalysis((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => !itemNames.includes(item.name)),
    }));
  };

  const addItemFromExisting = (type: 'kpis' | 'metrics' | 'dimensions', item: ExistingItem) => {
    const suggestion = convertExistingToSuggestion(item);
    setSuggestions((prev) => ({
      ...prev,
      [type]: prev[type].some((existing) => existing.name === suggestion.name)
        ? prev[type]
        : [...prev[type], suggestion],
    }));

    const singular = type.slice(0, -1) as 'kpi' | 'metric' | 'dimension';
    handleAddToAnalysis(singular, suggestion);
  };

  const resetAnalysisState = () => {
    setStep(2);
    setEditingAiExpanded(false);
    setItemsInAnalysis(EMPTY_ITEMS);
    setInsights([]);
    setDashboards([]);
    setSelectedInsights(new Set());
  };

  const handleAnalyze = async () => {
    if (!requirements.trim()) {
      alert('Please enter business requirements');
      return;
    }
    setLoading(true);
    try {
      const expandResponse = await fetch('/api/ai/expand-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, analyticsSolution, platforms, kpiCount, apiKey: activeKey, model: activeModel }),
      });
      if (!expandResponse.ok) {
        const errorPayload = await expandResponse.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to expand requirements');
      }
      const expandedData = await expandResponse.json();
      setAiExpanded(expandedData?.ai_expanded ?? null);

      const suggestResponse = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, analyticsSolution, kpiCount, apiKey: activeKey, model: activeModel }),
      });
      if (!suggestResponse.ok) {
        const errorPayload = await suggestResponse.json().catch(() => ({}));
        let message = errorPayload?.error || 'Failed to get suggestions';
        if (suggestResponse.status === 401 || message.includes('API key')) {
          message = [
            message,
            '',
            'Please verify your OPENAI_API_KEY configuration:',
            '1. Ensure OPENAI_API_KEY is set in .env.local',
            '2. The key should start with "sk-proj-"',
            '3. Confirm the key at https://platform.openai.com/account/api-keys',
            '4. Make sure billing is enabled',
            '5. Restart the dev server after changing environment variables',
          ].join('\n');
        }
        throw new Error(message);
      }
      const suggestionPayload = await suggestResponse.json();
      setSuggestions({
        kpis: (suggestionPayload?.kpis ?? []).map(normalizeSuggestion),
        metrics: (suggestionPayload?.metrics ?? []).map(normalizeSuggestion),
        dimensions: (suggestionPayload?.dimensions ?? []).map(normalizeSuggestion),
      });
      resetAnalysisState();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get AI suggestions. Please try again.';
      console.error('Error analyzing requirements:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMoreInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, analyticsSolution, aiExpanded, itemsInAnalysis, apiKey: activeKey, model: activeModel }),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to get insights');
      }
      const payload = await response.json();
      const newInsights: GroupedInsight[] = payload?.insights ?? [];
      setInsights((prev) => [...prev, ...newInsights]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get insights. Please try again.';
      console.error('Error generating insights:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDashboards = async () => {
    if (selectedInsights.size === 0) {
      alert('Please select at least one insight before viewing dashboard suggestions');
      return;
    }
    setLoading(true);
    try {
      const selectedInsightEntities = Array.from(selectedInsights)
        .map((id) => insights.find((entry) => entry.id === id))
        .filter((entry): entry is GroupedInsight => Boolean(entry));

      // 1) Get active schema from strictly mock datasets in the Sandbox
      const getActiveSchema = () => {
        const ds = mockDatasets.find((d) => d.id === activeMockDatasetId);
        if (!ds || !ds.data || !Array.isArray(ds.data) || ds.data.length === 0) return [];
        return Object.keys(ds.data[0]);
      };

      const response = await fetch('/api/ai/generate-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          analyticsSolution,
          selectedInsights: selectedInsightEntities,
          aiExpanded,
          datasetSchema: getActiveSchema(),
          apiKey: activeKey,
          model: activeModel
        }),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to get dashboard suggestions');
      }
      const payload = await response.json();
      setDashboards(payload?.dashboards ?? []);
      setStep(4);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get dashboard suggestions. Please try again.';
      console.error('Error loading dashboards:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async (activeTab?: number) => {
    setLoading(true);
    try {
      const dashboardsToSave = activeTab !== undefined && dashboards[activeTab] ? [dashboards[activeTab]] : [];

      const response = await fetch('/api/ai/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsInAnalysis,
          dashboards: dashboardsToSave,
          insights,
          requirements,
          analyticsSolution,
        }),
      });
      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.error || 'Failed to save analysis');
      }
      const payload = await response.json();
      
      if (dashboardsToSave.length > 0) {
        // Find the generated slug format if payload does not return it directly
        // The /api/ai/save-analysis uses `createSlug(dashboard.title || 'dashboard-...')`
        const slug = dashboardsToSave[0].title
          ? dashboardsToSave[0].title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
          : '';
        
        if (slug) {
          window.location.href = `/dashboards/${slug}/edit`;
        } else {
          alert(`Analysis saved!`);
        }
      } else {
        alert(`Analysis saved successfully! ${payload?.savedItems ?? 0} items added to your analysis.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save analysis. Please try again.';
      console.error('Error saving analysis:', error);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            '@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}@keyframes pulse{0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.2)}}',
        }}
      />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>AI Analyst</h1>
          <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
            Get personalized KPI recommendations based on your business requirements and analytics solution.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: step >= num ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
                  color: step >= num ? 'white' : 'var(--ifm-color-emphasis-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  zIndex: 2,
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: '0.75rem', textAlign: 'center', color: step >= num ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)' }}>
                {num === 1 && 'Requirements'}
                {num === 2 && 'KPI Suggestions'}
                {num === 3 && 'Insights'}
                {num === 4 && 'Dashboards'}
              </div>
              {num < 4 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    backgroundColor: step > num ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-200)',
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {loading && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '3rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  margin: '0 auto 1.5rem',
                  border: '4px solid var(--ifm-color-emphasis-200)',
                  borderTop: '4px solid var(--ifm-color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--ifm-font-color-base)' }}>
                Analyzing Your Requirements
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '1.5rem' }}>
                Our AI is processing your business requirements and generating {kpiCount} personalized KPIs with proportional metrics and
                dimensions...
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--ifm-color-primary)',
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '2.5rem',
            minHeight: '400px',
            position: 'relative',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.3s ease',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--ifm-color-emphasis-200)',
          }}
        >
          {step === 1 && (
            <>

              <Step1Requirements
                analyticsSolution={analyticsSolution}
                setAnalyticsSolution={setAnalyticsSolution}
                requirements={requirements}
                setRequirements={setRequirements}
                kpiCount={kpiCount}
                setKpiCount={setKpiCount}
                platforms={platforms}
                setPlatforms={setPlatforms}
                loading={loading}
                onAnalyze={handleAnalyze}
              />
            </>
          )}

          {step === 2 && (
            <Step2ExpandedRequirements
              userRequirement={requirements}
              aiExpanded={aiExpanded}
              editingAiExpanded={editingAiExpanded}
              setEditingAiExpanded={setEditingAiExpanded}
              setAiExpanded={setAiExpanded}
              suggestions={suggestions}
              existingItems={existingItemsByType}
              itemsInAnalysis={itemsInAnalysis}
              onAddToAnalysis={handleAddToAnalysis}
              onAddExistingToAnalysis={addItemFromExisting}
              onRemoveFromAnalysis={handleRemoveFromAnalysis}
              onNext={async () => {
                if (insights.length === 0) {
                  setLoading(true);
                  try {
                    const response = await fetch('/api/ai/insights', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ requirements, analyticsSolution, aiExpanded, apiKey: activeKey, model: activeModel }),
                    });
                    if (!response.ok) {
                      const errorPayload = await response.json().catch(() => ({}));
                      throw new Error(errorPayload?.error || 'Failed to get insights');
                    }
                    const payload = await response.json();
                    setInsights(payload?.insights ?? []);
                    setStep(3);
                  } catch (error) {
                    const message = error instanceof Error ? error.message : 'Failed to get insights. Please try again.';
                    console.error('Error loading insights:', error);
                    alert(message);
                  } finally {
                    setLoading(false);
                  }
                } else {
                  setStep(3);
                }
              }}
            />
          )}

          {step === 3 && (
            <Step3Insights
              insights={insights}
              selectedInsights={selectedInsights}
              setSelectedInsights={setSelectedInsights}
              loading={loading}
              onGenerateMore={handleGenerateMoreInsights}
              onSaveAnalysis={handleSaveAnalysis}
              onNext={handleLoadDashboards}
            />
          )}

          {step === 4 && (
            <Step4Dashboards 
               dashboards={dashboards} 
               loading={loading} 
               onSaveAnalysis={handleSaveAnalysis} 
               activeData={mockDatasets.find((d) => d.id === activeMockDatasetId)?.data || []}
               selectedItems={itemsInAnalysis}
               insights={insights.filter(i => selectedInsights.has(i.id))}
               requirements={requirements}
               analyticsSolution={analyticsSolution}
            />
          )}
        </div>
      </main>
    </>
  );
}

