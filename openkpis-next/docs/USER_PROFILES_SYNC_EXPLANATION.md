# How user_profiles Syncs with auth.users (Without Triggers)

## Your Application Code Already Handles Sync

Your application has **two places** that automatically sync `auth.users` → `user_profiles`:

### 1. AuthProvider (Automatic - Runs on Every Page Load)

**File:** `app/providers/AuthProvider.tsx`

**Function:** `resolveUserRole()` (lines 16-93)

**When it runs:**
- Every time a page loads
- For every authenticated user
- Automatically, no manual call needed

**What it does:**
```typescript
// Step 1: Check if profile exists
const { data: profile } = await supabase
  .from('user_profiles')
  .select('user_role, role, is_admin, is_editor')
  .eq('id', user.id)
  .eq('app_env', appEnv)
  .maybeSingle();

// Step 2: If no profile, CREATE it from auth.users data
if (!profileData) {
  await supabase.from('user_profiles').insert({
    id: user.id,                    // From auth.users
    github_username: githubUsername, // From auth.users.user_metadata
    full_name: fullName,            // From auth.users.user_metadata
    email: email,                   // From auth.users.email
    avatar_url: avatarUrl,          // From auth.users.user_metadata
    user_role: 'contributor',        // Default
    // ... other fields
  });
}

// Step 3: If profile exists, UPDATE it with latest data from auth.users
else {
  await supabase.from('user_profiles').update({
    github_username: githubUsername, // Sync from auth.users
    full_name: fullName,            // Sync from auth.users
    email: email,                   // Sync from auth.users
    avatar_url: avatarUrl,          // Sync from auth.users
    last_active_at: new Date(),     // Update timestamp
  });
}
```

**This ensures:**
- ✅ Profile is created when user first logs in
- ✅ Profile is updated with latest data from `auth.users` on every page load
- ✅ Data stays in sync automatically

### 2. API Endpoint (On-Demand)

**File:** `app/api/auth/ensure-profile/route.ts`

**When it runs:**
- Can be called explicitly by frontend code
- Useful for ensuring profile exists before certain operations

**What it does:**
- Same logic as AuthProvider
- Creates or updates profile from `auth.users` data

## Sync Flow (Without Trigger)

### New User Login:
1. **OAuth Callback:**
   - User authenticates via GitHub
   - Supabase creates user in `auth.users` ✅
   - Session established ✅
   - **No trigger needed** - user creation succeeds

2. **First Page Load:**
   - `AuthProvider` runs (server component)
   - Gets user from `auth.users` ✅
   - Calls `resolveUserRole()`
   - Checks `user_profiles` - **not found**
   - **Creates profile** from `auth.users` data ✅
   - Profile now exists

3. **Subsequent Page Loads:**
   - `AuthProvider` runs
   - Gets user from `auth.users` ✅
   - Calls `resolveUserRole()`
   - Finds existing profile
   - **Updates profile** with latest data from `auth.users` ✅
   - Keeps data in sync

### Existing User Login:
1. **OAuth Callback:**
   - User authenticates
   - Supabase finds existing user in `auth.users` ✅
   - Session established ✅

2. **Page Load:**
   - `AuthProvider` runs
   - Gets user from `auth.users` ✅
   - Finds existing profile
   - **Updates profile** with latest data ✅

## Why Application Code is Better Than Triggers

### Triggers (Problematic):
- ❌ Run during user creation (before auth is complete)
- ❌ If trigger fails, **user creation fails** (blocks login)
- ❌ Hard to debug (database-level errors)
- ❌ No error handling in application code
- ❌ Can't be tested easily

### Application Code (Current Approach):
- ✅ Runs after authentication is complete
- ✅ If profile creation fails, **login still works** (graceful degradation)
- ✅ Easy to debug (application logs)
- ✅ Proper error handling
- ✅ Can be tested
- ✅ Runs on every page load (keeps data in sync)

## Data Sync Details

### What Gets Synced:

**From `auth.users`:**
- `id` → `user_profiles.id`
- `email` → `user_profiles.email`
- `user_metadata.user_name` → `user_profiles.github_username`
- `user_metadata.full_name` → `user_profiles.full_name`
- `user_metadata.avatar_url` → `user_profiles.avatar_url`

**Added by Application:**
- `user_role` → Default: `'contributor'`
- `app_env` → Current environment (`'dev'` or `'prod'`)
- `last_active_at` → Updated on every page load
- `is_editor`, `is_admin` → Managed separately (not from auth.users)

## Verification

After removing triggers, verify sync works:

1. **New User:**
   - Login with new GitHub account
   - Check `user_profiles` table
   - Profile should be created automatically

2. **Existing User:**
   - Login with existing account
   - Check `user_profiles` table
   - Profile should be updated with latest data

3. **Data Sync:**
   - Update GitHub profile (name, avatar)
   - Login again
   - Check `user_profiles` table
   - Data should be synced

## Summary

**You don't need triggers!** Your application code already:
- ✅ Creates profiles automatically
- ✅ Updates profiles on every page load
- ✅ Keeps data in sync
- ✅ Has proper error handling
- ✅ Doesn't block authentication

**Removing triggers actually improves reliability** because:
- User creation can't fail due to profile creation issues
- Profile creation happens after authentication (when it's safe)
- Better error handling and debugging

