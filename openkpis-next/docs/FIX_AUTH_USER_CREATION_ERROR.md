# Fix "Database error saving new user" Error

## Error Message
```
https://openkpis.org/auth/callback?error=server_error&error_code=unexpected_failure&error_description=Database+error+saving+new+user
```

## What This Means

This error occurs **during Supabase's user creation process**, not in your application code. Supabase is trying to create a user in `auth.users`, but something in the database is failing.

## Most Likely Causes

### 1. Database Trigger on `auth.users` (MOST COMMON)
A trigger runs automatically when a user is created and tries to:
- Create a record in `user_profiles`
- Call a function that fails
- Perform an operation that fails due to RLS or constraints

**Solution:** Remove or fix the trigger

### 2. Database Function Called by Trigger
A function is called when users are created and it:
- Tries to INSERT into `user_profiles` but RLS blocks it
- Has a bug or missing error handling
- References a table/column that doesn't exist

**Solution:** Fix or remove the function

### 3. Foreign Key Constraint
`user_profiles` has a foreign key to `auth.users` that's causing issues during user creation.

**Solution:** Check and potentially modify the constraint

## Diagnostic Steps

### Step 1: Run Diagnostic Script
Run `scripts/diagnose-auth-user-creation-error.sql` in Supabase SQL Editor to find:
- Triggers on `auth.users`
- Functions that might be failing
- Constraints that might block

### Step 2: Check for Triggers
Look for triggers with names like:
- `handle_new_user`
- `on_auth_user_created`
- `create_user_profile`
- `sync_user_profile`

### Step 3: Check Supabase Dashboard
1. Go to **Database → Triggers**
2. Look for triggers on `auth.users` table
3. Check if any trigger tries to create `user_profiles`

### Step 4: Check Supabase Logs
1. Go to **Logs → Postgres Logs**
2. Look for errors when users try to sign up
3. The error message will show what's failing

## Quick Fix

### Option 1: Remove All Triggers on auth.users
```sql
-- Find and remove triggers
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
DROP TRIGGER IF EXISTS sync_user_profile ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;
```

**Note:** Replace trigger names with actual names found in diagnostic script.

### Option 2: Disable RLS on user_profiles (Already Done)
If you already ran `remove-rls-policies-for-login.sql`, RLS should be disabled. Verify:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';
-- Should show rowsecurity = false
```

### Option 3: Fix the Trigger
If you want to keep the trigger, modify it to:
- Handle errors gracefully
- Not fail if `user_profiles` insert fails
- Use proper error handling

## Step-by-Step Fix

1. **Run Diagnostic Script:**
   ```sql
   -- Run: scripts/diagnose-auth-user-creation-error.sql
   ```

2. **Identify the Problem:**
   - Look for triggers on `auth.users`
   - Check if they try to create `user_profiles`
   - Check if they have error handling

3. **Remove Problematic Triggers:**
   ```sql
   -- Use actual trigger names from diagnostic output
   DROP TRIGGER IF EXISTS <trigger_name> ON auth.users;
   ```

4. **Verify Fix:**
   - Try logging in with a new user
   - Check if error is resolved

5. **Alternative: Let App Code Handle Profile Creation**
   - Remove triggers that auto-create profiles
   - Let your app code (`AuthProvider.tsx`) create profiles
   - This gives you better control and error handling

## Why This Happens

Supabase allows you to create triggers on `auth.users` that run when users are created. If these triggers:
- Try to create records in tables with RLS enabled
- Don't have proper error handling
- Reference tables/columns that don't exist
- Have bugs

Then user creation will fail with "Database error saving new user".

## Prevention

1. **Don't create triggers on `auth.users`** unless absolutely necessary
2. **Let application code handle profile creation** (more control, better error handling)
3. **If you must use triggers**, ensure they:
   - Have proper error handling
   - Don't fail if profile creation fails
   - Use `SECURITY DEFINER` if needed to bypass RLS

## After Fixing

1. Test login with a new user
2. Verify user is created in `auth.users`
3. Verify profile is created in `user_profiles` (by app code)
4. Check logs for any remaining errors

