# KPIs Table Schema Verification

## Database Schema Analysis

### Column Count
- **prod_kpis**: 50 columns
- **dev_kpis**: 50 columns

---

## Required Fields Verification

### ✅ Core Fields (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `id` | uuid | ✅ | Primary key |
| `slug` | text | ✅ | Unique identifier |
| `name` | text | ✅ | Required |
| `description` | text | ✅ | |
| `formula` | text | ✅ | **CRITICAL** - Present |
| `category` | text | ✅ | |
| `tags` | ARRAY | ✅ | |

### ✅ Business Context (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `industry` | text | ✅ | Note: Code expects `string[]` but DB has `text` |
| `priority` | text | ✅ | |
| `core_area` | text | ✅ | |
| `scope` | text | ✅ | |

### ✅ Technical Fields (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `measure_type` | text | ✅ | |
| `aggregation_window` | text | ✅ | |

### ✅ Platform Events (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `ga4_event` | text | ✅ | |
| `adobe_event` | text | ✅ | |

### ✅ Data Mappings (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `w3_data_layer` | text | ✅ | |
| `ga4_data_layer` | text | ✅ | |
| `adobe_client_data_layer` | text | ✅ | |
| `xdm_mapping` | text | ✅ | |

### ✅ SQL & Documentation (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `sql_query` | text | ✅ | |
| `calculation_notes` | text | ✅ | |
| `business_use_case` | text | ✅ | |

### ✅ Additional Fields (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `dependencies` | jsonb | ✅ | **Correct type** (JSONB) |
| `source_data` | text | ✅ | |
| `report_attributes` | text | ✅ | |
| `dashboard_usage` | ARRAY | ✅ | |
| `segment_eligibility` | text | ✅ | |
| `related_kpis` | ARRAY | ✅ | |

### ✅ Governance (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `status` | text | ✅ | |
| `validation_status` | text | ✅ | |
| `data_sensitivity` | text | ✅ | |
| `pii_flag` | boolean | ✅ | |

### ✅ GitHub Sync (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `github_pr_url` | text | ✅ | |
| `github_pr_number` | integer | ✅ | |
| `github_commit_sha` | text | ✅ | |
| `github_file_path` | text | ✅ | |

### ✅ Contribution Tracking (All Present)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `created_by` | text | ✅ | |
| `created_at` | timestamp | ✅ | |
| `last_modified_by` | text | ✅ | |
| `last_modified_at` | timestamp | ✅ | |
| `approved_by` | text | ✅ | |
| `approved_at` | timestamp | ✅ | |

### ⚠️ Missing Fields (From TypeScript Interface)

| Field | Expected Type | Status | Notes |
|-------|---------------|--------|-------|
| `version` | text | ❌ **MISSING** | Version field |
| `reviewed_by` | string[] | ❌ **MISSING** | Array of reviewers |
| `reviewed_at` | string | ❌ **MISSING** | Review timestamp |
| `publisher_id` | string | ❌ **MISSING** | Publisher identifier |
| `published_at` | string | ❌ **MISSING** | Publication timestamp |
| `aliases` | string[] | ❌ **MISSING** | Alternative names |
| `owner` | string | ❌ **MISSING** | Owner field |

### ✅ Extra Fields (Not in TypeScript Interface)

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `dashboards` | ARRAY | ⚠️ **EXTRA** | Not in TypeScript interface |
| `kpi_type` | text | ⚠️ **EXTRA** | Not in TypeScript interface |
| `measure_aggregation` | text | ⚠️ **EXTRA** | Not in TypeScript interface |
| `related_dimensions` | ARRAY | ⚠️ **EXTRA** | Not in TypeScript interface (but may be used) |
| `related_events` | ARRAY | ⚠️ **EXTRA** | Not in TypeScript interface (but may be used) |
| `related_metrics` | ARRAY | ⚠️ **EXTRA** | Not in TypeScript interface (but may be used) |

---

## Summary

### ✅ Present Fields: 43/50
- All critical fields are present
- `formula` field exists ✅
- `dependencies` is correctly typed as JSONB ✅
- All business, technical, and platform fields present ✅

### ❌ Missing Fields: 7
1. `version` (text)
2. `reviewed_by` (ARRAY)
3. `reviewed_at` (timestamp)
4. `publisher_id` (text)
5. `published_at` (timestamp)
6. `aliases` (ARRAY)
7. `owner` (text)

### ⚠️ Extra Fields: 6
1. `dashboards` (ARRAY) - May be legacy or unused
2. `kpi_type` (text) - May be legacy or unused
3. `measure_aggregation` (text) - May be legacy or unused
4. `related_dimensions` (ARRAY) - May be used but not in interface
5. `related_events` (ARRAY) - May be used but not in interface
6. `related_metrics` (ARRAY) - May be used but not in interface

---

## Impact Assessment

### ✅ Low Impact Missing Fields
The missing fields (`version`, `reviewed_by`, `reviewed_at`, `publisher_id`, `published_at`, `aliases`, `owner`) are:
- Optional fields in the TypeScript interface
- Not used in create/edit forms
- Not displayed on detail pages
- Not included in GitHub sync

**Impact**: ⚠️ **MINIMAL** - These fields are optional and not currently used in the codebase.

### ⚠️ Potential Issues with Extra Fields
The extra fields (`dashboards`, `kpi_type`, `measure_aggregation`, `related_dimensions`, `related_events`, `related_metrics`) may:
- Be legacy fields that should be removed
- Be used in code but not in the TypeScript interface
- Need to be added to the TypeScript interface if they're being used

**Action**: Review codebase to see if these fields are used anywhere.

---

## Recommendation

### ✅ **KPIs Table is FUNCTIONAL**

The KPIs table has all **critical fields** required for:
- ✅ Creating KPIs
- ✅ Editing KPIs
- ✅ Displaying KPIs on detail pages
- ✅ Syncing to GitHub

### Optional: Add Missing Fields

If you want to add the missing optional fields, run:

```sql
-- Add missing optional fields to KPIs tables
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS version TEXT;
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS reviewed_by TEXT[];
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS publisher_id TEXT;
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS aliases TEXT[];
ALTER TABLE dev_kpis ADD COLUMN IF NOT EXISTS owner TEXT;

ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS version TEXT;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS reviewed_by TEXT[];
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS publisher_id TEXT;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS aliases TEXT[];
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS owner TEXT;
```

---

## Status: ✅ **KPIs TABLE IS FUNCTIONAL**

All critical fields are present. The missing fields are optional and not used in current codebase.

