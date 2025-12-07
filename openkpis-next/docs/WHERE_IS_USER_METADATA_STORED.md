# Where is `user_metadata.github_oauth_token` Stored?

## Answer: It's in `auth.users` table, NOT a separate table

### Location

**Table:** `auth.users` (Supabase Auth schema)  
**Field:** `user_metadata` (JSONB column)  
**Path:** `user_metadata.github_oauth_token`

### Why You Can't See It

1. **`auth.users` is in the `auth` schema**, not the `public` schema
2. **Supabase Dashboard** doesn't show `auth` schema tables by default
3. **It's a JSON field**, so you need to query it specifically

## How to Access It

### Option 1: Supabase Dashboard (SQL Editor)

1. Go to: [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to: **SQL Editor**
4. Run this query:

```sql
SELECT 
  id,
  email,
  user_metadata->>'github_oauth_token' as has_token,
  user_metadata->>'github_token_expires_at' as expires_at,
  user_metadata
FROM auth.users
WHERE email = 'your-email@example.com';
```

**Or see all users with tokens:**
```sql
SELECT 
  id,
  email,
  CASE 
    WHEN user_metadata->>'github_oauth_token' IS NOT NULL 
    THEN 'YES' 
    ELSE 'NO' 
  END as has_github_token,
  user_metadata->>'github_token_expires_at' as expires_at
FROM auth.users
WHERE user_metadata->>'github_oauth_token' IS NOT NULL;
```

### Option 2: Supabase Dashboard (Table Editor)

1. Go to: **Table Editor**
2. **You won't see `auth.users`** - it's in a different schema
3. To access it, you need to use **SQL Editor** (see Option 1)

### Option 3: Authentication → Users

1. Go to: **Authentication** → **Users**
2. Click on a user
3. Scroll down to **"User Metadata"** section
4. You should see:
   ```json
   {
     "github_oauth_token": "gho_xxxxx...",
     "github_token_expires_at": "2025-12-07T11:31:11.000Z"
   }
   ```

### Option 4: Code Access

```typescript
// Get user
const { data: { user } } = await supabase.auth.getUser();

// Access token
const token = user?.user_metadata?.github_oauth_token;
const expiresAt = user?.user_metadata?.github_token_expires_at;
```

## Table Structure

### `auth.users` Table (Supabase Internal)

```sql
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT,
  user_metadata JSONB,  -- ← Token stored here
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- ... other auth fields
);
```

### `user_metadata` JSON Structure

```json
{
  "github_oauth_token": "gho_xxxxxxxxxxxxxxxxxxxx",
  "github_token_expires_at": "2025-12-07T11:31:11.000Z",
  "user_name": "swapnamagantius",
  "avatar_url": "https://avatars.githubusercontent.com/...",
  "provider": "github"
}
```

## Why Not a Separate Table?

**Advantages of `user_metadata`:**
- ✅ Built into Supabase Auth
- ✅ Automatically synced with user
- ✅ No need for separate table/joins
- ✅ Available immediately after auth

**Disadvantages:**
- ❌ Not visible in Table Editor (auth schema)
- ❌ Need SQL Editor to query
- ❌ JSON field (less structured)

## How to Verify Token is Stored

### Method 1: Authentication → Users (Easiest)

1. Supabase Dashboard → **Authentication** → **Users**
2. Click on your user
3. Scroll to **"User Metadata"**
4. Look for `github_oauth_token`

### Method 2: SQL Query

```sql
SELECT 
  email,
  user_metadata->>'github_oauth_token' as token,
  user_metadata->>'github_token_expires_at' as expires_at
FROM auth.users
WHERE email = 'your-email@example.com';
```

### Method 3: Check in Code

Add this to any API route:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Token in metadata:', user?.user_metadata?.github_oauth_token ? 'YES' : 'NO');
```

## Summary

- **Location:** `auth.users.user_metadata` (JSON field)
- **Not a separate table** - it's in the auth schema
- **Access via:** SQL Editor, Authentication → Users, or code
- **Path:** `user_metadata.github_oauth_token`

