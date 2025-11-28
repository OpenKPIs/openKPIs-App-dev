# Remove Triggers on auth.users - Fix User Creation Error

## Problem
Error: `Database error saving new user`

**Root Cause:** Custom triggers on `auth.users` table are failing when trying to create user profiles.

## Solution
Remove all custom triggers on `auth.users` and let your application code handle profile creation.

## Why This Works

1. **Your app code already creates profiles:**
   - `app/providers/AuthProvider.tsx` creates profiles after authentication
   - It has proper error handling
   - It doesn't block authentication if profile creation fails

2. **Triggers are problematic:**
   - They run during user creation (before auth is complete)
   - They might fail due to RLS or other constraints
   - When they fail, user creation fails entirely

3. **Better approach:**
   - Let Supabase create the user in `auth.users` (authentication)
   - Let your app code create the profile in `user_profiles` (enrichment)
   - This gives you better control and error handling

## Steps to Fix

### Step 1: List Triggers
Run this to see what triggers exist:
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
```

### Step 2: Remove Triggers
Run `scripts/list-and-remove-auth-triggers.sql` which will:
- List all triggers on `auth.users`
- Remove all custom triggers (keeps Supabase internal triggers)
- Verify they're removed

### Step 3: Test Login
1. Try logging in with a new GitHub account
2. User should be created successfully
3. Profile should be created by your app code

## What Gets Removed

The script removes **custom triggers** only. Supabase's internal triggers (for auth functionality) are preserved because they're marked as `internal`.

## After Removing Triggers

1. **User Creation:** Works through Supabase auth (no triggers blocking)
2. **Profile Creation:** Handled by your app code:
   - `AuthProvider.tsx` creates profile on page load
   - `/api/auth/ensure-profile` can also create profile
   - Both have proper error handling

## Verification

After running the script, you should see:
- ✅ All custom triggers removed
- ✅ Only Supabase internal triggers remain
- ✅ User creation works
- ✅ Profile creation works (via app code)

## If Issues Persist

1. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for specific error messages

2. **Check Application Logs:**
   - Vercel Dashboard → Functions → Logs
   - Look for errors in `AuthProvider` or `/auth/callback`

3. **Verify RLS is Disabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'user_profiles';
   -- Should show rowsecurity = false
   ```

## Common Trigger Names

Triggers that commonly cause this issue:
- `handle_new_user`
- `on_auth_user_created`
- `create_user_profile`
- `sync_user_profile`
- `on_user_created`

The script will find and remove all of them automatically.

