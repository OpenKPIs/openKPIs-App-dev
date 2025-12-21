# KPI Form Fields Mapping to Supabase Tables

This document provides a comprehensive mapping of:
1. **New KPI Form** fields to Supabase `prod_kpis` table
2. **Edit KPI Form** fields to Supabase `prod_kpis` table
3. **KPI Detail Page** fields fetched from Supabase and their display sections

---

## 1. New KPI Form - Field Mapping

**File**: `app/(content)/kpis/new/page.tsx`  
**Hook**: `useItemForm`  
**API Route**: `app/api/items/create/route.ts`  
**Supabase Table**: `prod_kpis`

### Form Fields

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 1 | **name** | TextInput (required) | `name` | `text` | ✅ Saved | Required field |
| 2 | **slug** | SlugInput | `slug` | `text` | ✅ Saved | Auto-generated from name, can be edited |
| 3 | **description** | Textarea | `description` | `text` | ✅ Saved | Optional |
| 4 | **formula** | TextInput | `formula` | `text` | ✅ Saved | Optional, KPI-specific |
| 5 | **category** | Select | `category` | `text` | ✅ Saved | Dropdown: Conversion, Revenue, Engagement, etc. |
| 6 | **tags** | TagsInput | `tags` | `text[]` | ✅ Saved | Array of strings |

### Auto-Set Fields (Not in Form UI)

These fields are automatically set by the API during creation:

| Field | Value | Supabase Column | Notes |
|-------|-------|-----------------|-------|
| **status** | `'draft'` | `status` | Always set to 'draft' on creation |
| **created_by** | User identifier | `created_by` | From authenticated user's `user_name` or `email` |
| **created_at** | ISO timestamp | `created_at` | Current timestamp |

### Summary

- ✅ **Total form fields**: 6
- ✅ **All fields mapped and saved**: 6/6
- ✅ **No unmapped fields**
- ✅ **API endpoint**: `POST /api/items/create`

---

## 2. Edit KPI Form - Field Mapping

**File**: `app/(content)/kpis/[slug]/edit/KPIEditClient.tsx`  
**API Route**: `PUT /api/items/kpi/[id]`  
**Payload Builder**: `lib/services/entityUpdates.ts` → `KPI_FIELDS`  
**Supabase Table**: `prod_kpis`

The Edit form has **7 tabs** with **26 total fields**. Fields are organized by category below.

### Tab 1: Basic Info

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 1 | **name** | input | `name` | `text` | ✅ Saved | Text input |
| 2 | **description** | textarea | `description` | `text` | ✅ Saved | 4 rows |
| 3 | **formula** | input | `formula` | `text` | ✅ Saved | Monospace font |
| 4 | **category** | select | `category` | `text` | ✅ Saved | Dropdown with 11 options |
| 5 | **tags** | tags input | `tags` | `text[]` | ✅ Saved | Array, add/remove tags |

### Tab 2: Business Context

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 6 | **industry** | select | `industry` | `text[]` | ✅ Saved* | Single select, converted to array |
| 7 | **priority** | select | `priority` | `text` | ✅ Saved | High/Medium/Low |
| 8 | **core_area** | input | `core_area` | `text` | ✅ Saved | Text input |
| 9 | **scope** | select | `scope` | `text` | ✅ Saved | User/Session/Event/Global |
| 10 | **related_kpis** | tags input | `related_kpis` | `text[]` | ❌ **NOT Saved** | Array of KPI slugs |

*Note: Form sends single string value, but `KPI_FIELDS` builder converts it to `string[]` array.

### Tab 3: Technical

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 11 | **kpi_type** | select | `kpi_type` | `text` | ✅ Saved | Counter/Rate/Ratio/Percentage/Average/Sum |
| 12 | **measure** | input | `metric` | `text` | ❌ **NOT Saved** | Field name mismatch (form: `measure`, DB: `metric`) |
| 13 | **aggregation_window** | input | `aggregation_window` | `text` | ✅ Saved | Text input |

### Tab 4: Platform Implementation

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 14 | **ga4_implementation** | textarea | `ga4_implementation` | `text` | ✅ Saved | 6 rows, monospace |
| 15 | **adobe_implementation** | textarea | `adobe_implementation` | `text` | ✅ Saved | 6 rows, monospace |
| 16 | **amplitude_implementation** | textarea | `amplitude_implementation` | `text` | ✅ Saved | 6 rows, monospace |

### Tab 5: Data Mappings

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 17 | **data_layer_mapping** | textarea | `data_layer_mapping` | `text` | ✅ Saved | 8 rows, JSON format, monospace |
| 18 | **xdm_mapping** | textarea | `xdm_mapping` | `text` | ✅ Saved | 8 rows, JSON format, monospace |

### Tab 6: SQL

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 19 | **sql_query** | textarea | `sql_query` | `text` | ✅ Saved | 15 rows, SQL format, monospace |

### Tab 7: Documentation

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Notes |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 20 | **calculation_notes** | textarea | `calculation_notes` | `text` | ✅ Saved | 8 rows |
| 21 | **details** | textarea | `details` | `text` | ✅ Saved | 10 rows |

### Fields in Form but NOT Saved

These fields exist in the form's `FormData` type and are **read from the database** when loading the form, but are **NOT included in the `KPI_FIELDS` payload builder** in `lib/services/entityUpdates.ts`, so they are **NOT saved** when the form is submitted:

| # | Form Field | Form Type | Supabase Column | Supabase Type | Status | Issue |
|---|------------|-----------|-----------------|---------------|--------|-------|
| 22 | **dependencies** | (not in UI) | `dependencies` | `text` | ❌ **NOT Saved** | Missing from payload builder |
| 23 | **bi_source_system** | (not in UI) | `bi_source_system` | `text` | ❌ **NOT Saved** | Missing from payload builder |
| 24 | **report_attributes** | (not in UI) | `report_attributes` | `text` | ❌ **NOT Saved** | Missing from payload builder |
| 25 | **dashboard_usage** | (not in UI) | `dashboard_usage` | `text` | ❌ **NOT Saved** | Missing from payload builder |
| 26 | **segment_eligibility** | (not in UI) | `segment_eligibility` | `text` | ❌ **NOT Saved** | Missing from payload builder |
| 12 | **measure** | input | `metric` | `text` | ❌ **NOT Saved** | Field name mismatch |
| 10 | **related_kpis** | tags input | `related_kpis` | `text[]` | ❌ **NOT Saved** | Missing from payload builder |

### Auto-Updated Fields (Not in Form UI)

These fields are automatically updated by the API during save:

| Field | Value | Supabase Column | Notes |
|-------|-------|-----------------|-------|
| **status** | `'draft'` | `status` | Always set to 'draft' on update |
| **last_modified_by** | User identifier | `last_modified_by` | From authenticated user |
| **last_modified_at** | ISO timestamp | `last_modified_at` | Current timestamp |

### Summary

- **Total form fields**: 26
- **Fields with UI**: 21 (fields 1-21)
- **Fields without UI**: 5 (fields 22-26, in FormData but no form controls)
- **Mapped and saved**: 20 fields ✅
- **NOT saved**: 7 fields ❌
  - dependencies (no UI)
  - bi_source_system (no UI)
  - report_attributes (no UI)
  - dashboard_usage (no UI)
  - segment_eligibility (no UI)
  - measure → metric (field name mismatch)
  - related_kpis (has UI but not saved)

---

## 3. KPI Detail Page - Fields Fetched and Displayed

**File**: `app/(content)/kpis/[slug]/page.tsx`  
**Data Fetching**: `lib/server/kpis.ts` → `fetchKpiBySlug()`  
**Supabase Table**: `prod_kpis`  
**Query**: `SELECT * FROM prod_kpis WHERE slug = ?`

The detail page fetches all fields from the `prod_kpis` table but only displays a subset. Fields are organized by the section/heading where they appear on the page.

### Page Header Section

**Section ID**: `detail-header`  
**Heading**: None (main page title)

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 1 | **KPI Name** | `name` | `text` | `<h1>` title | Main page title |
| 2 | **Description** | `description` | `text` | `<p>` subtitle | Shown below title if exists |
| 3 | **Draft Badge** | `status` | `text` | Badge span | Only shown if `status === 'draft'` |

### Business Use Case Section

**Section ID**: `details`  
**Heading**: "Business Use case" (H2)  
**Function**: `renderRichTextBlock('details', 'Business Use case', kpi.details)`

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 4 | **Business Use case** | `details` | `text` | Rich text block | Pre-formatted text, white-space preserved |

### Priority Section

**Section ID**: `Priority`  
**Heading**: "Importance of KPI" (H2)  
**Function**: `renderRichTextBlock('Priority', 'Importance of KPI', kpi.priority)`

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 5 | **Importance of KPI** | `priority` | `text` | Rich text block | Pre-formatted text |

### Core Area Section

**Section ID**: `Core area`  
**Heading**: "Core area of KPI Analysis" (H2)  
**Function**: `renderRichTextBlock('Core area', 'Core area of KPI Analysis', kpi.core_area)`

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 6 | **Core area of KPI Analysis** | `core_area` | `text` | Rich text block | Pre-formatted text |

### Scope Section

**Section ID**: `Scope`  
**Heading**: "Scope at which KPI is analyzed" (H2)  
**Function**: `renderRichTextBlock('Scope', 'Scope at which KPI is analyzed', kpi.scope)`

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 7 | **Scope at which KPI is analyzed** | `scope` | `text` | Rich text block | Pre-formatted text |

### Formula Section

**Section ID**: `formula`  
**Heading**: "Formula" (H2)  
**Function**: `renderCodeBlock('formula', 'Formula', kpi.formula, 'text')`  
**Table of Contents**: ✅ Included (if field exists)

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 8 | **Formula** | `formula` | `text` | Code block | Monospace, syntax highlighting (text) |

### SQL Query Section

**Section ID**: `sql-query`  
**Heading**: "SQL Query" (H2)  
**Function**: `renderCodeBlock('sql-query', 'SQL Query', normalizeSqlQuery(kpi.sql_query), 'sql')`  
**Table of Contents**: ✅ Included (if field exists)  
**Normalization**: Legacy SQL with `<br>` tags and JSON arrays are normalized

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 9 | **SQL Query** | `sql_query` | `text` | Code block | Monospace, SQL syntax highlighting, normalized |

### Calculation Notes Section

**Section ID**: `calculation-notes`  
**Heading**: "Calculation Notes" (H2)  
**Function**: `renderRichTextBlock('calculation-notes', 'Calculation Notes', kpi.calculation_notes)`  
**Table of Contents**: ✅ Included (if field exists)

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 10 | **Calculation Notes** | `calculation_notes` | `text` | Rich text block | Pre-formatted text |

### Events Section

**Section ID**: `overview`  
**Heading**: "Events" (H2)  
**Function**: `renderTokenPills()`  
**Note**: This section is labeled "Events" but displays platform implementation fields from the KPI table, NOT from a separate Events table.

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 11 | **Google Analytics 4** | `ga4_implementation` | `text` | Token pill | Only shown if field has value |
| 12 | **Adobe** | `adobe_implementation` | `text` | Token pill | Only shown if field has value |
| 13 | **Amplitude** | `amplitude_implementation` | `text` | Token pill | Only shown if field has value |

### Data Layer Mapping Section

**Section ID**: `data-layer-mapping`  
**Heading**: "Data Layer Mapping" (H2)  
**Function**: `renderCodeBlock('data-layer-mapping', 'Data Layer Mapping', normalizeJsonMapping(kpi.data_layer_mapping), 'json')`  
**Table of Contents**: ✅ Included (if field exists)  
**Normalization**: JSON is normalized and pretty-printed

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 14 | **Data Layer Mapping** | `data_layer_mapping` | `text` | Code block | JSON format, syntax highlighting, normalized |

### XDM Mapping Section

**Section ID**: `xdm-mapping`  
**Heading**: "XDM Mapping" (H2)  
**Function**: `renderCodeBlock('xdm-mapping', 'XDM Mapping', normalizeJsonMapping(kpi.xdm_mapping), 'json')`  
**Table of Contents**: ✅ Included (if field exists)  
**Normalization**: JSON is normalized and pretty-printed

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 15 | **XDM Mapping** | `xdm_mapping` | `text` | Code block | JSON format, syntax highlighting, normalized |

### Governance Section

**Section ID**: `overview` (same as Events)  
**Heading**: "Governance" (H2)  
**Function**: `renderDetailRow()` - displays label/value pairs

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 16 | **Created by** | `created_by` | `text` | Label/Value row | User identifier |
| 17 | **Created on** | `created_at` | `timestamp` | Label/Value row | Formatted as locale date string |
| 18 | **Last modified by** | `last_modified_by` | `text` | Label/Value row | User identifier (if exists) |
| 19 | **Last modified on** | `last_modified_at` | `timestamp` | Label/Value row | Formatted as locale date string (if exists) |
| 20 | **Status** | `status` | `text` | Label/Value row | Uppercase display (DRAFT/PUBLISHED/ARCHIVED) |

### GitHub Section

**Section ID**: `github`  
**Heading**: "GitHub" (H2)  
**Conditional**: Only shown if `github_pr_url` exists  
**Function**: Link and code display

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| 21 | **View related Pull Request** | `github_pr_url` | `text` | External link | Opens in new tab |
| 22 | **File Path** | `github_file_path` | `text` | Code display | Only shown if exists |

### Community Discussion Section

**Section ID**: `discussion`  
**Heading**: "Community Discussion" (H2)  
**Component**: `<GiscusComments>`  
**Uses**: `kpi.slug` for discussion thread identification

| # | Display Label | Supabase Field | Supabase Type | Display Format | Notes |
|---|---------------|----------------|---------------|----------------|-------|
| N/A | **Discussion Thread** | `slug` | `text` | Giscus widget | Uses slug to identify discussion thread |

### Table of Contents

**Component**: `<TableOfContents headings={headings} />`  
**Function**: `buildHeadings(kpi)` - dynamically builds TOC based on available fields

**Included Sections** (only if field has value):
- Overview (always included)
- Formula (if `formula` exists)
- Details (if `details` exists)
- GA4 Implementation (if `ga4_implementation` exists)
- Adobe Implementation (if `adobe_implementation` exists)
- Amplitude Implementation (if `amplitude_implementation` exists)
- Data Layer Mapping (if `data_layer_mapping` exists)
- XDM Mapping (if `xdm_mapping` exists)
- SQL Query (if `sql_query` exists)
- Calculation Notes (if `calculation_notes` exists)

### Fields Fetched but NOT Displayed

These fields are fetched from Supabase but are **NOT displayed** anywhere on the detail page:

| Supabase Field | Type | Reason Not Displayed |
|----------------|------|---------------------|
| `id` | `uuid` | Internal ID, not needed for display |
| `slug` | `text` | Used in URL/routing, not displayed (but used for Giscus) |
| `category` | `text` | Not included in page layout |
| `tags` | `text[]` | Not included in page layout |
| `industry` | `text[]` | Not included in page layout |
| `kpi_type` | `text` | Not included in page layout |
| `metric` | `text` | Not included in page layout |
| `aggregation_window` | `text` | Not included in page layout |
| `dependencies` | `text` | Not included in page layout |
| `bi_source_system` | `text` | Not included in page layout |
| `report_attributes` | `text` | Not included in page layout |
| `dashboard_usage` | `text` | Not included in page layout |
| `segment_eligibility` | `text` | Not included in page layout |
| `related_kpis` | `text[]` | Not included in page layout |
| `validation_status` | `text` | Not included in page layout |
| `version` | `text` | Not included in page layout |
| `data_sensitivity` | `text` | Not included in page layout |
| `pii_flag` | `boolean` | Not included in page layout |
| `github_pr_number` | `integer` | Not displayed (only URL shown) |
| `github_commit_sha` | `text` | Not included in page layout |
| `approved_by` | `text` | Not included in page layout |
| `approved_at` | `timestamp` | Not included in page layout |
| `reviewed_by` | `text[]` | Not included in page layout |
| `reviewed_at` | `text` | Not included in page layout |
| `publisher_id` | `text` | Not included in page layout |
| `published_at` | `timestamp` | Not included in page layout |
| `aliases` | `text[]` | Not included in page layout |
| `owner` | `text` | Not included in page layout |

### Summary

- **Total fields fetched**: All fields from `prod_kpis` table (via `SELECT *`)
- **Total fields displayed**: 22 fields (including slug used for Giscus)
- **Data source**: Single table `prod_kpis` (no joins to Events table)
- **Conditional sections**: GitHub section only shown if `github_pr_url` exists
- **Dynamic TOC**: Table of Contents built dynamically based on available fields
- **Normalization**: SQL and JSON fields are normalized before display
- **Events section**: Shows platform implementation fields from KPI table, NOT from separate Events table

---

## Summary and Key Findings

### New KPI Form
- ✅ **All 6 fields are properly mapped and saved**
- ✅ **No issues** - form works correctly
- ✅ **API endpoint**: `POST /api/items/create`

### Edit KPI Form
- ⚠️ **7 fields are NOT saved** when form is submitted:
  1. `dependencies` (no UI, but in FormData)
  2. `bi_source_system` (no UI, but in FormData)
  3. `report_attributes` (no UI, but in FormData)
  4. `dashboard_usage` (no UI, but in FormData)
  5. `segment_eligibility` (no UI, but in FormData)
  6. `measure` → should map to `metric` (field name mismatch, has UI)
  7. `related_kpis` (has UI, but not saved)
- ✅ **20 fields are properly saved**
- ⚠️ **Issue**: Missing fields in `KPI_FIELDS` payload builder

### KPI Detail Page
- ✅ **Fetches all fields** from `prod_kpis` table (via `SELECT *`)
- ✅ **Displays 22 fields** across 12 sections
- ✅ **"Events" section** shows platform implementation fields from KPI table (NOT from separate Events table)
- ✅ **Dynamic Table of Contents** based on available fields
- ⚠️ **Many database fields not displayed** (tags, category, industry, etc.)

---

## Recommendations

### 1. Fix Edit Form - Add Missing Fields to Payload Builder

**File**: `lib/services/entityUpdates.ts`  
**Function**: `KPI_FIELDS` payload builder

Add the following fields to the return object:

```typescript
const KPI_FIELDS: PayloadBuilder = (data, userHandle) => {
  // ... existing code ...
  
  return {
    // ... existing fields ...
    
    // Add these missing fields:
    measure: toString(data.measure), // Maps to 'metric' column
    dependencies: toString(data.dependencies),
    bi_source_system: toString(data.bi_source_system),
    report_attributes: toString(data.report_attributes),
    dashboard_usage: toString(data.dashboard_usage),
    segment_eligibility: toString(data.segment_eligibility),
    related_kpis: toStringArray(data.related_kpis),
    
    // ... rest of fields ...
  };
};
```

**Note**: The `measure` field from the form should map to the `metric` column in Supabase. Update the database insert/update to use `metric` as the column name.

### 2. Consider Adding UI for Missing Fields

The following fields exist in `FormData` but have no UI controls in the Edit form:
- `dependencies`
- `bi_source_system`
- `report_attributes`
- `dashboard_usage`
- `segment_eligibility`

**Options**:
- Add form controls for these fields if they should be editable
- Remove them from `FormData` if they're not needed
- Keep them for future use but document they're not editable

### 3. Consider Displaying Additional Fields on Detail Page

The following fields are fetched but not displayed:
- `category` - Could be shown as a badge or tag
- `tags` - Could be displayed as pills/chips
- `industry` - Could be shown in Business Context section
- `kpi_type` - Could be shown in Technical section
- `metric` - Could be shown in Technical section
- `aggregation_window` - Could be shown in Technical section
- `related_kpis` - Could be shown as links to related KPIs

**Recommendation**: Consider adding these fields to appropriate sections if they provide value to users.

### 4. Fix Field Name Mismatch

**Issue**: Form uses `measure` but database column is `metric`

**Solution**: Either:
- Update form to use `metric` instead of `measure`, OR
- Map `measure` → `metric` in the payload builder (recommended to maintain form consistency)