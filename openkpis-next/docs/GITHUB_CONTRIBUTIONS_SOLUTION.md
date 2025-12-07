# GitHub Contributions Solution - Making Commits Count

## Problem

Commits made via GitHub App (bot) **do NOT count** toward user's GitHub Contributions graph, even if:
- Author email matches user's verified GitHub email
- Author name matches user's GitHub username

**Why**: GitHub only counts commits made **directly by the user**, not by bots or apps.

## Current Implementation Limitation

```typescript
// Current: Uses GitHub App (bot) to make commits
const octokit = new Octokit({
  authStrategy: createAppAuth,  // Bot authentication
  auth: {
    appId: Number(appId),
    privateKey,
    installationId,
  },
});

// Result: Commits show as "OpenKPIs Bot" → Don't count toward contributions
```

## Solution: Use User's OAuth Token

To make commits count toward GitHub Contributions, we need to:

1. **Use user's OAuth token** (from Supabase provider token) to authenticate
2. **Make commits as the user** (not as the bot)
3. **Fallback to bot** if user token unavailable

## Implementation Options

### Option 1: User OAuth Token (Recommended)

**Pros:**
- ✅ Commits count toward user contributions
- ✅ User attribution is accurate
- ✅ No additional user setup required

**Cons:**
- ⚠️ Requires user to be signed in
- ⚠️ Token may expire (need refresh mechanism)
- ⚠️ User must grant `repo` scope

**Implementation:**
```typescript
// Use user's OAuth token if available
const userToken = await getUserOAuthToken(); // From Supabase session

if (userToken) {
  // Make commit as user
  const userOctokit = new Octokit({
    auth: userToken,
  });
  
  // Create commit as user
  await userOctokit.repos.createOrUpdateFileContents({
    // ... commit as user
  });
} else {
  // Fallback to bot
  const botOctokit = new Octokit({
    authStrategy: createAppAuth,
    // ... bot auth
  });
}
```

### Option 2: Personal Access Token (PAT)

**Pros:**
- ✅ Commits count toward contributions
- ✅ More control over permissions
- ✅ Can be long-lived

**Cons:**
- ❌ Requires users to provide PAT manually
- ❌ Security risk (storing user tokens)
- ❌ Poor UX (users must generate and provide token)

**Not Recommended** - Too complex for users.

### Option 3: Hybrid Approach (Best)

**Strategy:**
1. Try user's OAuth token first
2. If unavailable or fails, use bot as fallback
3. Log which method was used

**Benefits:**
- ✅ Commits count when user token available
- ✅ Still works if user token unavailable
- ✅ Graceful degradation

## Required Changes

### 1. Extract User OAuth Token

The token is already stored in cookie (`openkpis_github_token`), but we need to use it for commits:

```typescript
// Get user's OAuth token
const userToken = cookieStore.get('openkpis_github_token')?.value;

if (userToken) {
  // Verify token has repo scope
  const tokenOctokit = new Octokit({ auth: userToken });
  const { data: user } = await tokenOctokit.users.getAuthenticated();
  
  // Check if token has repo permissions
  // If yes, use it for commits
}
```

### 2. Modify GitHub Sync Service

```typescript
export async function syncToGitHub(params: GitHubSyncParams): Promise<...> {
  let octokit: Octokit;
  let usingUserToken = false;
  
  // Try user's OAuth token first
  const userToken = await getUserOAuthToken();
  if (userToken) {
    try {
      octokit = new Octokit({ auth: userToken });
      // Verify token works and has repo scope
      await octokit.users.getAuthenticated();
      usingUserToken = true;
    } catch {
      // Token invalid, fallback to bot
      console.warn('User token invalid, using bot');
    }
  }
  
  // Fallback to bot if no user token
  if (!usingUserToken) {
    octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: Number(appId),
        privateKey,
        installationId,
      },
    });
  }
  
  // Make commit (as user or bot)
  const commitData = await octokit.repos.createOrUpdateFileContents({
    // ... commit details
    author: {
      name: params.userName,
      email: params.userEmail || `${params.userLogin}@users.noreply.github.com`,
    },
    committer: usingUserToken ? {
      name: params.userName,
      email: params.userEmail || `${params.userLogin}@users.noreply.github.com`,
    } : {
      name: 'OpenKPIs Bot',
      email: 'bot@openkpis.org',
    },
  });
}
```

### 3. Verify OAuth Token Scopes

The user's OAuth token must have `repo` scope to create commits. Check Supabase GitHub OAuth configuration:

**Required Scopes:**
- `user:email` - To read verified emails
- `repo` - To create commits and PRs

**In Supabase:**
1. Go to Authentication → Providers → GitHub
2. Ensure scopes include: `user:email repo`
3. Users may need to re-authenticate to grant new scopes

## Testing

### Verify Commits Count

1. Create a new item via the app
2. Check the commit in GitHub:
   - Should show user's name/avatar (not bot)
   - Should link to user's profile
3. Check user's GitHub profile:
   - Contribution should appear in graph
   - Should show green square for that day

### Verify Fallback

1. Sign out or clear cookies
2. Create item (should use bot)
3. Commit should still work but won't count toward contributions

## Migration Notes

### Existing Commits

- ❌ **Cannot retroactively fix** - Past commits made by bot won't count
- ✅ **Future commits** - Will count if using user token

### User Experience

- Users don't need to do anything
- If token available → commits count
- If token unavailable → commits still work (via bot)

## Security Considerations

### Token Storage

- ✅ Already stored in HTTP-only cookie (secure)
- ✅ Token expires with session
- ✅ Not exposed to client-side code

### Token Permissions

- ⚠️ Token has `repo` scope (can modify repository)
- ✅ Only used for user's own contributions
- ✅ Bot fallback prevents abuse

### Rate Limiting

- User tokens have lower rate limits than bot tokens
- Monitor for rate limit issues
- Fallback to bot if rate limited

## Implementation Priority

**HIGH** - This is the core requirement for GitHub Contributions to work.

**Estimated Effort**: 4-6 hours

**Steps:**
1. Extract user OAuth token in GitHub sync service
2. Try user token first, fallback to bot
3. Update commit author/committer based on token used
4. Add logging to track which method is used
5. Test with real user accounts
6. Verify contributions appear in GitHub profile

