# How `user_metadata` / `raw_user_meta_data` Works

## Answer: It's Automatically Created by Supabase

### The `auth.users` Table is Built-In

When you create a Supabase project, Supabase **automatically creates** the entire `auth` schema, including:

- `auth.users` table (with all columns including `raw_user_meta_data`)
- `auth.sessions` table
- `auth.refresh_tokens` table
- All other auth-related tables and functions

**You don't need to create these - they exist by default.**

---

## How It Works

### 1. Supabase Creates the Schema

When you sign up for Supabase and create a project, the `auth` schema is automatically set up with:

```sql
-- This is done automatically by Supabase (you never run this)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  encrypted_password TEXT,
  raw_user_meta_data JSONB,  -- ← Automatically created
  raw_app_meta_data JSONB,   -- ← Automatically created
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- ... many other columns
);
```

### 2. Your Code Stores Data in It

When you call `supabase.auth.updateUser()`:

```typescript
// app/auth/callback/route.ts - Line 118
await supabase.auth.updateUser({
  data: {
    github_oauth_token: providerToken,
    github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  },
});
```

**Supabase automatically:**
1. Takes the `data` object
2. Stores it in the `raw_user_meta_data` JSONB column
3. Makes it accessible via `user.user_metadata` in the client SDK

### 3. No SQL Migration Needed

**You don't need to:**
- ❌ Create the `auth.users` table
- ❌ Create the `raw_user_meta_data` column
- ❌ Run any migrations
- ❌ Write any SQL

**It just works!** Supabase handles it all.

---

## Verification: Check if Column Exists

Run this to confirm the column exists (it should):

```sql
-- Check if raw_user_meta_data column exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
  AND column_name = 'raw_user_meta_data';
```

**Expected Result:**
- `column_name`: `raw_user_meta_data`
- `data_type`: `jsonb`
- `is_nullable`: `YES`

---

## How Data Flows

```
1. User signs in with GitHub
   ↓
2. OAuth callback receives provider_token
   ↓
3. Code calls: supabase.auth.updateUser({ data: {...} })
   ↓
4. Supabase stores data in: auth.users.raw_user_meta_data
   ↓
5. Client SDK exposes it as: user.user_metadata
   ↓
6. Your code accesses: user.user_metadata.github_oauth_token
```

---

## Why Two Names?

**Database Column:** `raw_user_meta_data`  
**Client SDK Property:** `user_metadata`

Supabase uses different names for:
- **SQL queries:** Use `raw_user_meta_data` (actual column name)
- **TypeScript code:** Use `user_metadata` (SDK convenience property)

The SDK automatically maps between them.

---

## What If Column Doesn't Exist?

If the column doesn't exist (very unlikely), it means:

1. **Supabase project wasn't fully initialized** - Contact Supabase support
2. **Wrong database** - You might be querying a different database
3. **Permissions issue** - You might not have access to the `auth` schema

**Solution:** Check your Supabase project setup. The column should exist by default.

---

## Summary

- ✅ **Column is created automatically** by Supabase when you create a project
- ✅ **No SQL needed** - Supabase manages the `auth` schema
- ✅ **Just use `updateUser()`** - It stores data in `raw_user_meta_data`
- ✅ **Access via `user_metadata`** in TypeScript code
- ✅ **Query via `raw_user_meta_data`** in SQL

**You never need to create it - it's already there!**

