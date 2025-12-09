# Bug Fix: Fork Preference Not Saved on Create

## Problem

When a user clicks "Fork & Create (Preferred)" to create an item:
1. ✅ The item is created successfully using `fork_pr` mode
2. ✅ A fork is created, commit is made, and PR is opened
3. ❌ **BUT** the user's `enable_github_fork_contributions` preference is **NOT saved** to the database

### Impact

When the user later edits the item and clicks "Save All":
- The edit flow calls `getUserContributionMode(userId)` to determine the mode
- It checks `user_profiles.enable_github_fork_contributions`
- Since the preference was never saved, it's `false` or `null`
- **Result**: Edit flow defaults to `internal_app` mode (GitHub App bot commits)
- **User sees**: Bot commits instead of their own commits in PRs

### Evidence

From the GitHub repo PRs:
- PR #29: "Add kpi: Payment Error Rate" by `devyendar-maganti` ✅ (Fork+Create - user commit)
- PR #30: "Update kpi: Payment Error Rate" by `openkpis-dev-v2 bot` ❌ (Edit - bot commit)

## Root Cause

In `app/api/items/create/route.ts`:
- When `githubContributionMode === 'fork_pr'` is passed from the frontend
- The code uses `fork_pr` mode for the create operation
- **BUT** it never saves `enable_github_fork_contributions = true` to `user_profiles` table
- The preference is only saved via the `/api/user/settings/github-contributions` endpoint
- But the frontend doesn't call this endpoint when user clicks "Fork & Create"

## Solution

### Fix Applied

**File**: `app/api/items/create/route.ts`

**Change**: After a successful `fork_pr` create, automatically save the preference:

```typescript
// CRITICAL FIX: If user successfully created with fork_pr mode, save their preference
// This ensures future edits will also use fork_pr mode
if (contributionMode === 'fork_pr' && userId && syncResult.success) {
  try {
    const profileTable = withTablePrefix('user_profiles');
    const { error: prefError } = await admin
      .from(profileTable)
      .update({
        enable_github_fork_contributions: true,
      })
      .eq('id', userId);
    
    if (prefError) {
      console.warn('[Items Create] Failed to save fork preference (non-critical):', prefError);
      // Don't fail the request - preference save is non-critical
    } else {
      console.log('[Items Create] Saved fork+PR preference for user:', userId);
    }
  } catch (prefErr) {
    console.warn('[Items Create] Exception saving fork preference (non-critical):', prefErr);
    // Don't fail the request - preference save is non-critical
  }
}
```

### Why This Works

1. **Automatic Preference Saving**: When user successfully creates with `fork_pr`, preference is saved
2. **Edit Flow Compatibility**: Edit flow reads from `user_profiles.enable_github_fork_contributions`
3. **Non-Breaking**: If preference save fails, it's logged but doesn't break the create flow
4. **Backward Compatible**: Existing users who used Fork+Create before this fix can manually enable preference

## Verification

### SQL Query to Check Preference

Run this in Supabase SQL Editor (replace `{prefix}` with your table prefix):

```sql
-- Check all users and their fork preference
SELECT 
  id,
  email,
  user_name,
  enable_github_fork_contributions,
  created_at,
  updated_at
FROM {prefix}_user_profiles
ORDER BY updated_at DESC;
```

**File**: `scripts/verify_github_fork_preference.sql`

### Expected Behavior After Fix

1. **Create Flow (Fork + Create)**:
   - User clicks "Fork & Create (Preferred)"
   - Item created with `fork_pr` mode ✅
   - Preference `enable_github_fork_contributions = true` saved ✅
   - PR created by user (not bot) ✅

2. **Edit Flow (Save All)**:
   - User edits item and clicks "Save All"
   - `getUserContributionMode(userId)` reads preference from DB
   - Finds `enable_github_fork_contributions = true` ✅
   - Uses `fork_pr` mode ✅
   - PR created by user (not bot) ✅

## Additional Considerations

### Feature Flag Check

The `getUserContributionMode` function checks `GITHUB_FORK_MODE_ENABLED` first:

```typescript
const forkModeEnabled = process.env.GITHUB_FORK_MODE_ENABLED === 'true';
if (!forkModeEnabled) {
  return 'internal_app'; // Always returns internal_app if feature flag is off
}
```

**Impact**: 
- If `GITHUB_FORK_MODE_ENABLED=false`, `getUserContributionMode` always returns `internal_app`
- This means edit flow will use `internal_app` even if user has `enable_github_fork_contributions = true`
- **However**: If user explicitly clicks "Fork & Create" (explicit `fork_pr` mode), it bypasses the feature flag check

**Solution**: 
1. **For production**: Ensure `GITHUB_FORK_MODE_ENABLED=true` in environment variables
2. **For testing/development**: Feature flag acts as a global kill switch - when off, only explicit `fork_pr` requests work

**Fix Applied**: Added better error handling and logging when feature flag is off but fork_pr mode is requested.

### Manual Fix for Existing Users

If users already created items with Fork+Create before this fix, they can:

1. **Option 1**: Create a new item with Fork+Create (will auto-save preference)
2. **Option 2**: Manually update in Supabase:
   ```sql
   UPDATE {prefix}_user_profiles
   SET enable_github_fork_contributions = true
   WHERE id = 'user-id-here';
   ```
3. **Option 3**: Use the settings API:
   ```bash
   POST /api/user/settings/github-contributions
   { "enabled": true }
   ```

## Testing Checklist

- [x] Fix applied to save preference on successful fork_pr create
- [ ] Test: Create item with "Fork & Create" → Verify preference saved in DB
- [ ] Test: Edit same item → Verify uses fork_pr mode (user commit, not bot)
- [ ] Test: Create item with "Quick Create" → Verify preference NOT changed
- [ ] Test: Edit Quick Create item → Verify uses internal_app mode (bot commit)
- [ ] Verify: Check GitHub PRs show user commits for Fork+Create items
- [ ] Verify: Check GitHub PRs show bot commits for Quick Create items

## Files Modified

1. `app/api/items/create/route.ts` - Added preference saving logic
2. `scripts/verify_github_fork_preference.sql` - Added SQL query for verification

## Related Issues

- This bug explains why PR #30 shows bot commits even though PR #29 shows user commits
- The preference was never persisted, so edit flow defaulted to bot mode

