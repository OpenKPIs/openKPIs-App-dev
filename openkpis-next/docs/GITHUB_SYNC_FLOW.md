# GitHub Sync Flow for KPIs

## Overview

This document describes the complete flow for KPI creation, editing, and publishing with parallel Supabase and GitHub synchronization.

## Flow 1: User Creates New KPI (Edit Flow or AI Analyst Flow)

### Step 1: User Creates/Edits KPI
- User creates a new KPI via:
  - **Edit Flow**: Direct KPI creation form (`/kpis/new`)
  - **AI Analyst Flow**: AI suggests new KPIs → User adds to analysis → Items submitted via `/api/ai/submit-new-items`

### Step 2: Save to Supabase (Immediate)
- KPI is saved to Supabase with `status: 'draft'`
- `created_by` field is set to the user's GitHub username or email
- Contribution record is created in `contributions` table
- Audit log entry is created

### Step 3: GitHub PR Creation (Parallel, Non-Blocking)
- **Immediately after Supabase save**, GitHub sync is triggered in parallel
- For AI Analyst flow: `/api/ai/submit-new-items` calls `/api/kpis/[id]/sync-github` in background
- For Edit flow: Frontend calls `syncToGitHub()` function directly
- GitHub sync:
  1. Creates a new branch: `created-kpi-{slug}-{timestamp}`
  2. Generates YAML content from KPI data
  3. Creates/updates file in branch: `data-layer/kpis/{slug}.yml`
  4. Creates Pull Request with title: `Add KPI: {name} (Draft)`
  5. PR body includes contributor info and KPI description
  6. Updates Supabase with `github_pr_number`, `github_pr_url`, `github_commit_sha`

### Result
- ✅ KPI saved in Supabase as draft
- ✅ GitHub PR created immediately (even though KPI is draft)
- ✅ User gets immediate feedback
- ✅ PR shows contribution from user

## Flow 2: Editor Reviews and Publishes KPI

### Step 1: Editor Reviews Draft KPI
- Editor views draft KPI in review queue
- Editor can add additional data, fix issues, improve description

### Step 2: Editor Changes Status to Published
- Editor updates KPI status from `draft` to `published`
- Additional data is saved to Supabase
- This can happen via:
  - Editor dashboard
  - Direct edit of KPI status field
  - Publish API route (if exists)

### Step 3: GitHub PR Update (Automatic)
- When status changes to `published`, GitHub sync should be triggered
- `/api/kpis/[id]/sync-github` is called with `action: 'edited'`
- GitHub sync logic:
  1. Checks if PR already exists (using `github_pr_number` from Supabase)
  2. If PR exists:
     - Uses existing branch
     - Updates file with latest KPI data (including additional data from editor)
     - Updates PR title: `Add KPI: {name} (Ready for Review)`
     - Updates PR body to reflect `status: published`
  3. If PR doesn't exist (edge case):
     - Creates new PR as in Flow 1

### Step 4: KPI Becomes Visible
- Once status is `published`, KPI appears in:
  - Public KPI catalog
  - Search results
  - User dashboards
  - All public-facing pages

### Result
- ✅ KPI published in Supabase
- ✅ GitHub PR updated with latest data
- ✅ KPI visible to all users
- ✅ PR ready for review and merge

## Technical Implementation

### API Routes

1. **`/api/ai/submit-new-items`** (POST)
   - Saves items to Supabase as drafts
   - Triggers GitHub sync in parallel for KPIs
   - Returns immediately (non-blocking)

2. **`/api/kpis/[id]/sync-github`** (POST)
   - Handles both creation and updates
   - Checks for existing PR
   - Creates or updates PR accordingly
   - Updates Supabase with PR info

### Key Features

- **Parallel Processing**: GitHub sync doesn't block Supabase save
- **Idempotent**: Can be called multiple times safely
- **PR Reuse**: Updates existing PR instead of creating duplicates
- **Status Tracking**: PR title/body reflects KPI status
- **Error Handling**: GitHub sync failures don't break Supabase save

## Environment Variables Required

```env
GITHUB_REPO_OWNER=devyendarm
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_INSTALLATION_ID=your_installation_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Future Enhancements

- Add similar sync for Metrics and Dimensions
- Implement webhook to update Supabase when PR is merged
- Add notification system for PR creation/updates
- Support for bulk operations

