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
  measure_type?: string;
  aggregation_window?: string;
  
  // Platform Implementation
  ga4_event?: string;
  adobe_event?: string;
  
  // Data Mappings
  w3_data_layer?: string; // JSON (lowercase to match DB)
  ga4_data_layer?: string; // JSON (lowercase to match DB)
  adobe_client_data_layer?: string; // JSON (lowercase to match DB)
  xdm_mapping?: string; // JSON
  
  // SQL
  sql_query?: string;
  
  // Documentation
  calculation_notes?: string;
  business_use_case?: string; // lowercase to match DB
  
  // Additional fields
  dependencies?: string; // JSONB in DB, stored as JSON string
  source_data?: string; // lowercase to match DB
  report_attributes?: string;
  dashboard_usage?: string[];
  segment_eligibility?: string;
  related_kpis?: string[];
  
  // Governance
  status: 'draft' | 'published' | 'archived' | 'rejected';
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
  // formula removed - Events use event_serialization instead
  category?: string;
  tags?: string[];
  
  // Business Context
  industry?: string;
  priority?: string;
  core_area?: string;
  scope?: string;
  
  // Technical
  event_type?: 'standard' | 'custom';
  aggregation_window?: string;
  event_serialization?: string; // Event serialization format (replaces formula)
  
  // Platform Implementation
  ga4_event?: string;
  adobe_event?: string;
  
  // Data Mappings
  w3_data_layer?: string; // JSON (lowercase to match DB)
  ga4_data_layer?: string; // JSON (lowercase to match DB)
  adobe_client_data_layer?: string; // JSON (lowercase to match DB)
  xdm_mapping?: string; // JSON
  parameters?: string; // JSON - key/value attributes expected with the event
  
  // Documentation
  calculation_notes?: string;
  business_use_case?: string; // lowercase to match DB
  
  // Additional fields
  dependencies?: string; // JSONB in DB, stored as JSON string
  source_data?: string; // lowercase to match DB
  report_attributes?: string;
  dashboard_usage?: string[];
  segment_eligibility?: string;
  related_dimensions?: string[]; // Changed from related_kpis
  derived_dimensions?: string[]; // New field
  derived_metrics?: string[]; // New field
  derived_kpis?: string[]; // New field
  
  // Governance
  status: 'draft' | 'published' | 'archived' | 'rejected';
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

export interface Dimension {
  id: string;
  slug: string;
  name: string;
  description?: string;
  formula?: string;
  category?: string;
  tags?: string[];
  
  // Business Context
  industry?: string;
  priority?: string;
  core_area?: string;
  scope?: string;
  
  // Technical
  data_type?: 'string' | 'number' | 'counter' | 'boolean' | 'datetime' | 'array' | 'list';
  aggregation_window?: string;
  
  // Platform Implementation
  ga4_event?: string;
  adobe_event?: string;
  
  // Data Mappings
  w3_data_layer?: string; // JSON (lowercase to match DB)
  ga4_data_layer?: string; // JSON (lowercase to match DB)
  adobe_client_data_layer?: string; // JSON (lowercase to match DB)
  xdm_mapping?: string; // JSON
  
  // SQL
  sql_query?: string;
  
  // Documentation
  calculation_notes?: string;
  business_use_case?: string; // lowercase to match DB
  
  // Additional fields
  dependencies?: string; // JSONB in DB, stored as JSON string
  source_data?: string; // lowercase to match DB
  report_attributes?: string;
  dashboard_usage?: string[];
  segment_eligibility?: string;
  related_dimensions?: string[]; // Changed from related_kpis
  derived_dimensions?: string[]; // New field
  
  // Governance
  status: 'draft' | 'published' | 'archived' | 'rejected';
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

export interface Metric {
  id: string;
  slug: string;
  name: string;
  description?: string;
  formula?: string;
  category?: string;
  tags?: string[];
  
  // Business Context
  industry?: string;
  priority?: string;
  core_area?: string;
  scope?: string;
  
  // Technical
  measure_type?: string;
  aggregation_window?: string;
  
  // Platform Implementation
  ga4_event?: string;
  adobe_event?: string;
  
  // Data Mappings
  w3_data_layer?: string; // JSON (lowercase to match DB)
  ga4_data_layer?: string; // JSON (lowercase to match DB)
  adobe_client_data_layer?: string; // JSON (lowercase to match DB)
  xdm_mapping?: string; // JSON
  
  // SQL
  sql_query?: string;
  
  // Documentation
  calculation_notes?: string;
  business_use_case?: string; // lowercase to match DB
  
  // Additional fields
  dependencies?: string; // JSONB in DB, stored as JSON string
  source_data?: string; // lowercase to match DB
  report_attributes?: string;
  dashboard_usage?: string[];
  segment_eligibility?: string;
  related_metrics?: string[]; // Changed from related_kpis
  derived_kpis?: string[]; // New field
  
  // Governance
  status: 'draft' | 'published' | 'archived' | 'rejected';
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

