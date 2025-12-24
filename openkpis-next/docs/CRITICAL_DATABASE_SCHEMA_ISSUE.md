# ⚠️ CRITICAL: Database Schema Out of Sync

## Issue Summary

The **Events table** in both `dev_events` and `prod_events` is **missing 35+ columns** that the code expects. This will cause:

1. ❌ **Save failures** - Code tries to save fields that don't exist
2. ❌ **Retrieval failures** - Code tries to read fields that don't exist  
3. ❌ **Display failures** - Detail pages can't show missing fields
4. ❌ **GitHub sync failures** - YAML generation expects fields that don't exist

---

## Current Database Schema (Actual)

Based on the schema query results, the Events table currently has **ONLY 19 columns**:

### Existing Columns ✅
- `id` (uuid)
- `slug` (text)
- `name` (text)
- `description` (text)
- `category` (text)
- `tags` (text[])
- `status` (text)
- `created_by` (text)
- `created_at` (timestamp)
- `last_modified_by` (text)
- `last_modified_at` (timestamp)
- `approved_by` (text)
- `approved_at` (timestamp)
- `github_pr_url` (text)
- `github_pr_number` (integer)
- `github_commit_sha` (text)
- `github_file_path` (text)
- `search_vector` (tsvector)

---

## Missing Columns (35+ fields) ❌

### Critical Missing Fields:

1. **`event_serialization`** ❌ - **NEW field we just added to code**
2. **`event_type`** ❌ - Standard/custom enum
3. **`parameters`** ❌ - JSON key/value attributes
4. **`related_dimensions`** ❌ - TEXT[] array
5. **`derived_dimensions`** ❌ - TEXT[] array
6. **`derived_metrics`** ❌ - TEXT[] array
7. **`derived_kpis`** ❌ - TEXT[] array

### Business Context Missing:
8. **`industry`** ❌
9. **`priority`** ❌
10. **`core_area`** ❌
11. **`scope`** ❌

### Technical Missing:
12. **`aggregation_window`** ❌
13. **`ga4_event`** ❌
14. **`adobe_event`** ❌

### Data Mappings Missing:
15. **`w3_data_layer`** ❌
16. **`ga4_data_layer`** ❌
17. **`adobe_client_data_layer`** ❌
18. **`xdm_mapping`** ❌

### Documentation Missing:
19. **`calculation_notes`** ❌
20. **`business_use_case`** ❌

### Additional Missing:
21. **`dependencies`** ❌ - JSONB/TEXT
22. **`source_data`** ❌
23. **`report_attributes`** ❌
24. **`dashboard_usage`** ❌ - TEXT[]
25. **`segment_eligibility`** ❌

### Governance Missing:
26. **`data_sensitivity`** ❌
27. **`pii_flag`** ❌ - BOOLEAN
28. **`validation_status`** ❌
29. **`version`** ❌

### Contribution Tracking Missing:
30. **`reviewed_by`** ❌ - TEXT[]
31. **`reviewed_at`** ❌ - TIMESTAMP
32. **`publisher_id`** ❌
33. **`published_at`** ❌ - TIMESTAMP

### Metadata Missing:
34. **`aliases`** ❌ - TEXT[]
35. **`owner`** ❌

---

## Impact Assessment

### High Priority Issues:
- ❌ **Cannot create Events** - Save will fail when trying to insert missing columns
- ❌ **Cannot edit Events** - Update will fail when trying to update missing columns
- ❌ **Cannot display Events** - Detail page will show errors for missing fields
- ❌ **Cannot sync to GitHub** - YAML generation expects fields that don't exist

### Code Files Affected:
1. `app/api/items/create/route.ts` - Tries to save `event_serialization`
2. `lib/services/entityUpdates.ts` - Tries to update 35+ fields
3. `app/(content)/events/[slug]/page.tsx` - Tries to display missing fields
4. `lib/services/github.ts` - Tries to generate YAML with missing fields
5. `lib/server/events.ts` - Tries to retrieve missing fields

---

## Solution: Run Migration Script

### Migration Script Created:
**File**: `scripts/migrations/add-all-missing-events-columns.sql`

This script will:
1. ✅ Add all 35+ missing columns
2. ✅ Set appropriate data types (TEXT, TEXT[], BOOLEAN, TIMESTAMP)
3. ✅ Add column comments for documentation
4. ✅ Verify migration success

### How to Run:

1. **Open Supabase SQL Editor**
2. **Copy the migration script** from `scripts/migrations/add-all-missing-events-columns.sql`
3. **Run the script** - It will add all missing columns to both `dev_events` and `prod_events`
4. **Verify** - The script includes verification queries at the end

### Expected Result:

After migration, the Events table should have **54 columns** (19 existing + 35 new).

---

## Verification Queries

After running the migration, verify with:

```sql
-- Count total columns
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_events', 'prod_events')
GROUP BY table_name;

-- Verify critical columns exist
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('dev_events', 'prod_events')
  AND column_name IN (
    'event_serialization',
    'event_type',
    'parameters',
    'related_dimensions',
    'derived_dimensions',
    'derived_metrics',
    'derived_kpis'
  )
ORDER BY table_name, column_name;
```

---

## Next Steps

1. ✅ **Migration script created** - `scripts/migrations/add-all-missing-events-columns.sql`
2. ⏳ **Run migration** - Execute in Supabase SQL Editor
3. ⏳ **Verify columns** - Run verification queries
4. ⏳ **Test create/edit** - Verify Events can be created and edited
5. ⏳ **Test detail page** - Verify all fields display correctly
6. ⏳ **Test GitHub sync** - Verify YAML generation works

---

## Similar Issues Expected

This same issue likely exists for:
- ⏳ **Dimensions table** - May be missing `formula` and other fields
- ⏳ **Metrics table** - May be missing fields
- ⏳ **KPIs table** - May be missing fields

**Action**: Run similar schema verification queries for all entity tables.

---

## Summary

| Status | Count |
|--------|-------|
| **Existing Columns** | 19 ✅ |
| **Missing Columns** | 35+ ❌ |
| **Total Expected** | 54 |
| **Migration Script** | ✅ Created |
| **Migration Status** | ⏳ **PENDING** |

**⚠️ CRITICAL**: The Events table schema is completely out of sync with the code. Migration is **REQUIRED** before Events functionality will work.

