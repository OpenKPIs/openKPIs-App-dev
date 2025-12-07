# GitHub Contributions - Final Implementation Plan

## Priority Order (As Clarified)

1. **User Token (with silent refresh)** - Primary approach
2. **Prompt User to Login** - If not logged in
3. **Bot Token** - ONLY as last resort (rare failures)

## Implementation Strategy

### Flow Diagram

```
User creates/edits item
  ↓
Is user logged in?
  ↓
YES → Get user token from Supabase
  ↓
Token available?
  ↓
YES → Check if expired
  ↓
Expired? → Silent refresh
  ↓
Refresh successful? → Use user token ✅
  ↓
Refresh failed? → Prompt: "Re-authorize?" → User chooses
  ↓
NO (not logged in) → Prompt: "Sign in to track contributions?"
  ↓
User signs in → Get token → Use user token ✅
  ↓
ONLY if all above fail → Use bot token (last resort) ⚠️
```

## Code Implementation

### 1. Get User Token (with Silent Refresh)

```typescript
async function getUserOAuthTokenWithRefresh(userId: string): Promise<{
  token: string | null;
  requiresReauth: boolean;
  error?: string;
}> {
  // Step 1: Get token from Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      token: null,
      requiresReauth: true,
      error: 'User not logged in',
    };
  }
  
  let token = user.user_metadata?.github_oauth_token as string | undefined;
  const expiresAt = user.user_metadata?.github_token_expires_at as string | undefined;
  
  // Step 2: Check if token exists
  if (!token) {
    return {
      token: null,
      requiresReauth: true,
      error: 'GitHub token not found. Please sign in with GitHub.',
    };
  }
  
  // Step 3: Check if token is expired (with 5-minute buffer)
  const isExpired = expiresAt && new Date(expiresAt).getTime() < Date.now() + 5 * 60 * 1000;
  
  if (isExpired) {
    // Step 4: Try silent refresh
    console.log('[GitHub Token] Token expired, attempting silent refresh...');
    const refreshed = await refreshGitHubTokenSilently(userId);
    
    if (refreshed) {
      return { token: refreshed, requiresReauth: false };
    }
    
    // Refresh failed - need user to re-authorize
    return {
      token: null,
      requiresReauth: true,
      error: 'GitHub token expired. Please sign in again to track contributions.',
    };
  }
  
  // Step 5: Verify token is still valid
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.users.getAuthenticated();
    return { token, requiresReauth: false };
  } catch (error) {
    // Token invalid - try refresh
    console.log('[GitHub Token] Token invalid, attempting refresh...');
    const refreshed = await refreshGitHubTokenSilently(userId);
    
    if (refreshed) {
      return { token: refreshed, requiresReauth: false };
    }
    
    return {
      token: null,
      requiresReauth: true,
      error: 'GitHub token invalid. Please sign in again.',
    };
  }
}

async function refreshGitHubTokenSilently(userId: string): Promise<string | null> {
  try {
    // Try to get new token from Supabase session refresh
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.provider_refresh_token) {
      // Supabase may have refreshed the token
      // Check user metadata again
      const { data: { user } } = await supabase.auth.getUser();
      const newToken = user?.user_metadata?.github_oauth_token as string | undefined;
      
      if (newToken) {
        // Verify new token works
        const octokit = new Octokit({ auth: newToken });
        await octokit.users.getAuthenticated();
        return newToken;
      }
    }
    
    // Silent refresh not possible - return null
    return null;
  } catch (error) {
    console.error('[GitHub Token] Silent refresh failed:', error);
    return null;
  }
}
```

### 2. GitHub Sync Service (Updated Priority)

```typescript
export async function syncToGitHub(params: GitHubSyncParams): Promise<{
  success: boolean;
  commit_sha?: string;
  pr_number?: number;
  pr_url?: string;
  branch?: string;
  file_path?: string;
  error?: string;
  requiresReauth?: boolean;
}> {
  try {
    // PRIORITY 1: Try user token (with silent refresh)
    const { token: userToken, requiresReauth, error: tokenError } = 
      await getUserOAuthTokenWithRefresh(params.userId);
    
    if (userToken) {
      // Use user token - commits will count toward contributions
      return await commitWithUserToken(userToken, params);
    }
    
    // PRIORITY 2: User not logged in or token unavailable
    if (requiresReauth) {
      return {
        success: false,
        error: tokenError || 'GitHub authorization required',
        requiresReauth: true,
      };
    }
    
    // PRIORITY 3: Last resort - use bot (only if everything fails)
    console.warn('[GitHub Sync] Using bot token as last resort');
    return await commitWithBotToken(params);
    
  } catch (error: unknown) {
    console.error('GitHub sync error:', error);
    const err = error as { message?: string };
    
    // Try bot as absolute last resort
    try {
      console.warn('[GitHub Sync] Error with user token, trying bot as last resort');
      return await commitWithBotToken(params);
    } catch (botError) {
      return {
        success: false,
        error: err.message || 'Failed to sync to GitHub',
      };
    }
  }
}

async function commitWithUserToken(
  userToken: string,
  params: GitHubSyncParams
): Promise<{ success: boolean; commit_sha?: string; pr_number?: number; pr_url?: string; branch?: string; file_path?: string; error?: string }> {
  const octokit = new Octokit({ auth: userToken });
  
  // Verify user has repo access
  try {
    await octokit.users.getAuthenticated();
  } catch {
    throw new Error('User token does not have repository access');
  }
  
  // Create branch, commit, PR (same as before)
  // ... existing commit logic ...
  
  return {
    success: true,
    commit_sha: commitData.commit.sha,
    pr_number: prData.number,
    pr_url: prData.html_url,
    branch: branchName,
    file_path: filePath,
  };
}

async function commitWithBotToken(
  params: GitHubSyncParams
): Promise<{ success: boolean; commit_sha?: string; pr_number?: number; pr_url?: string; branch?: string; file_path?: string; error?: string }> {
  // Bot token implementation (existing code)
  // Only used as last resort
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = resolvePrivateKey();
  const installationIdStr = process.env.GITHUB_INSTALLATION_ID;
  
  if (!appId || !privateKey || !installationIdStr) {
    throw new Error('Bot credentials not configured');
  }
  
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: Number(appId),
      privateKey,
      installationId: parseInt(installationIdStr, 10),
    },
  });
  
  // ... existing commit logic with bot ...
  
  console.warn('[GitHub Sync] Used bot token - commit will NOT count toward user contributions');
  
  return {
    success: true,
    commit_sha: commitData.commit.sha,
    pr_number: prData.number,
    pr_url: prData.html_url,
    branch: branchName,
    file_path: filePath,
  };
}
```

### 3. Frontend Handling

```typescript
// In create item form
async function handleSubmit() {
  const response = await fetch('/api/items/create', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  
  const result = await response.json();
  
  if (result.error === 'TOKEN_REQUIRED' || result.requiresReauth) {
    // Show modal: "Sign in with GitHub to track your contributions"
    const shouldSignIn = confirm(
      'GitHub authorization required to track your contributions.\n\n' +
      'Click OK to sign in, or Cancel to skip (commit won\'t count toward contributions).'
    );
    
    if (shouldSignIn) {
      // Redirect to sign-in
      window.location.href = '/auth/signin?returnTo=' + encodeURIComponent(window.location.pathname);
    } else {
      // User skipped - retry with bot (last resort)
      const retryResponse = await fetch('/api/items/create', {
        method: 'POST',
        body: JSON.stringify({ ...formData, allowBotFallback: true }),
      });
      // ... handle response
    }
  }
}
```

### 4. Store Token in Supabase (Cross-Device)

```typescript
// In app/auth/callback/route.ts
if (providerToken) {
  // Store in cookie (immediate use)
  response.cookies.set('openkpis_github_token', providerToken, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  // ALSO store in Supabase user_metadata (cross-device)
  try {
    await supabase.auth.updateUser({
      data: {
        github_oauth_token: providerToken,
        github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
      },
    });
    console.log('[Auth Callback] Stored GitHub token in Supabase');
  } catch (error) {
    console.error('[Auth Callback] Failed to store token in Supabase:', error);
    // Non-critical - continue
  }
}
```

### 5. Fix OAuth Scopes

```typescript
// lib/supabase/auth.ts - Line 58
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo,
    scopes: 'read:user user:email repo',  // Changed from 'public_repo' to 'repo'
  },
});
```

## Summary

### Priority Order
1. ✅ **User Token** (with silent refresh if logged in)
2. ✅ **Prompt Login** (if not logged in)
3. ⚠️ **Bot Token** (ONLY as last resort)

### Key Changes
1. ✅ Store token in Supabase `user_metadata` (cross-device)
2. ✅ Silent refresh before commits (if user logged in)
3. ✅ Prompt user to login (if not logged in)
4. ✅ Bot only as last resort (rare failures)
5. ✅ Fix OAuth scopes: `public_repo` → `repo`

### User Experience
- **Logged in + token valid**: Works automatically ✅
- **Logged in + token expired**: Silent refresh → Works ✅
- **Logged in + refresh failed**: Prompt to re-authorize
- **Not logged in**: Prompt to sign in
- **All fails**: Bot (last resort, with warning)

