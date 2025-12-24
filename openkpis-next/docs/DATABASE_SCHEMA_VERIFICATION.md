# Database Schema Verification Guide

## Purpose
This document provides SQL queries to verify that all required database columns exist and can be queried correctly.

## ⚠️ Important: Run These Queries in Supabase SQL Editor

You need to **actually query the database** to verify the schema. The TypeScript types are just definitions - they don't guarantee the database columns exist.

---

## Required SQL Queries

### 1. Verify `event_serialization` Column in Events Table

```sql
-- Check if event_serialization column exists
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_events', 'prod_events')
  AND column_name = 'event_serialization'
ORDER BY table_name, column_name;
```

**Expected Result:**
- Should return 1-2 rows (one for dev_events, one for prod_events if both exist)
- `data_type` should be `text` or `character varying`
- `is_nullable` should be `YES` (nullable)

**If No Results:**
- ❌ **COLUMN MISSING** - Need to add `event_serialization` column to events table
- Run migration: `ALTER TABLE dev_events ADD COLUMN event_serialization TEXT;`
- Run migration: `ALTER TABLE prod_events ADD COLUMN event_serialization TEXT;`

---

### 2. Verify `formula` Column in Dimensions Table

```sql
-- Check if formula column exists in dimensions
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_dimensions', 'prod_dimensions')
  AND column_name = 'formula'
ORDER BY table_name, column_name;
```

**Expected Result:**
- Should return 1-2 rows
- `data_type` should be `text` or `character varying`
- `is_nullable` should be `YES` (nullable)

**If No Results:**
- ❌ **COLUMN MISSING** - Need to add `formula` column to dimensions table
- Run migration: `ALTER TABLE dev_dimensions ADD COLUMN formula TEXT;`
- Run migration: `ALTER TABLE prod_dimensions ADD COLUMN formula TEXT;`

---

### 3. Verify `formula` Column in KPIs Table

```sql
-- Check if formula column exists in kpis
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_kpis', 'prod_kpis')
  AND column_name = 'formula'
ORDER BY table_name, column_name;
```

**Expected Result:**
- Should return 1-2 rows
- `data_type` should be `text` or `character varying`

---

### 4. Verify `formula` Column in Metrics Table

```sql
-- Check if formula column exists in metrics
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_metrics', 'prod_metrics')
  AND column_name = 'formula'
ORDER BY table_name, column_name;
```

**Expected Result:**
- Should return 1-2 rows
- `data_type` should be `text` or `character varying`

---

### 5. Verify Events Table Does NOT Have `formula` Column

```sql
-- Check if formula column exists in events (should NOT exist)
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_events', 'prod_events')
  AND column_name = 'formula'
ORDER BY table_name, column_name;
```

**Expected Result:**
- Should return **0 rows** (formula should NOT exist in events table)
- Events should use `event_serialization` instead

**If Results Found:**
- ⚠️ **DEPRECATED COLUMN** - `formula` exists but should be removed or ignored
- Consider: `ALTER TABLE dev_events DROP COLUMN formula;` (after migrating data if needed)

---

### 6. Test Data Retrieval - Verify Fields Can Be Queried

```sql
-- Test query for events (if any exist)
SELECT 
    id,
    slug,
    name,
    event_serialization,
    related_dimensions,
    derived_dimensions,
    derived_metrics,
    derived_kpis,
    parameters,
    event_type
FROM dev_events
LIMIT 1;
```

**Expected Result:**
- Query should execute without errors
- All columns should be returned (may be NULL if no data)

**If Error:**
- ❌ **COLUMN MISSING** - The column doesn't exist in the database
- Need to add the missing column

---

### 7. Comprehensive Schema Check - All Entity-Specific Fields

```sql
-- Check all key columns for events table
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_events', 'prod_events')
  AND column_name IN (
    'event_serialization',
    'formula',
    'related_dimensions',
    'derived_dimensions',
    'derived_metrics',
    'derived_kpis',
    'parameters',
    'event_type'
  )
ORDER BY table_name, column_name;
```

**Expected Results:**

| Column Name | Should Exist | Data Type |
|-------------|--------------|-----------|
| `event_serialization` | ✅ YES | `text` |
| `formula` | ❌ NO | - |
| `related_dimensions` | ✅ YES | `text[]` or `text` |
| `derived_dimensions` | ✅ YES | `text[]` or `text` |
| `derived_metrics` | ✅ YES | `text[]` or `text` |
| `derived_kpis` | ✅ YES | `text[]` or `text` |
| `parameters` | ✅ YES | `text` |
| `event_type` | ✅ YES | `text` |

---

## Migration Scripts (If Needed)

### Add `event_serialization` to Events Table

```sql
-- For dev_events
ALTER TABLE dev_events 
ADD COLUMN IF NOT EXISTS event_serialization TEXT;

-- For prod_events
ALTER TABLE prod_events 
ADD COLUMN IF NOT EXISTS event_serialization TEXT;
```

### Add `formula` to Dimensions Table

```sql
-- For dev_dimensions
ALTER TABLE dev_dimensions 
ADD COLUMN IF NOT EXISTS formula TEXT;

-- For prod_dimensions
ALTER TABLE prod_dimensions 
ADD COLUMN IF NOT EXISTS formula TEXT;
```

### Remove `formula` from Events Table (If It Exists)

```sql
-- Only run if formula column exists in events table
-- First, migrate any existing data to event_serialization if needed
UPDATE dev_events 
SET event_serialization = formula 
WHERE formula IS NOT NULL AND event_serialization IS NULL;

-- Then drop the formula column
ALTER TABLE dev_events DROP COLUMN IF EXISTS formula;
ALTER TABLE prod_events DROP COLUMN IF EXISTS formula;
```

---

## How to Run These Queries

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to "SQL Editor"

2. **Run Each Query**
   - Copy and paste each query
   - Click "Run" or press Ctrl+Enter
   - Review the results

3. **Document Results**
   - Note which columns exist
   - Note which columns are missing
   - Run migration scripts if needed

4. **Verify After Migration**
   - Re-run the verification queries
   - Confirm all columns exist
   - Test data retrieval queries

---

## Complete Verification Script

A complete SQL script is available at:
- `scripts/verify-schema-fields.sql`

This script includes all verification queries in one file for easy execution.

---

## Next Steps After Verification

1. ✅ **If All Columns Exist**: Proceed with testing create/edit flows
2. ❌ **If Columns Missing**: Run migration scripts to add missing columns
3. ⚠️ **If Deprecated Columns Exist**: Consider removing or documenting them
4. ✅ **After Migration**: Re-verify and test end-to-end flows

---

## Summary

| Table | Required Column | Status | Action Needed |
|-------|----------------|--------|--------------|
| `dev_events` / `prod_events` | `event_serialization` | ⏳ **VERIFY** | Run SQL query |
| `dev_events` / `prod_events` | `formula` | ⏳ **VERIFY** | Should NOT exist |
| `dev_dimensions` / `prod_dimensions` | `formula` | ⏳ **VERIFY** | Run SQL query |
| `dev_kpis` / `prod_kpis` | `formula` | ⏳ **VERIFY** | Run SQL query |
| `dev_metrics` / `prod_metrics` | `formula` | ⏳ **VERIFY** | Run SQL query |

**⚠️ IMPORTANT**: TypeScript types are NOT the database schema. You MUST query the database to verify columns exist.

---

## ⚠️ Critical Finding from Documentation

According to `docs/DATABASE_STRUCTURE_ANALYSIS.md`:
- **Dimensions**: Line 173 states "❌ NO `formula` field"
- **Events**: Line 176 states "`formula: text`" (but we changed this to `event_serialization`)

**This documentation may be OUTDATED**. The actual database schema needs to be verified via SQL queries.

**Action Required:**
1. Run the SQL verification queries above
2. Update documentation based on actual database schema
3. Run migrations if columns are missing

