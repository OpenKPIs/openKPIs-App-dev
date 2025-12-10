# Production Deployment Checklist - Quick Reference

## Pre-Deployment

### Supabase Database
- [ ] **Add Column:** Run `scripts/add_github_fork_preference.sql` (replace `{prefix}` with production prefix)
- [ ] **Update Users:** Run `scripts/update_existing_users_fork_preference.sql` (replace `{prefix}`)
- [ ] **Verify:** Run `scripts/verify_github_fork_preference.sql` to confirm all users have `true`

### Environment Variables (Vercel)
- [ ] **Verify:** `GITHUB_APP_ID` is set (production app)
- [ ] **Verify:** `GITHUB_INSTALLATION_ID` is set (production installation)
- [ ] **Verify:** `GITHUB_APP_PRIVATE_KEY_B64` is set (production key)
- [ ] **Verify:** `GITHUB_REPO_OWNER=openKPIs` (production owner)
- [ ] **Verify:** `GITHUB_CONTENT_REPO_NAME=openKPIs-Content` (production repo)
- [ ] **Verify:** Supabase variables are set (production Supabase)
- [ ] **Note:** `GITHUB_FORK_MODE_ENABLED` is **NOT needed** (removed from code)

### GitHub
- [ ] **Verify:** GitHub App has correct permissions on `openKPIs/openKPIs-Content`
- [ ] **Verify:** Webhook is configured on production content repo
- [ ] **Verify:** Webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

## Deployment

### Code
- [ ] **Merge:** Merge dev changes to `openKPIs/openKPIs-App` main branch
- [ ] **Monitor:** Watch Vercel deployment logs
- [ ] **Verify:** Build completes successfully

## Post-Deployment

### Testing
- [ ] **Create Flow:** Checkbox is checked by default
- [ ] **Create Flow:** User can uncheck checkbox
- [ ] **Create Flow:** Create with checked → Uses fork+PR mode
- [ ] **Create Flow:** Create with unchecked → Uses bot mode
- [ ] **Edit Flow:** Uses saved preference automatically (no checkbox)
- [ ] **Database:** All users have `enable_github_fork_contributions = true`

### Monitoring
- [ ] **Logs:** Check Vercel logs for errors
- [ ] **GitHub:** Verify PRs are being created correctly
- [ ] **Supabase:** Verify preference is being saved correctly

## Rollback (If Needed)

- [ ] **Code:** Revert merge in GitHub
- [ ] **Database:** Only rollback if reverting code (column removal not recommended)

## Key Points

✅ **No new environment variables needed**  
✅ **No GitHub repository changes needed**  
✅ **Only Supabase migration required**  
✅ **Feature works immediately after deployment**

