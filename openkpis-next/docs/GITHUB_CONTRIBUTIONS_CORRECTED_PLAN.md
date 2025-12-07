# GitHub Contributions - Corrected Implementation Plan

## Critical Corrections

### 1. GitHub OAuth Configuration - CLARIFICATION

**IMPORTANT**: GitHub OAuth is configured **ONCE at the organization level**, NOT per-user.

**Where it's configured:**
- **GitHub OAuth App**: Created in OpenKPIs organization (or your GitHub account)
  - Location: `https://github.com/settings/developers` → OAuth Apps
  - **One OAuth App for ALL users**
  - Users do NOT need to create their own OAuth apps

**In Supabase Dashboard:**
- Go to: Authentication → Providers → GitHub
- You'll see:
  - ✅ **Enabled** (toggle)
  - ✅ **Client ID** (from GitHub OAuth App)
  - ✅ **Client Secret** (from GitHub OAuth App)
  - ✅ **Redirect URL** (Supabase callback URL)
  - ❌ **NO "Scopes" field** (scopes are set in CODE, not dashboard)

**Scopes are set in CODE:**
```typescript
// lib/supabase/auth.ts - Line 58
await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    scopes: 'read:user user:email repo',  // ← Set here, not in dashboard
  },
});
```

**Current Issue**: Code uses `public_repo` but needs `repo` for private repos.

---

## Corrected Implementation Plan

### 1. Store Token in Supabase (Cross-Device Support)

**Problem**: Token only in cookie → Lost when user switches devices

**Solution**: Store in Supabase `user_metadata` or separate table

**Option A: Store in `user_metadata` (Recommended)**
```typescript
// In auth/callback/route.ts
if (providerToken) {
  // Store in cookie (for immediate use)
  response.cookies.set('openkpis_github_token', providerToken, {...});
  
  // ALSO store in Supabase user metadata (for cross-device)
  await supabase.auth.updateUser({
    data: {
      github_oauth_token: providerToken,
      github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
    },
  });
}
```

**Option B: Store in Separate Table (More Secure)**
```sql
CREATE TABLE github_oauth_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy: Users can only read their own tokens
ALTER TABLE github_oauth_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own tokens" ON github_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);
```

**Retrieval:**
```typescript
// Get token from Supabase (works across devices)
const { data: user } = await supabase.auth.getUser();
const token = user.user_metadata?.github_oauth_token;

// Or from database table
const { data: tokenData } = await supabase
  .from('github_oauth_tokens')
  .select('access_token, expires_at')
  .eq('user_id', user.id)
  .single();
```

---

### 2. Silent Token Refresh Before Commits

**Problem**: Token expires → Commits fail or use bot

**Solution**: Check token expiration and refresh silently before commit

```typescript
async function getValidUserToken(userId: string): Promise<string | null> {
  // Get token from Supabase
  const { data: user } = await supabase.auth.getUser();
  const token = user.user_metadata?.github_oauth_token;
  const expiresAt = user.user_metadata?.github_token_expires_at;
  
  if (!token) return null;
  
  // Check if token is expired (with 5-minute buffer)
  if (expiresAt) {
    const expirationTime = new Date(expiresAt).getTime();
    const bufferTime = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (now >= expirationTime - bufferTime) {
      // Token expired or expiring soon - try to refresh
      console.log('Token expiring, attempting refresh...');
      const refreshed = await refreshGitHubToken(userId);
      return refreshed;
    }
  }
  
  // Verify token is still valid
  try {
    const octokit = new Octokit({ auth: token });
    await octokit.users.getAuthenticated();
    return token; // Token is valid
  } catch {
    // Token invalid - try refresh
    console.log('Token invalid, attempting refresh...');
    return await refreshGitHubToken(userId);
  }
}

async function refreshGitHubToken(userId: string): Promise<string | null> {
  // Option 1: Use Supabase refresh (if available)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.provider_refresh_token) {
    // Supabase may handle refresh automatically
    // Check if new token available
    const { data: { user } } = await supabase.auth.getUser();
    const newToken = user.user_metadata?.github_oauth_token;
    if (newToken) return newToken;
  }
  
  // Option 2: Prompt user to re-authorize (if refresh fails)
  // Return null to trigger re-authorization prompt
  return null;
}
```

---

### 3. User Re-Authorization Prompt (If Token Expired)

**Problem**: Token expired → Silent fallback to bot → User doesn't know

**Solution**: Prompt user to re-authorize if token expired

```typescript
async function syncToGitHub(params: GitHubSyncParams): Promise<...> {
  // Try to get valid user token
  const userToken = await getValidUserToken(params.userId);
  
  if (!userToken) {
    // Token unavailable or expired
    // Option 1: Prompt user to re-authorize
    return {
      success: false,
      error: 'TOKEN_EXPIRED',
      requiresReauth: true,
      message: 'Your GitHub token has expired. Please sign in again to enable contribution tracking.',
    };
    
    // Option 2: Use bot (only if user explicitly opts out)
    // This should be a user choice, not automatic
  }
  
  // Use user token for commit
  const octokit = new Octokit({ auth: userToken });
  // ... make commit
}
```

**Frontend Handling:**
```typescript
// In create item form
if (result.error === 'TOKEN_EXPIRED' && result.requiresReauth) {
  // Show modal: "Your GitHub token expired. Re-authorize to track contributions?"
  // If user clicks "Re-authorize" → redirect to sign-in
  // If user clicks "Skip" → use bot token (commit won't count)
}
```

---

### 4. Avoid Mixed Contributions (User + Bot)

**Problem**: Some commits by user, some by bot → Hard to count total contributions

**Solution**: **ALWAYS prioritize user token**. Only use bot if user explicitly opts out.

```typescript
async function syncToGitHub(params: GitHubSyncParams): Promise<...> {
  // Step 1: Try user token (with refresh)
  const userToken = await getValidUserToken(params.userId);
  
  if (userToken) {
    // Use user token - commits will count
    return await commitWithUserToken(userToken, params);
  }
  
  // Step 2: Token unavailable - ask user
  // Don't automatically fall back to bot
  return {
    success: false,
    error: 'TOKEN_REQUIRED',
    requiresReauth: true,
    message: 'GitHub authorization required to track your contributions. Please sign in with GitHub.',
  };
}
```

**User Experience:**
1. User creates item
2. If token expired → Show prompt: "Re-authorize to track contributions?"
3. User chooses:
   - **"Re-authorize"** → Redirect to sign-in → Token refreshed → Commit counts
   - **"Skip"** → Use bot → Commit works but doesn't count
   - **"Cancel"** → Don't create commit

---

### 5. Fix OAuth Scopes in Code

**Current Code (WRONG):**
```typescript
// lib/supabase/auth.ts - Line 58
scopes: 'read:user user:email public_repo',  // ❌ Wrong scope
```

**Corrected:**
```typescript
// lib/supabase/auth.ts
scopes: 'read:user user:email repo',  // ✅ Correct scope for private repos
```

**Scope Explanation:**
- `read:user` - Read user profile
- `user:email` - Read verified emails
- `repo` - Full repository access (create commits, PRs) - **REQUIRED for contributions**

**Note**: `public_repo` only works for public repos. `repo` works for both public and private.

---

## Complete Implementation Flow

### 1. User Signs In
```
User clicks "Sign in with GitHub"
  ↓
GitHub OAuth (OpenKPIs OAuth App - configured once)
  ↓
User authorizes (grants repo scope)
  ↓
Supabase receives token
  ↓
Store in:
  - Cookie (immediate use)
  - Supabase user_metadata (cross-device)
  - Database table (optional, more secure)
```

### 2. User Creates Item
```
User creates KPI
  ↓
Check: Is user token available and valid?
  ↓
YES → Use user token → Commit counts ✅
  ↓
NO → Check: Is token expired?
  ↓
YES → Prompt: "Re-authorize to track contributions?"
  ↓
User chooses:
  - Re-authorize → Sign in → Token refreshed → Commit counts ✅
  - Skip → Use bot → Commit works but doesn't count ⚠️
```

### 3. Token Refresh (Silent)
```
Before commit:
  ↓
Check token expiration
  ↓
Expiring soon? → Try refresh
  ↓
Refresh successful? → Use new token
  ↓
Refresh failed? → Prompt user
```

---

## Database Schema Changes

### Option 1: Store in user_metadata (Simple)
```sql
-- No schema change needed
-- Tokens stored in auth.users.user_metadata
-- Access via: user.user_metadata.github_oauth_token
```

### Option 2: Separate Table (More Secure)
```sql
CREATE TABLE github_oauth_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only access their own tokens
ALTER TABLE github_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tokens" ON github_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON github_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## Code Changes Required

### 1. Fix OAuth Scopes
**File**: `lib/supabase/auth.ts`
```typescript
scopes: 'read:user user:email repo',  // Change from 'public_repo' to 'repo'
```

### 2. Store Token in Supabase
**File**: `app/auth/callback/route.ts`
```typescript
// After extracting provider token
if (providerToken) {
  // Store in cookie
  response.cookies.set('openkpis_github_token', providerToken, {...});
  
  // ALSO store in Supabase
  await supabase.auth.updateUser({
    data: {
      github_oauth_token: providerToken,
      github_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    },
  });
}
```

### 3. Retrieve Token from Supabase
**File**: `lib/services/github.ts`
```typescript
async function getUserOAuthToken(userId: string): Promise<string | null> {
  // Try Supabase user_metadata first
  const { data: { user } } = await supabase.auth.getUser();
  const token = user?.user_metadata?.github_oauth_token;
  
  if (token) {
    // Verify token is valid
    try {
      const octokit = new Octokit({ auth: token });
      await octokit.users.getAuthenticated();
      return token;
    } catch {
      // Token invalid - try refresh
      return await refreshToken(userId);
    }
  }
  
  return null;
}
```

### 4. Implement Token Refresh
**File**: `lib/services/github.ts`
```typescript
async function refreshToken(userId: string): Promise<string | null> {
  // Check if refresh token available
  // If yes, refresh
  // If no, return null (prompt user to re-authorize)
}
```

### 5. Update GitHub Sync to Use User Token
**File**: `lib/services/github.ts`
```typescript
export async function syncToGitHub(params: GitHubSyncParams): Promise<...> {
  // Try user token first
  const userToken = await getUserOAuthToken(params.userId);
  
  if (userToken) {
    // Use user token
    const octokit = new Octokit({ auth: userToken });
    // ... commit as user
  } else {
    // Token unavailable - return error (don't auto-fallback to bot)
    return {
      success: false,
      error: 'TOKEN_REQUIRED',
      requiresReauth: true,
    };
  }
}
```

---

## Summary of Changes

### What Users Need to Do
- ✅ **One-time**: Sign in with GitHub and authorize
- ✅ **Ongoing**: Nothing - works automatically
- ✅ **If token expires**: Re-authorize when prompted (or skip if they don't want contributions)

### What We Need to Do
1. ✅ Fix OAuth scopes: `public_repo` → `repo`
2. ✅ Store token in Supabase (not just cookie)
3. ✅ Implement silent token refresh
4. ✅ Prompt user to re-authorize if token expired (don't auto-fallback to bot)
5. ✅ Prioritize user token commits (avoid mixed counting)

### GitHub OAuth Configuration
- ✅ **One OAuth App** for all users (configured in OpenKPIs GitHub account)
- ✅ **Scopes set in CODE** (not Supabase dashboard)
- ✅ Users don't need to create their own OAuth apps

