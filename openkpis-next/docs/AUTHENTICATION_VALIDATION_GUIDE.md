# Authentication Validation Guide

## Your Correct Understanding

You're absolutely right:
1. **Authentication happens in `auth.users`** (Supabase-managed, no RLS issues)
2. **`user_profiles` is just enrichment data** (replicated from auth.users)
3. **Login should work through `auth.users`** regardless of `user_profiles` RLS
4. **Access privileges should be determined from `user_profiles`**, not authentication itself

## Authentication Flow Validation

### Step 1: OAuth Callback (Authentication)
**File:** `app/auth/callback/route.ts`
```typescript
// Line 66: This is where authentication happens
await supabase.auth.exchangeCodeForSession(code);
```

**What this does:**
- ✅ Creates user in `auth.users` (Supabase-managed)
- ✅ Creates session and sets cookies
- ✅ **Authentication is complete at this point**
- ❌ **Does NOT touch `user_profiles`**

**This should work for ALL users regardless of `user_profiles` RLS.**

### Step 2: Page Load - AuthProvider (Profile Enrichment)
**File:** `app/providers/AuthProvider.tsx`
```typescript
// Line 96-99: Gets authenticated user (from auth.users)
const { data: { user } } = await supabase.auth.getUser();

// Line 102: Resolves role (touches user_profiles)
const initialRole = await resolveUserRole(supabase, initialUser);
```

**What `resolveUserRole()` does:**
- Line 19-24: SELECT from `user_profiles` - **Could fail if RLS blocks**
- Line 40-62: INSERT into `user_profiles` if missing - **Could fail if RLS blocks**
- **Errors are logged but NOT thrown** - should continue with default role

**Potential Issue:**
- If RLS blocks, profile operations fail silently
- User is still authenticated (from `auth.users`)
- Default role `'contributor'` is used
- **Login should still work**

## The Real Question

**Is login actually failing, or is profile creation failing silently?**

### Scenario A: Authentication Works, Profile Creation Fails
**Symptoms:**
- User can log in (session created in `auth.users`)
- User can access the site
- But `user_profiles` INSERT fails due to RLS
- User appears logged in but profile operations fail
- Errors in logs: `[AuthProvider] Error creating profile:`

**Solution:** Remove RLS on `user_profiles` to allow profile creation

### Scenario B: Authentication Fails
**Symptoms:**
- User cannot log in at all
- No session created
- OAuth callback fails
- Errors in Supabase Auth logs

**Solution:** This is NOT an RLS issue - check:
- OAuth configuration (callback URL, Client ID/Secret)
- Supabase redirect URLs
- Environment variables

## Diagnostic Steps

### 1. Check Supabase Auth Logs
```
Supabase Dashboard → Authentication → Logs
```
**Look for:**
- Are new users being created in `auth.users`?
- What errors appear during login?
- Is `exchangeCodeForSession` succeeding or failing?

### 2. Check Browser Console
**Open DevTools (F12) → Console**
**Look for:**
- `[AuthProvider] Error loading profile:` - RLS blocking SELECT
- `[AuthProvider] Error creating profile:` - RLS blocking INSERT
- `exchangeCodeForSession error:` - Authentication failure

### 3. Check Server Logs
**Vercel Dashboard → Functions → Logs**
**Look for:**
- Errors in `/auth/callback` route
- Errors in `AuthProvider` (server component)

### 4. Run Validation Script
**Run:** `scripts/validate-authentication-setup.sql` in Supabase SQL Editor
**This will show:**
- RLS status on `user_profiles`
- Existing policies
- Whether policies are blocking operations

### 5. Test Authentication Directly
**After OAuth callback, check:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Authenticated user:', user);
```
**This should work regardless of `user_profiles` RLS.**

### 6. Test Profile Creation Separately
**After successful login, manually call:**
```typescript
POST /api/auth/ensure-profile
```
**Check if it succeeds or fails - this will show if RLS is the issue.**

## Expected Behavior

### If RLS Blocks user_profiles:
1. ✅ User authenticates successfully (`auth.users` created)
2. ✅ Session is established
3. ✅ User can access the site
4. ⚠️ Profile creation fails (logged but not blocking)
5. ⚠️ User gets default role `'contributor'`
6. ⚠️ Some features might not work (if they depend on profile)

### If Authentication Fails:
1. ❌ User is NOT created in `auth.users`
2. ❌ No session established
3. ❌ User cannot access the site
4. ❌ This is NOT an RLS issue

## Conclusion

**Authentication (`auth.users`) should work regardless of `user_profiles` RLS.**

If login is actually failing:
- Check OAuth configuration
- Check Supabase redirect URLs
- Check environment variables
- **NOT RLS on user_profiles**

If login works but profile creation fails:
- Remove RLS on `user_profiles` (use `remove-rls-policies-for-login.sql`)
- Or fix RLS policies to allow authenticated users to create their own profile

## Quick Fix

If you want to ensure profile creation works:

```sql
-- Remove RLS on user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS user_profiles_select_all ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_self ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_update_self ON public.user_profiles;
```

**This allows profile creation while keeping authentication working through `auth.users`.**

