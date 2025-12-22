# KPI Table - Complete Database Schema

## Complete Field List with Data Types

This document provides the **final, correct data types** for all fields in the `prod_kpis` table.

### Recommended: Use JSONB for dependencies
Since `dependencies` stores structured JSON data, **JSONB is recommended** over TEXT for:
- Better querying capabilities
- JSON validation
- Indexing support
- Type safety

However, TEXT works if you prefer simplicity (current implementation uses TEXT).

---

## Complete Schema

| # | Field Name | Supabase Data Type | TypeScript Type | Notes |
|---|------------|-------------------|-----------------|-------|
| **Core Fields** |
| 1 | `id` | `uuid` | `string` | Primary key, auto-generated |
| 2 | `slug` | `text` | `string` | Unique identifier, URL-friendly |
| 3 | `name` | `text` | `string` | KPI name (required) |
| 4 | `description` | `text` | `string?` | KPI description |
| 5 | `formula` | `text` | `string?` | Calculation formula |
| 6 | `category` | `text` | `string?` | Category (Conversion, Revenue, etc.) |
| 7 | `tags` | `text[]` | `string[]?` | Array of tags |
| **Business Context** |
| 8 | `industry` | `text[]` | `string[]?` | Array of industries |
| 9 | `priority` | `text` | `string?` | High/Medium/Low |
| 10 | `core_area` | `text` | `string?` | Core area of analysis |
| 11 | `scope` | `text` | `string?` | User/Session/Event/Global |
| 12 | `related_kpis` | `text[]` | `string[]?` | Array of related KPI slugs |
| **Technical** |
| 13 | `measure_type` | `text` | `string?` | Counter/Rate/Ratio/Percentage/Average/Sum |
| 14 | `aggregation_window` | `text` | `string?` | Aggregation window description |
| **Platform Events** |
| 15 | `ga4_event` | `text` | `string?` | Google Analytics 4 event name |
| 16 | `adobe_event` | `text` | `string?` | Adobe Analytics event name |
| **Data Mappings (JSON stored as TEXT)** |
| 17 | `W3_data_layer` | `text` | `string?` | W3C Data Layer mapping (JSON string) |
| 18 | `GA4_data_layer` | `text` | `string?` | GA4 Data Layer mapping (JSON string) |
| 19 | `Adobe_client_data_layer` | `text` | `string?` | Adobe Client Data Layer mapping (JSON string) |
| 20 | `xdm_mapping` | `text` | `string?` | AEP XDM schema (JSON string) |
| **SQL** |
| 21 | `sql_query` | `text` | `string?` | SQL query text |
| **Documentation** |
| 22 | `calculation_notes` | `text` | `string?` | Calculation notes and caveats |
| 23 | `Business_Use_Case` | `text` | `string?` | Business use case description |
| **Additional Fields** |
| 24 | `dependencies` | `jsonb` ⚠️ **or** `text` | `string?` | Structured dependencies (JSON) - **RECOMMEND JSONB** |
| 25 | `Source_Data` | `text` | `string?` | Source data system |
| 26 | `report_attributes` | `text` | `string?` | Report attributes description |
| 27 | `dashboard_usage` | `text[]` | `string[]?` | Array of dashboard names |
| 28 | `segment_eligibility` | `text` | `string?` | Segment eligibility description |
| **Governance** |
| 29 | `status` | `text` | `'draft' \| 'published' \| 'archived'` | KPI status (required) |
| 30 | `validation_status` | `text` | `'unverified' \| 'verified' \| 'rejected'?` | Validation status |
| 31 | `version` | `text` | `string?` | Version number |
| 32 | `data_sensitivity` | `text` | `string?` | Public/Internal/Restricted |
| 33 | `pii_flag` | `boolean` | `boolean?` | Contains PII flag |
| **GitHub** |
| 34 | `github_pr_url` | `text` | `string?` | GitHub PR URL |
| 35 | `github_pr_number` | `integer` | `number?` | GitHub PR number |
| 36 | `github_commit_sha` | `text` | `string?` | GitHub commit SHA |
| 37 | `github_file_path` | `text` | `string?` | GitHub file path |
| **Contribution** |
| 38 | `created_by` | `text` | `string` | Creator user identifier (required) |
| 39 | `created_at` | `timestamptz` | `string` | Creation timestamp (required) |
| 40 | `last_modified_by` | `text` | `string?` | Last modifier user identifier |
| 41 | `last_modified_at` | `timestamptz` | `string?` | Last modification timestamp |
| 42 | `approved_by` | `text` | `string?` | Approver user identifier |
| 43 | `approved_at` | `timestamptz` | `string?` | Approval timestamp |
| 44 | `reviewed_by` | `text[]` | `string[]?` | Array of reviewer user identifiers |
| 45 | `reviewed_at` | `text` | `string?` | Review timestamp |
| 46 | `publisher_id` | `text` | `string?` | Publisher user identifier |
| 47 | `published_at` | `timestamptz` | `string?` | Publication timestamp |
| **Metadata** |
| 48 | `aliases` | `text[]` | `string[]?` | Array of alternate names/acronyms |
| 49 | `owner` | `text` | `string?` | Owner identifier |

---

## Data Type Summary

### Arrays (TEXT[])
- `tags` - Array of tag strings
- `industry` - Array of industry strings
- `related_kpis` - Array of KPI slug strings
- `dashboard_usage` - Array of dashboard name strings
- `reviewed_by` - Array of reviewer user identifiers
- `aliases` - Array of alias strings

### JSON/JSONB Fields
- `dependencies` - **RECOMMENDED: JSONB** (currently TEXT, stores JSON string)
- `W3_data_layer` - TEXT (stores JSON string)
- `GA4_data_layer` - TEXT (stores JSON string)
- `Adobe_client_data_layer` - TEXT (stores JSON string)
- `xdm_mapping` - TEXT (stores JSON string)

### Boolean
- `pii_flag` - Boolean

### Integer
- `github_pr_number` - Integer

### Timestamps
- `created_at` - Timestamptz
- `last_modified_at` - Timestamptz
- `approved_at` - Timestamptz
- `published_at` - Timestamptz

### Text (All others)
- All other fields are `text` type

---

## Migration Recommendations

### 1. `dependencies` - Change to JSONB (Recommended)

**Current**: `TEXT`  
**Recommended**: `JSONB`

**Benefits**:
- JSON validation at database level
- Better querying with JSON operators
- Indexing support
- Type safety

**Migration**:
```sql
-- Convert dependencies from TEXT to JSONB
ALTER TABLE prod_kpis ADD COLUMN IF NOT EXISTS dependencies_temp JSONB;

UPDATE prod_kpis 
SET dependencies_temp = CASE
  WHEN dependencies IS NULL THEN NULL::JSONB
  WHEN dependencies::text ~ '^\s*\{' THEN dependencies::text::JSONB
  ELSE NULL::JSONB
END
WHERE dependencies IS NOT NULL;

ALTER TABLE prod_kpis DROP COLUMN IF EXISTS dependencies;
ALTER TABLE prod_kpis RENAME COLUMN dependencies_temp TO dependencies;
```

### 2. `dashboard_usage` - Change to TEXT[] (Required)

**Current**: `TEXT`  
**Required**: `TEXT[]`

**Migration**: See `scripts/migrations/update-dashboard-usage-dependencies.sql`

---

## Complete Migration Script

See `scripts/migrations/update-dashboard-usage-dependencies.sql` for the complete migration that:
1. Converts `dashboard_usage` from TEXT to TEXT[]
2. Optionally converts `dependencies` from TEXT to JSONB (recommended)

