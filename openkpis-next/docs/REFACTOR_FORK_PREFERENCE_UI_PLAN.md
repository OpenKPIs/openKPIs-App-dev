# Refactor: Fork Preference UI & Remove Feature Flag

## Overview

Refactoring the GitHub contribution system to:
1. Remove `GITHUB_FORK_MODE_ENABLED` feature flag entirely
2. Change default value of `enable_github_fork_contributions` to `true`
3. Replace two-button UI with checkbox + single "Create" button
4. Show progress modal for both flows (fork+PR and bot)
5. Improve error handling with token refresh → login prompt → bot fallback

## Changes Summary

### 1. Database Changes
- **Migration**: Change `DEFAULT false` to `DEFAULT true`
- **Update Script**: SQL to set all existing users to `true`

### 2. Code Changes
- **Remove**: All `GITHUB_FORK_MODE_ENABLED` checks
- **Update**: `getUserContributionMode` to only check database preference
- **Update**: Create API to save preference based on checkbox state
- **Update**: Error handling with fallback to bot mode

### 3. UI Changes
- **Remove**: Two buttons (Quick Create, Fork + Create)
- **Add**: Checkbox (checked by default) with message
- **Add**: Single "Create" button
- **Update**: Progress modal to work for both flows

## Implementation Steps

### Phase 1: Database & Backend Core
1. ✅ Update migration script (DEFAULT true)
2. ✅ Create SQL update script for existing users
3. ✅ Remove GITHUB_FORK_MODE_ENABLED from `getUserContributionMode`
4. ✅ Remove GITHUB_FORK_MODE_ENABLED from `syncToGitHub`
5. ✅ Remove GITHUB_FORK_MODE_ENABLED from create API route
6. ✅ Remove GITHUB_FORK_MODE_ENABLED from settings API route

### Phase 2: Error Handling & Bot Mode
7. ✅ Update error handling: token refresh → login → bot fallback
8. ✅ Verify bot mode uses auth.email and auth name

### Phase 3: UI Components
9. ✅ Update `SubmitBar.tsx`: checkbox + single Create button
10. ✅ Update `GitHubForkModal.tsx`: support both flows with different messages
11. ✅ Update `useItemForm.ts`: handle checkbox state, save on Create

### Phase 4: API Integration
12. ✅ Update create API: save preference based on checkbox (true/false)
13. ✅ Ensure preference is saved for both checked and unchecked states

### Phase 5: Documentation
14. ✅ Update all documentation to remove feature flag references
15. ✅ Update environment variable docs

## UI Specification

### Checkbox
- **Default**: Checked (true)
- **Label**: "(Preferred) Get contribution credit on your Github account with Fork and PR approach. Unselecting will not give any contribution for your Open Source contributoin on Github"
- **Behavior**: State synced with `enable_github_fork_contributions` from DB
- **Save**: Only on "Create" button click (not on checkbox change)

### Create Button
- **Label**: Always "Create"
- **Behavior**: 
  - If checkbox checked → `fork_pr` mode
  - If checkbox unchecked → `internal_app` mode + save `enable_github_fork_contributions = false`

### Progress Modal
- **Show**: For both flows (fork+PR and bot)
- **Messages**:
  - Fork+PR: "Creating fork...", "Committing changes...", "Opening Pull Request..."
  - Bot: "Creating branch...", "Committing changes...", "Opening Pull Request..."

## Error Handling Flow

1. **Token Refresh Attempt**: Try silent refresh
2. **If Refresh Fails**: Show login prompt
3. **If Login Fails or User Cancels**: Fallback to bot mode
4. **Bot Mode Message**: Inform user that bot mode was used

## Files to Modify

### Backend
- `lib/services/github.ts` - Remove feature flag, update error handling
- `app/api/items/create/route.ts` - Remove feature flag, save preference
- `app/api/user/settings/github-contributions/route.ts` - Remove feature flag check

### Frontend
- `components/forms/SubmitBar.tsx` - Replace buttons with checkbox + Create
- `components/forms/GitHubForkModal.tsx` - Support both flows
- `hooks/useItemForm.ts` - Handle checkbox, save preference

### Database
- `scripts/add_github_fork_preference.sql` - Update DEFAULT to true
- `scripts/update_existing_users_fork_preference.sql` - NEW: Update existing users

### Documentation
- All docs mentioning `GITHUB_FORK_MODE_ENABLED`

