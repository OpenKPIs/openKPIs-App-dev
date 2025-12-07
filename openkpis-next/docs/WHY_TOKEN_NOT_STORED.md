# Why GitHub Token is Not Being Stored

## Problem

The `raw_user_meta_data` only contains GitHub profile info (from Supabase OAuth), but **NOT** the `github_oauth_token` or `github_token_expires_at` fields.

**Current `raw_user_meta_data`:**
```json
{
  "iss": "https://api.github.com",
  "sub": "239198068",
  "email": "swaddfdapna.aeer@gmail.com",
  "user_name": "swaddfdapna",
  "avatar_url": "https://avatars.githubusercontent.com/u/239198068?v=4",
  "provider_id": "239198068",
  "email_verified": true,
  "phone_verified": false,
  "preferred_username": "swaddfdapna"
}
```

**Missing:**
- `github_oauth_token`
- `github_token_expires_at`

## Root Cause

**Supabase does NOT provide the provider token in the session object by default** for security reasons.

In `app/auth/callback/route.ts`, the code tries to extract:
```typescript
providerToken = session.provider_token || session.provider_access_token;
```

But these properties are **not present** in the session object returned by `exchangeCodeForSession()`.

## Why Supabase Doesn't Provide It

1. **Security**: Provider tokens are sensitive and shouldn't be exposed to client-side code
2. **Token Management**: Supabase manages tokens internally and doesn't expose them
3. **Best Practice**: Tokens should be stored server-side only

## Solutions

### Option 1: Use Supabase Admin API (Recommended)

Use the Supabase Admin API with `SUPABASE_SERVICE_ROLE_KEY` to fetch the token:

```typescript
// In auth/callback/route.ts
import { createClient } from '@supabase/supabase-js';

// After exchangeCodeForSession
if (sessionData?.session?.user) {
  // Use Admin API to get the provider token
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Get user's identity (contains provider token)
  const { data: identities } = await adminClient.auth.admin.getUserById(
    sessionData.session.user.id
  );

  // Extract provider token from identity
  const githubIdentity = identities.user?.identities?.find(
    (id: any) => id.provider === 'github'
  );
  
  const providerToken = githubIdentity?.identity_data?.access_token;
  
  if (providerToken) {
    // Store in user_metadata
    await supabase.auth.updateUser({
      data: {
        github_oauth_token: providerToken,
        github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      },
    });
  }
}
```

### Option 2: Store Token During OAuth Flow

Intercept the token before Supabase processes it (more complex, requires custom OAuth handler).

### Option 3: Use Database Webhook

Set up a Supabase webhook to capture the token when user is created (requires webhook setup).

## Current Status

The code in `app/auth/callback/route.ts` is trying to extract the token, but it's `null` because Supabase doesn't provide it in the session.

**Check server logs for:**
- `[Auth Callback] Provider token extracted successfully` ✅ (token found)
- `[Auth Callback] Provider token NOT found in session` ❌ (token missing - current state)

## Next Steps

1. **Add logging** (already done) to confirm token is missing
2. **Implement Option 1** (Admin API) to fetch and store the token
3. **Test** by signing in again and checking `raw_user_meta_data`

## Environment Variable Needed

For Option 1, you'll need:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ WARNING:** Service role key bypasses RLS - keep it secret and only use server-side!

