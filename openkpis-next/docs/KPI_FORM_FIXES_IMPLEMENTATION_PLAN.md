# KPI Form Fixes - Detailed Implementation Plan

This document outlines all changes needed to fix the Edit Form, data fetching, and KPI Details page display issues.

---

## Overview of Changes

1. Rename `measure` → `measure_type` (form label: "Measure Type")
2. Add new field `measure_aggregation`
3. Rename `ga4_implementation` → `ga4_event` and `adobe_implementation` → `adobe_event`
4. Remove `amplitude_implementation` completely
5. Fix `related_kpis` - semicolon-separated input, convert to array
6. Rename `data_layer_mapping` → `W3_data_layer`, add `GA4_data_layer` and `Adobe_client_data_layer`
7. Rename `bi_source_system` → `Source_Data` and fix saving
8. Fix saving for `dependencies`, `report_attributes`, `dashboard_usage`, `segment_eligibility`
9. Rename `details` → `Business_Use_Case`
10. Ensure all fields are displayed on detail page

---

## Phase 1: Database Schema Changes (Supabase)

### SQL Migration Script

**File to create**: `scripts/migrations/update-kpi-fields.sql`

```sql
-- 1. Rename measure to measure_type
ALTER TABLE prod_kpis RENAME COLUMN measure TO measure_type;

-- 2. Add measure_aggregation field
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS measure_aggregation TEXT;

-- 3. Rename ga4_implementation to ga4_event
ALTER TABLE prod_kpis RENAME COLUMN ga4_implementation TO ga4_event;

-- 4. Rename adobe_implementation to adobe_event
ALTER TABLE prod_kpis RENAME COLUMN adobe_implementation TO adobe_event;

-- 5. Remove amplitude_implementation column
ALTER TABLE prod_kpis DROP COLUMN IF EXISTS amplitude_implementation;

-- 6. Rename data_layer_mapping to W3_data_layer
ALTER TABLE prod_kpis RENAME COLUMN data_layer_mapping TO W3_data_layer;

-- 7. Add GA4_data_layer field
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS GA4_data_layer TEXT;

-- 8. Add Adobe_client_data_layer field
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS Adobe_client_data_layer TEXT;

-- 9. Rename bi_source_system to Source_Data
ALTER TABLE prod_kpis RENAME COLUMN bi_source_system TO Source_Data;

-- 10. Add missing fields if they don't exist
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS dependencies TEXT;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS report_attributes TEXT;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS dashboard_usage TEXT;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS segment_eligibility TEXT;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS related_kpis TEXT[];

-- 11. Rename details to Business_Use_Case
ALTER TABLE prod_kpis RENAME COLUMN details TO Business_Use_Case;

-- Add comments for documentation
COMMENT ON COLUMN prod_kpis.measure_type IS 'Type of measure used for the KPI';
COMMENT ON COLUMN prod_kpis.measure_aggregation IS 'Aggregation method for the measure';
COMMENT ON COLUMN prod_kpis.ga4_event IS 'Google Analytics 4 event name';
COMMENT ON COLUMN prod_kpis.adobe_event IS 'Adobe Analytics event name';
COMMENT ON COLUMN prod_kpis.W3_data_layer IS 'W3C Data Layer mapping (JSON format)';
COMMENT ON COLUMN prod_kpis.GA4_data_layer IS 'GA4 Data Layer mapping (JSON format)';
COMMENT ON COLUMN prod_kpis.Adobe_client_data_layer IS 'Adobe Client Data Layer mapping (JSON format)';
COMMENT ON COLUMN prod_kpis.Source_Data IS 'Source data system for the KPI';
COMMENT ON COLUMN prod_kpis.Business_Use_Case IS 'Business use case description';
COMMENT ON COLUMN prod_kpis.related_kpis IS 'Array of related KPI slugs';
```

**Execution**: Run this script in Supabase SQL Editor before making code changes.

**File Creation**: Create the file `scripts/migrations/update-kpi-fields.sql` with the above SQL content.

**Important Notes**:
- Run this migration in a test environment first
- Backup the `prod_kpis` table before running in production
- The migration is idempotent (can be run multiple times safely due to `IF NOT EXISTS` and `IF EXISTS` clauses)
- Column renames preserve existing data automatically
- New columns will be NULL for existing records

---

## Phase 2: TypeScript Type Definitions

### File: `lib/types/database.ts`

**Changes needed**:

```typescript
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
  measure_type?: string;  // CHANGED: was 'measure'
  measure_aggregation?: string;  // NEW FIELD
  aggregation_window?: string;
  
  // Platform Implementation
  ga4_event?: string;  // CHANGED: was 'ga4_implementation'
  adobe_event?: string;  // CHANGED: was 'adobe_implementation'
  // REMOVED: amplitude_implementation
  
  // Data Mappings
  W3_data_layer?: string;  // CHANGED: was 'data_layer_mapping'
  GA4_data_layer?: string;  // NEW FIELD
  Adobe_client_data_layer?: string;  // NEW FIELD
  xdm_mapping?: string; // JSON
  
  // SQL
  sql_query?: string;
  
  // Documentation
  calculation_notes?: string;
  Business_Use_Case?: string;  // CHANGED: was 'details'
  
  // Additional fields (now properly included)
  dependencies?: string;
  Source_Data?: string;  // CHANGED: was 'bi_source_system'
  report_attributes?: string;
  dashboard_usage?: string;
  segment_eligibility?: string;
  related_kpis?: string[];  // Array of KPI slugs
  
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
```

---

## Phase 3: Payload Builder (API Update Logic)

### File: `lib/services/entityUpdates.ts`

**Changes needed in `KPI_FIELDS` function**:

```typescript
const KPI_FIELDS: PayloadBuilder = (data, userHandle) => {
	const toString = (value: unknown) => (typeof value === 'string' ? value : '');
	const toStringArray = (value: unknown): string[] => {
		if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
		if (typeof value === 'string' && value.trim().length > 0) return [value.trim()];
		return [];
	};

	// Helper to convert semicolon-separated string to array
	const semicolonToArray = (value: unknown): string[] => {
		if (typeof value === 'string' && value.trim().length > 0) {
			return value.split(';')
				.map(item => item.trim())
				.filter(item => item.length > 0);
		}
		if (Array.isArray(value)) {
			return value.filter((item): item is string => typeof item === 'string');
		}
		return [];
	};

	return {
		name: toString(data.name),
		description: toString(data.description),
		formula: toString(data.formula),
		category: toString(data.category),
		tags: toStringArray(data.tags),
		industry: toStringArray(data.industry),
		priority: toString(data.priority),
		core_area: toString(data.core_area),
		scope: toString(data.scope),
		kpi_type: toString(data.kpi_type),
		measure_type: toString(data.measure_type),  // CHANGED: was 'measure'
		measure_aggregation: toString(data.measure_aggregation),  // NEW
		aggregation_window: toString(data.aggregation_window),
		ga4_event: toString(data.ga4_event),  // CHANGED: was 'ga4_implementation'
		adobe_event: toString(data.adobe_event),  // CHANGED: was 'adobe_implementation'
		// REMOVED: amplitude_implementation
		W3_data_layer: toString(data.W3_data_layer),  // CHANGED: was 'data_layer_mapping'
		GA4_data_layer: toString(data.GA4_data_layer),  // NEW
		Adobe_client_data_layer: toString(data.Adobe_client_data_layer),  // NEW
		xdm_mapping: toString(data.xdm_mapping),
		sql_query: toString(data.sql_query),
		calculation_notes: toString(data.calculation_notes),
		Business_Use_Case: toString(data.Business_Use_Case),  // CHANGED: was 'details'
		
		// Now properly included:
		dependencies: toString(data.dependencies),
		Source_Data: toString(data.Source_Data),  // CHANGED: was 'bi_source_system'
		report_attributes: toString(data.report_attributes),
		dashboard_usage: toString(data.dashboard_usage),
		segment_eligibility: toString(data.segment_eligibility),
		related_kpis: semicolonToArray(data.related_kpis),  // Convert semicolon-separated to array
		
		status: 'draft',
		last_modified_by: userHandle,
		last_modified_at: new Date().toISOString(),
	};
};
```

---

## Phase 4: Edit Form Component

### File: `app/(content)/kpis/[slug]/edit/KPIEditClient.tsx`

### 4.1 Update FormData Type

```typescript
type FormData = {
  name: string;
  description: string;
  formula: string;
  category: string;
  tags: string[];
  industry: string;
  priority: string;
  core_area: string;
  scope: string;
  kpi_type: string;
  measure_type: string;  // CHANGED: was 'measure'
  measure_aggregation: string;  // NEW
  aggregation_window: string;
  ga4_event: string;  // CHANGED: was 'ga4_implementation'
  adobe_event: string;  // CHANGED: was 'adobe_implementation'
  // REMOVED: amplitude_implementation
  W3_data_layer: string;  // CHANGED: was 'data_layer_mapping'
  GA4_data_layer: string;  // NEW
  Adobe_client_data_layer: string;  // NEW
  xdm_mapping: string;
  dependencies: string;
  Source_Data: string;  // CHANGED: was 'bi_source_system'
  report_attributes: string;
  dashboard_usage: string;
  segment_eligibility: string;
  related_kpis: string;  // CHANGED: now string (semicolon-separated) instead of array
  sql_query: string;
  calculation_notes: string;
  Business_Use_Case: string;  // CHANGED: was 'details'
};
```

### 4.2 Update AdditionalKpiFields Type

```typescript
type AdditionalKpiFields = {
  dependencies?: string | null;
  Source_Data?: string | null;  // CHANGED: was 'bi_source_system'
  report_attributes?: string | null;
  dashboard_usage?: string | null;
  segment_eligibility?: string | null;
  measure_type?: string | null;  // CHANGED: was 'measure'
  measure_aggregation?: string | null;  // NEW
  related_kpis?: string[] | string | null;  // Can be array or string
};
```

### 4.3 Update initialFormState

```typescript
const initialFormState: FormData = useMemo(
  () => ({
    name: kpi.name || '',
    description: kpi.description || '',
    formula: kpi.formula || '',
    category: kpi.category || '',
    tags: kpi.tags ?? [],
    industry: kpi.industry?.[0] || '',
    priority: kpi.priority || '',
    core_area: kpi.core_area || '',
    scope: kpi.scope || '',
    kpi_type: kpi.kpi_type || '',
    measure_type: kpi.measure_type || '',  // CHANGED
    measure_aggregation: kpi.measure_aggregation || '',  // NEW
    aggregation_window: kpi.aggregation_window || '',
    ga4_event: kpi.ga4_event || '',  // CHANGED
    adobe_event: kpi.adobe_event || '',  // CHANGED
    // REMOVED: amplitude_implementation
    W3_data_layer: kpi.W3_data_layer || '',  // CHANGED
    GA4_data_layer: kpi.GA4_data_layer || '',  // NEW
    Adobe_client_data_layer: kpi.Adobe_client_data_layer || '',  // NEW
    xdm_mapping: kpi.xdm_mapping || '',
    dependencies: kpi.dependencies || '',
    Source_Data: kpi.Source_Data || '',  // CHANGED
    report_attributes: kpi.report_attributes || '',
    dashboard_usage: kpi.dashboard_usage || '',
    segment_eligibility: kpi.segment_eligibility || '',
    related_kpis: Array.isArray(kpi.related_kpis) 
      ? kpi.related_kpis.join(';')  // Convert array to semicolon-separated string
      : (typeof kpi.related_kpis === 'string' ? kpi.related_kpis : ''),  // NEW: handle string input
    sql_query: kpi.sql_query || '',
    calculation_notes: kpi.calculation_notes || '',
    Business_Use_Case: kpi.Business_Use_Case || '',  // CHANGED
  }),
  [kpi],
);
```

### 4.4 Update Tab 3: Technical Section

**Replace the measure field**:

```typescript
{activeTab === 2 && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>KPI Type</label>
      <select
        value={formData.kpi_type}
        onChange={(e) => setFormData((prev) => ({ ...prev, kpi_type: e.target.value }))}
        style={{...}}
      >
        <option value="">None</option>
        {KPI_TYPES.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Measure Type</label>
      <input
        type="text"
        value={formData.measure_type}
        onChange={(e) => setFormData((prev) => ({ ...prev, measure_type: e.target.value }))}
        style={{...}}
        placeholder="e.g., Count, Sum, Average"
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Measure Aggregation</label>
      <input
        type="text"
        value={formData.measure_aggregation}
        onChange={(e) => setFormData((prev) => ({ ...prev, measure_aggregation: e.target.value }))}
        style={{...}}
        placeholder="e.g., Daily, Weekly, Monthly"
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Aggregation Window</label>
      <input
        type="text"
        value={formData.aggregation_window}
        onChange={(e) => setFormData((prev) => ({ ...prev, aggregation_window: e.target.value }))}
        style={{...}}
      />
    </div>
  </div>
)}
```

### 4.5 Update Tab 4: Platform Implementation Section

**Rename fields and remove Amplitude**:

```typescript
{activeTab === 3 && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GA4 Event</label>
      <textarea
        value={formData.ga4_event}
        onChange={(e) => setFormData((prev) => ({ ...prev, ga4_event: e.target.value }))}
        rows={6}
        style={{...}}
        placeholder="Google Analytics 4 event name"
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Adobe Event</label>
      <textarea
        value={formData.adobe_event}
        onChange={(e) => setFormData((prev) => ({ ...prev, adobe_event: e.target.value }))}
        rows={6}
        style={{...}}
        placeholder="Adobe Analytics event name"
      />
    </div>
    {/* REMOVED: Amplitude Implementation */}
  </div>
)}
```

### 4.6 Update Tab 5: Data Mappings Section

**Rename and add new fields**:

```typescript
{activeTab === 4 && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>W3 Data Layer</label>
      <textarea
        value={formData.W3_data_layer}
        onChange={(e) => setFormData((prev) => ({ ...prev, W3_data_layer: e.target.value }))}
        rows={8}
        style={{...}}
        placeholder="W3C Data Layer mapping (JSON format)"
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>GA4 Data Layer</label>
      <textarea
        value={formData.GA4_data_layer}
        onChange={(e) => setFormData((prev) => ({ ...prev, GA4_data_layer: e.target.value }))}
        rows={8}
        style={{...}}
        placeholder="GA4 Data Layer mapping (JSON format)"
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Adobe Client Data Layer</label>
      <textarea
        value={formData.Adobe_client_data_layer}
        onChange={(e) => setFormData((prev) => ({ ...prev, Adobe_client_data_layer: e.target.value }))}
        rows={8}
        style={{...}}
        placeholder="Adobe Client Data Layer mapping (JSON format)"
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>XDM Mapping</label>
      <textarea
        value={formData.xdm_mapping}
        onChange={(e) => setFormData((prev) => ({ ...prev, xdm_mapping: e.target.value }))}
        rows={8}
        style={{...}}
      />
    </div>
  </div>
)}
```

### 4.7 Update Tab 2: Business Context - Related KPIs

**Change to semicolon-separated input**:

```typescript
<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
    Related KPIs
  </label>
  <input
    type="text"
    value={formData.related_kpis}
    onChange={(e) => setFormData((prev) => ({ ...prev, related_kpis: e.target.value }))}
    placeholder="Enter KPI slugs separated by semicolons (e.g., kpi1;kpi2;kpi3)"
    style={{...}}
  />
  <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)', marginTop: '0.5rem' }}>
    Separate multiple KPIs with semicolons (;)
  </p>
</div>
```

**Remove the old tag-based input handlers** (handleAddRelated, handleRemoveRelated functions can be removed).

### 4.8 Update Tab 7: Documentation Section

**Rename details field**:

```typescript
{activeTab === 6 && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Calculation Notes</label>
      <textarea
        value={formData.calculation_notes}
        onChange={(e) => setFormData((prev) => ({ ...prev, calculation_notes: e.target.value }))}
        rows={8}
        style={{...}}
      />
    </div>
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Business Use Case</label>
      <textarea
        value={formData.Business_Use_Case}
        onChange={(e) => setFormData((prev) => ({ ...prev, Business_Use_Case: e.target.value }))}
        rows={10}
        style={{...}}
        placeholder="Describe the business use case for this KPI"
      />
    </div>
  </div>
)}
```

### 4.9 Add Missing Fields to Appropriate Tabs

**Add to Tab 2 (Business Context)** or create new section:

```typescript
<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Source Data</label>
  <input
    type="text"
    value={formData.Source_Data}
    onChange={(e) => setFormData((prev) => ({ ...prev, Source_Data: e.target.value }))}
    style={{...}}
    placeholder="Source data system"
  />
</div>
```

**Add to a new Tab or existing tab**:

```typescript
<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Dependencies</label>
  <textarea
    value={formData.dependencies}
    onChange={(e) => setFormData((prev) => ({ ...prev, dependencies: e.target.value }))}
    rows={4}
    style={{...}}
  />
</div>
<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Report Attributes</label>
  <textarea
    value={formData.report_attributes}
    onChange={(e) => setFormData((prev) => ({ ...prev, report_attributes: e.target.value }))}
    rows={4}
    style={{...}}
  />
</div>
<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Dashboard Usage</label>
  <textarea
    value={formData.dashboard_usage}
    onChange={(e) => setFormData((prev) => ({ ...prev, dashboard_usage: e.target.value }))}
    rows={4}
    style={{...}}
  />
</div>
<div>
  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Segment Eligibility</label>
  <textarea
    value={formData.segment_eligibility}
    onChange={(e) => setFormData((prev) => ({ ...prev, segment_eligibility: e.target.value }))}
    rows={4}
    style={{...}}
  />
</div>
```

### 4.10 Update Tab Labels

**Update the tab array**:

```typescript
{['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'SQL', 'Documentation'].map((tab, idx) => (
  // ... tab buttons
))}
```

---

## Phase 5: KPI Detail Page

### File: `app/(content)/kpis/[slug]/page.tsx`

### 5.1 Update buildHeadings Function

```typescript
function buildHeadings(kpi: NormalizedKpi): Heading[] {
  const headings: Heading[] = [
    { id: 'overview', text: 'Overview', level: 2 },
  ];

  if (kpi.formula) headings.push({ id: 'formula', text: 'Formula', level: 2 });
  if (kpi.Business_Use_Case) headings.push({ id: 'business-use-case', text: 'Business Use Case', level: 2 });  // CHANGED
  if (kpi.ga4_event) headings.push({ id: 'ga4-event', text: 'GA4 Event', level: 2 });  // CHANGED
  if (kpi.adobe_event) headings.push({ id: 'adobe-event', text: 'Adobe Event', level: 2 });  // CHANGED
  // REMOVED: amplitude_implementation
  if (kpi.W3_data_layer) headings.push({ id: 'w3-data-layer', text: 'W3 Data Layer', level: 2 });  // CHANGED
  if (kpi.GA4_data_layer) headings.push({ id: 'ga4-data-layer', text: 'GA4 Data Layer', level: 2 });  // NEW
  if (kpi.Adobe_client_data_layer) headings.push({ id: 'adobe-client-data-layer', text: 'Adobe Client Data Layer', level: 2 });  // NEW
  if (kpi.xdm_mapping) headings.push({ id: 'xdm-mapping', text: 'XDM Mapping', level: 2 });
  if (kpi.sql_query) headings.push({ id: 'sql-query', text: 'SQL Query', level: 2 });
  if (kpi.calculation_notes) headings.push({ id: 'calculation-notes', text: 'Calculation Notes', level: 2 });

  return headings;
}
```

### 5.2 Update normalizeJsonMapping Function

**Rename to handle new field names**:

```typescript
// Function remains the same, just used for new field names
function normalizeJsonMapping(raw?: string | null): string | null {
  // ... existing implementation
}
```

### 5.3 Update Page Render - Business Use Case

```typescript
{renderRichTextBlock('business-use-case', 'Business Use Case', kpi.Business_Use_Case)}  // CHANGED
{renderRichTextBlock('Priority', 'Importance of KPI', kpi.priority)}
{renderRichTextBlock('Core area', 'Core area of KPI Analysis', kpi.core_area ?? undefined)}
{renderRichTextBlock('Scope', 'Scope at which KPI is analyzed', kpi.scope ?? undefined)}
```

### 5.4 Update Events Section

```typescript
<section id="overview" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
  <h2 className="section-title">Events</h2>
  {renderTokenPills('Google Analytics 4', kpi.ga4_event ? [kpi.ga4_event] : [])}  // CHANGED
  {renderTokenPills('Adobe', kpi.adobe_event ? [kpi.adobe_event] : [])}  // CHANGED
  {/* REMOVED: Amplitude */}
</section>
```

### 5.5 Update Data Mappings Section - Accordion Style

**Create accordion component or use simple collapsible sections**:

```typescript
{/* Data Mappings Accordion */}
<section id="data-mappings" style={{ marginBottom: '2rem' }}>
  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Data Mappings</h2>
  
  {kpi.W3_data_layer && (
    <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>W3 Data Layer</summary>
      {renderCodeBlock('w3-data-layer', '', normalizeJsonMapping(kpi.W3_data_layer), 'json')}
    </details>
  )}
  
  {kpi.GA4_data_layer && (
    <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>GA4 Data Layer</summary>
      {renderCodeBlock('ga4-data-layer', '', normalizeJsonMapping(kpi.GA4_data_layer), 'json')}
    </details>
  )}
  
  {kpi.Adobe_client_data_layer && (
    <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Adobe Client Data Layer</summary>
      {renderCodeBlock('adobe-client-data-layer', '', normalizeJsonMapping(kpi.Adobe_client_data_layer), 'json')}
    </details>
  )}
  
  {kpi.xdm_mapping && (
    <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>XDM Mapping</summary>
      {renderCodeBlock('xdm-mapping', '', normalizeJsonMapping(kpi.xdm_mapping), 'json')}
    </details>
  )}
</section>
```

### 5.6 Add Missing Fields Display

**Add new sections for previously missing fields**:

```typescript
{/* Technical Details Section */}
{(kpi.measure_type || kpi.measure_aggregation || kpi.aggregation_window) && (
  <section id="technical-details" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Technical Details</h2>
    {renderDetailRow('Measure Type', kpi.measure_type, 'measure-type')}
    {renderDetailRow('Measure Aggregation', kpi.measure_aggregation, 'measure-aggregation')}
    {renderDetailRow('Aggregation Window', kpi.aggregation_window, 'aggregation-window')}
    {renderDetailRow('KPI Type', kpi.kpi_type, 'kpi-type')}
  </section>
)}

{/* Source Data Section */}
{kpi.Source_Data && (
  <section id="source-data" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Source Data</h2>
    {renderRichTextBlock('source-data', '', kpi.Source_Data)}
  </section>
)}

{/* Dependencies Section */}
{kpi.dependencies && (
  <section id="dependencies" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Dependencies</h2>
    {renderRichTextBlock('dependencies', '', kpi.dependencies)}
  </section>
)}

{/* Report Attributes Section */}
{kpi.report_attributes && (
  <section id="report-attributes" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Report Attributes</h2>
    {renderRichTextBlock('report-attributes', '', kpi.report_attributes)}
  </section>
)}

{/* Dashboard Usage Section */}
{kpi.dashboard_usage && (
  <section id="dashboard-usage" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Dashboard Usage</h2>
    {renderRichTextBlock('dashboard-usage', '', kpi.dashboard_usage)}
  </section>
)}

{/* Segment Eligibility Section */}
{kpi.segment_eligibility && (
  <section id="segment-eligibility" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Segment Eligibility</h2>
    {renderRichTextBlock('segment-eligibility', '', kpi.segment_eligibility)}
  </section>
)}

{/* Related KPIs Section */}
{kpi.related_kpis && Array.isArray(kpi.related_kpis) && kpi.related_kpis.length > 0 && (
  <section id="related-kpis" style={{ marginBottom: '2rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Related KPIs</h2>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {kpi.related_kpis.map((relatedSlug) => (
        <Link
          key={relatedSlug}
          href={`/kpis/${relatedSlug}`}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--ifm-color-primary)',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          {relatedSlug}
        </Link>
      ))}
    </div>
  </section>
)}
```

---

## Phase 6: Server-Side KPI Fetching

### File: `lib/server/kpis.ts`

**Update NormalizedKpi type and normalization**:

```typescript
type KpiRow = KPI & {
  tags?: string[] | string | null;
  industry?: string[] | string | null;
  related_kpis?: string[] | string | null;
};

export type NormalizedKpi = Omit<KpiRow, 'tags' | 'industry' | 'related_kpis'> & {
  tags: string[];
  industry: string[];
  related_kpis: string[];
  // Ensure all new fields are included
  measure_type?: string;
  measure_aggregation?: string;
  ga4_event?: string;
  adobe_event?: string;
  W3_data_layer?: string;
  GA4_data_layer?: string;
  Adobe_client_data_layer?: string;
  Source_Data?: string;
  Business_Use_Case?: string;
  dependencies?: string;
  report_attributes?: string;
  dashboard_usage?: string;
  segment_eligibility?: string;
};
```

**The normalizeKpi function should already handle the array conversions correctly.**

---

## Phase 7: Testing Checklist

### Database Migration Testing
- [ ] Run SQL migration script in Supabase SQL Editor
- [ ] Verify all columns exist with correct names:
  - [ ] `measure_type` (renamed from `measure`)
  - [ ] `measure_aggregation` (new column)
  - [ ] `ga4_event` (renamed from `ga4_implementation`)
  - [ ] `adobe_event` (renamed from `adobe_implementation`)
  - [ ] `amplitude_implementation` (removed - verify it's gone)
  - [ ] `W3_data_layer` (renamed from `data_layer_mapping`)
  - [ ] `GA4_data_layer` (new column)
  - [ ] `Adobe_client_data_layer` (new column)
  - [ ] `Source_Data` (renamed from `bi_source_system`)
  - [ ] `Business_Use_Case` (renamed from `details`)
  - [ ] `dependencies`, `report_attributes`, `dashboard_usage`, `segment_eligibility` (verify exist)
  - [ ] `related_kpis` (verify is TEXT[] array type)
- [ ] Verify column comments are set correctly
- [ ] Test with existing data to ensure no data loss
- [ ] Verify data types are correct (TEXT for strings, TEXT[] for arrays)

### Form Testing - Create New KPI
- [ ] Test creating new KPI with minimal fields (name, slug)
- [ ] Test creating new KPI with all fields filled
- [ ] Verify new KPI creation still works after migration

### Form Testing - Edit KPI
- [ ] Load existing KPI in edit form
- [ ] Verify all fields load correctly from database
- [ ] Test editing each tab individually:
  - [ ] Tab 1: Basic Info (name, description, formula, category, tags)
  - [ ] Tab 2: Business Context (industry, priority, core_area, scope, related_kpis, Source_Data)
  - [ ] Tab 3: Technical (kpi_type, measure_type, measure_aggregation, aggregation_window)
  - [ ] Tab 4: Platform Events (ga4_event, adobe_event - no amplitude)
  - [ ] Tab 5: Data Mappings (W3_data_layer, GA4_data_layer, Adobe_client_data_layer, xdm_mapping)
  - [ ] Tab 6: SQL (sql_query)
  - [ ] Tab 7: Documentation (calculation_notes, Business_Use_Case)
- [ ] Test saving form with all fields filled
- [ ] Test saving form with empty/null values
- [ ] Verify form validation works correctly

### Form Testing - Field-Specific
- [ ] **measure_type**: 
  - [ ] Verify field label shows "Measure Type"
  - [ ] Test saving text value (e.g., "Count", "Sum", "Average")
  - [ ] Verify saves to `measure_type` column (not `measure` or `metric`)
- [ ] **measure_aggregation**: 
  - [ ] Verify new field appears in Technical tab
  - [ ] Test saving value (e.g., "Daily", "Weekly", "Monthly")
  - [ ] Verify saves correctly to database
- [ ] **ga4_event** (renamed from ga4_implementation):
  - [ ] Verify field label shows "GA4 Event"
  - [ ] Test saving event name
  - [ ] Verify old data migrated correctly (if any)
- [ ] **adobe_event** (renamed from adobe_implementation):
  - [ ] Verify field label shows "Adobe Event"
  - [ ] Test saving event name
  - [ ] Verify old data migrated correctly (if any)
- [ ] **amplitude_implementation**:
  - [ ] Verify field is completely removed from form
  - [ ] Verify no errors when loading KPIs that had this field
- [ ] **W3_data_layer** (renamed from data_layer_mapping):
  - [ ] Verify field label shows "W3 Data Layer"
  - [ ] Test saving JSON data
  - [ ] Verify old data migrated correctly
- [ ] **GA4_data_layer** (new field):
  - [ ] Verify new field appears in Data Mappings tab
  - [ ] Test saving JSON data
- [ ] **Adobe_client_data_layer** (new field):
  - [ ] Verify new field appears in Data Mappings tab
  - [ ] Test saving JSON data
- [ ] **Source_Data** (renamed from bi_source_system):
  - [ ] Verify field label shows "Source Data"
  - [ ] Test saving value
  - [ ] Verify saves correctly (was previously not saving)
- [ ] **Business_Use_Case** (renamed from details):
  - [ ] Verify field label shows "Business Use Case"
  - [ ] Test saving text
  - [ ] Verify old data migrated correctly
- [ ] **related_kpis** (semicolon-separated):
  - [ ] Verify input accepts semicolon-separated values (e.g., "kpi1;kpi2;kpi3")
  - [ ] Test saving: "kpi1;kpi2" → should save as array ["kpi1", "kpi2"]
  - [ ] Test loading: array ["kpi1", "kpi2"] → should display as "kpi1;kpi2"
  - [ ] Test with single value: "kpi1" → should save as ["kpi1"]
  - [ ] Test with empty string → should save as []
  - [ ] Test with extra spaces: "kpi1 ; kpi2 ; kpi3" → should trim and save correctly
- [ ] **dependencies, report_attributes, dashboard_usage, segment_eligibility**:
  - [ ] Verify all fields now save correctly (were previously not saving)
  - [ ] Test saving text values for each
  - [ ] Verify they appear in appropriate form tabs

### Detail Page Testing - Field Display
- [ ] **Header Section**:
  - [ ] Verify KPI name displays
  - [ ] Verify description displays
  - [ ] Verify draft badge shows for draft KPIs
- [ ] **Business Use Case** (renamed from details):
  - [ ] Verify section heading shows "Business Use Case"
  - [ ] Verify content displays correctly
  - [ ] Verify appears in Table of Contents
- [ ] **Priority, Core Area, Scope**:
  - [ ] Verify all display correctly
- [ ] **Formula Section**:
  - [ ] Verify displays as code block
  - [ ] Verify appears in Table of Contents
- [ ] **SQL Query Section**:
  - [ ] Verify displays as code block with SQL syntax
  - [ ] Verify normalization works (removes <br> tags, etc.)
  - [ ] Verify appears in Table of Contents
- [ ] **Calculation Notes**:
  - [ ] Verify displays as rich text
  - [ ] Verify appears in Table of Contents
- [ ] **Events Section**:
  - [ ] Verify "Events" heading displays
  - [ ] Verify GA4 Event displays as token pill (if value exists)
  - [ ] Verify Adobe Event displays as token pill (if value exists)
  - [ ] Verify Amplitude is NOT displayed (removed)
  - [ ] Test with only GA4 event
  - [ ] Test with only Adobe event
  - [ ] Test with both events
  - [ ] Test with no events
- [ ] **Data Mappings Section** (Accordion):
  - [ ] Verify "Data Mappings" heading displays
  - [ ] Verify W3 Data Layer accordion item exists (if value present)
  - [ ] Verify GA4 Data Layer accordion item exists (if value present)
  - [ ] Verify Adobe Client Data Layer accordion item exists (if value present)
  - [ ] Verify XDM Mapping accordion item exists (if value present)
  - [ ] Test clicking each accordion to expand/collapse
  - [ ] Verify JSON is normalized and pretty-printed
  - [ ] Verify all appear in Table of Contents
- [ ] **Technical Details Section**:
  - [ ] Verify section displays when any technical field has value
  - [ ] Verify Measure Type displays
  - [ ] Verify Measure Aggregation displays
  - [ ] Verify Aggregation Window displays
  - [ ] Verify KPI Type displays
- [ ] **Source Data Section**:
  - [ ] Verify section displays when Source_Data has value
  - [ ] Verify content displays correctly
- [ ] **Dependencies Section**:
  - [ ] Verify section displays when dependencies has value
  - [ ] Verify content displays correctly
- [ ] **Report Attributes Section**:
  - [ ] Verify section displays when report_attributes has value
  - [ ] Verify content displays correctly
- [ ] **Dashboard Usage Section**:
  - [ ] Verify section displays when dashboard_usage has value
  - [ ] Verify content displays correctly
- [ ] **Segment Eligibility Section**:
  - [ ] Verify section displays when segment_eligibility has value
  - [ ] Verify content displays correctly
- [ ] **Related KPIs Section**:
  - [ ] Verify section displays when related_kpis array has values
  - [ ] Verify each KPI slug displays as clickable link
  - [ ] Test clicking links navigate to correct KPI pages
  - [ ] Test with empty array (should not display section)
  - [ ] Test with single related KPI
  - [ ] Test with multiple related KPIs
- [ ] **Governance Section**:
  - [ ] Verify Created by, Created on display
  - [ ] Verify Last modified by, Last modified on display
  - [ ] Verify Status displays (uppercase)
- [ ] **GitHub Section**:
  - [ ] Verify displays when github_pr_url exists
  - [ ] Verify link works correctly
  - [ ] Verify file path displays

### Detail Page Testing - Edge Cases
- [ ] Test KPI with all fields null/empty (should not break)
- [ ] Test KPI with all fields filled
- [ ] Test KPI with only some fields filled
- [ ] Verify Table of Contents only includes sections with content
- [ ] Test with very long text values (should not break layout)
- [ ] Test with special characters in text fields
- [ ] Test with invalid JSON in data layer fields (should handle gracefully)

### Data Integrity Testing
- [ ] **Backward Compatibility**:
  - [ ] Load existing KPIs created before migration
  - [ ] Verify all data displays correctly
  - [ ] Verify no data loss occurred during migration
  - [ ] Test editing old KPIs (should work correctly)
- [ ] **Array Fields**:
  - [ ] Verify `tags` array works correctly (loads and saves)
  - [ ] Verify `industry` array works correctly (loads and saves)
  - [ ] Verify `related_kpis` array works correctly (loads and saves)
  - [ ] Test with empty arrays
  - [ ] Test with single-item arrays
  - [ ] Test with multiple-item arrays
- [ ] **Data Migration** (if needed):
  - [ ] If existing data needs conversion, verify conversion script works
  - [ ] Test migration on sample data
  - [ ] Verify no data corruption

### Integration Testing
- [ ] Test full workflow: Create → Edit → View → Edit → View
- [ ] Test with different user permissions
- [ ] Test form submission and API response
- [ ] Verify GitHub sync still works after changes
- [ ] Test error handling (invalid data, network errors, etc.)

### Performance Testing
- [ ] Verify page load times are acceptable
- [ ] Test with KPIs that have large text fields
- [ ] Test form save performance
- [ ] Verify no unnecessary re-renders

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify accordion works in all browsers
- [ ] Verify form inputs work correctly in all browsers

---

## Phase 8: Rollback Plan

If issues occur, rollback steps:

1. **Database Rollback SQL** (create backup script):
```sql
-- Reverse all changes
-- WARNING: This will lose data in new columns (measure_aggregation, GA4_data_layer, Adobe_client_data_layer)
-- Make sure to backup data before running rollback

-- 1. Rename measure_type back to measure
ALTER TABLE prod_kpis RENAME COLUMN measure_type TO measure;

-- 2. Drop measure_aggregation column (data will be lost)
ALTER TABLE prod_kpis DROP COLUMN IF EXISTS measure_aggregation;

-- 3. Rename ga4_event back to ga4_implementation
ALTER TABLE prod_kpis RENAME COLUMN ga4_event TO ga4_implementation;

-- 4. Rename adobe_event back to adobe_implementation
ALTER TABLE prod_kpis RENAME COLUMN adobe_event TO adobe_implementation;

-- 5. Add back amplitude_implementation column
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS amplitude_implementation TEXT;

-- 6. Rename W3_data_layer back to data_layer_mapping
ALTER TABLE prod_kpis RENAME COLUMN W3_data_layer TO data_layer_mapping;

-- 7. Drop GA4_data_layer column (data will be lost)
ALTER TABLE prod_kpis DROP COLUMN IF EXISTS GA4_data_layer;

-- 8. Drop Adobe_client_data_layer column (data will be lost)
ALTER TABLE prod_kpis DROP COLUMN IF EXISTS Adobe_client_data_layer;

-- 9. Rename Source_Data back to bi_source_system
ALTER TABLE prod_kpis RENAME COLUMN Source_Data TO bi_source_system;

-- 10. Rename Business_Use_Case back to details
ALTER TABLE prod_kpis RENAME COLUMN Business_Use_Case TO details;

-- Note: dependencies, report_attributes, dashboard_usage, segment_eligibility, related_kpis
-- columns will remain (they were added, not renamed)
```

2. **Code Rollback**: Revert all file changes via Git

---

## Implementation Order

1. **Phase 1**: Database migration (run SQL script)
   - Create migration file: `scripts/migrations/update-kpi-fields.sql`
   - Run in Supabase SQL Editor
   - Verify all columns exist with correct names
   
2. **Phase 2**: Update TypeScript types
   - Update `lib/types/database.ts` - KPI interface
   
3. **Phase 3**: Update payload builder
   - Update `lib/services/entityUpdates.ts` - KPI_FIELDS function
   - Add semicolonToArray helper function
   
4. **Phase 4**: Update Edit form component
   - Update `app/(content)/kpis/[slug]/edit/KPIEditClient.tsx`
   - Update FormData type
   - Update all form tabs
   - Update initialFormState
   - Remove old handlers (handleAddRelated, handleRemoveRelated)
   
5. **Phase 5**: Update Detail page
   - Update `app/(content)/kpis/[slug]/page.tsx`
   - Update buildHeadings function
   - Update all field references
   - Add accordion for data mappings
   - Add missing field sections
   
6. **Phase 6**: Update server-side fetching
   - Update `lib/server/kpis.ts` - NormalizedKpi type
   - Ensure array normalization works correctly
   
7. **Phase 7**: Testing
   - Follow comprehensive testing checklist
   - Test in development environment first
   - Test with existing data
   - Test all edge cases
   
8. **Phase 8**: Deploy and monitor
   - Deploy to staging first
   - Monitor for errors
   - Deploy to production
   - Monitor production for issues

---

## Quick Reference: Field Name Changes

| Old Name | New Name | Type | Notes |
|----------|----------|------|-------|
| `measure` | `measure_type` | TEXT | Renamed |
| - | `measure_aggregation` | TEXT | New field |
| `ga4_implementation` | `ga4_event` | TEXT | Renamed |
| `adobe_implementation` | `adobe_event` | TEXT | Renamed |
| `amplitude_implementation` | - | - | Removed |
| `data_layer_mapping` | `W3_data_layer` | TEXT | Renamed |
| - | `GA4_data_layer` | TEXT | New field |
| - | `Adobe_client_data_layer` | TEXT | New field |
| `bi_source_system` | `Source_Data` | TEXT | Renamed |
| `details` | `Business_Use_Case` | TEXT | Renamed |
| - | `dependencies` | TEXT | Now saved (was not saving) |
| - | `report_attributes` | TEXT | Now saved (was not saving) |
| - | `dashboard_usage` | TEXT | Now saved (was not saving) |
| - | `segment_eligibility` | TEXT | Now saved (was not saving) |
| `related_kpis` | `related_kpis` | TEXT[] | Format changed: semicolon-separated input → array |

---

## Notes

- All changes should be made in a feature branch
- Test thoroughly before merging to main
- Consider data migration for existing records if needed
- Update any related documentation
- Update API documentation if applicable

---

## Additional Implementation Details

### Handling Existing Data

If you have existing KPIs in the database, consider:

1. **Data Backup**: Before running migration, backup the `prod_kpis` table
2. **Data Migration Script** (if needed):
   ```sql
   -- Example: If you need to migrate data from old column names
   -- This should be run AFTER the schema changes
   
   -- Migrate data from old columns to new (if columns existed before)
   -- Most renames will preserve data automatically
   
   -- For related_kpis: If existing data is in wrong format, convert it
   -- UPDATE prod_kpis SET related_kpis = string_to_array(related_kpis_string, ';')
   -- WHERE related_kpis_string IS NOT NULL;
   ```

### Form Validation

Consider adding validation for:
- **related_kpis**: Validate that slugs exist before saving
- **JSON fields**: Validate JSON format for data layer mappings
- **Required fields**: Ensure name is always required

### Error Handling

Ensure proper error handling for:
- Database connection errors
- Invalid data format (especially JSON fields)
- Missing required fields
- Array conversion errors (related_kpis)

### Performance Considerations

- **Large text fields**: Consider truncation for display if fields are very long
- **Array operations**: Ensure efficient array handling for related_kpis
- **Form state**: Optimize form state updates to prevent unnecessary re-renders

### Accessibility

Ensure:
- All form fields have proper labels
- Accordion sections are keyboard accessible
- Error messages are announced to screen readers
- Form validation errors are clearly displayed

### Documentation Updates

After implementation, update:
- API documentation (if applicable)
- User guide/documentation
- Developer documentation
- CHANGELOG.md

