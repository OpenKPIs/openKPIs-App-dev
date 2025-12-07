# Issue: Commits Still Showing Bot as Committer

## Problem Confirmed

Looking at the commit: https://github.com/OpenKPIs/OpenKPIs-Content-Dev/pull/25/commits/bd8666f42bc8f6f94490522ab0100bd50a3abfce

**Shows:** "swapnamagantius authored and **OpenKPIs Bot committed**"

This means the **bot token was used**, not the user token.

---

## Why This Happens

### GitHub Counts by COMMITTER, Not Author

**What matters for contributions:**
- ✅ **Committer** = Who actually made the commit (counts)
- ⚠️ **Author** = Who wrote the code (doesn't count alone)

**Your commit:**
- Author: `swapnamagantius` ✅
- Committer: `OpenKPIs Bot` ❌
- **Result:** Doesn't count toward contributions

---

## Code Analysis

### When User Token is Used:
```typescript
// commitWithUserToken() - Lines 298-305
author: {
  name: params.userName,  // swapnamagantius
  email: params.userEmail,
},
committer: {
  name: params.userName,  // swapnamagantius (SAME as author)
  email: params.userEmail,
}
```
**Result:** "swapnamagantius authored and swapnamagantius committed" ✅

### When Bot Token is Used:
```typescript
// commitWithBotToken() - Lines 418-425
author: {
  name: params.userName,  // swapnamagantius
  email: params.userEmail,
},
committer: {
  name: 'OpenKPIs Bot',   // BOT (different from author)
  email: 'bot@openkpis.org',
}
```
**Result:** "swapnamagantius authored and OpenKPIs Bot committed" ❌

---

## Why User Token Wasn't Used

The commit shows bot was used, which means one of these happened:

### 1. Token Not Found
- Cookie missing
- user_metadata missing token
- `getUserOAuthTokenWithRefresh()` returned `null`

### 2. Token Invalid/Expired
- Token expired (8 hours)
- Token doesn't have `repo` scope
- Token verification failed

### 3. Error During User Token Commit
- 404 error (repository access denied)
- Other error → Falls back to bot

### 4. Code Path Issue
- `requiresReauth` was `true` but code fell through to bot
- Exception caught → Falls back to bot

---

## How to Diagnose

### Check Server Logs (Vercel)

**Look for these messages when you created the KPI:**

**If user token was used (should see):**
```
[GitHub Token] Found token in cookie
[GitHub Token] Token is valid
[GitHub Sync] Verified access to repository
```

**If bot token was used (you'll see):**
```
[GitHub Sync] All user token attempts failed, using bot as last resort
[GitHub Sync] Used bot token as last resort - commit will NOT count toward user contributions
```

**If token not found:**
```
[GitHub Token] GitHub token not found. Please sign in with GitHub.
```

**If token expired:**
```
[GitHub Token] Token expired, attempting silent refresh...
[GitHub Token] Silent refresh failed
```

**If repository access denied:**
```
[GitHub Sync] Repository access denied (404) - user token may not have repo scope
```

---

## The Real Issue

**Even though:**
- ✅ Token is stored in cookie
- ✅ Token is stored in user_metadata
- ✅ Code tries to use user token first

**The commit still shows bot as committer**, which means:
- ❌ User token wasn't retrieved successfully, OR
- ❌ User token commit failed and fell back to bot

---

## Next Steps

1. **Check Vercel logs** for the exact error message
2. **Verify token is accessible** when creating KPI
3. **Check if token has `repo` scope** (might need to sign in again)
4. **Verify repository access** (user might not be a collaborator)

---

## Summary

**Question:** Does the new implementation create user contributions?

**Answer:** **NO** - The commit still shows bot as committer, which means the user token isn't being used successfully.

**Action:** Check server logs to see why the user token wasn't used.

