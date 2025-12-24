# Metrics Table Schema Verification

## ⚠️ **CRITICAL ISSUES FOUND**

The Metrics table has **significant schema issues**:
- ❌ **Missing 20+ required columns**
- ⚠️ **Wrong field names** (legacy names still in use)
- ⚠️ **Wrong data types** (dashboard_usage should be ARRAY, dependencies should be JSONB)

---

## Current Schema Analysis

### Column Count
- **prod_metrics**: 45 columns
- **dev_metrics**: 45 columns

---

## Field Name Mismatches (Legacy Names)

| Current DB Name | Expected Name | Status | Action Needed |
|----------------|---------------|--------|---------------|
| `adobe_implementation` | `adobe_event` | ⚠️ **WRONG NAME** | Rename or add new column |
| `ga4_implementation` | `ga4_event` | ⚠️ **WRONG NAME** | Rename or add new column |
| `data_layer_mapping` | `w3_data_layer` | ⚠️ **WRONG NAME** | Rename or add new column |
| `bi_source_system` | `source_data` | ⚠️ **WRONG NAME** | Rename or add new column |
| `details` | `business_use_case` | ⚠️ **WRONG NAME** | Rename or add new column |
| `measure` | `measure_type` | ⚠️ **WRONG NAME** | Rename or add new column |

---

## Missing Required Fields

### ❌ Critical Missing Fields

| Field | Expected Type | Status | Notes |
|-------|---------------|--------|-------|
| `ga4_event` | text | ❌ **MISSING** | Currently `ga4_implementation` |
| `adobe_event` | text | ❌ **MISSING** | Currently `adobe_implementation` |
| `w3_data_layer` | text | ❌ **MISSING** | Currently `data_layer_mapping` |
| `ga4_data_layer` | text | ❌ **MISSING** | |
| `adobe_client_data_layer` | text | ❌ **MISSING** | |
| `source_data` | text | ❌ **MISSING** | Currently `bi_source_system` |
| `business_use_case` | text | ❌ **MISSING** | Currently `details` |
| `measure_type` | text | ❌ **MISSING** | Currently `measure` |
| `derived_kpis` | ARRAY | ❌ **MISSING** | **CRITICAL** - Used in code |

### ❌ Additional Missing Fields

| Field | Expected Type | Status |
|-------|---------------|--------|
| `version` | text | ❌ **MISSING** |
| `reviewed_by` | ARRAY | ❌ **MISSING** |
| `reviewed_at` | timestamp | ❌ **MISSING** |
| `publisher_id` | text | ❌ **MISSING** |
| `published_at` | timestamp | ❌ **MISSING** |
| `aliases` | ARRAY | ❌ **MISSING** |
| `owner` | text | ❌ **MISSING** |

---

## Wrong Data Types

| Field | Current Type | Expected Type | Status |
|-------|-------------|---------------|--------|
| `dashboard_usage` | text | ARRAY | ⚠️ **WRONG TYPE** |
| `dependencies` | text | jsonb | ⚠️ **WRONG TYPE** (or TEXT for JSON string) |

---

## Existing Fields (Correct)

### ✅ Core Fields Present

| Field | Type | Status |
|-------|------|--------|
| `id` | uuid | ✅ |
| `slug` | text | ✅ |
| `name` | text | ✅ |
| `description` | text | ✅ |
| `formula` | text | ✅ **CRITICAL** |
| `category` | text | ✅ |
| `tags` | ARRAY | ✅ |

### ✅ Business Context Present

| Field | Type | Status |
|-------|------|--------|
| `industry` | text | ✅ |
| `priority` | text | ✅ |
| `core_area` | text | ✅ |
| `scope` | text | ✅ |

### ✅ Technical Fields Present

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `aggregation_window` | text | ✅ | |
| `measure` | text | ⚠️ | Should be `measure_type` |

### ✅ Documentation Present

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `calculation_notes` | text | ✅ | |
| `details` | text | ⚠️ | Should be `business_use_case` |

### ✅ Additional Fields Present

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `dependencies` | text | ⚠️ | Should be JSONB or TEXT (for JSON) |
| `bi_source_system` | text | ⚠️ | Should be `source_data` |
| `report_attributes` | text | ✅ | |
| `dashboard_usage` | text | ⚠️ | Should be ARRAY |
| `segment_eligibility` | text | ✅ | |
| `related_metrics` | ARRAY | ✅ | |
| `related_kpis` | ARRAY | ✅ | |

### ✅ Governance Present

| Field | Type | Status |
|-------|------|--------|
| `status` | text | ✅ |
| `validation_status` | text | ✅ |
| `data_sensitivity` | text | ✅ |
| `pii_flag` | boolean | ✅ |

### ✅ GitHub Sync Present

| Field | Type | Status | Notes |
|-------|------|--------|-------|
| `github_pr_url` | text | ✅ | |
| `github_pr_number` | integer | ✅ | |
| `github_commit_sha` | text | ✅ | |
| `github_file_path` | text | ✅ | |
| `github_author` | text | ⚠️ **EXTRA** | Not in TypeScript interface |

### ✅ Contribution Tracking Present

| Field | Type | Status |
|-------|------|--------|
| `created_by` | text | ✅ |
| `created_at` | timestamp | ✅ |
| `last_modified_by` | text | ✅ |
| `last_modified_at` | timestamp | ✅ |
| `approved_by` | text | ✅ |
| `approved_at` | timestamp | ✅ |

---

## Summary

### ❌ Missing Fields: 20+

1. **Critical Missing:**
   - `ga4_event` (currently `ga4_implementation`)
   - `adobe_event` (currently `adobe_implementation`)
   - `w3_data_layer` (currently `data_layer_mapping`)
   - `ga4_data_layer`
   - `adobe_client_data_layer`
   - `source_data` (currently `bi_source_system`)
   - `business_use_case` (currently `details`)
   - `measure_type` (currently `measure`)
   - `derived_kpis` (ARRAY) - **CRITICAL**

2. **Optional Missing:**
   - `version`
   - `reviewed_by`
   - `reviewed_at`
   - `publisher_id`
   - `published_at`
   - `aliases`
   - `owner`

### ⚠️ Wrong Data Types: 2

1. `dashboard_usage` - Should be ARRAY, currently TEXT
2. `dependencies` - Should be JSONB (or TEXT for JSON), currently TEXT (may be OK)

### ⚠️ Wrong Field Names: 6

1. `adobe_implementation` → `adobe_event`
2. `ga4_implementation` → `ga4_event`
3. `data_layer_mapping` → `w3_data_layer`
4. `bi_source_system` → `source_data`
5. `details` → `business_use_case`
6. `measure` → `measure_type`

### ⚠️ Extra Fields: 2

1. `amplitude_implementation` - Not in TypeScript interface
2. `github_author` - Not in TypeScript interface
3. `metric_type` - Not in TypeScript interface

---

## Impact Assessment

### ❌ **HIGH IMPACT** - Will Cause Failures:

1. **Cannot create Metrics** - Code expects `ga4_event`, `adobe_event`, `w3_data_layer`, etc.
2. **Cannot edit Metrics** - Code tries to update fields that don't exist
3. **Cannot display Metrics** - Detail page expects missing fields
4. **Cannot sync to GitHub** - YAML generation expects missing fields
5. **Missing `derived_kpis`** - This field is used in the code and is critical

---

## Required Migration

A comprehensive migration script is needed to:
1. ✅ Rename legacy fields to new names
2. ✅ Add missing required fields
3. ✅ Fix data types (dashboard_usage to ARRAY)
4. ✅ Add optional fields
5. ✅ Migrate data from old fields to new fields

---

## Status: ❌ **METRICS TABLE NEEDS MIGRATION**

The Metrics table schema is **NOT synchronized** with the code. Migration is **REQUIRED** before Metrics functionality will work correctly.

