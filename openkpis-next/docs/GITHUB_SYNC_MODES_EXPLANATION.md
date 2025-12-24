# GitHub Sync Modes - Current Implementation

**Date:** 2025-01-27  
**Question:** Does GitHub sync still use both fork and bot approaches, or only fork?

---

## Answer: **Both Approaches Are Available**

The system supports **two modes**, and users can select which one to use:

1. **`fork_pr`** - Fork + PR approach (default)
2. **`internal_app`** - Bot/App approach (fallback)

---

## Mode Selection

### Default Behavior

- **Default:** `fork_pr` (Fork + PR approach)
- **User Preference:** Stored in `user_profiles.enable_github_fork_contributions`
  - `true` or `null` → `fork_pr` mode
  - `false` → `internal_app` mode

### How Mode is Determined

```typescript
// 1. Explicit mode from frontend (checkbox selection)
if (params.mode) {
  mode = params.mode; // Use explicit mode
}

// 2. User preference from database
if (!params.mode && params.userId) {
  mode = await getUserContributionMode(userId);
  // Returns 'fork_pr' if enable_github_fork_contributions is true or null
  // Returns 'internal_app' if enable_github_fork_contributions is false
}

// 3. Fallback default
mode = mode || 'fork_pr'; // Default to fork_pr
```

---

## Mode 1: Fork + PR (`fork_pr`)

### What It Does

1. **Creates/ensures fork** exists in user's account
2. **Creates branch** in fork
3. **Commits file** to fork (using user token)
4. **Creates PR** from fork to org repo (using user token first, App token as fallback)

### Token Usage

- **Fork operations:** User token
- **Commits:** User token (with user email attribution)
- **PR creation:** User token first, App token as fallback

### Benefits

- ✅ **Real GitHub contributions** (commits count toward user's profile)
- ✅ **User can access PRs** (created with user token)
- ✅ **Standard GitHub workflow** (fork → PR)

### Fallback

If `fork_pr` fails, it **automatically falls back to `internal_app`** mode to ensure the item is still synced to GitHub.

---

## Mode 2: Internal App (`internal_app`)

### What It Does

1. **Creates branch** in org repo (using GitHub App)
2. **Commits file** to branch (using GitHub App with user attribution)
3. **Creates PR** from branch to main (using GitHub App)

### Token Usage

- **All operations:** GitHub App token
- **Commits:** App token with user email attribution (may or may not count toward contributions)

### Benefits

- ✅ **Faster** (no fork needed)
- ✅ **More reliable** (App has org permissions)
- ✅ **Works without user token** (if user token unavailable)

### Trade-offs

- ⚠️ **May not count toward contributions** (depends on GitHub's algorithm)
- ⚠️ **PR shows bot as creator** (not user)

---

## Current Implementation Flow

### Create Flow

```typescript
// 1. Check user preference or explicit mode
let mode = params.mode || await getUserContributionMode(userId) || 'fork_pr';

// 2. Execute based on mode
if (mode === 'fork_pr') {
  // Try fork+PR approach
  try {
    result = await syncViaForkAndPR(userToken, params);
  } catch (error) {
    // Fallback to bot mode if fork+PR fails
    result = await commitWithUserToken(userToken, params);
    result.mode = 'internal_app';
  }
} else if (mode === 'internal_app') {
  // Use bot/app approach directly
  result = await commitWithUserToken(userToken, params);
  result.mode = 'internal_app';
}
```

### Edit Flow

```typescript
// Edit flow doesn't pass explicit mode, uses user preference
const mode = await getUserContributionMode(userId); // Reads from DB
// Defaults to 'fork_pr' if not set
```

---

## User Selection

### Frontend Checkbox

Users can select their preferred mode via a checkbox:
- **Checked:** `fork_pr` mode (Fork + Create)
- **Unchecked:** `internal_app` mode (Quick Create)

### Preference Storage

The selection is saved to `user_profiles.enable_github_fork_contributions`:
- `true` → `fork_pr` mode
- `false` → `internal_app` mode
- `null` → `fork_pr` mode (default)

---

## Summary

### Both Modes Available

| Mode | Approach | Token | Contributions | Default |
|------|----------|-------|---------------|---------|
| `fork_pr` | Fork + PR | User token | ✅ Yes | ✅ Yes |
| `internal_app` | Bot/App | App token | ⚠️ Maybe | ❌ No |

### Selection Logic

1. **Explicit mode** (from checkbox) → Use it
2. **User preference** (from DB) → Use it
3. **Default** → `fork_pr`

### Fallback Behavior

- If `fork_pr` fails → **Automatically falls back to `internal_app`**
- Ensures item is always synced to GitHub (even if fork+PR fails)

---

## Key Points

1. ✅ **Both approaches are still available**
2. ✅ **Default is `fork_pr`** (Fork + PR)
3. ✅ **Users can select via preference** (checkbox)
4. ✅ **Automatic fallback** from `fork_pr` to `internal_app` if fork+PR fails
5. ✅ **Edit flow uses user preference** (reads from DB)

---

*The system maintains both approaches for flexibility, with fork+PR as the default for better contribution tracking.*

