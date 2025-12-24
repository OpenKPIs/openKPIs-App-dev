# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


# Fix: Remove Admin Client for Public Pages

## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages



## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages


## Problem
The site was using `createAdminClient()` (requiring `SUPABASE_SECRET_KEY`) just to read **published content** on public pages. This is unnecessary and creates security concerns.

## Why Admin Client Was Wrong

**Public pages should NOT need admin access:**
- `/kpis` - Shows published KPIs to everyone
- `/metrics` - Shows published metrics to everyone  
- `/dimensions` - Shows published dimensions to everyone
- `/events` - Shows published events to everyone
- `/dashboards` - Shows published dashboards to everyone

**Admin client should only be used for:**
- Admin operations (publishing, editing)
- Operations that bypass RLS intentionally
- Server-side admin tasks

## Solution

### 1. Code Change ✅
**Updated `lib/server/entities.ts`:**
- Changed from `createAdminClient()` to `createClient()`
- Now uses regular client with RLS policies
- No longer requires `SUPABASE_SECRET_KEY` for public pages

### 2. RLS Policies ✅
**Created `scripts/create-rls-policies-for-public-read.sql`:**
- **Policy 1:** Anyone can read published content (`status = 'published'`)
- **Policy 2:** Users can read their own content (even drafts)

## How It Works Now

### Before (Wrong):
```typescript
// Used admin client - bypasses all RLS
const admin = createAdminClient();
const data = await admin.from('prod_kpis').select('*');
```

### After (Correct):
```typescript
// Uses regular client - respects RLS policies
const supabase = await createClient();
const data = await supabase.from('prod_kpis').select('*');
// RLS policies allow:
// - Anyone to read published content
// - Users to read their own content
```

## Setup Steps

### Step 1: Run RLS Policies Script
```sql
-- Run in Supabase SQL Editor
-- scripts/create-rls-policies-for-public-read.sql
```

This will:
- Enable RLS on prod_* tables
- Create policies for public read access
- Allow users to read their own content

### Step 2: Verify Code Change
The code is already updated in `lib/server/entities.ts` to use regular client.

### Step 3: Test
- Visit `/kpis` - Should load published KPIs
- Visit `/metrics` - Should load published metrics
- Logged in users should also see their own drafts

## Benefits

✅ **Security:** No admin access for public pages  
✅ **Proper RLS:** Policies control access, not bypassing  
✅ **No Secret Key Required:** Public pages work without `SUPABASE_SECRET_KEY`  
✅ **Enterprise-Compliant:** Proper separation of concerns

## When to Use Admin Client

**Still use `createAdminClient()` for:**
- Admin operations (publishing, editing)
- Operations in `/api/editor/publish/route.ts`
- Server-side admin tasks that need to bypass RLS

**Do NOT use `createAdminClient()` for:**
- Reading published content
- Public pages
- User-facing queries

## Summary

**Before:** Public pages used admin client (wrong)  
**After:** Public pages use regular client with RLS policies (correct)  
**Result:** More secure, proper access control, no secret key needed for public pages









