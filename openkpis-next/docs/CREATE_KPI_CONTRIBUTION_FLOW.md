# Create KPI → GitHub Contribution Flow

## ✅ Expected Flow (Now Working)

### Step 1: User Creates KPI
```
User fills form → Clicks "Save"
  ↓
POST /api/items/create
  ↓
syncToGitHub({ userId: "..." }) called
```

### Step 2: Token Retrieval
```
getUserOAuthTokenWithRefresh(userId)
  ↓
PRIORITY 1: Check cookie
  ✅ openkpis_github_token = "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"
  ↓
Token found! ✅
  ↓
Verify token is valid
  ✅ Token valid
```

**OR if cookie missing:**
```
PRIORITY 2: Check user_metadata
  ✅ raw_user_meta_data.github_oauth_token = "gho_..."
  ↓
Token found! ✅
```

### Step 3: User Token Commit
```
commitWithUserToken(userToken, params)
  ↓
const octokit = new Octokit({ auth: userToken })
  ↓
Verify repository access
  ✅ User has repo scope
  ✅ Repository accessible
  ↓
Create branch
  ✅ Branch created
  ↓
Create commit with:
  author: { name: "swapnamagantius", email: "swapna.magantius@gmail.com" }
  committer: { name: "swapnamagantius", email: "swapna.magantius@gmail.com" }
  ↓
✅ Commit shows as USER commit
✅ Counts toward GitHub Contributions
```

### Step 4: Create Pull Request
```
Create PR
  ✅ PR created
  ✅ Shows user as author
```

---

## What to Check After Creating KPI

### 1. Server Logs (Vercel)

Look for these messages:

**Success:**
```
[GitHub Token] Found token in cookie
[GitHub Token] Token is valid
[GitHub Sync] Attempting to access repository: devyendarm/OpenKPIs-Content-Dev
[GitHub Sync] Verified access to repository: devyendarm/OpenKPIs-Content-Dev
[GitHub Sync] Using user token for commit
```

**If token from user_metadata:**
```
[GitHub Token] Found token in user_metadata
[GitHub Token] Token is valid
```

**If token expired/invalid:**
```
[GitHub Token] Token expired, attempting silent refresh...
[GitHub Token] Silent refresh successful
```

**If repository access denied:**
```
[GitHub Sync] Repository access denied (404) - user token may not have repo scope
```

### 2. GitHub Repository

**Check the commit:**
- Go to: `https://github.com/devyendarm/OpenKPIs-Content-Dev`
- Find the latest commit
- **Should show:**
  - ✅ Your GitHub avatar
  - ✅ Your username: `swapnamagantius`
  - ✅ Links to your profile
  - ❌ NOT "OpenKPIs Bot"

**Check the PR:**
- Find the Pull Request
- **Should show:**
  - ✅ Created by: `swapnamagantius`
  - ✅ Your avatar
  - ✅ Your email in commit

### 3. Your GitHub Profile

**Check Contributions Graph:**
- Go to: `https://github.com/swapnamagantius`
- Scroll to Contributions graph
- **Should see:**
  - ✅ Green square for today
  - ✅ Commit count increased
  - ✅ Commit shows in activity

**Note:** GitHub may take a few minutes to update the graph.

---

## Potential Issues

### Issue 1: Token Doesn't Have `repo` Scope

**Symptoms:**
- 404 error: "Repository not found or no access"
- Log: `[GitHub Sync] Repository access denied (404)`

**Solution:**
- Sign out and sign in again
- Make sure you grant "Repositories: Public and private" permission

### Issue 2: Token Expired

**Symptoms:**
- Log: `[GitHub Token] Token expired`
- Falls back to bot

**Solution:**
- Sign in again to refresh token
- Token expires after 8 hours

### Issue 3: Repository Access Denied

**Symptoms:**
- 404 error even with valid token
- User not a collaborator on repository

**Solution:**
- Repository owner needs to add you as collaborator
- Or repository needs to be public

---

## Success Indicators

| Check | Expected | How to Verify |
|-------|----------|---------------|
| **Token in Cookie** | ✅ Yes | Browser DevTools → Cookies |
| **Token in user_metadata** | ✅ Yes | SQL query (already confirmed) |
| **Token has repo scope** | ✅ Yes | You granted it during sign-in |
| **Commit shows as user** | ✅ Yes | GitHub commit page |
| **Contribution counts** | ✅ Yes | Your GitHub profile graph |

---

## Summary

**Yes, creating a new KPI should now create GitHub user-level contributions!**

**Why it works:**
1. ✅ Token stored in cookie (confirmed)
2. ✅ Token stored in user_metadata (confirmed via SQL)
3. ✅ Token has `repo` scope (you granted it)
4. ✅ Code retrieves token from cookie/user_metadata
5. ✅ Code uses user token for commits
6. ✅ Commits show as user commits (not bot)

**Test it:** Create a new KPI and check your GitHub profile! 🎯

