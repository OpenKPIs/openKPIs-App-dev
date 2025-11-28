# Fix: KPIs, Dimensions, Events, Metrics, Dashboards Pages Error

## Error Message
```
Something went wrong
An unexpected error occurred. Please try again.
```

## Root Cause Analysis

### The Problem
All these pages use `listEntitiesForServer()` which calls `createAdminClient()`. The admin client requires `SUPABASE_SECRET_KEY` environment variable.

**Pages Affected:**
- `/kpis`
- `/metrics`
- `/dimensions`
- `/events`
- `/dashboards`

### Code Flow
```typescript
// Each page does:
const supabase = await createClient(); // Gets user session
const items = await listEntitiesForServer({...}); // Uses createAdminClient()
```

**In `lib/server/entities.ts`:**
```typescript
async function runQuery(table: string, options: ListEntitiesServerOptions) {
  const admin = createAdminClient(); // ← This requires SUPABASE_SECRET_KEY
  // ...
}
```

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // Throws error if SUPABASE_SECRET_KEY is missing
}
```

## Most Likely Causes

### 1. Missing `SUPABASE_SECRET_KEY` Environment Variable ⚠️ MOST COMMON
**Symptom:** Pages crash with "Something went wrong"  
**Cause:** `SUPABASE_SECRET_KEY` not set in Vercel  
**Fix:** Add `SUPABASE_SECRET_KEY` to Vercel environment variables

### 2. Wrong `SUPABASE_SECRET_KEY` Value
**Symptom:** Pages crash, database queries fail  
**Cause:** Secret key is incorrect or from wrong Supabase project  
**Fix:** Verify secret key matches your Supabase project

### 3. RLS Policies Blocking Access
**Symptom:** Empty results or permission errors  
**Cause:** RLS policies on `prod_*` tables  
**Note:** Admin client should bypass RLS, but if it's not working, RLS might be the issue

### 4. Database Tables Don't Exist
**Symptom:** "relation does not exist" errors  
**Cause:** Tables not created in Supabase  
**Fix:** Run table creation scripts

## Diagnostic Steps

### Step 1: Check Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Verify These Variables Are Set:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   SUPABASE_SECRET_KEY=<your-secret-key>  ← CRITICAL!
   ```

3. **Check Environment:**
   - Make sure `SUPABASE_SECRET_KEY` is set for **Production** environment
   - Also set for **Preview** if you're testing there

### Step 2: Verify Supabase Secret Key

1. **Get Secret Key from Supabase:**
   - Go to: Supabase Dashboard → **Settings** → **API**
   - Find **"service_role key"** or **"secret key"**
   - Copy the key (it starts with `eyJ...`)

2. **Verify in Vercel:**
   - Check that `SUPABASE_SECRET_KEY` in Vercel matches Supabase secret key
   - Make sure there are no extra spaces or line breaks

### Step 3: Check Vercel Logs

1. **Go to Vercel Dashboard:**
   - Navigate to: **Deployments** → Latest deployment
   - Click **"Functions"** tab
   - Look for errors when accessing `/kpis`, `/metrics`, etc.

2. **Look for These Errors:**
   - `Missing server admin envs: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY`
   - `Failed to list entities`
   - `relation "prod_kpis" does not exist`
   - `permission denied for table`

### Step 4: Test Database Connection

**Option A: Check Supabase Dashboard**
1. Go to Supabase Dashboard → **Table Editor**
2. Verify these tables exist:
   - `prod_kpis`
   - `prod_metrics`
   - `prod_dimensions`
   - `prod_events`
   - `prod_dashboards`

**Option B: Run SQL Query in Supabase**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'prod_%'
ORDER BY table_name;
```

## Fixes

### Fix 1: Add Missing Environment Variable (Most Common)

1. **Get Secret Key:**
   - Supabase Dashboard → Settings → API → **secret key** (format: `sb_secret_...`)

2. **Add to Vercel:**
   - Vercel Dashboard → Settings → Environment Variables
   - **Key:** `SUPABASE_SECRET_KEY`
   - **Value:** Paste the secret key from Supabase
   - **Environment:** Select **Production** (and Preview if needed)
   - Click **Save**

3. **Redeploy:**
   - Go to **Deployments**
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit

### Fix 2: Verify All Supabase Environment Variables

**Required Variables:**
```bash
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SECRET_KEY=<secret-key>  ← Make sure this is set!
```

**To Get These Values:**
1. Supabase Dashboard → Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → `SUPABASE_SECRET_KEY`

### Fix 3: Check RLS Policies (If Still Failing)

If pages still fail after setting `SUPABASE_SECRET_KEY`, check RLS:

1. **Verify Admin Client Bypasses RLS:**
   - Admin client uses `service_role` key which should bypass RLS
   - If it doesn't, there might be a configuration issue

2. **Check RLS Status:**
   ```sql
   SELECT 
     schemaname,
     tablename,
     rowsecurity as rls_enabled
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename LIKE 'prod_%';
   ```

3. **If RLS is Blocking:**
   - Admin client should bypass RLS automatically
   - If not, check that `SUPABASE_SECRET_KEY` is the `service_role` key (not `publishable` key)

### Fix 4: Verify Tables Exist

If tables don't exist, create them:

1. **Run Table Creation Scripts:**
   - Use the SQL scripts in `scripts/` directory
   - Or create tables manually in Supabase Dashboard

2. **Verify Tables:**
   ```sql
   SELECT COUNT(*) FROM prod_kpis;
   SELECT COUNT(*) FROM prod_metrics;
   SELECT COUNT(*) FROM prod_dimensions;
   SELECT COUNT(*) FROM prod_events;
   SELECT COUNT(*) FROM prod_dashboards;
   ```

## Quick Fix Checklist

- [ ] `SUPABASE_SECRET_KEY` is set in Vercel
- [ ] `SUPABASE_SECRET_KEY` matches Supabase service_role key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set correctly
- [ ] All variables are set for **Production** environment
- [ ] Redeployed after adding/changing variables
- [ ] Tables exist in Supabase (`prod_kpis`, `prod_metrics`, etc.)
- [ ] Checked Vercel logs for specific error messages

## Testing After Fix

1. **Test Each Page:**
   - Go to `/kpis` - Should load without error
   - Go to `/metrics` - Should load without error
   - Go to `/dimensions` - Should load without error
   - Go to `/events` - Should load without error
   - Go to `/dashboards` - Should load without error

2. **Check Browser Console:**
   - Open DevTools (F12) → Console
   - Look for any errors

3. **Check Vercel Logs:**
   - Vercel Dashboard → Deployments → Functions
   - Should see successful requests, no errors

## Common Error Messages

### Error 1: "Missing server admin envs"
**Cause:** `SUPABASE_SECRET_KEY` not set  
**Fix:** Add `SUPABASE_SECRET_KEY` to Vercel

### Error 2: "Failed to list entities"
**Cause:** Database query failed (could be RLS, missing tables, or wrong key)  
**Fix:** Check Vercel logs for specific error, verify tables exist

### Error 3: "relation does not exist"
**Cause:** Tables not created  
**Fix:** Create tables in Supabase

### Error 4: "permission denied"
**Cause:** RLS blocking or wrong key type  
**Fix:** Verify `SUPABASE_SECRET_KEY` is `service_role` key (not `publishable`)

## Summary

**Most Likely Issue:** Missing `SUPABASE_SECRET_KEY` in Vercel environment variables.

**Quick Fix:**
1. Get secret key from Supabase (Settings → API → service_role key)
2. Add to Vercel as `SUPABASE_SECRET_KEY`
3. Redeploy

**If Still Failing:**
- Check Vercel logs for specific error
- Verify tables exist in Supabase
- Verify all environment variables are correct

