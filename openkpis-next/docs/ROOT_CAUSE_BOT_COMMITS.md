# Root Cause: Why Commits Are Made by Bot Instead of User

## The Problem

**GitHub contributions are showing as bot commits instead of user commits** because the GitHub OAuth token is **never being stored** in `user_metadata`.

## The Flow (What Should Happen)

### Step 1: User Signs In
```
User clicks "Sign in with GitHub"
  ↓
OAuth callback: app/auth/callback/route.ts
  ↓
Extract provider_token from session
  ↓
Store in cookie AND user_metadata ✅
```

### Step 2: User Creates KPI
```
User creates KPI
  ↓
API calls: syncToGitHub()
  ↓
getUserOAuthTokenWithRefresh() checks:
  1. Cookie: openkpis_github_token ✅ (if available)
  2. user_metadata.github_oauth_token ✅ (if stored)
  3. Silent refresh (if expired)
  4. Require re-auth (if not found)
  ↓
If token found → commitWithUserToken() ✅
  ↓
Commit shows as USER → Counts toward contributions ✅
```

## What's Actually Happening

### Step 1: User Signs In (BROKEN)
```
User clicks "Sign in with GitHub"
  ↓
OAuth callback: app/auth/callback/route.ts
  ↓
Try to extract provider_token from session
  ↓
❌ provider_token is NULL (Supabase doesn't provide it)
  ↓
❌ Token NOT stored in cookie
❌ Token NOT stored in user_metadata
```

### Step 2: User Creates KPI (FALLS BACK TO BOT)
```
User creates KPI
  ↓
API calls: syncToGitHub()
  ↓
getUserOAuthTokenWithRefresh() checks:
  1. Cookie: openkpis_github_token ❌ (not set)
  2. user_metadata.github_oauth_token ❌ (not stored)
  3. Silent refresh ❌ (no token to refresh)
  4. Returns: requiresReauth: true
  ↓
Code falls through to bot fallback (line 516-518)
  ↓
commitWithBotToken() ❌
  ↓
Commit shows as BOT → Doesn't count toward contributions ❌
```

## Code Evidence

### In `lib/services/github.ts` (syncToGitHub):

```typescript
// Line 472-474: Try to get user token
const { token: userToken, requiresReauth, error: tokenError } = 
  await getUserOAuthTokenWithRefresh(params.userId);

if (userToken) {
  // ✅ Use user token - commits count
  return await commitWithUserToken(userToken, params);
}

// Line 499-506: If requiresReauth, should return early
if (requiresReauth) {
  return {
    success: false,
    error: tokenError || 'GitHub authorization required',
    requiresReauth: true,
  };
}

// Line 516-518: BUT if error occurs, falls through to bot
console.warn('[GitHub Sync] All user token attempts failed, using bot as last resort');
return await commitWithBotToken(params); // ❌ BOT COMMIT
```

### In `lib/services/github.ts` (getUserOAuthTokenWithRefresh):

```typescript
// Line 95-106: Check cookie
const cookieToken = cookieStore.get('openkpis_github_token')?.value;
if (cookieToken) {
  token = cookieToken; // ✅ Found in cookie
}

// Line 108-114: Check user_metadata
if (!token) {
  token = user.user_metadata?.github_oauth_token; // ❌ NULL (never stored)
}

// Line 116-122: If no token found
if (!token) {
  return {
    token: null,
    requiresReauth: true, // ❌ Triggers bot fallback
    error: 'GitHub token not found. Please sign in with GitHub.',
  };
}
```

## Why Token Wasn't Stored

### In `app/auth/callback/route.ts`:

```typescript
// Line 88-104: Try to extract token
let providerToken: string | null = null;

if (sessionData?.session) {
  const session = sessionData.session as unknown as Record<string, unknown>;
  providerToken = 
    (session.provider_token as string | undefined) || // ❌ NULL
    (session.provider_access_token as string | undefined) || // ❌ NULL
    null;
}

// Line 106: Only stores if providerToken exists
if (providerToken && sessionData?.session?.user) {
  // Store token...
} else {
  // ❌ Token never stored because providerToken is NULL
}
```

**Root Cause:** Supabase doesn't provide `provider_token` in the session object by default for security reasons.

## The Fix

The updated `app/auth/callback/route.ts` now:
1. ✅ Tries to extract token from session (original approach)
2. ✅ Falls back to Admin API to fetch from user identity
3. ✅ Stores token in both cookie and `user_metadata`

## Verification

After the fix, check:

1. **Sign in again** with GitHub
2. **Check server logs** for:
   - `[Auth Callback] Provider token extracted successfully` OR
   - `[Auth Callback] Provider token extracted from Admin API`
   - `[Auth Callback] Stored GitHub token in Supabase user_metadata`
3. **Check `raw_user_meta_data`** - should now have:
   ```json
   {
     "github_oauth_token": "gho_xxxxx...",
     "github_token_expires_at": "2025-12-07T..."
   }
   ```
4. **Create a KPI** and check logs:
   - `[GitHub Token] Found token in cookie` OR
   - `[GitHub Token] Found token in user_metadata`
   - `[GitHub Sync] Using user token for commit`
5. **Check GitHub** - commit should show as YOUR commit, not bot

## Summary

| Issue | Status | Impact |
|-------|--------|--------|
| Token not extracted from session | ✅ Fixed (Admin API fallback) | Was causing bot commits |
| Token not stored in user_metadata | ✅ Fixed (Now stores via Admin API) | Was causing bot commits |
| Code falls back to bot | ⚠️ Still happens (but should be rare now) | Commits won't count if token missing |

**The fix should resolve the bot commit issue!** 🎯

