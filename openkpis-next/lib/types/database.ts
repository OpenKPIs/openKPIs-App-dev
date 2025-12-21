/**
 * Database Types
 * TypeScript types for Supabase database tables
 */

export interface KPI {
  id: string;
  slug: string;
  name: string;
  description?: string;
  formula?: string;
  category?: string;
  tags?: string[];
  
  // Business Context
  industry?: string[];
  priority?: string;
  core_area?: string;
  scope?: string;
  
  // Technical
  kpi_type?: string;
  measure_type?: string;
  measure_aggregation?: string;
  aggregation_window?: string;
  
  // Platform Implementation
  ga4_event?: string;
  adobe_event?: string;
  
  // Data Mappings
  W3_data_layer?: string; // JSON
  GA4_data_layer?: string; // JSON
  Adobe_client_data_layer?: string; // JSON
  xdm_mapping?: string; // JSON
  
  // SQL
  sql_query?: string;
  
  // Documentation
  calculation_notes?: string;
  Business_Use_Case?: string;
  
  // Additional fields
  dependencies?: string;
  Source_Data?: string;
  report_attributes?: string;
  dashboard_usage?: string;
  segment_eligibility?: string;
  related_kpis?: string[];
  
  // Governance
  status: 'draft' | 'published' | 'archived';
  validation_status?: 'unverified' | 'verified' | 'rejected';
  version?: string;
  data_sensitivity?: string;
  pii_flag?: boolean;
  
  // GitHub
  github_pr_url?: string;
  github_pr_number?: number;
  github_commit_sha?: string;
  github_file_path?: string;
  
  // Contribution
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  approved_by?: string;
  approved_at?: string;
  reviewed_by?: string[];
  reviewed_at?: string;
  publisher_id?: string;
  published_at?: string;
  
  // Metadata
  aliases?: string[];
  owner?: string;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  // ... similar fields to KPI
}

export interface Dimension {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  // ... similar fields to KPI
}

export interface Metric {
  id: string;
  slug: string;
  name: string;
  description?: string;
  formula?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  // ... similar fields to KPI
}

export interface Job {
  id: string;
  type: 'create_pr' | 'sync_content' | 'ai_analysis' | 'reindex_search';
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  attempts: number;
  max_attempts: number;
  error_message?: string;
  result?: Record<string, unknown>;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  related_item_type?: string;
  related_item_id?: string;
}

