# Enterprise Standard PR Creation Approach

**Date:** 2025-01-27  
**Issue:** PRs created with App Token may not be accessible by User Token

---

## Problem Statement

When PRs are created using App Token:
- ✅ PR creation is more reliable (better permissions)
- ❌ **PRs may not be accessible by the user's token**
- ❌ User cannot interact with PRs using their own token
- ❌ Breaks enterprise standard workflow expectations

---

## Enterprise Standard Approach

### Core Principle

**Use User Token FIRST for PR creation** - ensures user can access and interact with PRs using their own token.

### Implementation Strategy

1. **Try User Token First** (with retries)
   - User token creates PR → user can access it
   - Retry with exponential backoff on head field errors
   - Maximum retries: 5 attempts (configurable)

2. **Fallback to App Token Only as Last Resort**
   - Only if user token fails after all retries
   - App token is backup, not primary
   - Logs clearly indicate fallback usage

3. **Handle Repo Owner Case**
   - If `forkOwner === baseRepoOwner`: user is repo owner
   - Can use direct commit/branch approach (no fork needed)
   - PR creation still uses user token first

---

## Code Implementation

### Token Selection Logic

```typescript
// Start with user token (enterprise standard)
let useAppToken = false;
let triedAppToken = false;

for (let attempt = 0; attempt < maxPRAttempts; attempt++) {
  try {
    // Use user token first
    const octokitToUse = useAppToken ? appOctokit! : userOctokit;
    
    // Create PR with selected token
    prResponse = await octokitToUse.pulls.create({...});
    
  } catch (prError) {
    // If head error with user token, retry with exponential backoff
    if (isHeadError && !useAppToken && attempt < maxPRAttempts - 1) {
      // Retry with user token
      continue;
    }
    
    // If user token failed after all retries, try App token
    if (!useAppToken && !triedAppToken && appOctokit) {
      useAppToken = true;
      triedAppToken = true;
      attempt = -1; // Reset counter for App token retries
      continue;
    }
  }
}
```

### Head Field Format

**Unchanged** - format is correct:
- Same owner: `branchName` (e.g., `openkpis-edited-kpis-...`)
- Different owner: `forkOwner:branchName` (e.g., `devyendarm:openkpis-edited-kpis-...`)

---

## Benefits

### ✅ User Token First

1. **User Can Access PRs**
   - PRs created with user token are accessible by user
   - User can view, comment, modify PRs using their token
   - Standard GitHub workflow expectations met

2. **Better Attribution**
   - PR shows as created by user (not bot)
   - More natural GitHub experience
   - User feels ownership of their PRs

3. **Enterprise Standard**
   - Follows GitHub best practices
   - Aligns with enterprise workflows
   - Users expect to access their own PRs

### ⚠️ App Token Fallback

1. **Reliability Backup**
   - App token has better permissions
   - Can create PRs when user token fails
   - Ensures PR creation doesn't completely fail

2. **Trade-offs**
   - PR may not be accessible by user token
   - PR shows as created by bot
   - Should be rare (only when user token truly fails)

---

## When Each Token is Used

### User Token (Primary)

**Used when:**
- ✅ User has proper permissions
- ✅ Fork branch is visible to user token
- ✅ GitHub has synced the branch
- ✅ Standard case (most PRs)

**Result:**
- ✅ PR accessible by user
- ✅ PR shows user as creator
- ✅ User can interact with PR

### App Token (Fallback)

**Used when:**
- ⚠️ User token fails after all retries
- ⚠️ Head field invalid errors persist
- ⚠️ User token doesn't have sufficient permissions
- ⚠️ Rare edge cases

**Result:**
- ⚠️ PR may not be accessible by user token
- ⚠️ PR shows bot as creator
- ⚠️ User may need to access PR via web UI

---

## Repo Owner vs. Other Users

### Repo Owner (`forkOwner === baseRepoOwner`)

**Current Approach:**
- Still uses fork + PR workflow
- Head format: `branchName` (no owner prefix)
- PR creation: User token first

**Potential Optimization:**
- Could use direct commit/branch approach (no fork)
- Would be faster and simpler
- Future enhancement opportunity

### Other Users (`forkOwner !== baseRepoOwner`)

**Current Approach:**
- Fork + PR workflow (required)
- Head format: `forkOwner:branchName`
- PR creation: User token first

**This is correct** - fork is required for non-owners.

---

## Testing Scenarios

### Scenario 1: User Token Success

1. User creates/edit item
2. Fork + branch created
3. Commit made to fork
4. **PR creation with user token succeeds**
5. ✅ User can access PR
6. ✅ PR shows user as creator

### Scenario 2: User Token Fails, App Token Success

1. User creates/edit item
2. Fork + branch created
3. Commit made to fork
4. **PR creation with user token fails (head error)**
5. Retries with user token (exponential backoff)
6. **User token fails after all retries**
7. **Fallback to App token**
8. **PR creation with App token succeeds**
9. ⚠️ PR may not be accessible by user token
10. ⚠️ PR shows bot as creator

### Scenario 3: Both Tokens Fail

1. User creates/edit item
2. Fork + branch created
3. Commit made to fork
4. **PR creation with user token fails**
5. Retries with user token
6. **User token fails after all retries**
7. **Fallback to App token**
8. **App token also fails**
9. ❌ PR creation fails
10. Error returned with manual PR instructions

---

## Monitoring and Logging

### Key Log Messages

```
[GitHub Fork PR] Attempting PR creation with User token (attempt 1/5)...
[GitHub Fork PR] User token failed (head field invalid), retrying in 2000ms...
[GitHub Fork PR] User token failed after all retries, trying App token as last resort fallback...
[GitHub Fork PR] Attempting PR creation with App token (attempt 1/5)...
[GitHub Fork PR] PR created successfully with User token: <url>
```

### Metrics to Track

1. **User token success rate** (should be high)
2. **App token fallback usage** (should be rare)
3. **PR creation failure rate** (should be very low)
4. **Head field error frequency** (indicates timing issues)

---

## Summary

### What Changed

1. ✅ **User token is now PRIMARY** (was App token first)
2. ✅ **App token is FALLBACK** (was primary)
3. ✅ **Better retry logic** (user token gets full retries before fallback)
4. ✅ **Enterprise standard** (user can access their PRs)

### What Stayed the Same

1. ✅ Head field format (unchanged, was correct)
2. ✅ Fork + PR workflow (unchanged)
3. ✅ Commit attribution (still user token)
4. ✅ Contribution tracking (unchanged)

### Expected Outcomes

1. ✅ **Most PRs created with user token** (user can access)
2. ✅ **Rare App token fallback** (only when user token truly fails)
3. ✅ **Better user experience** (PRs accessible by user)
4. ✅ **Enterprise standard compliance** (follows best practices)

---

*This approach ensures PRs are accessible by users while maintaining reliability through App token fallback.*

