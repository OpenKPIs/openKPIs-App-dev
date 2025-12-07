# SQL Queries to Verify `user_metadata` and GitHub Token Storage

## ⚠️ IMPORTANT: Check Column Names First!

Supabase uses `raw_user_meta_data` in the database, not `user_metadata`. The `user_metadata` is a property exposed by the client SDK.

### Step 1: See ALL Columns in auth.users

```sql
-- List all columns in auth.users table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;
```

**Look for:**
- `raw_user_meta_data` (JSONB) - This is where metadata is stored
- `raw_app_meta_data` (JSONB) - App-specific metadata

---

## Query 1: Check All Users and Their Metadata Structure (CORRECTED)

```sql
-- See all users with their metadata (using raw_user_meta_data)
SELECT 
  id,
  email,
  created_at,
  updated_at,
  CASE 
    WHEN raw_user_meta_data IS NULL THEN 'NULL'
    WHEN raw_user_meta_data = '{}'::jsonb THEN 'EMPTY'
    ELSE 'HAS_DATA'
  END as metadata_status,
  raw_user_meta_data
FROM auth.users
ORDER BY updated_at DESC
LIMIT 10;
```

---

## Query 2: Check for GitHub Token in Metadata (CORRECTED)

```sql
-- Check if github_oauth_token exists in raw_user_meta_data
SELECT 
  id,
  email,
  created_at,
  updated_at,
  raw_user_meta_data->>'github_oauth_token' as has_token,
  CASE 
    WHEN raw_user_meta_data->>'github_oauth_token' IS NOT NULL 
    THEN 'YES - Token exists'
    ELSE 'NO - Token missing'
  END as token_status,
  raw_user_meta_data->>'github_token_expires_at' as expires_at,
  raw_user_meta_data->>'user_name' as github_username,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
ORDER BY updated_at DESC;
```

---

## Query 3: Detailed View of Your User's Metadata (CORRECTED)

```sql
-- Replace 'your-email@example.com' with your actual email
SELECT 
  id,
  email,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_user_meta_data->>'github_oauth_token' as github_token,
  raw_user_meta_data->>'github_token_expires_at' as token_expires_at,
  raw_user_meta_data->>'user_name' as github_username,
  raw_user_meta_data->>'avatar_url' as avatar_url,
  raw_user_meta_data->>'provider' as provider
FROM auth.users
WHERE email = 'your-email@example.com';
```

---

## Query 4: Check All Metadata Keys (Structure) (CORRECTED)

```sql
-- See what keys exist in raw_user_meta_data across all users
SELECT DISTINCT
  jsonb_object_keys(raw_user_meta_data) as metadata_key
FROM auth.users
WHERE raw_user_meta_data IS NOT NULL
  AND raw_user_meta_data != '{}'::jsonb
ORDER BY metadata_key;
```

**Expected Keys:**
- `github_oauth_token`
- `github_token_expires_at`
- `user_name` (from GitHub)
- `avatar_url` (from GitHub)
- `provider` (should be "github")

---

## Query 5: Check Token Expiration Status (CORRECTED)

```sql
-- Check if tokens are expired or expiring soon
SELECT 
  id,
  email,
  raw_user_meta_data->>'github_oauth_token' as token_exists,
  raw_user_meta_data->>'github_token_expires_at' as expires_at,
  CASE 
    WHEN raw_user_meta_data->>'github_token_expires_at' IS NULL THEN 'NO_EXPIRATION_SET'
    WHEN (raw_user_meta_data->>'github_token_expires_at')::timestamptz < NOW() THEN 'EXPIRED'
    WHEN (raw_user_meta_data->>'github_token_expires_at')::timestamptz < NOW() + INTERVAL '1 hour' THEN 'EXPIRING_SOON'
    ELSE 'VALID'
  END as token_status,
  updated_at as last_updated
FROM auth.users
WHERE raw_user_meta_data->>'github_oauth_token' IS NOT NULL
ORDER BY updated_at DESC;
```

---

## Query 6: Count Users with GitHub Tokens (CORRECTED)

```sql
-- Statistics: How many users have tokens stored
SELECT 
  COUNT(*) as total_users,
  COUNT(raw_user_meta_data->>'github_oauth_token') as users_with_token,
  COUNT(*) - COUNT(raw_user_meta_data->>'github_oauth_token') as users_without_token,
  COUNT(CASE WHEN raw_user_meta_data IS NULL THEN 1 END) as users_with_null_metadata,
  COUNT(CASE WHEN raw_user_meta_data = '{}'::jsonb THEN 1 END) as users_with_empty_metadata
FROM auth.users;
```

---

## Query 7: Full Metadata for Debugging (Be Careful - Shows Tokens!) (CORRECTED)

```sql
-- ⚠️ WARNING: This shows actual tokens - use only for debugging
-- Replace 'your-email@example.com' with your actual email
SELECT 
  id,
  email,
  raw_user_meta_data,
  jsonb_pretty(raw_user_meta_data) as formatted_metadata
FROM auth.users
WHERE email = 'your-email@example.com';
```

---

## Query 8: Check Recent Sign-Ins (Should Have Tokens) (CORRECTED)

```sql
-- Check users who signed in recently (should have tokens if callback worked)
SELECT 
  u.id,
  u.email,
  u.updated_at as last_signin,
  u.raw_user_meta_data->>'github_oauth_token' IS NOT NULL as has_token,
  u.raw_user_meta_data->>'github_token_expires_at' as expires_at
FROM auth.users u
WHERE u.updated_at > NOW() - INTERVAL '24 hours'
ORDER BY u.updated_at DESC;
```

---

## Troubleshooting: Column Name Confusion

**Important:** Supabase uses different names:
- **Database column:** `raw_user_meta_data` (what you query in SQL)
- **Client SDK property:** `user_metadata` (what you access in code)

The `updateUser({ data: {...} })` method stores data in `raw_user_meta_data`, but the client SDK exposes it as `user_metadata`.

### Check All Columns

```sql
-- Check all columns in auth.users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;
```

### Check All JSONB Columns

```sql
-- Find all JSONB columns (where metadata might be stored)
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
  AND data_type = 'jsonb';
```

---

## Expected Results After Successful Login

After a user signs in with GitHub, you should see in `raw_user_meta_data`:

```json
{
  "github_oauth_token": "gho_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "github_token_expires_at": "2025-12-07T19:31:11.000Z",
  "user_name": "swapnamagantius",
  "avatar_url": "https://avatars.githubusercontent.com/u/...",
  "provider": "github"
}
```

---

## If Token is Missing

If `github_oauth_token` is NULL or missing:

1. **Check auth callback logs:**
   - Look for `[Auth Callback] Stored GitHub token in Supabase user_metadata`
   - Check for errors: `[Auth Callback] Failed to store token in Supabase`

2. **Verify OAuth callback is working:**
   ```sql
   -- Check if user has any metadata at all
   SELECT 
     email,
     raw_user_meta_data,
     updated_at
   FROM auth.users
   WHERE email = 'your-email@example.com';
   ```

3. **Check if provider_token is being extracted:**
   - The callback route should log if `providerToken` is found
   - Check Vercel/server logs for `[auth/callback]` messages

---

## Quick Diagnostic Query (CORRECTED)

Run this to get a complete picture:

```sql
SELECT 
  'Total Users' as metric,
  COUNT(*)::text as value
FROM auth.users
UNION ALL
SELECT 
  'Users with Metadata',
  COUNT(*)::text
FROM auth.users
WHERE raw_user_meta_data IS NOT NULL AND raw_user_meta_data != '{}'::jsonb
UNION ALL
SELECT 
  'Users with GitHub Token',
  COUNT(*)::text
FROM auth.users
WHERE raw_user_meta_data->>'github_oauth_token' IS NOT NULL
UNION ALL
SELECT 
  'Users with Expired Tokens',
  COUNT(*)::text
FROM auth.users
WHERE raw_user_meta_data->>'github_token_expires_at' IS NOT NULL
  AND (raw_user_meta_data->>'github_token_expires_at')::timestamptz < NOW();
```

---

## ⚠️ KEY DIFFERENCE

**In SQL queries:** Use `raw_user_meta_data`  
**In TypeScript code:** Use `user.user_metadata`

The Supabase client SDK automatically maps `raw_user_meta_data` to `user_metadata` for convenience.

