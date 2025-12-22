# Missing Columns Fix - Quick Reference

## Error: "Could not find the 'Adobe_client_data_layer' column"

This error occurs because the database schema hasn't been updated with the new columns that the code expects.

## Quick Fix

Run this SQL script in your Supabase SQL Editor:

**File**: `scripts/migrations/quick-fix-missing-columns.sql`

**Important**: Replace `dev_kpis` with your actual table name:
- For dev environment: `dev_kpis`
- For production: `prod_kpis`

## What This Script Does

1. ✅ Adds `GA4_data_layer` column
2. ✅ Adds `Adobe_client_data_layer` column (fixes your error)
3. ✅ Adds/renames `W3_data_layer` (from `data_layer_mapping` if exists)
4. ✅ Adds/renames `ga4_event` (from `ga4_implementation` if exists)
5. ✅ Adds/renames `adobe_event` (from `adobe_implementation` if exists)
6. ✅ Adds all other missing columns

## Complete Migration

For a complete migration including type changes, use:
- `scripts/migrations/complete-kpi-schema-migration.sql` - Full migration with type changes

## Verification

After running the script, verify with:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dev_kpis' 
AND column_name IN (
  'GA4_data_layer',
  'Adobe_client_data_layer',
  'W3_data_layer',
  'ga4_event',
  'adobe_event'
);
```

All columns should appear in the results.

