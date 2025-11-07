'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AddToAnalysisButton from '@/components/AddToAnalysisButton';
import { supabase } from '@/lib/supabase/client';
import { isAuthenticated, signInWithGitHub } from '@/lib/supabase/auth';
import GitHubSignIn from '@/components/GitHubSignIn';
import type { User } from '@supabase/supabase-js';
import StepNavigation from './components/StepNavigation';
import Step1Requirements from './components/Step1Requirements';
import Step2ExpandedRequirements from './components/Step2ExpandedRequirements';
import Step3Insights from './components/Step3Insights';
import Step4Dashboards from './components/Step4Dashboards';
import type { AnalyticsSolution, Suggestion, AIExpanded, GroupedInsight, DashboardSuggestion, ExistingItem } from './types';

export default function AIAnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState<number>(1);
  const [analyticsSolution, setAnalyticsSolution] = useState<AnalyticsSolution>('Google Analytics (GA4)');
  const [requirements, setRequirements] = useState('');
  const [kpiCount, setKpiCount] = useState<number>(5);
  const [platforms, setPlatforms] = useState<string[]>([]); // Web, Mobile, Cross-Device, Omnichannel
  const [loading, setLoading] = useState(false);
  const [aiExpanded, setAiExpanded] = useState<any>(null); // AI-expanded requirements
  const [editingAiExpanded, setEditingAiExpanded] = useState(false); // Edit mode for AI expansion
  const [suggestions, setSuggestions] = useState<{
    kpis: Suggestion[];
    metrics: Suggestion[];
    dimensions: Suggestion[];
  }>({
    kpis: [],
    metrics: [],
    dimensions: [],
  });
  const [additionalSuggestions, setAdditionalSuggestions] = useState<{
    kpis: Suggestion[];
    metrics: Suggestion[];
    dimensions: Suggestion[];
  }>({
    kpis: [],
    metrics: [],
    dimensions: [],
  });
  const [dashboards, setDashboards] = useState<any[]>([]); // Updated to DashboardSuggestionDetailed[]
  const [insights, setInsights] = useState<any[]>([]); // Updated to GroupedInsight[]
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(new Set()); // Selected insight IDs
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const [activeAccordion, setActiveAccordion] = useState<'kpis' | 'metrics' | 'dimensions' | null>('kpis');
  const [activeDashboardTab, setActiveDashboardTab] = useState<number>(0);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  
  // Items added to Analysis (recap section)
  const [itemsInAnalysis, setItemsInAnalysis] = useState<{
    kpis: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
    metrics: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
    dimensions: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
  }>({
    kpis: [],
    metrics: [],
    dimensions: [],
  });
  const [selectedItemsToRemove, setSelectedItemsToRemove] = useState<{
    kpis: Set<string>;
    metrics: Set<string>;
    dimensions: Set<string>;
  }>({
    kpis: new Set(),
    metrics: new Set(),
    dimensions: new Set(),
  });
  
  // Track which items are new (not in existingItems)
  const [newItems, setNewItems] = useState<{
    kpis: Set<string>;
    metrics: Set<string>;
    dimensions: Set<string>;
  }>({
    kpis: new Set(),
    metrics: new Set(),
    dimensions: new Set(),
  });
  
  // Track items submitted in current journey (for download filtering)
  const [submittedItems, setSubmittedItems] = useState<{
    kpis: Set<string>;
    metrics: Set<string>;
    dimensions: Set<string>;
  }>({
    kpis: new Set(),
    metrics: new Set(),
    dimensions: new Set(),
  });
  
  // Existing items from Supabase (Column 1)
  const [existingItems, setExistingItems] = useState<{
    kpis: Array<{ id: string; name: string; description?: string; category?: string; tags?: string[]; slug: string }>;
    metrics: Array<{ id: string; name: string; description?: string; category?: string; tags?: string[]; slug: string }>;
    dimensions: Array<{ id: string; name: string; description?: string; category?: string; tags?: string[]; slug: string }>;
  }>({
    kpis: [],
    metrics: [],
    dimensions: [],
  });
  
  // Search for existing items
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected checkboxes for suggested items (Columns 2-4)
  const [selectedSuggested, setSelectedSuggested] = useState<{
    kpis: Set<string>;
    metrics: Set<string>;
    dimensions: Set<string>;
  }>({
    kpis: new Set(),
    metrics: new Set(),
    dimensions: new Set(),
  });
  
  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ visible: false, x: 0, y: 0, content: null });
  
  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      }
      setAuthLoading(false);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Load existing items from Supabase (only if authenticated)
  useEffect(() => {
    if (!user) return; // Don't load if not authenticated
    
    const loadExistingItems = async () => {
      try {
        const [kpisRes, metricsRes, dimensionsRes] = await Promise.all([
          supabase.from('kpis').select('id, name, description, category, tags, slug').eq('status', 'published').order('name'),
          supabase.from('metrics').select('id, name, description, category, tags, slug').eq('status', 'published').order('name'),
          supabase.from('dimensions').select('id, name, description, category, tags, slug').eq('status', 'published').order('name'),
        ]);
        
        setExistingItems({
          kpis: (kpisRes.data || []).map((kpi: any) => ({
            id: kpi.id,
            name: kpi.name,
            description: kpi.description,
            category: kpi.category,
            slug: kpi.slug,
            tags: Array.isArray(kpi.tags) ? kpi.tags : typeof kpi.tags === 'string' ? JSON.parse(kpi.tags || '[]') : [],
          })),
          metrics: (metricsRes.data || []).map((metric: any) => ({
            id: metric.id,
            name: metric.name,
            description: metric.description,
            category: metric.category,
            slug: metric.slug,
            tags: Array.isArray(metric.tags) ? metric.tags : typeof metric.tags === 'string' ? JSON.parse(metric.tags || '[]') : [],
          })),
          dimensions: (dimensionsRes.data || []).map((dim: any) => ({
            id: dim.id,
            name: dim.name,
            description: dim.description,
            category: dim.category,
            slug: dim.slug,
            tags: Array.isArray(dim.tags) ? dim.tags : typeof dim.tags === 'string' ? JSON.parse(dim.tags || '[]') : [],
          })),
        });
      } catch (error) {
        console.error('Error loading existing items:', error);
      }
    };
    
    loadExistingItems();
  }, [user]);
  
  // Show login prompt if not authenticated
  if (authLoading) {
    return (
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</div>
        </div>
      </main>
    );
  }
  
  if (!user) {
    return (
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'var(--ifm-color-emphasis-100)',
          borderRadius: '8px',
          border: '1px solid var(--ifm-color-emphasis-300)'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>
            🔒 AI Analyst
          </div>
          <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Please log in to use the advanced AI Analyst feature. Sign in with GitHub to get personalized KPI recommendations, dashboard suggestions, and insights.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <GitHubSignIn />
          </div>
        </div>
      </main>
    );
  }

  const handleAnalyze = async () => {
    if (!requirements.trim()) {
      alert('Please enter business requirements');
      return;
    }

    if (!analyticsSolution) {
      alert('Please select an analytics solution');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Expand requirements using AI
      const expandResponse = await fetch('/api/ai/expand-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          analyticsSolution,
          platforms,
          kpiCount,
        }),
      });

      if (!expandResponse.ok) {
        const error = await expandResponse.json();
        throw new Error(error.error || 'Failed to expand requirements');
      }

      const expandedData = await expandResponse.json();
      setAiExpanded(expandedData.ai_expanded || null);

      // Step 2: Get KPI suggestions
      const suggestResponse = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          analyticsSolution,
          kpiCount,
        }),
      });

      if (!suggestResponse.ok) {
        const error = await suggestResponse.json();
        let errorMessage = error.error || 'Failed to get suggestions';
        
        // Add helpful hint for API key errors
        if (suggestResponse.status === 401 || errorMessage.includes('API key')) {
          errorMessage += '\n\nPlease check your OPENAI_API_KEY in your .env.local file.';
          errorMessage += '\nMake sure you have a valid project API key (sk-proj-...) from https://platform.openai.com/account/api-keys';
        }
        
        throw new Error(errorMessage);
      }

      const data = await suggestResponse.json();
      setSuggestions({
        kpis: data.kpis || [],
        metrics: data.metrics || [],
        dimensions: data.dimensions || [],
      });
      
      // Move to Step 2 (AI-Expanded Requirements + KPI Suggestions)
      setStep(2);
      
      // Detect which items are new (not in existingItems)
      const detectNewItems = () => {
        const newKpis = new Set<string>();
        const newMetrics = new Set<string>();
        const newDimensions = new Set<string>();
        
        const existingNames = {
          kpis: new Set(existingItems.kpis.map(k => k.name.toLowerCase())),
          metrics: new Set(existingItems.metrics.map(m => m.name.toLowerCase())),
          dimensions: new Set(existingItems.dimensions.map(d => d.name.toLowerCase())),
        };
        
        (data.kpis || []).forEach((kpi: Suggestion) => {
          if (!existingNames.kpis.has(kpi.name.toLowerCase())) {
            newKpis.add(kpi.name);
          }
        });
        
        (data.metrics || []).forEach((metric: Suggestion) => {
          if (!existingNames.metrics.has(metric.name.toLowerCase())) {
            newMetrics.add(metric.name);
          }
        });
        
        (data.dimensions || []).forEach((dim: Suggestion) => {
          if (!existingNames.dimensions.has(dim.name.toLowerCase())) {
            newDimensions.add(dim.name);
          }
        });
        
        setNewItems({
          kpis: newKpis,
          metrics: newMetrics,
          dimensions: newDimensions,
        });
      };
      
      detectNewItems();
      setStep(2);
    } catch (error: any) {
      console.error('Error analyzing:', error);
      
      // Show detailed error message
      const errorMessage = error.message || 'Failed to get AI suggestions. Please try again.';
      
      // Create a more user-friendly alert with line breaks
      alert(errorMessage);
      
      // Also log to console for debugging
      if (errorMessage.includes('API key')) {
        console.error(
          'Configuration Error:\n' +
          '1. Check that OPENAI_API_KEY is set in your .env.local file\n' +
          '2. Make sure the key starts with "sk-proj-" (new OpenAI format)\n' +
          '3. Verify the key is valid at https://platform.openai.com/account/api-keys\n' +
          '4. Ensure your OpenAI account has billing enabled\n' +
          '5. Restart your dev server after adding/updating the key'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromAnalysis = (type: 'kpis' | 'metrics' | 'dimensions', itemNames: string[]) => {
    setItemsInAnalysis(prev => ({
      ...prev,
      [type]: prev[type].filter(item => !itemNames.includes(item.name)),
    }));
  };

  const handleAddToAnalysis = (type: 'kpi' | 'metric' | 'dimension', item: Suggestion) => {
    // Track selected KPIs for dashboard/insights generation
    if (type === 'kpi') {
      setSelectedKPIs(prev => [...new Set([...prev, item.name])]);
    }
    
    // Add item to analysis recap
    const itemData = { name: item.name, description: item.description, category: item.category, tags: item.tags };
    setItemsInAnalysis(prev => {
      const typeKey = `${type}s` as 'kpis' | 'metrics' | 'dimensions';
      const existing = prev[typeKey].find(i => i.name === item.name);
      if (existing) return prev; // Already added
      
      return {
        ...prev,
        [typeKey]: [...prev[typeKey], itemData],
      };
    });
  };

  const handleLoadAdditional = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/additional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          analyticsSolution,
          existingSuggestions: suggestions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get additional suggestions');
      }

      const data = await response.json();
      setAdditionalSuggestions({
        kpis: data.kpis || [],
        metrics: data.metrics || [],
        dimensions: data.dimensions || [],
      });
      setStep(3); // Step 3 is now Dashboards (was Step 4)
    } catch (error: any) {
      console.error('Error loading additional:', error);
      alert(error.message || 'Failed to get additional suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Generate insights (called from Step 2 and Step 3 "Generate More" button)
  const handleGenerateMoreInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          analyticsSolution,
          aiExpanded,
          itemsInAnalysis, // Pass selected KPIs, Metrics, and Dimensions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get insights');
      }

      const data = await response.json();
      // Append new insights to existing ones (for "Generate More" functionality)
      setInsights((prev) => [...prev, ...(data.insights || [])]);
    } catch (error: any) {
      console.error('Error generating insights:', error);
      alert(error.message || 'Failed to get insights');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboards based on selected insights (Step 4)
  const handleLoadDashboards = async () => {
    if (selectedInsights.size === 0) {
      alert('Please select at least one insight before viewing dashboard suggestions');
      return;
    }

    setLoading(true);
    try {
      // Convert selected insight IDs to full insight objects
      const selectedInsightsArray = Array.from(selectedInsights)
        .map(id => insights.find(i => i.id === id))
        .filter(Boolean);

      const response = await fetch('/api/ai/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements,
          analyticsSolution,
          selectedInsights: selectedInsightsArray,
          aiExpanded,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get dashboard suggestions');
      }

      const data = await response.json();
      setDashboards(data.dashboards || []);
      setStep(4); // Step 4 is Dashboards (after Insights which is Step 3)
    } catch (error: any) {
      console.error('Error loading dashboards:', error);
      alert(error.message || 'Failed to get dashboard suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for Step 2
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
  
  const handleBulkAddToAnalysis = async () => {
    // Add selected KPIs to selectedKPIs list (for dashboard/insights)
    const kpiNames: string[] = [];
    selectedSuggested.kpis.forEach(name => kpiNames.push(name));
    
    setSelectedKPIs(prev => {
      const combined = [...new Set([...prev, ...kpiNames])];
      return combined;
    });
    
    // Submit new items to Supabase if they don't exist
    const itemsToSubmit: Array<{ type: 'kpi' | 'metric' | 'dimension'; item: Suggestion }> = [];
    
    selectedSuggested.kpis.forEach(kpiName => {
      if (newItems.kpis.has(kpiName)) {
        const item = suggestions.kpis.find(k => k.name === kpiName);
        if (item) itemsToSubmit.push({ type: 'kpi', item });
      }
    });
    
    selectedSuggested.metrics.forEach(metricName => {
      if (newItems.metrics.has(metricName)) {
        const item = suggestions.metrics.find(m => m.name === metricName);
        if (item) itemsToSubmit.push({ type: 'metric', item });
      }
    });
    
    selectedSuggested.dimensions.forEach(dimName => {
      if (newItems.dimensions.has(dimName)) {
        const item = suggestions.dimensions.find(d => d.name === dimName);
        if (item) itemsToSubmit.push({ type: 'dimension', item });
      }
    });
    
    // Submit new items to Supabase
    if (itemsToSubmit.length > 0 && user) {
      setLoading(true);
      try {
        const response = await fetch('/api/ai/submit-new-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: itemsToSubmit,
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          // Track submitted items
          const submittedNames = {
            kpis: new Set<string>(),
            metrics: new Set<string>(),
            dimensions: new Set<string>(),
          };
          
          itemsToSubmit.forEach(({ type, item }) => {
            if (type === 'kpi') submittedNames.kpis.add(item.name);
            else if (type === 'metric') submittedNames.metrics.add(item.name);
            else if (type === 'dimension') submittedNames.dimensions.add(item.name);
          });
          
          setSubmittedItems(prev => ({
            kpis: new Set([...prev.kpis, ...submittedNames.kpis]),
            metrics: new Set([...prev.metrics, ...submittedNames.metrics]),
            dimensions: new Set([...prev.dimensions, ...submittedNames.dimensions]),
          }));
        }
      } catch (error) {
        console.error('Error submitting new items:', error);
        // Continue even if submission fails - user can manually add later
      } finally {
        setLoading(false);
      }
    }
    
    // Add all selected items to analysis recap
    setItemsInAnalysis(prev => ({
      kpis: [
        ...prev.kpis,
        ...suggestions.kpis.filter(kpi => selectedSuggested.kpis.has(kpi.name))
          .map(kpi => ({ name: kpi.name, description: kpi.description, category: kpi.category, tags: kpi.tags }))
      ].filter((item, index, self) => index === self.findIndex(t => t.name === item.name)),
      metrics: [
        ...prev.metrics,
        ...suggestions.metrics.filter(metric => selectedSuggested.metrics.has(metric.name))
          .map(metric => ({ name: metric.name, description: metric.description, category: metric.category, tags: metric.tags }))
      ].filter((item, index, self) => index === self.findIndex(t => t.name === item.name)),
      dimensions: [
        ...prev.dimensions,
        ...suggestions.dimensions.filter(dim => selectedSuggested.dimensions.has(dim.name))
          .map(dim => ({ name: dim.name, description: dim.description, category: dim.category, tags: dim.tags }))
      ].filter((item, index, self) => index === self.findIndex(t => t.name === item.name)),
    }));
    
    // Clear selections after adding
    setSelectedSuggested({
      kpis: new Set(),
      metrics: new Set(),
      dimensions: new Set(),
    });
  };
  
  const toggleItemToRemove = (type: 'kpis' | 'metrics' | 'dimensions', itemName: string) => {
    setSelectedItemsToRemove(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return { ...prev, [type]: newSet };
    });
  };
  
  const handleRemoveSelectedItems = () => {
    setItemsInAnalysis(prev => ({
      kpis: prev.kpis.filter(item => !selectedItemsToRemove.kpis.has(item.name)),
      metrics: prev.metrics.filter(item => !selectedItemsToRemove.metrics.has(item.name)),
      dimensions: prev.dimensions.filter(item => !selectedItemsToRemove.dimensions.has(item.name)),
    }));
    
    // Also remove from selectedKPIs if removed
    setSelectedKPIs(prev => prev.filter(kpi => !selectedItemsToRemove.kpis.has(kpi)));
    
    // Clear selection
    setSelectedItemsToRemove({
      kpis: new Set(),
      metrics: new Set(),
      dimensions: new Set(),
    });
  };
  
  const handleClearList = () => {
    setSelectedSuggested({
      kpis: new Set(),
      metrics: new Set(),
      dimensions: new Set(),
    });
  };

  const handleSaveAnalysis = async () => {
    if (!user) {
      alert('Please log in to save your analysis');
      return;
    }

    setSavingAnalysis(true);
    try {
      const response = await fetch('/api/ai/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsInAnalysis,
          dashboards,
          insights,
          requirements,
          analyticsSolution,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save analysis');
      }

      const result = await response.json();
      alert(`Analysis saved successfully! ${result.savedItems} items added to your analysis.`);
    } catch (error: any) {
      console.error('Error saving analysis:', error);
      alert(error.message || 'Failed to save analysis. Please try again.');
    } finally {
      setSavingAnalysis(false);
    }
  };
  
  const showTooltip = (e: React.MouseEvent, item: Suggestion | { name: string; description?: string; category?: string; tags?: string[] }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.right + 10,
      y: rect.top,
      content: (
        <div style={{ padding: '0.75rem', maxWidth: '300px' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>{item.name}</div>
          {item.description && (
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: '0.5rem' }}>
              {item.description}
            </div>
          )}
          {item.category && (
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.25rem' }}>
              <strong>Category:</strong> {item.category}
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)' }}>
              <strong>Tags:</strong> {Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
            </div>
          )}
        </div>
      ),
    });
  };
  
  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  };
  
  const addItemFromExisting = (type: 'kpis' | 'metrics' | 'dimensions', item: typeof existingItems.kpis[0]) => {
    const suggestion: Suggestion = {
      name: item.name,
      description: item.description || '',
      category: item.category || undefined,
      tags: item.tags || [],
    };
    
    // Add to suggestions
    setSuggestions(prev => ({
      ...prev,
      [type]: [...prev[type], suggestion],
    }));
    
    // Also add directly to analysis
    const itemType = type.slice(0, -1) as 'kpi' | 'metric' | 'dimension';
    handleAddToAnalysis(itemType, suggestion);
    
    // Track KPI for dashboards
    if (type === 'kpis') {
      setSelectedKPIs(prev => [...new Set([...prev, item.name])]);
    }
  };
  
  // Filter existing items based on search
  const filteredExistingItems = {
    kpis: existingItems.kpis.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    metrics: existingItems.metrics.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    dimensions: existingItems.dimensions.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  };
  


  return (
    <>
      {/* Loading Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1.2);
            }
          }
        `
      }} />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          AI Analyst
        </h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Get personalized KPI recommendations based on your business requirements and analytics solution
        </p>
      </div>

      {/* Progress Steps */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '3rem',
          position: 'relative',
        }}
      >
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
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
            <div
              style={{
                fontSize: '0.75rem',
                textAlign: 'center',
                color: step >= num ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
              }}
            >
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

      {/* Loading Overlay */}
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
            {/* Animated Spinner */}
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
            
            {/* Loading Text */}
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: 'var(--ifm-font-color-base)',
              }}
            >
              Analyzing Your Requirements
            </h3>
            
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--ifm-color-emphasis-700)',
                marginBottom: '1.5rem',
              }}
            >
              Our AI is processing your business requirements and generating {kpiCount} personalized KPIs with proportional Metrics and Dimensions...
            </p>
            
            {/* Animated Dots */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
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

      {/* Step Content */}
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
        )}
        
        {/* Old inline Step 1 rendering - removed, replaced with component above */}
        {false && step === 1 && (
          <div>
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ifm-font-color-base)', letterSpacing: '-0.02em' }}>
                Step 1: Business Requirements
              </h2>
              <p style={{ margin: 0, color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                Select your analytics solution and describe your business requirements. Our AI will
                analyze your needs and suggest relevant KPIs, Metrics, and Dimensions specific to your chosen platform.
              </p>
            </div>

            {/* Analytics Solution and KPI Count - Side by Side */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Analytics Solution Dropdown */}
              <div style={{ flexShrink: 0, position: 'relative' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: 'var(--ifm-font-color-base)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Analytics Solution <span style={{ color: 'var(--ifm-color-danger)' }}>*</span>
                </label>
                <select
                  value={analyticsSolution}
                  onChange={(e) => setAnalyticsSolution(e.target.value as AnalyticsSolution)}
                  style={{
                    padding: '0.875rem 2.5rem 0.875rem 1rem',
                    border: '2px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '12px',
                    minWidth: '280px',
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.15)';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="Google Analytics (GA4)">Google Analytics (GA4)</option>
                  <option value="Adobe Analytics">Adobe Analytics</option>
                  <option value="Adobe Customer Journey Analytics">Adobe Customer Journey Analytics</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              {/* Number of KPIs Input */}
              <div style={{ flexShrink: 0, width: '140px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: 'var(--ifm-font-color-base)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Number of KPIs
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={kpiCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value >= 1 && value <= 50) {
                      setKpiCount(value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    border: '2px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.15)';
                    e.currentTarget.style.outline = 'none';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* KPI Count Helper Text */}
            <div style={{ marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--ifm-color-emphasis-600)',
                  margin: 0,
                  lineHeight: '1.5',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ fontSize: '1rem' }}>💡</span>
                <span>More KPIs require longer processing time. The AI will generate proportional Metrics and Dimensions automatically. <strong>Recommended: 5-10 KPIs</strong></span>
              </p>
            </div>

            {/* Requirements Textarea */}
            <div style={{ marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--ifm-font-color-base)',
                  letterSpacing: '0.01em',
                }}
              >
                Business Requirements <span style={{ color: 'var(--ifm-color-danger)' }}>*</span>
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Example: I need to track e-commerce performance, including conversion rates, cart abandonment, and customer lifetime value. I want to measure both website and mobile app behavior, segment by user demographics, and track marketing campaign effectiveness."
                style={{
                  width: '100%',
                  minHeight: '180px',
                  padding: '1.125rem',
                  border: '2px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  lineHeight: '1.6',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-400)';
                }}
                onMouseLeave={(e) => {
                  if (e.currentTarget !== document.activeElement) {
                    e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--ifm-color-primary-rgb), 0.15)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={handleAnalyze}
                disabled={loading || !requirements.trim() || !analyticsSolution}
                style={{
                  padding: '0.875rem 2.5rem',
                  backgroundColor:
                    loading || !requirements.trim() || !analyticsSolution
                      ? 'var(--ifm-color-emphasis-300)'
                      : 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading || !requirements.trim() || !analyticsSolution ? 'not-allowed' : 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease',
                  boxShadow: loading || !requirements.trim() || !analyticsSolution
                    ? 'none'
                    : '0 4px 12px rgba(var(--ifm-color-primary-rgb), 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!loading && requirements.trim() && analyticsSolution) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(var(--ifm-color-primary-rgb), 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && requirements.trim() && analyticsSolution) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--ifm-color-primary-rgb), 0.3)';
                  }
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '18px',
                        height: '18px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    Analyzing...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>✨</span>
                    Analyze & Get Suggestions
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <Step2ExpandedRequirements
            userRequirement={requirements}
            aiExpanded={aiExpanded}
            editingAiExpanded={editingAiExpanded}
            setEditingAiExpanded={setEditingAiExpanded}
            setAiExpanded={setAiExpanded}
            suggestions={suggestions}
            existingItems={existingItems}
            itemsInAnalysis={itemsInAnalysis}
            onAddToAnalysis={handleAddToAnalysis}
            onAddExistingToAnalysis={addItemFromExisting}
            onRemoveFromAnalysis={handleRemoveFromAnalysis}
            onNext={async () => {
              // Load insights initially if not loaded, then move to Step 3
              if (insights.length === 0) {
                setLoading(true);
                try {
                  const response = await fetch('/api/ai/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requirements,
                      analyticsSolution,
                      aiExpanded,
                    }),
                  });

                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to get insights');
                  }

                  const data = await response.json();
                  setInsights(data.insights || []);
                  setStep(3); // Move to Step 3 (Insights)
                } catch (error: any) {
                  console.error('Error loading insights:', error);
                  alert(error.message || 'Failed to get insights');
                } finally {
                  setLoading(false);
                }
              } else {
                setStep(3); // Move to Step 3 (Insights)
              }
            }}
          />
        )}
        
        {/* Old inline Step 2 rendering - removed, replaced with component above */}
        {false && step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Step 2: KPI Suggestions
            </h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--ifm-color-emphasis-700)' }}>
              Based on your requirements for {analyticsSolution}, here are AI-generated suggestions:
            </p>

            {/* 4-Column Layout */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr 1fr 1fr',
                gap: '1.5rem',
                marginTop: '1.5rem',
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
                              onClick={() => addItemFromExisting(itemType, item)}
                              onMouseEnter={(e) => showTooltip(e, item)}
                              onMouseLeave={hideTooltip}
                            >
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addItemFromExisting(itemType, item);
                                }}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: 'var(--ifm-color-primary)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  marginLeft: '0.5rem',
                                }}
                              >
                                Add
                              </button>
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
              <div>
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
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: isNew ? '#fff4e6' : 'white',
                            borderRadius: '6px',
                            border: `1px solid ${isNew ? '#ffa500' : 'var(--ifm-color-emphasis-200)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            position: 'relative',
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
                        <strong>💡 Note:</strong> New KPIs marked above will be submitted to OpenKPIs repository when you "Add to Analysis". They'll be created as draft items for editor review.
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
              <div>
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
                </h3>
                {suggestions.dimensions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {suggestions.dimensions.map((dimension, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid var(--ifm-color-emphasis-200)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
                    No Dimensions suggested yet
                  </p>
                )}
              </div>

              {/* Column 4: Suggested Metrics */}
              <div>
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
                </h3>
                {suggestions.metrics.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {suggestions.metrics.map((metric, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'white',
                          borderRadius: '6px',
                          border: '1px solid var(--ifm-color-emphasis-200)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
                    No Metrics suggested yet
                  </p>
                )}
              </div>
            </div>

            {/* Bulk Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleClearList}
                disabled={
                  selectedSuggested.kpis.size === 0 &&
                  selectedSuggested.metrics.size === 0 &&
                  selectedSuggested.dimensions.size === 0
                }
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  cursor:
                    selectedSuggested.kpis.size === 0 &&
                    selectedSuggested.metrics.size === 0 &&
                    selectedSuggested.dimensions.size === 0
                      ? 'not-allowed'
                      : 'pointer',
                  backgroundColor: 'white',
                  color: 'var(--ifm-color-emphasis-700)',
                  opacity:
                    selectedSuggested.kpis.size === 0 &&
                    selectedSuggested.metrics.size === 0 &&
                    selectedSuggested.dimensions.size === 0
                      ? 0.5
                      : 1,
                }}
              >
                Clear List
              </button>
              <button
                onClick={handleBulkAddToAnalysis}
                disabled={
                  selectedSuggested.kpis.size === 0 &&
                  selectedSuggested.metrics.size === 0 &&
                  selectedSuggested.dimensions.size === 0
                }
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor:
                    selectedSuggested.kpis.size === 0 &&
                    selectedSuggested.metrics.size === 0 &&
                    selectedSuggested.dimensions.size === 0
                      ? 'var(--ifm-color-emphasis-300)'
                      : 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor:
                    selectedSuggested.kpis.size === 0 &&
                    selectedSuggested.metrics.size === 0 &&
                    selectedSuggested.dimensions.size === 0
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Add to Analysis ({selectedSuggested.kpis.size + selectedSuggested.metrics.size + selectedSuggested.dimensions.size})
              </button>
            </div>

            {/* Analysis Recap Section */}
            {(itemsInAnalysis.kpis.length > 0 || itemsInAnalysis.metrics.length > 0 || itemsInAnalysis.dimensions.length > 0) && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px solid var(--ifm-color-emphasis-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                    Items in Analysis
                  </h3>
                  {Array.from(selectedItemsToRemove.kpis).length > 0 ||
                   Array.from(selectedItemsToRemove.metrics).length > 0 ||
                   Array.from(selectedItemsToRemove.dimensions).length > 0 ? (
                    <button
                      onClick={handleRemoveSelectedItems}
                      type="button"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        display: 'inline-block',
                        minWidth: 'auto',
                      }}
                    >
                      Remove Selected ({Array.from(selectedItemsToRemove.kpis).length + Array.from(selectedItemsToRemove.metrics).length + Array.from(selectedItemsToRemove.dimensions).length})
                    </button>
                  ) : null}
                </div>
                
                {/* Grouped by Item Type */}
                {(['kpis', 'metrics', 'dimensions'] as const).map((type) => {
                  const items = itemsInAnalysis[type];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={type} style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        marginBottom: '0.75rem',
                        color: 'var(--ifm-color-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)} ({items.length})
                      </h4>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                        gap: '0.75rem' 
                      }}>
                        {items.map((item, index) => (
                          <div
                            key={index}
                            style={{
                              padding: '0.875rem',
                              backgroundColor: selectedItemsToRemove[type].has(item.name) 
                                ? 'var(--ifm-color-emphasis-100)' 
                                : 'white',
                              borderRadius: '8px',
                              border: `2px solid ${selectedItemsToRemove[type].has(item.name) ? 'var(--ifm-color-danger)' : 'var(--ifm-color-emphasis-200)'}`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedItemsToRemove[type].has(item.name)}
                              onChange={() => toggleItemToRemove(type, item.name)}
                              style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                marginTop: '2px',
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                {item.name}
                              </div>
                              {item.description && (
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  color: 'var(--ifm-color-emphasis-600)',
                                  lineHeight: '1.4',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                }}
              >
                Back
              </button>
              <button
                onClick={handleLoadDashboards}
                disabled={loading || (itemsInAnalysis.kpis.length === 0 && itemsInAnalysis.metrics.length === 0 && itemsInAnalysis.dimensions.length === 0 && selectedKPIs.length === 0)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading || (itemsInAnalysis.kpis.length === 0 && itemsInAnalysis.metrics.length === 0 && itemsInAnalysis.dimensions.length === 0 && selectedKPIs.length === 0) ? 'var(--ifm-color-emphasis-300)' : 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || (itemsInAnalysis.kpis.length === 0 && itemsInAnalysis.metrics.length === 0 && itemsInAnalysis.dimensions.length === 0 && selectedKPIs.length === 0) ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Loading...' : 'Next: Dashboard Suggestions'}
              </button>
            </div>

            {/* Tooltip */}
            {tooltip.visible && tooltip.content && (
              <div
                style={{
                  position: 'fixed',
                  left: `${tooltip.x}px`,
                  top: `${tooltip.y}px`,
                  backgroundColor: 'white',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  maxWidth: '350px',
                }}
              >
                {tooltip.content}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <Step3Insights
            insights={insights}
            selectedInsights={selectedInsights}
            setSelectedInsights={setSelectedInsights}
            aiExpanded={aiExpanded}
            requirements={requirements}
            analyticsSolution={analyticsSolution}
            loading={loading}
            onGenerateMore={handleGenerateMoreInsights}
            onSaveAnalysis={handleSaveAnalysis}
            onNext={() => handleLoadDashboards()}
          />
        )}

        {/* OLD STEP 3 CODE - REMOVED - REPLACED WITH Step3Insights COMPONENT ABOVE */}
        {false && step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              Step 3: Dashboard Configuration Suggestions
            </h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--ifm-color-emphasis-700)' }}>
              Suggested dashboard configurations for your selected KPIs:
            </p>

            {dashboards.length > 0 ? (
              <div>
                {/* Dashboard Tabs */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginBottom: '1.5rem',
                  borderBottom: '2px solid var(--ifm-color-emphasis-200)',
                  overflowX: 'auto',
                }}>
                  {dashboards.map((dashboard, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveDashboardTab(index)}
                      type="button"
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        borderBottom: activeDashboardTab === index 
                          ? '3px solid var(--ifm-color-primary)' 
                          : '3px solid transparent',
                        backgroundColor: 'transparent',
                        color: activeDashboardTab === index 
                          ? 'var(--ifm-color-primary)' 
                          : 'var(--ifm-color-emphasis-700)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: activeDashboardTab === index ? 600 : 400,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {dashboard.name}
                    </button>
                  ))}
                </div>

                {/* Active Dashboard Content */}
                {dashboards.map((dashboard, index) => 
                  index === activeDashboardTab && (
                  <div
                    key={index}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid var(--ifm-color-emphasis-200)',
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                      {dashboard.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--ifm-color-emphasis-600)',
                        marginBottom: '1rem',
                        lineHeight: '1.5',
                      }}
                    >
                      {dashboard.description}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ fontSize: '0.875rem' }}>KPIs:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {dashboard.kpis.map((kpi: any, kpiIndex: number) => (
                          <span
                            key={kpiIndex}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: 'var(--ifm-color-emphasis-100)',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: 'var(--ifm-color-emphasis-700)',
                            }}
                          >
                            {kpi}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Dashboard Visualization Preview */}
                    <div style={{ 
                      marginTop: '1.5rem',
                      padding: '1rem',
                      backgroundColor: 'var(--ifm-color-emphasis-50)',
                      borderRadius: '8px',
                      border: '1px dashed var(--ifm-color-emphasis-300)',
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase' }}>
                        Dashboard Preview
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: dashboard.layout === '2-column' ? '1fr 1fr' : 
                                           dashboard.layout === '3-column' ? '1fr 1fr 1fr' : '1fr',
                        gap: '0.75rem',
                      }}>
                        {dashboard.visualization.slice(0, 4).map((viz: string, vizIndex: number) => {
                          // Render placeholder based on visualization type
                          if (viz.toLowerCase().includes('chart') || viz.toLowerCase().includes('line') || viz.toLowerCase().includes('bar')) {
                            return (
                              <div key={vizIndex} style={{
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid var(--ifm-color-emphasis-200)',
                                minHeight: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative',
                              }}>
                                <svg width="100%" height="140" viewBox="0 0 120 140" style={{ overflow: 'visible' }}>
                                  {/* Grid lines */}
                                  {[0, 20, 40, 60, 80, 100].map((y, i) => (
                                    <line key={i} x1="0" y1={y + 20} x2="120" y2={y + 20} stroke="var(--ifm-color-emphasis-200)" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                                  ))}
                                  {/* Y-axis */}
                                  <line x1="25" y1="10" x2="25" y2="120" stroke="var(--ifm-color-emphasis-400)" strokeWidth="2" />
                                  {/* X-axis */}
                                  <line x1="25" y1="120" x2="120" y2="120" stroke="var(--ifm-color-emphasis-400)" strokeWidth="2" />
                                  {/* Bar chart bars with gradient effect */}
                                  <rect x="30" y="90" width="15" height="30" fill="var(--ifm-color-primary)" opacity="0.8" rx="2" />
                                  <rect x="48" y="70" width="15" height="50" fill="var(--ifm-color-primary)" opacity="0.8" rx="2" />
                                  <rect x="66" y="50" width="15" height="70" fill="var(--ifm-color-primary)" opacity="0.8" rx="2" />
                                  <rect x="84" y="80" width="15" height="40" fill="var(--ifm-color-primary)" opacity="0.8" rx="2" />
                                  {/* Y-axis labels */}
                                  <text x="20" y="125" fontSize="8" fill="var(--ifm-color-emphasis-600)" textAnchor="end">0</text>
                                  <text x="20" y="100" fontSize="8" fill="var(--ifm-color-emphasis-600)" textAnchor="end">50</text>
                                  <text x="20" y="75" fontSize="8" fill="var(--ifm-color-emphasis-600)" textAnchor="end">100</text>
                                </svg>
                                <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem' }}>
                                  {viz}
                                </div>
                              </div>
                            );
                          } else if (viz.toLowerCase().includes('table')) {
                            return (
                              <div key={vizIndex} style={{
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid var(--ifm-color-emphasis-200)',
                                minHeight: '150px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              }}>
                                <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '2px solid var(--ifm-color-emphasis-300)', backgroundColor: 'var(--ifm-color-emphasis-50)' }}>
                                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)' }}>Metric</th>
                                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)' }}>Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(dashboard.kpis.slice(0, 3) || ['KPI 1', 'KPI 2', 'KPI 3']).map((row: string, i: number) => (
                                      <tr key={i} style={{ borderBottom: '1px solid var(--ifm-color-emphasis-100)' }}>
                                        <td style={{ padding: '0.75rem', color: 'var(--ifm-color-emphasis-700)' }}>{row}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', color: 'var(--ifm-color-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                                          {Math.floor(Math.random() * 10000).toLocaleString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div style={{ fontSize: '0.7rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.75rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  {viz}
                                </div>
                              </div>
                            );
                          } else if (viz.toLowerCase().includes('scorecard') || viz.toLowerCase().includes('metric')) {
                            return (
                              <div key={vizIndex} style={{
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid var(--ifm-color-emphasis-200)',
                                minHeight: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--ifm-color-primary)', marginBottom: '0.5rem' }}>
                                  {Math.floor(Math.random() * 1000)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--ifm-color-emphasis-600)', textAlign: 'center' }}>
                                  {dashboard.kpis[vizIndex] || 'KPI'}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--ifm-color-emphasis-500)', marginTop: '0.25rem' }}>
                                  {viz}
                                </div>
                              </div>
                            );
                          } else {
                            // Generic widget
                            return (
                              <div key={vizIndex} style={{
                                padding: '1rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                border: '1px solid var(--ifm-color-emphasis-200)',
                                minHeight: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                color: 'var(--ifm-color-emphasis-500)',
                              }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                <div style={{ fontSize: '0.7rem', textAlign: 'center' }}>{viz}</div>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--ifm-color-emphasis-200)' }}>
                      <div>
                        <strong>Layout:</strong> {dashboard.layout}
                      </div>
                      <div>
                        <strong>Widgets:</strong> {dashboard.visualization.length}
                      </div>
                    </div>
                  </div>
                  )
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
                No dashboard suggestions available. Please select KPIs first.
              </p>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  handleGenerateMoreInsights();
                  setStep(3);
                }}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading ? 'var(--ifm-color-emphasis-300)' : 'var(--ifm-color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Loading...' : 'Next: Insights'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <Step4Dashboards
            dashboards={dashboards}
            loading={loading}
            onSaveAnalysis={handleSaveAnalysis}
          />
        )}

        {/* OLD STEP 4 CODE - REMOVED - REPLACED WITH Step4Dashboards COMPONENT ABOVE */}
      </div>
    </main>
    </>
  );
}
