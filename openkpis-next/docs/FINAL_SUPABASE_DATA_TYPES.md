# Final Supabase Data Types for KPI Table

## Complete Verification Summary

This document provides the **final, verified data types** for all fields in the `prod_kpis` table based on thorough analysis of:
- Create Form (`app/(content)/kpis/new/page.tsx`)
- Edit Form (`app/(content)/kpis/[slug]/edit/KPIEditClient.tsx`)
- Payload Builder (`lib/services/entityUpdates.ts`)
- Detail Page Retrieval (`lib/server/kpis.ts`)

---

## All 49 Fields - Final Data Types

| # | Field Name | **Supabase Type** | TypeScript Type | Form Input | Payload Builder | Status |
|---|------------|-------------------|-----------------|------------|-----------------|--------|
| **Core Fields** |
| 1 | `id` | `uuid` | `string` | Auto | Auto | ✅ |
| 2 | `slug` | `text` | `string` | Text | String | ✅ |
| 3 | `name` | `text` | `string` | Text | `toString()` | ✅ |
| 4 | `description` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 5 | `formula` | `text` | `string?` | Text | `toString()` | ✅ |
| 6 | `category` | `text` | `string?` | Select | `toString()` | ✅ |
| 7 | `tags` | `text[]` | `string[]?` | TagsInput | `toStringArray()` | ✅ |
| **Business Context** |
| 8 | `industry` | `text[]` | `string[]?` | Select | `toStringArray()` | ✅ |
| 9 | `priority` | `text` | `string?` | Select | `toString()` | ✅ |
| 10 | `core_area` | `text` | `string?` | Text | `toString()` | ✅ |
| 11 | `scope` | `text` | `string?` | Select | `toString()` | ✅ |
| 12 | `related_kpis` | `text[]` | `string[]?` | Text (semicolon) | `semicolonToArray()` | ✅ |
| 13 | `Source_Data` | `text` | `string?` | Text | `toString()` | ✅ |
| 14 | `report_attributes` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 15 | `dashboard_usage` | `text[]` ⚠️ | `string[]?` | Text (semicolon) | `semicolonToArray()` | ⚠️ **MIGRATION NEEDED** |
| 16 | `segment_eligibility` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 17 | `dependencies` | `jsonb` ⚠️ | `string?` | Structured JSON | `toString()` (JSON string) | ⚠️ **RECOMMENDED: JSONB** |
| **Technical** |
| 18 | `measure_type` | `text` | `string?` | Select | `toString()` | ✅ |
| 19 | `aggregation_window` | `text` | `string?` | Text | `toString()` | ✅ |
| **Platform Events** |
| 20 | `ga4_event` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 21 | `adobe_event` | `text` | `string?` | Textarea | `toString()` | ✅ |
| **Data Mappings** |
| 22 | `W3_data_layer` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 23 | `GA4_data_layer` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 24 | `Adobe_client_data_layer` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 25 | `xdm_mapping` | `text` | `string?` | Textarea | `toString()` | ✅ |
| **SQL** |
| 26 | `sql_query` | `text` | `string?` | Textarea | `toString()` | ✅ |
| **Documentation** |
| 27 | `calculation_notes` | `text` | `string?` | Textarea | `toString()` | ✅ |
| 28 | `Business_Use_Case` | `text` | `string?` | Textarea | `toString()` | ✅ |
| **Governance** |
| 29 | `status` | `text` | `'draft' \| 'published' \| 'archived'` | Auto | 'draft' | ✅ |
| 30 | `validation_status` | `text` | `string?` | - | - | ✅ |
| 31 | `version` | `text` | `string?` | - | - | ✅ |
| 32 | `data_sensitivity` | `text` | `string?` | Select | `toString()` | ✅ |
| 33 | `pii_flag` | `boolean` | `boolean?` | Checkbox | `toBoolean()` | ✅ |
| **GitHub** |
| 34 | `github_pr_url` | `text` | `string?` | - | - | ✅ |
| 35 | `github_pr_number` | `integer` | `number?` | - | - | ✅ |
| 36 | `github_commit_sha` | `text` | `string?` | - | - | ✅ |
| 37 | `github_file_path` | `text` | `string?` | - | - | ✅ |
| **Contribution** |
| 38 | `created_by` | `text` | `string` | Auto | Auto | ✅ |
| 39 | `created_at` | `timestamptz` | `string` | Auto | Auto | ✅ |
| 40 | `last_modified_by` | `text` | `string?` | Auto | userHandle | ✅ |
| 41 | `last_modified_at` | `timestamptz` | `string?` | Auto | ISO string | ✅ |
| 42 | `approved_by` | `text` | `string?` | - | - | ✅ |
| 43 | `approved_at` | `timestamptz` | `string?` | - | - | ✅ |
| 44 | `reviewed_by` | `text[]` | `string[]?` | - | - | ✅ |
| 45 | `reviewed_at` | `text` | `string?` | - | - | ✅ |
| 46 | `publisher_id` | `text` | `string?` | - | - | ✅ |
| 47 | `published_at` | `timestamptz` | `string?` | - | - | ✅ |
| **Metadata** |
| 48 | `aliases` | `text[]` | `string[]?` | - | - | ✅ |
| 49 | `owner` | `text` | `string?` | - | - | ✅ |

---

## Data Type Categories

### Arrays (TEXT[]) - 7 fields
1. ✅ `tags` - `text[]`
2. ✅ `industry` - `text[]`
3. ✅ `related_kpis` - `text[]`
4. ⚠️ `dashboard_usage` - `text[]` (needs migration from TEXT)
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

### Text - 30 fields
All other fields are `text` type.

---

## Issues Found

### ⚠️ Issue 1: `dashboard_usage` - Type Mismatch
- **Current DB**: `TEXT`
- **Required DB**: `TEXT[]`
- **Code**: Expects array, converts semicolon-separated string to array
- **Priority**: **HIGH** - Migration required
- **Migration**: See `scripts/migrations/update-dashboard-usage-dependencies.sql`

### ⚠️ Issue 2: `dependencies` - Should be JSONB
- **Current DB**: `TEXT`
- **Recommended DB**: `JSONB`
- **Code**: Stores JSON string, works with TEXT but JSONB is better
- **Priority**: **MEDIUM** - Recommended improvement
- **Migration**: See `scripts/migrations/update-dashboard-usage-dependencies.sql`

---

## Verification Checklist

### Create Form
- ✅ All 6 fields have correct types
- ✅ Auto-set fields (`status`, `created_by`, `created_at`) correct

### Edit Form
- ✅ All 26 editable fields have correct types
- ✅ Array fields properly converted
- ✅ Boolean field properly converted
- ✅ Dependencies stored as JSON string
- ⚠️ `dashboard_usage` needs DB migration

### Payload Builder
- ✅ All conversions correct:
  - `toString()` for text fields
  - `toStringArray()` for array fields
  - `semicolonToArray()` for semicolon-separated fields
  - `toBoolean()` for boolean field

### Detail Page Retrieval
- ✅ Uses `select('*')` - fetches all fields
- ✅ Normalizes arrays correctly
- ✅ Handles both string and array formats

---

## Migration Script

**File**: `scripts/migrations/update-dashboard-usage-dependencies.sql`

**Changes**:
1. ✅ Converts `dashboard_usage` from TEXT to TEXT[]
2. ✅ Converts `dependencies` from TEXT to JSONB
3. ✅ Migrates existing data safely
4. ✅ Adds column comments

---

## Summary

- **Total Fields**: 49
- **Correct Types**: 47 ✅
- **Needs Migration**: 1 ⚠️ (`dashboard_usage`)
- **Recommended Change**: 1 ⚠️ (`dependencies`)

**All code is ready and compatible with the migrations.**

