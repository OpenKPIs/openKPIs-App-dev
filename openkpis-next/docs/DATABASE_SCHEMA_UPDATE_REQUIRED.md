# Database Schema Update Required

## ⚠️ Important: Database Migration Needed

The code has been updated to treat `dashboard_usage` as an array, but the Supabase database schema needs to be updated to match.

## Current Database Schema Issues

### 1. `dashboard_usage` - Needs to be TEXT[]
- **Current**: `TEXT` (from original migration)
- **Required**: `TEXT[]` (array type)
- **Issue**: Code expects array, but database has TEXT type

### 2. `dependencies` - Currently TEXT (OK for JSON string)
- **Current**: `TEXT` 
- **Status**: ✅ Correct - We store JSON as string, so TEXT is fine
- **Note**: Could be changed to JSONB for better querying, but TEXT works

### 3. `related_kpis` - Already TEXT[]
- **Current**: `TEXT[]`
- **Status**: ✅ Correct

## Migration Script

**File**: `scripts/migrations/update-dashboard-usage-dependencies.sql`

This script will:
1. Convert `dashboard_usage` from TEXT to TEXT[]
2. Migrate existing data (semicolon-separated strings → arrays)
3. Add appropriate column comments

## How to Apply

1. **Backup your database** before running the migration
2. Open Supabase SQL Editor
3. Copy and paste the contents of `scripts/migrations/update-dashboard-usage-dependencies.sql`
4. Run the script
5. Verify the changes with:
   ```sql
   SELECT column_name, data_type, udt_name 
   FROM information_schema.columns 
   WHERE table_name = 'prod_kpis' 
   AND column_name IN ('dashboard_usage', 'dependencies', 'related_kpis');
   ```

## Expected Results

After migration:
- `dashboard_usage`: `data_type = 'ARRAY'`, `udt_name = '_text'`
- `dependencies`: `data_type = 'text'`, `udt_name = 'text'` (or 'jsonb' if you change it)
- `related_kpis`: `data_type = 'ARRAY'`, `udt_name = '_text'`

## Data Migration Notes

- Existing `dashboard_usage` values will be converted:
  - Semicolon-separated: `"C-Suite;Merchandising"` → `["C-Suite", "Merchandising"]`
  - Single value: `"C-Suite"` → `["C-Suite"]`
  - Already array format: preserved as-is
  - NULL: remains NULL

## Testing After Migration

1. Test saving a KPI with dashboard_usage values
2. Verify the array is saved correctly in Supabase
3. Verify the array is displayed correctly on the detail page
4. Verify GitHub sync includes the array in YAML

