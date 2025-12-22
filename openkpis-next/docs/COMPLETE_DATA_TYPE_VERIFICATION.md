# Complete Data Type Verification for KPI Table

## Comprehensive Check: Create Form → Edit Form → Detail Page

This document verifies the expected Supabase data types for all KPI fields based on:
1. **Create Form** (`app/(content)/kpis/new/page.tsx`)
2. **Edit Form** (`app/(content)/kpis/[slug]/edit/KPIEditClient.tsx`)
3. **Payload Builder** (`lib/services/entityUpdates.ts`)
4. **Detail Page Retrieval** (`lib/server/kpis.ts`)

---

## Field-by-Field Verification

### Core Fields

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `id` | Auto | Auto | Auto | UUID | `uuid` | ✅ |
| `slug` | Text | - | String | String | `text` | ✅ |
| `name` | Text | Text | `toString()` | String | `text` | ✅ |
| `description` | Textarea | Textarea | `toString()` | String | `text` | ✅ |
| `formula` | Text | Text | `toString()` | String | `text` | ✅ |
| `category` | Select | Select | `toString()` | String | `text` | ✅ |
| `tags` | TagsInput | TagsInput | `toStringArray()` | Array | `text[]` | ✅ |

### Business Context

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `industry` | - | Select | `toStringArray()` | Array | `text[]` | ✅ |
| `priority` | - | Select | `toString()` | String | `text` | ✅ |
| `core_area` | - | Text | `toString()` | String | `text` | ✅ |
| `scope` | - | Select | `toString()` | String | `text` | ✅ |
| `related_kpis` | - | Text (semicolon) | `semicolonToArray()` | Array | `text[]` | ✅ |
| `Source_Data` | - | Text | `toString()` | String | `text` | ✅ |
| `report_attributes` | - | Textarea | `toString()` | String | `text` | ✅ |
| `dashboard_usage` | - | Text (semicolon) | `semicolonToArray()` | Array | `text[]` ⚠️ | ⚠️ Needs migration |
| `segment_eligibility` | - | Textarea | `toString()` | String | `text` | ✅ |
| `dependencies` | - | Structured JSON | `toString()` (JSON string) | String | `jsonb` ⚠️ | ⚠️ Should be JSONB |

### Technical

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `measure_type` | - | Select | `toString()` | String | `text` | ✅ |
| `aggregation_window` | - | Text | `toString()` | String | `text` | ✅ |

### Platform Events

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `ga4_event` | - | Textarea | `toString()` | String | `text` | ✅ |
| `adobe_event` | - | Textarea | `toString()` | String | `text` | ✅ |

### Data Mappings (JSON stored as TEXT)

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `W3_data_layer` | - | Textarea | `toString()` | String | `text` | ✅ |
| `GA4_data_layer` | - | Textarea | `toString()` | String | `text` | ✅ |
| `Adobe_client_data_layer` | - | Textarea | `toString()` | String | `text` | ✅ |
| `xdm_mapping` | - | Textarea | `toString()` | String | `text` | ✅ |

### SQL

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `sql_query` | - | Textarea | `toString()` | String | `text` | ✅ |

### Documentation

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `calculation_notes` | - | Textarea | `toString()` | String | `text` | ✅ |
| `Business_Use_Case` | - | Textarea | `toString()` | String | `text` | ✅ |

### Governance

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `status` | Auto ('draft') | Auto ('draft') | 'draft' | String | `text` | ✅ |
| `validation_status` | - | - | - | String? | `text` | ✅ |
| `version` | - | - | - | String? | `text` | ✅ |
| `data_sensitivity` | - | Select | `toString()` | String | `text` | ✅ |
| `pii_flag` | - | Checkbox | `toBoolean()` | Boolean | `boolean` | ✅ |

### GitHub

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `github_pr_url` | - | - | - | String? | `text` | ✅ |
| `github_pr_number` | - | - | - | Number? | `integer` | ✅ |
| `github_commit_sha` | - | - | - | String? | `text` | ✅ |
| `github_file_path` | - | - | - | String? | `text` | ✅ |

### Contribution (Auto-managed)

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `created_by` | Auto | - | - | String | `text` | ✅ |
| `created_at` | Auto | - | - | String | `timestamptz` | ✅ |
| `last_modified_by` | - | Auto | userHandle | String | `text` | ✅ |
| `last_modified_at` | - | Auto | ISO string | String | `timestamptz` | ✅ |
| `approved_by` | - | - | - | String? | `text` | ✅ |
| `approved_at` | - | - | - | String? | `timestamptz` | ✅ |
| `reviewed_by` | - | - | - | Array? | `text[]` | ✅ |
| `reviewed_at` | - | - | - | String? | `text` | ✅ |
| `publisher_id` | - | - | - | String? | `text` | ✅ |
| `published_at` | - | - | - | String? | `timestamptz` | ✅ |

### Metadata

| Field | Create Form | Edit Form | Payload Builder | Retrieval | **Expected Supabase Type** | Status |
|-------|-------------|-----------|-----------------|-----------|---------------------------|--------|
| `aliases` | - | - | - | Array? | `text[]` | ✅ |
| `owner` | - | - | - | String? | `text` | ✅ |

---

## Critical Issues Found

### ⚠️ Issue 1: `dashboard_usage` - Type Mismatch
- **Code Expects**: `text[]` (array)
- **Payload Builder**: `semicolonToArray()` → converts to array
- **Retrieval**: `toStringArray()` → expects array
- **Current DB**: `TEXT` (from original migration)
- **Required DB**: `TEXT[]`
- **Status**: ❌ **MIGRATION REQUIRED**

### ⚠️ Issue 2: `dependencies` - Should be JSONB
- **Code Expects**: JSON string (stored as TEXT currently)
- **Form Handling**: `JSON.stringify(formData.dependenciesData)` → converts structured object to JSON string
- **Payload Builder**: `toString()` → stores JSON string
- **Retrieval**: String (parsed as JSON in form with `JSON.parse()`)
- **Current DB**: `TEXT`
- **Recommended DB**: `JSONB` (better querying, validation, indexing)
- **Status**: ⚠️ **RECOMMENDED TO CHANGE TO JSONB**
- **Note**: Code works with TEXT, but JSONB provides better functionality

---

## Data Type Summary

### Arrays (TEXT[]) - 7 fields
1. ✅ `tags` - `text[]`
2. ✅ `industry` - `text[]`
3. ✅ `related_kpis` - `text[]`
4. ⚠️ `dashboard_usage` - `text[]` (needs migration)
5. ✅ `reviewed_by` - `text[]`
6. ✅ `aliases` - `text[]`

### JSON/JSONB - 5 fields
1. ⚠️ `dependencies` - `jsonb` (recommended) or `text` (current)
2. ✅ `W3_data_layer` - `text` (JSON string)
3. ✅ `GA4_data_layer` - `text` (JSON string)
4. ✅ `Adobe_client_data_layer` - `text` (JSON string)
5. ✅ `xdm_mapping` - `text` (JSON string)

### Boolean - 1 field
1. ✅ `pii_flag` - `boolean`

### Integer - 1 field
1. ✅ `github_pr_number` - `integer`

### UUID - 1 field
1. ✅ `id` - `uuid`

### Timestamps (timestamptz) - 4 fields
1. ✅ `created_at` - `timestamptz`
2. ✅ `last_modified_at` - `timestamptz`
3. ✅ `approved_at` - `timestamptz`
4. ✅ `published_at` - `timestamptz`

### Text - All others (30+ fields)
All remaining fields are `text` type.

---

## Payload Builder Analysis

### Array Conversions
- `tags`: `toStringArray()` → `text[]` ✅
- `industry`: `toStringArray()` → `text[]` ✅
- `dashboard_usage`: `semicolonToArray()` → `text[]` ⚠️ (DB needs update)
- `related_kpis`: `semicolonToArray()` → `text[]` ✅

### Boolean Conversions
- `pii_flag`: `toBoolean()` → `boolean` ✅

### String Conversions
- All other fields: `toString()` → `text` ✅

### Special Handling
- `dependencies`: `toString()` → stores JSON string → should be `jsonb` ⚠️

---

## Retrieval Analysis (`lib/server/kpis.ts`)

### Normalization Function
- `tags`: `toStringArray()` → always returns `string[]` ✅
- `industry`: `toStringArray()` → always returns `string[]` ✅
- `related_kpis`: `toStringArray()` → always returns `string[]` ✅
- `dashboard_usage`: `toStringArray()` → always returns `string[]` ⚠️ (DB needs update)

### Type Safety
- `KpiRow`: Handles both `string[]` and `string` from DB
- `NormalizedKpi`: Always returns `string[]` for arrays
- Handles edge cases (null, empty, JSON arrays)

---

## Final Recommendations

### Required Migrations

1. **`dashboard_usage`**: TEXT → TEXT[]
   - Code expects array
   - Payload builder converts to array
   - Retrieval expects array
   - **MIGRATION REQUIRED**

2. **`dependencies`**: TEXT → JSONB (Recommended)
   - Better querying capabilities
   - JSON validation at DB level
   - Indexing support
   - **RECOMMENDED MIGRATION**

### Verification Query

After migrations, verify with:
```sql
SELECT 
  column_name, 
  data_type, 
  udt_name,
  CASE 
    WHEN data_type = 'ARRAY' THEN 'Array'
    WHEN data_type = 'USER-DEFINED' AND udt_name = 'jsonb' THEN 'JSONB'
    WHEN data_type = 'USER-DEFINED' AND udt_name = 'uuid' THEN 'UUID'
    ELSE data_type
  END as type_category
FROM information_schema.columns 
WHERE table_name = 'prod_kpis' 
ORDER BY ordinal_position;
```

---

## Detailed Field Analysis

### Create Form Fields (6 fields)
1. `name` - text ✅
2. `slug` - text ✅
3. `description` - text ✅
4. `formula` - text ✅
5. `category` - text ✅
6. `tags` - text[] ✅

**Auto-set on create**:
- `status` - 'draft' (text) ✅
- `created_by` - text ✅
- `created_at` - timestamptz ✅

### Edit Form Fields (26 editable fields)
All fields from Create Form plus:
- Business Context: `industry`, `priority`, `core_area`, `scope`, `related_kpis`, `Source_Data`, `report_attributes`, `dashboard_usage`, `segment_eligibility`, `data_sensitivity`, `pii_flag`
- Technical: `measure_type`, `aggregation_window`
- Platform Events: `ga4_event`, `adobe_event`
- Data Mappings: `W3_data_layer`, `GA4_data_layer`, `Adobe_client_data_layer`, `xdm_mapping`
- SQL: `sql_query`
- Documentation: `calculation_notes`, `Business_Use_Case`
- Dependencies: `dependencies` (structured JSON)

**Auto-set on update**:
- `status` - 'draft' (text) ✅
- `last_modified_by` - text ✅
- `last_modified_at` - timestamptz ✅

### Detail Page Retrieval
- Uses `select('*')` → fetches all columns ✅
- Normalizes arrays: `tags`, `industry`, `related_kpis`, `dashboard_usage` ✅
- Handles both string and array formats from DB ✅

## Summary

- ✅ **47 fields** have correct types
- ⚠️ **1 field** needs migration (`dashboard_usage`: TEXT → TEXT[])
- ⚠️ **1 field** recommended to change (`dependencies`: TEXT → JSONB)

**Total Fields Checked**: 49  
**Correct**: 47  
**Needs Migration**: 1  
**Recommended Change**: 1

## Migration Priority

1. **HIGH PRIORITY**: `dashboard_usage` TEXT → TEXT[] (code expects array)
2. **MEDIUM PRIORITY**: `dependencies` TEXT → JSONB (better functionality, but works with TEXT)

