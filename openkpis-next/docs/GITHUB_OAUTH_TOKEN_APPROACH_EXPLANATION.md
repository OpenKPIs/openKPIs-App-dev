# GitHub OAuth Token Approach - How It Works

## Overview

Instead of using the GitHub App (bot) to make commits, we'll use the **user's OAuth token** that's already stored when they sign in via GitHub. This makes commits count toward their GitHub Contributions graph.

## Current Flow (What Happens Now)

### 1. User Signs In
```
User clicks "Sign in with GitHub"
  ↓
Supabase redirects to GitHub OAuth
  ↓
User authorizes the app
  ↓
GitHub redirects back with OAuth code
  ↓
Supabase exchanges code for session + provider token
  ↓
Provider token stored in cookie: openkpis_github_token
```

### 2. What Token Do We Get?

When user signs in via GitHub OAuth, Supabase receives:
- **Access Token** (OAuth token) - Can be used to make API calls as the user
- **Refresh Token** - Used to get new access tokens when they expire
- **Provider Token** - The GitHub OAuth token (stored in cookie)

**Current Status**: We're already storing this token in the cookie, but **not using it for commits**.

## Proposed Flow (What Will Happen)

### 1. User Signs In (Same as Now)
- ✅ User clicks "Sign in with GitHub"
- ✅ Grants permissions (one-time, if not already granted)
- ✅ Token stored in cookie
- ✅ **No change for user**

### 2. When User Creates/Edits Item

```
User creates KPI in app
  ↓
App checks: Is user OAuth token available?
  ↓
YES → Use user's token to make commit (counts toward contributions)
  ↓
NO → Fallback to bot token (doesn't count, but still works)
```

### 3. Commit Creation

**With User Token:**
```typescript
// Use user's OAuth token
const userOctokit = new Octokit({ 
  auth: userOAuthToken  // From cookie
});

// Commit shows as made by USER
await userOctokit.repos.createOrUpdateFileContents({
  author: { name: 'swapnamagantius', email: 'user@example.com' },
  committer: { name: 'swapnamagantius', email: 'user@example.com' },
  // ✅ Counts toward GitHub Contributions!
});
```

**With Bot Token (Fallback):**
```typescript
// Use bot token if user token unavailable
const botOctokit = new Octokit({
  authStrategy: createAppAuth,
  // ... bot auth
});

// Commit shows as made by BOT
await botOctokit.repos.createOrUpdateFileContents({
  author: { name: 'swapnamagantius', email: 'user@example.com' },
  committer: { name: 'OpenKPIs Bot', email: 'bot@openkpis.org' },
  // ❌ Doesn't count toward GitHub Contributions
});
```

## User Experience

### First Time User Signs In

1. **User clicks "Sign in with GitHub"**
2. **GitHub shows permission screen:**
   ```
   OpenKPIs wants to:
   - Read your email addresses
   - Read and write repository contents
   - Create pull requests
   ```
3. **User clicks "Authorize"** (one-time)
4. **Done!** Token stored, ready to use

### Subsequent Sign-Ins

1. **User clicks "Sign in with GitHub"**
2. **GitHub may show:**
   - Quick approval (if permissions unchanged)
   - Or just redirects (if already authorized)
3. **No action needed** - Token refreshed automatically

### When Creating Items

- **User creates KPI** → Commit made with their token → **Counts toward contributions**
- **No extra steps** - Works automatically
- **If token expired** → Falls back to bot (commit still works, just doesn't count)

## Token Management

### Token Storage

**Where**: HTTP-only cookie (`openkpis_github_token`)
- ✅ Secure (not accessible to JavaScript)
- ✅ Auto-sent with requests
- ✅ Expires with session (typically 7 days)

### Token Expiration

**GitHub OAuth tokens typically:**
- Last **8 hours** (access token)
- Can be refreshed using refresh token
- Supabase handles refresh automatically

**What Happens When Token Expires:**
1. User creates item
2. App tries to use user token
3. Token expired → Falls back to bot token
4. Commit still works, but doesn't count toward contributions
5. Next time user signs in → Token refreshed

### Token Refresh

**Automatic (Handled by Supabase):**
- Supabase refreshes tokens automatically
- When user signs in again, new token stored
- **User doesn't need to do anything**

**Manual Refresh (If Needed):**
- User signs out and signs back in
- New token obtained
- **No GitHub settings changes needed**

## Required GitHub OAuth Scopes

### Current Scopes (Check Supabase)

**Minimum Required:**
- `user:email` - To read verified emails (already have)
- `repo` - To create commits and PRs (**may need to add**)

### How to Check/Update Scopes

**In Supabase Dashboard:**
1. Go to: Authentication → Providers → GitHub
2. Check "Scopes" field
3. Should include: `user:email repo`
4. If `repo` missing → Add it
5. Users may need to re-authorize (one-time)

**What Happens If `repo` Scope Missing:**
- Commits will fail with 403 Forbidden
- Falls back to bot token
- Commits work but don't count

## User Actions Required

### One-Time Setup

**Option 1: If user already signed in**
- ✅ No action needed if `repo` scope already granted
- ⚠️ May need to re-authorize if scope was added later

**Option 2: If user signs in after scope added**
- ✅ Just sign in normally
- ✅ Grant permissions when prompted
- ✅ Done!

### Ongoing Usage

**User creates items:**
- ✅ Just create items normally
- ✅ Commits automatically use their token
- ✅ No GitHub settings changes needed
- ✅ No re-authorization needed (until token expires)

**If token expires:**
- ✅ Sign out and sign back in
- ✅ Token refreshed automatically
- ✅ No GitHub settings changes needed

## Security Considerations

### Token Permissions

**What the token can do:**
- ✅ Create commits in `OpenKPIs-Content-Dev` repository
- ✅ Create pull requests
- ❌ Cannot access other repositories
- ❌ Cannot modify repository settings
- ❌ Cannot delete repository

**Scope is limited to:**
- The repository where the GitHub App is installed
- User's own contributions only

### Token Storage

**Security measures:**
- ✅ HTTP-only cookie (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite: lax (CSRF protection)
- ✅ Expires with session
- ✅ Not accessible to client-side JavaScript

### Token Usage

**When token is used:**
- Only for user's own contributions
- Only for creating commits/PRs
- Never exposed to client-side code
- Never logged or stored in database

## Comparison: User Token vs Bot Token

| Aspect | User Token | Bot Token |
|--------|-----------|-----------|
| **GitHub Contributions** | ✅ Counts | ❌ Doesn't count |
| **Commit Attribution** | ✅ Shows user | ❌ Shows bot |
| **User Setup** | One-time OAuth | None |
| **Token Expiration** | ~8 hours | Long-lived |
| **Fallback** | Falls back to bot | Always available |
| **Security** | User-scoped | App-scoped |

## Implementation Strategy

### Hybrid Approach (Recommended)

```typescript
async function syncToGitHub(params) {
  let octokit: Octokit;
  let usingUserToken = false;
  
  // Step 1: Try user's OAuth token
  const userToken = await getUserOAuthToken(); // From cookie
  
  if (userToken) {
    try {
      // Verify token works
      octokit = new Octokit({ auth: userToken });
      await octokit.users.getAuthenticated();
      usingUserToken = true;
      console.log('Using user token for commit');
    } catch (error) {
      // Token invalid/expired
      console.warn('User token invalid, falling back to bot');
    }
  }
  
  // Step 2: Fallback to bot if no user token
  if (!usingUserToken) {
    octokit = new Octokit({
      authStrategy: createAppAuth,
      // ... bot auth
    });
    console.log('Using bot token for commit');
  }
  
  // Step 3: Make commit
  const commitData = await octokit.repos.createOrUpdateFileContents({
    // ... commit details
    author: {
      name: params.userName,
      email: params.userEmail,
    },
    committer: usingUserToken ? {
      name: params.userName,  // User commits as themselves
      email: params.userEmail,
    } : {
      name: 'OpenKPIs Bot',   // Bot commits
      email: 'bot@openkpis.org',
    },
  });
}
```

## User Experience Summary

### What Users Need to Do

**One-Time:**
1. Sign in with GitHub
2. Grant permissions (if prompted)
3. Done!

**Ongoing:**
- ✅ Nothing! Just use the app normally
- ✅ Commits automatically count toward contributions
- ✅ No GitHub settings changes needed
- ✅ No re-authorization needed (until token expires)

**If Token Expires:**
- Sign out and sign back in (takes 10 seconds)
- Token refreshed automatically
- No GitHub settings changes needed

### What Happens Automatically

- ✅ Token stored when user signs in
- ✅ Token used for commits (if available)
- ✅ Falls back to bot if token unavailable
- ✅ Token refreshed on next sign-in
- ✅ Commits count toward contributions (when using user token)

## FAQ

### Q: Do users need to change GitHub settings?
**A: No.** Once they authorize the app during sign-in, everything is automatic.

### Q: Do users need to re-authorize every time?
**A: No.** The token persists until it expires (~8 hours). Supabase handles refresh automatically.

### Q: What if the token expires?
**A:** Commits fall back to bot token. User just needs to sign in again to refresh token.

### Q: What if user revokes access in GitHub?
**A:** Token becomes invalid. Commits fall back to bot. User needs to re-authorize.

### Q: Does this work for all users?
**A:** Yes, as long as they sign in with GitHub and grant `repo` scope.

### Q: What if user doesn't grant `repo` scope?
**A:** Commits fall back to bot token. Commits still work, just don't count toward contributions.

## Next Steps

1. **Verify Supabase OAuth scopes** include `repo`
2. **Implement hybrid approach** (user token first, bot fallback)
3. **Test with real user accounts**
4. **Verify commits appear in GitHub Contributions**
5. **Monitor token expiration and refresh**

## Conclusion

**User Experience:**
- ✅ **One-time**: Sign in and authorize
- ✅ **Ongoing**: Nothing - works automatically
- ✅ **No GitHub settings changes** needed
- ✅ **No re-authorization** needed (until token expires)

**Technical:**
- ✅ Uses existing OAuth token (already stored)
- ✅ Graceful fallback to bot if token unavailable
- ✅ Secure token storage (HTTP-only cookie)
- ✅ Automatic token refresh via Supabase

**Result:**
- ✅ Commits count toward GitHub Contributions
- ✅ User attribution is accurate
- ✅ No user friction

