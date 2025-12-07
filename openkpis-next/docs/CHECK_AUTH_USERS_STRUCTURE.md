# Check auth.users Table Structure

## Step 1: See ALL Columns in auth.users

```sql
-- List all columns in auth.users table
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

## Step 2: Check if Table Exists

```sql
-- Verify auth.users table exists
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'auth'
  AND table_name = 'users';
```

## Step 3: Check Raw Structure (Alternative)

```sql
-- Try to see the actual table structure
SELECT 
  *
FROM auth.users
LIMIT 1;
```

## Step 4: Check for Metadata in Different Locations

Supabase might store metadata differently. Try these:

```sql
-- Check raw_user_meta_data (older Supabase versions)
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'github_oauth_token' as has_token
FROM auth.users
LIMIT 5;

-- Check raw_app_meta_data
SELECT 
  id,
  email,
  raw_app_meta_data
FROM auth.users
LIMIT 5;
```

## Step 5: Check All JSONB Columns

```sql
-- Find all JSONB columns in auth.users
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
  AND data_type = 'jsonb';
```

## If user_metadata Doesn't Exist

If `user_metadata` column doesn't exist, Supabase might be using:
- `raw_user_meta_data` (older versions)
- Or metadata might be stored elsewhere

Try this query instead:

```sql
-- Check raw_user_meta_data for GitHub token
SELECT 
  id,
  email,
  updated_at,
  raw_user_meta_data,
  raw_user_meta_data->>'github_oauth_token' as has_github_token,
  raw_user_meta_data->>'github_token_expires_at' as expires_at
FROM auth.users
ORDER BY updated_at DESC;
```

