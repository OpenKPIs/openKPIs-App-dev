# Production Deployment Guide - Checkbox Always Checked Feature

## Overview

This guide outlines the steps needed to deploy the "Checkbox Always Checked" feature to production. This feature ensures that the fork+PR checkbox is always checked by default in create flow, while edit flow uses saved preferences.

## Prerequisites

- ✅ Code changes are complete and tested in dev
- ✅ All validations passed
- ✅ Production repository: `openKPIs/openKPIs-App`
- ✅ Production Supabase project access
- ✅ Production Vercel project access

## Step 1: Supabase Database Changes

### 1.1 Add Column to user_profiles Table

**Location:** Supabase Dashboard → SQL Editor

**Script:** `scripts/add_github_fork_preference.sql`

**Action Required:**
1. Open Supabase Dashboard → SQL Editor
2. Replace `{prefix}` with your production table prefix (e.g., `prod_` or no prefix)
3. Run the migration:

```sql
-- Add column to user_profiles table
ALTER TABLE {prefix}_user_profiles
ADD COLUMN IF NOT EXISTS enable_github_fork_contributions BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN {prefix}_user_profiles.enable_github_fork_contributions IS 
'If true, user wants to use fork+PR workflow for GitHub contributions. If false, uses Quick Create (App-based sync only).';
```

**Example (if no prefix):**
```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS enable_github_fork_contributions BOOLEAN DEFAULT true;
```

### 1.2 Update Existing Users

**Script:** `scripts/update_existing_users_fork_preference.sql`

**Action Required:**
1. After adding the column, update all existing users to have `true` as default:

```sql
-- Update all existing users to have fork contributions enabled by default
UPDATE {prefix}_user_profiles
SET enable_github_fork_contributions = true
WHERE enable_github_fork_contributions IS NULL 
   OR enable_github_fork_contributions = false;
```

**Example (if no prefix):**
```sql
UPDATE user_profiles
SET enable_github_fork_contributions = true
WHERE enable_github_fork_contributions IS NULL 
   OR enable_github_fork_contributions = false;
```

### 1.3 Verify Migration

**Script:** `scripts/verify_github_fork_preference.sql`

Run this to verify the migration:

```sql
-- Verify the migration
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE enable_github_fork_contributions = true) as enabled_users,
  COUNT(*) FILTER (WHERE enable_github_fork_contributions = false) as disabled_users,
  COUNT(*) FILTER (WHERE enable_github_fork_contributions IS NULL) as null_users
FROM {prefix}_user_profiles;
```

**Expected Result:**
- `enabled_users` should equal `total_users` (all users have `true`)
- `disabled_users` should be `0`
- `null_users` should be `0`

## Step 2: Environment Variables

### 2.1 No New Environment Variables Required ✅

**Important:** The `GITHUB_FORK_MODE_ENABLED` feature flag has been **removed**. No environment variable is needed to enable/disable this feature.

### 2.2 Existing Environment Variables (Verify)

Ensure these are set in **Vercel Production Environment Variables**:

**Required GitHub App Variables:**
```bash
GITHUB_APP_ID=your-app-id
GITHUB_INSTALLATION_ID=your-installation-id
GITHUB_APP_PRIVATE_KEY_B64=base64-encoded-key
```

**Required Repository Variables:**
```bash
GITHUB_REPO_OWNER=openKPIs  # Production owner
GITHUB_CONTENT_REPO_NAME=openKPIs-Content  # Production content repo
# OR
GITHUB_CONTENT_REPO=openKPIs/openKPIs-Content
```

**Required Supabase Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SECRET_KEY=eyJhbGc...
```

**Note:** These should already be configured. Just verify they're correct for production.

## Step 3: GitHub Repository Changes

### 3.1 No GitHub Repository Changes Required ✅

The feature works with existing repositories:
- **App Repository:** `openKPIs/openKPIs-App` (production)
- **Content Repository:** `openKPIs/openKPIs-Content` (production)

### 3.2 Verify GitHub App Permissions

Ensure your GitHub App has these permissions on the **production content repository**:

**Repository Permissions:**
- ✅ Contents: Read & Write
- ✅ Pull requests: Read & Write
- ✅ Metadata: Read-only

**Account Permissions:**
- ✅ None required (for organization repos)

**Where to Check:**
1. GitHub → Settings → Developer settings → GitHub Apps
2. Select your app
3. Verify permissions on `openKPIs/openKPIs-Content` repository

### 3.3 Verify Webhook Configuration

Ensure webhook is configured on **production content repository**:

**Webhook URL:**
```
https://your-production-domain.com/api/webhooks/github
```

**Events:**
- ✅ Pull requests
- ✅ Pull request reviews (optional)

**Secret:**
- Must match `GITHUB_WEBHOOK_SECRET` in Vercel environment variables

## Step 4: Code Deployment

### 4.1 Merge to Production

**Option A: Direct Push (if you have access)**
```bash
# From dev branch
git checkout main
git pull origin main
git merge openkpis-app-dev/main  # Or cherry-pick commits
git push origin main
```

**Option B: Create Pull Request**
1. Create PR from `openKPIs-App-dev` → `openKPIs-App`
2. Review changes
3. Merge to production `main` branch

### 4.2 Vercel Auto-Deployment

Vercel will automatically deploy when you push to `origin/main`:
- ✅ Build will run
- ✅ Environment variables will be used
- ✅ Deployment will be live

**Monitor Deployment:**
1. Go to Vercel Dashboard
2. Check deployment status
3. Verify build logs for any errors

## Step 5: Post-Deployment Verification

### 5.1 Test Create Flow

1. Navigate to production site
2. Go to "Create KPI" (or any entity)
3. **Verify:** Checkbox is checked by default ✅
4. **Verify:** User can uncheck checkbox ✅
5. **Verify:** Create with checkbox checked → Uses fork+PR mode ✅
6. **Verify:** Create with checkbox unchecked → Uses bot mode ✅

### 5.2 Test Edit Flow

1. Edit an existing item
2. **Verify:** No checkbox shown (uses saved preference automatically) ✅
3. **Verify:** If preference is `true`, uses fork+PR mode ✅
4. **Verify:** If preference is `false`, uses bot mode ✅

### 5.3 Verify Database

Run verification query:
```sql
SELECT 
  id,
  email,
  enable_github_fork_contributions
FROM {prefix}_user_profiles
LIMIT 10;
```

**Expected:** All users should have `enable_github_fork_contributions = true` (or `null` for new users, which defaults to `true`)

### 5.4 Monitor Logs

Check Vercel logs for:
- ✅ No errors during item creation
- ✅ GitHub sync working correctly
- ✅ Preference saving working correctly

## Step 6: Rollback Plan (If Needed)

### 6.1 Database Rollback

If you need to rollback the database changes:

```sql
-- Remove the column (only if needed)
ALTER TABLE {prefix}_user_profiles
DROP COLUMN IF EXISTS enable_github_fork_contributions;
```

**Note:** This will cause errors in the application. Only do this if reverting code changes.

### 6.2 Code Rollback

If you need to rollback code:
1. Revert the merge/PR in GitHub
2. Push to `origin/main`
3. Vercel will auto-deploy the previous version

## Summary Checklist

### Before Deployment
- [ ] Review all code changes
- [ ] Test in dev environment
- [ ] Prepare Supabase SQL scripts with correct table prefix
- [ ] Verify environment variables in Vercel
- [ ] Verify GitHub App permissions
- [ ] Verify webhook configuration

### During Deployment
- [ ] Run Supabase migration (add column)
- [ ] Update existing users (set default to true)
- [ ] Verify migration (run verification query)
- [ ] Merge code to production
- [ ] Monitor Vercel deployment

### After Deployment
- [ ] Test create flow (checkbox checked by default)
- [ ] Test edit flow (uses saved preference)
- [ ] Verify database (all users have preference set)
- [ ] Monitor logs for errors
- [ ] Monitor GitHub sync operations

## Important Notes

1. **No Feature Flag:** The `GITHUB_FORK_MODE_ENABLED` environment variable is **not needed** and has been removed from the code.

2. **Default Behavior:** The checkbox is **always checked** in create flow, regardless of saved preference. This is by design.

3. **Edit Flow:** Edit operations use saved preference automatically. No user interaction needed.

4. **Backward Compatibility:** Existing users will have their preference set to `true` by default after migration.

5. **No Breaking Changes:** The feature is backward compatible. If a user doesn't have the preference set, it defaults to `true`.

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify environment variables
4. Verify database migration completed
5. Check GitHub App permissions

## Related Documentation

- `docs/CHECKBOX_ALWAYS_CHECKED_IMPLEMENTATION.md` - Implementation details
- `docs/VALIDATION_CHECKBOX_ALWAYS_CHECKED.md` - Validation report
- `scripts/add_github_fork_preference.sql` - Migration script
- `scripts/update_existing_users_fork_preference.sql` - Update script
- `scripts/verify_github_fork_preference.sql` - Verification script

