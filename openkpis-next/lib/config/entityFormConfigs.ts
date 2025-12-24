/**
 * Entity Form Field Configurations
 * Centralized configuration for all entity edit forms
 */

import type { EntityKind } from '@/src/types/entities';

export const CATEGORIES = ['Conversion', 'Revenue', 'Engagement', 'Retention', 'Acquisition', 'Performance', 'Quality', 'Efficiency', 'Satisfaction', 'Growth', 'Other'];
export const INDUSTRIES = ['Retail', 'E-commerce', 'SaaS', 'Healthcare', 'Education', 'Finance', 'Media', 'Technology', 'Manufacturing', 'Other'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const KPI_TYPES = ['Counter', 'Rate', 'Ratio', 'Percentage', 'Average', 'Sum'];
export const DATA_TYPES = ['string', 'number', 'counter', 'boolean', 'datetime', 'array', 'list'];
export const EVENT_TYPES = ['standard', 'custom'];
export const SCOPES = ['User', 'Session', 'Event', 'Global'];
export const DATA_SENSITIVITY = ['Public', 'Internal', 'Restricted'];

export type EntityType = EntityKind;

export type FieldConfig = {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'tags' | 'dependencies' | 'semicolon-list';
  label: string;
  tab: number;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
  condition?: (entityType: EntityType) => boolean;
  style?: {
    fontFamily?: 'inherit' | 'monospace';
  };
};

export type EntityFormConfig = {
  entityType: EntityType;
  entityName: string; // Display name: "KPI", "Metric", etc.
  tabs: string[];
  fields: FieldConfig[];
  apiEndpoint: (id: string) => string;
  redirectPath: (slug: string) => string;
  backPath: (slug: string) => string;
};

// Helper to check if field should be shown
export function shouldShowField(field: FieldConfig, entityType: EntityType): boolean {
  if (!field.condition) return true;
  return field.condition(entityType);
}

// KPI Form Configuration
export const KPI_FORM_CONFIG: EntityFormConfig = {
  entityType: 'kpi',
  entityName: 'KPI',
  tabs: ['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'SQL', 'Documentation'],
  fields: [
    // Tab 0: Basic Info
    { name: 'name', type: 'text', label: 'Name', tab: 0, required: true, placeholder: 'KPI Name' },
    { name: 'description', type: 'textarea', label: 'Description', tab: 0, placeholder: 'Short definition and context', rows: 4 },
    { name: 'formula', type: 'text', label: 'Formula', tab: 0, placeholder: 'Calculation logic in plain text', condition: (t) => ['kpi', 'metric', 'dimension'].includes(t), style: { fontFamily: 'monospace' } },
    { name: 'category', type: 'select', label: 'Category', tab: 0, options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags', tab: 0, placeholder: 'Free-form labels (e.g., Engagement, Retail, Checkout)' },
    
    // Tab 1: Business Context
    { name: 'industry', type: 'select', label: 'Industry', tab: 1, options: INDUSTRIES },
    { name: 'priority', type: 'select', label: 'Priority', tab: 1, options: PRIORITIES },
    { name: 'core_area', type: 'text', label: 'Core Area', tab: 1, placeholder: 'e.g. Digital Analytics, Business Intelligence, Statistics, Data Science & AI etc.' },
    { name: 'scope', type: 'select', label: 'Scope', tab: 1, options: SCOPES },
    { name: 'related_kpis', type: 'semicolon-list', label: 'Related KPIs', tab: 1, placeholder: 'Enter KPIs separated by semicolons (e.g., add-to-cart;order;revenue)', condition: (t) => t === 'kpi' },
    { name: 'related_metrics', type: 'semicolon-list', label: 'Related Metrics', tab: 1, placeholder: 'Enter metrics separated by semicolons', condition: (t) => t === 'metric' },
    { name: 'related_dimensions', type: 'semicolon-list', label: 'Related Dimensions', tab: 1, placeholder: 'Enter dimensions separated by semicolons', condition: (t) => ['dimension', 'event'].includes(t) },
    { name: 'derived_dimensions', type: 'semicolon-list', label: 'Derived Dimensions', tab: 1, placeholder: 'Enter dimensions separated by semicolons', condition: (t) => ['dimension', 'event'].includes(t) },
    { name: 'derived_metrics', type: 'semicolon-list', label: 'Derived Metrics', tab: 1, placeholder: 'Enter metrics separated by semicolons', condition: (t) => t === 'event' },
    { name: 'derived_kpis', type: 'semicolon-list', label: 'Derived KPIs', tab: 1, placeholder: 'Enter KPIs separated by semicolons', condition: (t) => ['metric', 'event'].includes(t) },
    { name: 'source_data', type: 'text', label: 'Source Data', tab: 1, placeholder: 'Digital Analytics, Business Intelligence, ERP, CRM etc.' },
    { name: 'dependencies', type: 'dependencies', label: 'Dependencies', tab: 1 },
    { name: 'report_attributes', type: 'textarea', label: 'Report Attributes', tab: 1, placeholder: 'Attributes in GA4/Adobe reports (Dimensions, Metrics, KPIs etc.)', rows: 4 },
    { name: 'dashboard_usage', type: 'semicolon-list', label: 'Dashboard Usage', tab: 1, placeholder: 'Enter dashboards separated by semicolons (e.g., C-Suite;Merchandising;Traffic Analysis)' },
    { name: 'segment_eligibility', type: 'textarea', label: 'Segment Eligibility', tab: 1, placeholder: 'Whether entity can be used in segmentation (True/False)', rows: 4 },
    { name: 'data_sensitivity', type: 'select', label: 'Data Sensitivity', tab: 1, options: DATA_SENSITIVITY },
    { name: 'pii_flag', type: 'checkbox', label: 'Contains PII (Personally Identifiable Information)', tab: 1 },
    
    // Tab 2: Technical
    { name: 'measure_type', type: 'select', label: 'Measure Type', tab: 2, options: KPI_TYPES, condition: (t) => ['kpi', 'metric'].includes(t) },
    { name: 'data_type', type: 'select', label: 'Data Type', tab: 2, options: DATA_TYPES, condition: (t) => t === 'dimension' },
    { name: 'event_type', type: 'select', label: 'Event Type', tab: 2, options: EVENT_TYPES, condition: (t) => t === 'event' },
    { name: 'aggregation_window', type: 'text', label: 'Aggregation Window', tab: 2, placeholder: 'Which aggregation are possible (Event, Session, User, Time based - Hourly/Daily/Monthly/Yearly)' },
    
    // Tab 3: Platform Events
    { name: 'ga4_event', type: 'textarea', label: 'GA4 Event', tab: 3, placeholder: 'Google Analytics 4 event name', rows: 6, style: { fontFamily: 'monospace' } },
    { name: 'adobe_event', type: 'textarea', label: 'Adobe Event', tab: 3, placeholder: 'Adobe Analytics event name', rows: 6, style: { fontFamily: 'monospace' } },
    { name: 'parameters', type: 'textarea', label: 'Parameters', tab: 3, placeholder: 'key/value attributes expected with the event (e.g., item_id, currency, value)', rows: 8, condition: (t) => t === 'event' },
    
    // Tab 4: Data Mappings
    { name: 'w3_data_layer', type: 'textarea', label: 'W3 Data Layer', tab: 4, placeholder: 'W3C Data Layer mapping (JSON format)', rows: 8, style: { fontFamily: 'monospace' } },
    { name: 'ga4_data_layer', type: 'textarea', label: 'GA4 Data Layer', tab: 4, placeholder: 'GA4 Data Layer mapping (JSON format)', rows: 8, style: { fontFamily: 'monospace' } },
    { name: 'adobe_client_data_layer', type: 'textarea', label: 'Adobe Client Data Layer', tab: 4, placeholder: 'Adobe Client Data Layer mapping (JSON format)', rows: 8, style: { fontFamily: 'monospace' } },
    { name: 'xdm_mapping', type: 'textarea', label: 'XDM Mapping', tab: 4, placeholder: 'AEP XDM schema', rows: 8, style: { fontFamily: 'monospace' } },
    
    // Tab 5: SQL
    { name: 'sql_query', type: 'textarea', label: 'SQL Query', tab: 5, placeholder: 'Standard SQL query', rows: 15, condition: (t) => ['kpi', 'metric', 'dimension', 'event'].includes(t), style: { fontFamily: 'monospace' } },
    
    // Tab 6: Documentation
    { name: 'calculation_notes', type: 'textarea', label: 'Calculation Notes', tab: 6, placeholder: 'Specific caveats, or special considerations', rows: 8, condition: (t) => ['kpi', 'metric', 'dimension', 'event'].includes(t) },
    { name: 'business_use_case', type: 'textarea', label: 'Business Use Case', tab: 6, placeholder: 'Describe the business use case', rows: 10, condition: (t) => ['kpi', 'metric', 'dimension', 'event'].includes(t) },
  ],
  apiEndpoint: (id) => `/api/items/kpi/${id}`,
  redirectPath: (slug) => `/kpis/${slug}`,
  backPath: (slug) => `/kpis/${slug}`,
};

// Metric Form Configuration
export const METRIC_FORM_CONFIG: EntityFormConfig = {
  ...KPI_FORM_CONFIG,
  entityType: 'metric',
  entityName: 'Metric',
  tabs: ['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'SQL', 'Documentation'], // Explicitly set tabs
  fields: KPI_FORM_CONFIG.fields.map(field => {
    if (field.name === 'related_kpis') {
      return { ...field, name: 'related_metrics', label: 'Related Metrics', placeholder: 'Enter metrics separated by semicolons' };
    }
    return field;
  }),
  apiEndpoint: (id) => `/api/items/metric/${id}`,
  redirectPath: (slug) => `/metrics/${slug}`,
  backPath: (slug) => `/metrics/${slug}`,
};

// Dimension Form Configuration
export const DIMENSION_FORM_CONFIG: EntityFormConfig = {
  ...KPI_FORM_CONFIG,
  entityType: 'dimension',
  entityName: 'Dimension',
  tabs: ['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'SQL', 'Documentation'], // Explicitly set tabs
  // Keep formula field for Dimensions (formula condition already includes 'dimension')
  apiEndpoint: (id) => `/api/items/dimension/${id}`,
  redirectPath: (slug) => `/dimensions/${slug}`,
  backPath: (slug) => `/dimensions/${slug}`,
};

// Event Form Configuration
export const EVENT_FORM_CONFIG: EntityFormConfig = {
  ...KPI_FORM_CONFIG,
  entityType: 'event',
  entityName: 'Event',
  tabs: ['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'Documentation'], // No SQL tab for Events
  // Override fields: Remove formula, remove SQL, add event_serialization
  fields: KPI_FORM_CONFIG.fields
    .filter(field => field.name !== 'formula' && field.name !== 'sql_query') // Remove formula and SQL fields for Events
    .concat([
      // Add Event Serialization field (new separate field for Events)
      { name: 'event_serialization', type: 'text', label: 'Event Serialization', tab: 0, placeholder: 'Event serialization format', condition: (t: EntityType) => t === 'event' },
    ]),
  apiEndpoint: (id) => `/api/items/event/${id}`,
  redirectPath: (slug) => `/events/${slug}`,
  backPath: (slug) => `/events/${slug}`,
};

// Dashboard Form Configuration (simplified - only basic fields)
export const DASHBOARD_FORM_CONFIG: EntityFormConfig = {
  entityType: 'dashboard',
  entityName: 'Dashboard',
  tabs: ['Basic Info'],
  fields: [
    { name: 'name', type: 'text', label: 'Name', tab: 0, required: true, placeholder: 'Dashboard Name' },
    { name: 'description', type: 'textarea', label: 'Description', tab: 0, placeholder: 'Brief description of the Dashboard...', rows: 4 },
    { name: 'category', type: 'select', label: 'Category', tab: 0, options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags', tab: 0, placeholder: 'Free-form labels' },
  ],
  apiEndpoint: (id) => `/api/items/dashboard/${id}`,
  redirectPath: (slug) => `/dashboards/${slug}`,
  backPath: (slug) => `/dashboards/${slug}`,
};

// Configuration map
export const ENTITY_FORM_CONFIGS: Record<EntityType, EntityFormConfig> = {
  kpi: KPI_FORM_CONFIG,
  metric: METRIC_FORM_CONFIG,
  dimension: DIMENSION_FORM_CONFIG,
  event: EVENT_FORM_CONFIG,
  dashboard: DASHBOARD_FORM_CONFIG,
};

// Get configuration for entity type
export function getEntityFormConfig(entityType: EntityType): EntityFormConfig {
  return ENTITY_FORM_CONFIGS[entityType];
}

