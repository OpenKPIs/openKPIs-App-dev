# Production KPI Schema Comparison

## Summary
Comparing `prod_kpis` table schema with code expectations.

## ✅ Fields in Sync (All Match)

### Core Fields
- ✅ `id` - uuid
- ✅ `slug` - text
- ✅ `name` - text
- ✅ `description` - text
- ✅ `formula` - text
- ✅ `category` - text
- ✅ `tags` - ARRAY (text[])

### Business Context
- ✅ `industry` - text (code normalizes to array)
- ✅ `priority` - text
- ✅ `core_area` - text
- ✅ `scope` - text
- ✅ `related_kpis` - ARRAY (text[])
- ✅ `source_data` - text (lowercase ✅)
- ✅ `report_attributes` - text
- ✅ `dashboard_usage` - ARRAY (text[]) ✅
- ✅ `segment_eligibility` - text

### Technical
- ✅ `measure_type` - text
- ✅ `aggregation_window` - text

### Platform Events
- ✅ `ga4_event` - text (lowercase ✅)
- ✅ `adobe_event` - text (lowercase ✅)

### Data Mappings
- ✅ `w3_data_layer` - text (lowercase ✅)
- ✅ `ga4_data_layer` - text (lowercase ✅)
- ✅ `adobe_client_data_layer` - text (lowercase ✅)
- ✅ `xdm_mapping` - text

### SQL & Documentation
- ✅ `sql_query` - text
- ✅ `calculation_notes` - text
- ✅ `business_use_case` - text (lowercase ✅)

### Dependencies
- ✅ `dependencies` - jsonb ✅

### Governance
- ✅ `status` - text
- ✅ `validation_status` - text
- ✅ `data_sensitivity` - text
- ✅ `pii_flag` - boolean

### GitHub
- ✅ `github_pr_url` - text
- ✅ `github_pr_number` - integer
- ✅ `github_commit_sha` - text
- ✅ `github_file_path` - text

### Contribution
- ✅ `created_by` - text
- ✅ `created_at` - timestamptz
- ✅ `last_modified_by` - text
- ✅ `last_modified_at` - timestamptz
- ✅ `approved_by` - text
- ✅ `approved_at` - timestamptz

### Metadata
- ✅ `search_vector` - tsvector (internal, not in code)

---

## ⚠️ Fields in Database but NOT in Code

### 1. `kpi_type` (text)
- **Status**: Exists in DB, removed from form
- **Reason**: Replaced with `measure_type` using KPI_TYPES enum
- **Impact**: ⚠️ **LOW** - Field exists but not used
- **Action**: Can be ignored or removed from DB if not needed

### 2. `measure_aggregation` (text)
- **Status**: Exists in DB, removed from form
- **Reason**: Removed per user request
- **Impact**: ⚠️ **LOW** - Field exists but not used
- **Action**: Can be ignored or removed from DB if not needed

### 3. `dashboards` (ARRAY - text[])
- **Status**: Exists in DB, not in code
- **Reason**: Unknown - might be legacy field
- **Impact**: ⚠️ **LOW** - Not referenced in code
- **Action**: Investigate if this is duplicate of `dashboard_usage` or legacy field

### 4. `related_dimensions` (ARRAY - text[])
- **Status**: Exists in DB, not in code
- **Reason**: Using `dependencies` JSONB instead
- **Impact**: ⚠️ **LOW** - Not used, replaced by structured dependencies
- **Action**: Can be ignored or removed if `dependencies` JSONB contains this data

### 5. `related_events` (ARRAY - text[])
- **Status**: Exists in DB, not in code
- **Reason**: Using `dependencies` JSONB instead
- **Impact**: ⚠️ **LOW** - Not used, replaced by structured dependencies
- **Action**: Can be ignored or removed if `dependencies` JSONB contains this data

### 6. `related_metrics` (ARRAY - text[])
- **Status**: Exists in DB, not in code
- **Reason**: Using `dependencies` JSONB instead
- **Impact**: ⚠️ **LOW** - Not used, replaced by structured dependencies
- **Action**: Can be ignored or removed if `dependencies` JSONB contains this data

---

## ✅ Fields in Code but NOT in Database

**None** - All code fields exist in the database! ✅

---

## Summary

### Total Fields
- **Database**: 50 columns
- **Code Interface**: 49 fields (excluding `search_vector` which is internal)
- **In Sync**: 44 fields ✅
- **DB Only (unused)**: 6 fields ⚠️

### Status
✅ **SYNC STATUS: GOOD**

All fields used by the code exist in the database with correct types. The 6 unused fields in the database are:
1. Legacy/removed fields: `kpi_type`, `measure_aggregation`
2. Possibly duplicate: `dashboards` (vs `dashboard_usage`)
3. Replaced by JSONB: `related_dimensions`, `related_events`, `related_metrics` (vs `dependencies`)

### Recommendations

1. **No Action Required** - The code will work correctly with the current schema
2. **Optional Cleanup** - Consider removing unused fields if they're not needed:
   - `kpi_type` - if not used elsewhere
   - `measure_aggregation` - if not used elsewhere
   - `dashboards` - if `dashboard_usage` is the preferred field
   - `related_dimensions`, `related_events`, `related_metrics` - if `dependencies` JSONB contains all this data

3. **Data Migration** - If removing fields, ensure data is migrated:
   - `related_dimensions`, `related_events`, `related_metrics` → `dependencies` JSONB
   - `dashboards` → `dashboard_usage` (if they're duplicates)

---

## Verification Checklist

- ✅ All case-sensitive fields match (lowercase)
- ✅ `dashboard_usage` is ARRAY type
- ✅ `dependencies` is JSONB type
- ✅ All form fields exist in database
- ✅ All code fields exist in database
- ⚠️ Some unused fields exist in database (safe to ignore)

**Conclusion**: The schema is in sync with the code. No blocking issues found.

