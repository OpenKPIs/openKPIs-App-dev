# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


# Fix: Admin Client RLS Issue

## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```



## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```


## Problem
Pages (`/kpis`, `/metrics`, etc.) are failing even though `SUPABASE_SECRET_KEY` is correctly set in Vercel.

## Root Cause
The admin client should bypass RLS automatically when using `service_role`/`secret` key, but **RLS policies might still be blocking** if they're too restrictive.

## Solution Options

### Option 1: Disable RLS on prod_* Tables (Recommended for Admin Access)

**Run this SQL in Supabase:**

```sql
-- Disable RLS on all prod_* tables
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```

**Why:** Admin client should bypass RLS, but disabling it ensures no policy conflicts.

### Option 2: Fix Admin Client Code (If Option 1 Doesn't Work)

**Update `lib/supabase/server.ts`:**

```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false);
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  
  // Explicitly create client with service_role key
  // This should bypass RLS automatically
  const client = createSupabaseClient(config.url, config.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  });
  
  return client;
}
```

### Option 3: Remove Restrictive RLS Policies

**If RLS must stay enabled, remove policies that block admin access:**

```sql
-- List policies first
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename LIKE 'prod_%';

-- Remove policies that use auth.uid() or current_user
-- (These block admin client even with service_role key)
DROP POLICY IF EXISTS <policy_name> ON prod_kpis;
DROP POLICY IF EXISTS <policy_name> ON prod_metrics;
-- ... repeat for other tables
```

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-rls-and-admin-client.sql` in Supabase SQL Editor to check:
- RLS status on tables
- Existing policies
- Table existence

### Step 2: Check Vercel Logs
Look for specific error messages:
- `permission denied for table` → RLS blocking
- `relation does not exist` → Tables missing
- `Failed to list entities` → Query error

### Step 3: Test Admin Client Directly
Create a test API route to verify admin client works:

```typescript
// app/api/test-admin/route.ts
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from('prod_kpis').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
```

Visit `/api/test-admin` - if it fails, RLS is blocking.

## Most Likely Fix

**Disable RLS on prod_* tables** - Admin client should work, but RLS can still interfere. Disabling RLS ensures admin access works.

```sql
ALTER TABLE prod_kpis DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dimensions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE prod_dashboards DISABLE ROW LEVEL SECURITY;
```








