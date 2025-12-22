# Final KPI Schema Migration Guide

## Summary

This document provides the **final, complete data types** for all KPI table fields and the migration script to update the database.

## Key Changes Required

### 1. `dependencies` - Change to JSONB ✅ RECOMMENDED
- **Current**: `TEXT` (stores JSON string)
- **Recommended**: `JSONB` (better querying, validation, indexing)
- **Reason**: Structured JSON data benefits from JSONB type

### 2. `dashboard_usage` - Change to TEXT[] ✅ REQUIRED
- **Current**: `TEXT` 
- **Required**: `TEXT[]` (array type)
- **Reason**: Code expects array, database has TEXT

### 3. `related_kpis` - Already TEXT[] ✅ CORRECT
- **Current**: `TEXT[]`
- **Status**: No change needed

---

## Complete Field Data Types

| Field Name | Supabase Type | Notes |
|------------|---------------|-------|
| `id` | `uuid` | Primary key |
| `slug` | `text` | Unique identifier |
| `name` | `text` | Required |
| `description` | `text` | |
| `formula` | `text` | |
| `category` | `text` | |
| `tags` | `text[]` | Array |
| `industry` | `text[]` | Array |
| `priority` | `text` | |
| `core_area` | `text` | |
| `scope` | `text` | |
| `related_kpis` | `text[]` | Array ✅ |
| `measure_type` | `text` | |
| `aggregation_window` | `text` | |
| `ga4_event` | `text` | |
| `adobe_event` | `text` | |
| `W3_data_layer` | `text` | JSON string |
| `GA4_data_layer` | `text` | JSON string |
| `Adobe_client_data_layer` | `text` | JSON string |
| `xdm_mapping` | `text` | JSON string |
| `sql_query` | `text` | |
| `calculation_notes` | `text` | |
| `Business_Use_Case` | `text` | |
| `dependencies` | `jsonb` ⚠️ | **CHANGE FROM TEXT** |
| `Source_Data` | `text` | |
| `report_attributes` | `text` | |
| `dashboard_usage` | `text[]` ⚠️ | **CHANGE FROM TEXT** |
| `segment_eligibility` | `text` | |
| `status` | `text` | |
| `validation_status` | `text` | |
| `version` | `text` | |
| `data_sensitivity` | `text` | |
| `pii_flag` | `boolean` | |
| `github_pr_url` | `text` | |
| `github_pr_number` | `integer` | |
| `github_commit_sha` | `text` | |
| `github_file_path` | `text` | |
| `created_by` | `text` | |
| `created_at` | `timestamptz` | |
| `last_modified_by` | `text` | |
| `last_modified_at` | `timestamptz` | |
| `approved_by` | `text` | |
| `approved_at` | `timestamptz` | |
| `reviewed_by` | `text[]` | Array |
| `reviewed_at` | `text` | |
| `publisher_id` | `text` | |
| `published_at` | `timestamptz` | |
| `aliases` | `text[]` | Array |
| `owner` | `text` | |

---

## Migration Script

**File**: `scripts/migrations/update-dashboard-usage-dependencies.sql`

This script will:
1. ✅ Convert `dashboard_usage` from TEXT to TEXT[]
2. ✅ Convert `dependencies` from TEXT to JSONB
3. ✅ Migrate existing data safely
4. ✅ Add column comments

---

## How to Apply Migration

1. **Backup your database** ⚠️ CRITICAL
2. Open Supabase SQL Editor
3. Copy contents of `scripts/migrations/update-dashboard-usage-dependencies.sql`
4. Run the script
5. Verify with:
   ```sql
   SELECT column_name, data_type, udt_name 
   FROM information_schema.columns 
   WHERE table_name = 'prod_kpis' 
   AND column_name IN ('dashboard_usage', 'dependencies', 'related_kpis')
   ORDER BY column_name;
   ```

---

## Expected Results After Migration

| Column | data_type | udt_name |
|--------|-----------|----------|
| `dependencies` | `jsonb` | `jsonb` |
| `dashboard_usage` | `ARRAY` | `_text` |
| `related_kpis` | `ARRAY` | `_text` |

---

## Code Compatibility

The code is already compatible with these changes:

- **dependencies**: Code stores as JSON string, Supabase JSONB accepts JSON strings
- **dashboard_usage**: Code expects array, will work after migration
- **related_kpis**: Already array, no changes needed

---

## Notes

- **dependencies as JSONB**: Supabase will automatically parse JSON strings when inserting into JSONB columns
- **dashboard_usage migration**: Existing semicolon-separated values will be converted to arrays
- **Data safety**: Migration preserves all existing data

