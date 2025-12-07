# Fix Verified Gate Permissions Issue

## Problem

The "Verified Gate / verify-status-check" workflow is failing with:
```
Resource not accessible by integration
status: 403
```

The workflow is trying to comment on PRs but doesn't have write permissions.

## Root Cause

GitHub Actions workflows using `pull_request` events have **read-only** permissions by default for security. To write comments, you need to explicitly grant write permissions.

## Solution

### Step 1: Find the Workflow File

The workflow is in the **`OpenKPIs-Content-Dev`** repository (not App-Dev).

1. Go to: `https://github.com/OpenKPIs/OpenKPIs-Content-Dev`
2. Navigate to: `.github/workflows/`
3. Find the workflow file that contains "Verified Gate" or "verify-status-check"

### Step 2: Add Write Permissions

Add `permissions` to the workflow file. Here's the fix:

```yaml
name: Verified Gate

on:
  pull_request:
  pull_request_target:

jobs:
  verify-status-check:
    runs-on: ubuntu-latest
    # ADD THIS PERMISSIONS BLOCK
    permissions:
      issues: write      # Required to comment on PRs/issues
      pull-requests: write  # Required to comment on PRs
      contents: read     # Required to read repository contents
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Verify Status Check
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            // Your existing script here
            // This will now have write permissions
```

### Step 3: Alternative - Use pull_request_target

If the workflow uses `pull_request_target` event, it has write permissions by default, but you still need to explicitly set permissions:

```yaml
on:
  pull_request_target:  # This event has write permissions by default

jobs:
  verify-status-check:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write
      contents: read
```

### Step 4: If Using GITHUB_TOKEN

The default `GITHUB_TOKEN` should work, but if you're using a custom token, ensure it has:
- ✅ `issues: write`
- ✅ `pull_requests: write`

### Step 5: Verify the Fix

1. Commit and push the workflow changes
2. Create a new PR or update the existing PR
3. The workflow should now be able to comment successfully

## Complete Example Workflow

```yaml
name: Verified Gate

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  verify-status-check:
    runs-on: ubuntu-latest
    
    # CRITICAL: Grant write permissions
    permissions:
      issues: write
      pull-requests: write
      contents: read
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Fetch all history for full diff
      
      - name: Check for Verified Status
        id: check-verified
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const { data: files } = await github.rest.pulls.listFiles({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
            });
            
            const verifiedFiles = [];
            for (const file of files) {
              // Your verification logic here
              if (file.filename.includes('status: "Verified"')) {
                verifiedFiles.push(file.filename);
              }
            }
            
            if (verifiedFiles.length > 0) {
              // This will now work with write permissions
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `## ❌ Verified Status Gate Failed\n\nFiles with verified status: ${verifiedFiles.join(', ')}`,
              });
              
              core.setFailed('Verified status found in files');
            }
```

## Important Notes

### Security Warning

⚠️ **`pull_request_target` event is dangerous** - it runs with write permissions and can access secrets. Only use it if you trust the PR author.

**Safer approach**: Use `pull_request` event with explicit permissions (as shown above).

### Permission Levels

- `read`: Can read repository contents
- `write`: Can create/update issues, PRs, comments
- `none`: No access (most secure)

### Why This Happens

GitHub restricts permissions for `pull_request` events to prevent malicious PRs from:
- Modifying the repository
- Accessing secrets
- Creating issues/comments without review

By explicitly granting `write` permissions, you're acknowledging the security trade-off.

## Verification

After applying the fix:

1. ✅ Workflow should be able to comment on PRs
2. ✅ No more 403 "Resource not accessible" errors
3. ✅ Status check should pass/fail correctly

## If Still Failing

1. **Check workflow file syntax** - YAML is sensitive to indentation
2. **Verify the workflow file is in the correct repository** (`OpenKPIs-Content-Dev`)
3. **Check if the workflow is actually running** - Look at Actions tab
4. **Review workflow logs** - Check for other errors

## Related Documentation

- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [pull_request event permissions](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
- [pull_request_target event](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request_target)

