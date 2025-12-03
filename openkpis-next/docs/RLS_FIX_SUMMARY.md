# RLS Fix Summary - Pages Error Resolution

## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


# RLS Fix Summary - Pages Error Resolution

## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


# RLS Fix Summary - Pages Error Resolution

## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully



## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully



## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully



## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully


## Problem
Pages (`/kpis`, `/metrics`, `/dimensions`, `/events`, `/dashboards`) are failing with "Something went wrong" error, even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
**RLS (Row Level Security) policies on `prod_*` tables are blocking admin client access**, even though the admin client uses `service_role`/`secret` key which should bypass RLS.

## Solution

### Quick Fix: Disable RLS on prod_* Tables

**Run this SQL script in Supabase:**
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

**Or run manually:**
```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

### Why This Works
- Admin client uses `service_role`/`secret` key
- Should bypass RLS automatically
- But restrictive RLS policies can still interfere
- Disabling RLS ensures admin access works

### Code Changes Made
1. **Enhanced admin client** (`lib/supabase/server.ts`):
   - Explicitly configured to bypass auth/session
   - Ensures RLS bypass works correctly

2. **Better error handling** (`lib/server/entities.ts`):
   - Clearer error messages
   - Better logging for debugging

## Verification

### Step 1: Run Diagnostic Script
```sql
-- scripts/diagnose-rls-and-admin-client.sql
```
This will show:
- RLS status on all prod_* tables
- Existing policies
- Table existence

### Step 2: Disable RLS
```sql
-- scripts/disable-rls-on-prod-tables.sql
```

### Step 3: Test Pages
- Visit `/kpis` - Should load
- Visit `/metrics` - Should load
- Visit `/dimensions` - Should load
- Visit `/events` - Should load
- Visit `/dashboards` - Should load

## Alternative: Keep RLS Enabled

If you need RLS enabled, ensure policies allow admin access:

```sql
-- Create policy that allows service_role access
CREATE POLICY "Allow admin service_role access"
ON prod_kpis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
```

But **disabling RLS is simpler** since admin client handles access control.

## Summary

**Issue:** RLS policies blocking admin client  
**Fix:** Disable RLS on prod_* tables  
**Script:** `scripts/disable-rls-on-prod-tables.sql`  
**Result:** Pages should load successfully



