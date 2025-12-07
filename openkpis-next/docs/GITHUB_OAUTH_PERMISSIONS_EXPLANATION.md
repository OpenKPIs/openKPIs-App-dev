# GitHub OAuth Permissions Explanation

## Permissions You're Seeing

When you sign in with GitHub, you see:

```
OpenKPIs DEV by OpenKPIs

would like additional permissions to

Repositories
  Public and private

Existing access
  Access public repositories

Read all user profile data

Access user email addresses (read-only)
```

## What Each Permission Means

### ✅ "Repositories: Public and private"
**Scope:** `repo`  
**What it does:**
- Full read/write access to all repositories (public and private)
- Can create commits, branches, and pull requests
- **REQUIRED for user-attributed commits** (contributions)

**Why we need it:**
- To create branches in `OpenKPIs-Content-Dev`
- To commit files as the user (not bot)
- To create pull requests
- To make commits count toward GitHub Contributions

---

### ✅ "Read all user profile data"
**Scope:** `read:user`  
**What it does:**
- Read your GitHub username
- Read your profile information
- Read your avatar URL

**Why we need it:**
- Display your GitHub username in the app
- Show your avatar
- Identify you in the system

---

### ✅ "Access user email addresses (read-only)"
**Scope:** `user:email`  
**What it does:**
- Read your verified email addresses
- Get your primary email

**Why we need it:**
- Use your verified email for commits (so they count toward contributions)
- Display your email in your profile
- Send notifications (if needed)

---

### ℹ️ "Existing access: Access public repositories"
**What this means:**
- You previously authorized the app with only `public_repo` scope
- Now we're requesting `repo` scope (broader permissions)
- GitHub is showing you what you had before vs. what you're being asked for now

**Action needed:**
- Click "Authorize" to grant the new `repo` scope
- This replaces the old `public_repo` scope

---

## Code That Requests These Permissions

**File:** `lib/supabase/auth.ts` (Line 58)

```typescript
await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    scopes: 'read:user user:email repo',  // ← These scopes
  },
});
```

**Mapping:**
- `read:user` → "Read all user profile data"
- `user:email` → "Access user email addresses (read-only)"
- `repo` → "Repositories: Public and private"

---

## Is This Correct?

**✅ YES - These permissions are correct!**

All three permissions are necessary:
1. **`repo`** - Required for creating commits that count toward contributions
2. **`read:user`** - Required for basic user info
3. **`user:email`** - Required for verified email (commit attribution)

---

## What Happens If You Don't Grant `repo` Scope?

If you only grant `read:user` and `user:email` (but not `repo`):
- ❌ Cannot create branches
- ❌ Cannot commit files
- ❌ Cannot create pull requests
- ❌ Commits will fail with 404 error
- ❌ Falls back to bot token (commits don't count)

**You MUST grant `repo` scope for contributions to work!**

---

## Security Note

**These permissions are safe:**
- ✅ Read-only access to profile and email
- ✅ Write access only to repositories you explicitly grant access to
- ✅ You can revoke access anytime at: `https://github.com/settings/applications`

**What we do with these permissions:**
- Create commits in `OpenKPIs-Content-Dev` repository only
- Use your verified email for commit attribution
- Display your GitHub username in the app

**What we DON'T do:**
- ❌ Access your private repositories (unless you grant access)
- ❌ Modify your profile
- ❌ Send emails on your behalf
- ❌ Access any data outside the OpenKPIs repositories

---

## Summary

| Permission | Scope | Required? | Why |
|------------|-------|-----------|-----|
| Repositories: Public and private | `repo` | ✅ **YES** | User-attributed commits |
| Read all user profile data | `read:user` | ✅ Yes | Display username/avatar |
| Access user email addresses | `user:email` | ✅ Yes | Verified email for commits |

**All permissions are correct and necessary!** ✅

