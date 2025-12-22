# Case Sensitivity Fix - adobe_client_data_layer

## Issue
The database column is `adobe_client_data_layer` (lowercase) but the code was using `Adobe_client_data_layer` (capital A).

## Fix Applied
All code references have been updated to use lowercase `adobe_client_data_layer` to match the database.

## Files Updated

### Code Files
1. ✅ `lib/types/database.ts` - Type definition
2. ✅ `lib/services/entityUpdates.ts` - Payload builder
3. ✅ `app/(content)/kpis/[slug]/edit/KPIEditClient.tsx` - Edit form
4. ✅ `app/(content)/kpis/[slug]/page.tsx` - Detail page
5. ✅ `lib/services/github.ts` - GitHub sync
6. ✅ `app/api/ai/download-datalayer/route.ts` - API route
7. ✅ `app/api/analysis/download/route.ts` - API route

### Migration Scripts
1. ✅ `scripts/migrations/quick-fix-missing-columns.sql`
2. ✅ `scripts/migrations/complete-kpi-schema-migration.sql`
3. ✅ `scripts/migrations/add-missing-kpi-columns.sql`

## Note on Other Fields

Other fields with capital letters:
- `W3_data_layer` - May need to check database
- `GA4_data_layer` - May need to check database
- `Source_Data` - May need to check database
- `Business_Use_Case` - May need to check database

**Recommendation**: Check your database to verify the exact case of these columns and update code if needed.

## Verification

After running the migration script, verify the column exists:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dev_kpis' 
AND column_name = 'adobe_client_data_layer';
```

The column should exist and be accessible.

