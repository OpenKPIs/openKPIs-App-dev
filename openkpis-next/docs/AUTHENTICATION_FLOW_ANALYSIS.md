# Authentication Flow Analysis

## Overview

You're absolutely correct: **Authentication happens in `auth.users` (Supabase-managed), and `user_profiles` is just enrichment data.** Login should work regardless of `user_profiles` RLS policies.

## Authentication Flow

### Step 1: OAuth Callback (`app/auth/callback/route.ts`)
```typescript
// Line 66: This is where authentication actually happens
const { data: sessionData, error: exchangeError } = 
  await supabase.auth.exchangeCodeForSession(code);
```

**What happens:**
- ✅ Creates user in `auth.users` (Supabase-managed, no RLS)
- ✅ Creates session and sets cookies
- ✅ User is authenticated at this point
- ❌ **Does NOT touch `user_profiles`** - authentication is complete

**This should work for all users regardless of `user_profiles` RLS.**

### Step 2: Page Load - AuthProvider (`app/providers/AuthProvider.tsx`)
```typescript
// Line 96-99: Gets authenticated user
const { data: { user } } = await supabase.auth.getUser();

// Line 102: Resolves role (touches user_profiles)
const initialRole = await resolveUserRole(supabase, initialUser);
```

**What happens in `resolveUserRole()`:**
- Line 19-24: SELECT from `user_profiles` - **Could fail if RLS blocks**
- Line 40-62: INSERT into `user_profiles` if missing - **Could fail if RLS blocks**
- Line 58-59: **Error is logged but NOT thrown** - should continue

**Potential Issue:**
- If RLS blocks SELECT, `profile` will be null (error is logged)
- If RLS blocks INSERT, `insertError` is logged but not thrown
- Function returns `'contributor'` as default role
- **Login should still work** - user is authenticated

### Step 3: Client-Side (`app/providers/AuthClientProvider.tsx`)
```typescript
// Line 63: Gets role from user_profiles
const r = await getUserRoleClient();
```

**What happens:**
- Calls `getUserRoleClient()` which queries `user_profiles`
- If it fails, defaults to `'contributor'`
- **Should not block login**

## The Real Question

**Is login actually failing, or is profile creation failing silently?**

### Scenario 1: Login Works, Profile Creation Fails
- User authenticates successfully (`auth.users` created)
- Session is established
- User can access the site
- But `user_profiles` INSERT fails due to RLS
- User appears logged in but profile operations fail

### Scenario 2: Page Load Fails Due to RLS Error
- User authenticates successfully
- But `AuthProvider` (server component) fails when querying `user_profiles`
- Page doesn't load or shows error
- User appears not logged in

## Diagnosis

### Check 1: Is Authentication Actually Failing?
Look at Supabase Dashboard → Authentication → Logs:
- Are users being created in `auth.users`?
- Are sessions being created?
- What errors appear?

### Check 2: Are Profile Operations Failing?
Check browser console and server logs:
- Look for `[AuthProvider] Error loading profile:` or `Error creating profile:`
- These errors are logged but might not be visible to users

### Check 3: Is Page Load Blocking?
- Does the page load at all after OAuth?
- Or does it show an error/blank page?
- Check server-side errors in Vercel logs

## Root Cause Analysis

### If Login Actually Works:
**Problem:** Profile creation is failing silently
**Solution:** Remove RLS on `user_profiles` to allow profile creation
**Impact:** Users can log in but don't have profiles (might affect features)

### If Login Fails:
**Problem:** Something else is blocking authentication
**Possible causes:**
1. OAuth configuration (callback URL, Client ID/Secret)
2. Supabase redirect URL not configured
3. Environment variables missing
4. Network/cookie issues
5. **NOT RLS on user_profiles** (authentication doesn't touch it)

## Recommended Investigation Steps

1. **Check Supabase Auth Logs:**
   ```
   Supabase Dashboard → Authentication → Logs
   ```
   - Are new users being created?
   - What errors appear during login?

2. **Check Browser Console:**
   - Open DevTools (F12) → Console
   - Look for errors during login
   - Check for `[AuthProvider] Error` messages

3. **Check Server Logs:**
   - Vercel Dashboard → Functions → Logs
   - Look for errors in `/auth/callback` route
   - Look for errors in `AuthProvider`

4. **Test Authentication Directly:**
   - After OAuth callback, check if `supabase.auth.getUser()` works
   - This should work regardless of `user_profiles`

5. **Test Profile Creation Separately:**
   - After successful login, manually call `/api/auth/ensure-profile`
   - Check if it succeeds or fails
   - This will show if RLS is the issue

## Conclusion

**Authentication (`auth.users`) and login should work regardless of `user_profiles` RLS.**

If login is actually failing, the issue is likely:
- OAuth configuration
- Supabase redirect URLs
- Environment variables
- **NOT RLS on user_profiles**

If login works but profile creation fails, then RLS on `user_profiles` is the issue.

