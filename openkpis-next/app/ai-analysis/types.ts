export type AnalyticsSolution = 'Adobe Analytics' | 'Google Analytics (GA4)' | 'Adobe Customer Journey Analytics' | 'Custom';

export interface Suggestion {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

export interface AIExpanded {
  goal: string;
  questions: string[];
  scope: string[];
  time_horizon: string;
  breakdowns: string[];
  constraints: string[];
}

export interface GroupedInsight {
  id: string;
  group: string; // Acquisition, Engagement, Conversion, Monetization, Retention
  title: string;
  rationale: string;
  data_requirements: string[];
  chart_hint: string;
  signal_strength: 'low' | 'medium' | 'high';
}

export interface DashboardSection {
  title: string;
  insights_covered: string[];
  tiles: Array<{
    metric: string;
    by: string[];
    chart: string;
  }>;
}

export interface DashboardSuggestion {
  title: string;
  purpose: string;
  sections: DashboardSection[];
  layout_notes: string;
  markdown?: string;
}

export interface ExistingItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  slug: string;
}

export interface ItemsInAnalysis {
  kpis: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
  metrics: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
  dimensions: Array<{ name: string; description?: string; category?: string; tags?: string[] }>;
}
