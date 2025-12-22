# Complete KPI Attributes List for Metrics Replication

This document provides a comprehensive list of **all KPI attributes** used across:
- Create Form
- Edit Form (7 tabs)
- Detail Page Display
- Supabase Database
- GitHub Sync

Use this list to replicate the flow to Metrics with your modifications.

---

## Complete KPI Attributes (49 Total Fields)

### 1. Core Fields (7 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 1 | `id` | `uuid` | Auto | `uuid` | Primary key, auto-generated |
| 2 | `slug` | `string` | Create only | `text` | URL-friendly identifier |
| 3 | `name` | `string` | Tab 1 | `text` | Required field |
| 4 | `description` | `string?` | Tab 1 | `text` | Textarea (4 rows) |
| 5 | `formula` | `string?` | Tab 1 | `text` | Monospace font |
| 6 | `category` | `string?` | Tab 1 | `text` | Select dropdown (11 options) |
| 7 | `tags` | `string[]?` | Tab 1 | `text[]` | Array, add/remove tags |

**Categories**: Conversion, Revenue, Engagement, Retention, Acquisition, Performance, Quality, Efficiency, Satisfaction, Growth, Other

---

### 2. Business Context (9 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 8 | `industry` | `string` | Tab 2 | `text` | Select (single), stored as string |
| 9 | `priority` | `string?` | Tab 2 | `text` | Select: High/Medium/Low |
| 10 | `core_area` | `string?` | Tab 2 | `text` | Text input |
| 11 | `scope` | `string?` | Tab 2 | `text` | Select: User/Session/Event/Global |
| 12 | `related_kpis` | `string[]?` | Tab 2 | `text[]` | Semicolon-separated input |
| 13 | `source_data` | `string?` | Tab 2 | `text` | Text input (lowercase in DB) |
| 14 | `report_attributes` | `string?` | Tab 2 | `text` | Textarea |
| 15 | `dashboard_usage` | `string[]?` | Tab 2 | `text[]` | Semicolon-separated input |
| 16 | `segment_eligibility` | `string?` | Tab 2 | `text` | Textarea |

**Industries**: Retail, E-commerce, SaaS, Healthcare, Education, Finance, Media, Technology, Manufacturing, Other

---

### 3. Technical Details (2 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 17 | `measure_type` | `string?` | Tab 3 | `text` | Select: Counter/Rate/Ratio/Percentage/Average/Sum |
| 18 | `aggregation_window` | `string?` | Tab 3 | `text` | Textarea |

**Measure Types**: Counter, Rate, Ratio, Percentage, Average, Sum

---

### 4. Platform Events (2 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 19 | `ga4_event` | `string?` | Tab 4 | `text` | Textarea (6 rows), supports multiple values (newline-separated) |
| 20 | `adobe_event` | `string?` | Tab 4 | `text` | Textarea (6 rows), supports multiple values (newline-separated) |

**Display**: Table format with Platform and Event columns, grouped by platform

---

### 5. Data Mappings (4 fields - JSON stored as TEXT)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 21 | `w3_data_layer` | `string?` | Tab 5 | `text` | JSON string (lowercase in DB) |
| 22 | `ga4_data_layer` | `string?` | Tab 5 | `text` | JSON string (lowercase in DB) |
| 23 | `adobe_client_data_layer` | `string?` | Tab 5 | `text` | JSON string (lowercase in DB) |
| 24 | `xdm_mapping` | `string?` | Tab 5 | `text` | JSON string |

**Display**: Accordion with code blocks, JSON pretty-printed

---

### 6. SQL & Documentation (3 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 25 | `sql_query` | `string?` | Tab 6 | `text` | Textarea (10 rows), monospace |
| 26 | `calculation_notes` | `string?` | Tab 6 | `text` | Textarea (6 rows) |
| 27 | `business_use_case` | `string?` | Tab 6 | `text` | Textarea (6 rows), lowercase in DB |

---

### 7. Dependencies (1 field - JSONB)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 28 | `dependencies` | `string?` | Tab 7 | `jsonb` | Structured JSON with subsections: Events, Metrics, Dimensions, KPIs |

**Structure**:
```json
{
  "Events": ["event1", "event2"],
  "Metrics": ["metric1"],
  "Dimensions": ["dim1", "dim2"],
  "KPIs": ["kpi1"]
}
```

**Display**: Structured display with subsections on detail page

---

### 8. Data Governance (2 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 29 | `data_sensitivity` | `string?` | Tab 7 | `text` | Select dropdown |
| 30 | `pii_flag` | `boolean` | Tab 7 | `bool` | Checkbox |

**Data Sensitivity Options**: Public, Internal, Confidential, Restricted

---

### 9. Status & Governance (3 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 31 | `status` | `'draft' | 'published' | 'archived'` | Auto | `text` | Auto-set to 'draft' |
| 32 | `validation_status` | `'unverified' | 'verified' | 'rejected'?` | - | `text` | Not in form |
| 33 | `version` | `string?` | - | `text` | Not in form |

---

### 10. GitHub Sync Fields (4 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 34 | `github_pr_url` | `string?` | Auto | `text` | Auto-populated after GitHub sync |
| 35 | `github_pr_number` | `number?` | Auto | `integer` | Auto-populated after GitHub sync |
| 36 | `github_commit_sha` | `string?` | Auto | `text` | Auto-populated after GitHub sync |
| 37 | `github_file_path` | `string?` | Auto | `text` | Auto-populated after GitHub sync |

---

### 11. Contribution Tracking (8 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 38 | `created_by` | `string` | Auto | `text` | User identifier (user_name or email) |
| 39 | `created_at` | `string` | Auto | `timestamptz` | ISO timestamp |
| 40 | `last_modified_by` | `string?` | Auto | `text` | Updated on every edit |
| 41 | `last_modified_at` | `string?` | Auto | `timestamptz` | Updated on every edit |
| 42 | `approved_by` | `string?` | - | `text` | Not in form |
| 43 | `approved_at` | `string?` | - | `timestamptz` | Not in form |
| 44 | `reviewed_by` | `string[]?` | - | `text[]` | Not in form |
| 45 | `reviewed_at` | `string?` | - | `text` | Not in form |
| 46 | `publisher_id` | `string?` | - | `text` | Not in form |
| 47 | `published_at` | `string?` | - | `timestamptz` | Not in form |

---

### 12. Metadata (2 fields)

| # | Field Name | Type | Form Tab | DB Type | Notes |
|---|------------|------|----------|---------|-------|
| 48 | `aliases` | `string[]?` | - | `text[]` | Not in form |
| 49 | `owner` | `string?` | - | `text` | Not in form |

---

## Form Structure (7 Tabs)

### Tab 1: Basic Info
- name
- description
- formula
- category
- tags

### Tab 2: Business Context
- industry
- priority
- core_area
- scope
- related_kpis
- source_data
- report_attributes
- dashboard_usage
- segment_eligibility

### Tab 3: Technical
- measure_type
- aggregation_window

### Tab 4: Platform Events
- ga4_event
- adobe_event

### Tab 5: Data Mappings
- w3_data_layer
- ga4_data_layer
- adobe_client_data_layer
- xdm_mapping

### Tab 6: SQL & Documentation
- sql_query
- calculation_notes
- business_use_case

### Tab 7: Dependencies & Governance
- dependencies (structured with subsections)
- data_sensitivity
- pii_flag

---

## Key Files to Replicate

### 1. Create Form
- **File**: `app/(content)/kpis/new/page.tsx`
- **Hook**: `useItemForm`
- **API**: `app/api/items/create/route.ts`
- **Fields**: name, slug, description, formula, category, tags

### 2. Edit Form
- **File**: `app/(content)/kpis/[slug]/edit/KPIEditClient.tsx`
- **API**: `PUT /api/items/kpi/[id]`
- **Payload Builder**: `lib/services/entityUpdates.ts` → `KPI_FIELDS`
- **All 49 fields** (organized in 7 tabs)

### 3. Detail Page
- **File**: `app/(content)/kpis/[slug]/page.tsx`
- **Fetch**: `lib/server/kpis.ts` → `fetchKpiBySlug`
- **Normalize**: `lib/server/kpis.ts` → `normalizeKpi`
- **Display**: All fields with proper formatting

### 4. Database Types
- **File**: `lib/types/database.ts`
- **Interface**: `KPI`

### 5. Payload Builder
- **File**: `lib/services/entityUpdates.ts`
- **Function**: `KPI_FIELDS`
- **Helpers**: `toString()`, `toStringArray()`, `semicolonToArray()`, `toBoolean()`

### 6. GitHub Sync
- **File**: `lib/services/github.ts`
- **Function**: `syncToGitHub()`
- **YAML Generation**: `generateYAML()`
- **EntityRecord Interface**: Includes all KPI fields

---

## Data Type Conversions

### String Fields
- Use `toString()` helper
- Examples: name, description, formula, category, priority, core_area, scope

### Array Fields
- Use `toStringArray()` for tags, industry
- Use `semicolonToArray()` for related_kpis, dashboard_usage
- Examples: tags, related_kpis, dashboard_usage

### Boolean Fields
- Use `toBoolean()` helper
- Example: pii_flag

### JSON Fields
- Store as JSON string using `toString()`
- Examples: dependencies, w3_data_layer, ga4_data_layer, adobe_client_data_layer, xdm_mapping

---

## Special Handling

### 1. Dependencies
- **Input**: Structured object with Events, Metrics, Dimensions, KPIs arrays
- **Storage**: JSON string (converted to JSONB in DB)
- **Display**: Structured sections on detail page

### 2. Events (ga4_event, adobe_event)
- **Input**: Textarea with newline-separated values
- **Storage**: Single text field with newlines
- **Display**: Table format grouped by platform

### 3. Dashboard Usage & Related KPIs
- **Input**: Semicolon-separated string
- **Storage**: `text[]` array
- **Display**: Token pills

### 4. Industry
- **Input**: Single select
- **Storage**: `text` (string, not array)
- **Display**: Single value

---

## GitHub Sync Fields

All fields are included in `EntityRecord` interface in `lib/services/github.ts`:
- All 49 fields are synced to GitHub YAML files
- YAML format: `data-layer/kpis/{slug}.yml`
- Includes metadata, contribution tracking, and GitHub fields

---

## Summary

**Total Fields**: 49
- **Form Fields**: 28 (across 7 tabs)
- **Auto-Set Fields**: 12 (status, timestamps, GitHub fields)
- **Metadata Fields**: 9 (not in forms)

**Key Modifications for Metrics**:
1. Remove KPI-specific fields (measure_type, related_kpis)
2. Adjust dependencies structure (remove KPIs subsection)
3. Modify categories/options as needed
4. Update table names and routes
5. Adjust GitHub sync paths (`data-layer/metrics/`)

---

## Next Steps

1. Review this list and identify which fields to keep/modify/remove for Metrics
2. Create similar structure for Metrics:
   - `app/(content)/metrics/new/page.tsx`
   - `app/(content)/metrics/[slug]/edit/MetricEditClient.tsx`
   - `app/(content)/metrics/[slug]/page.tsx`
   - `lib/services/entityUpdates.ts` → `METRIC_FIELDS`
   - `lib/server/metrics.ts`
3. Update database types in `lib/types/database.ts`
4. Update GitHub sync to handle Metrics table

