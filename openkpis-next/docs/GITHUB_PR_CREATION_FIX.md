# GitHub PR Creation Fix

## Issue
PR creation fails with error:
```
Validation Failed: {"resource":"PullRequest","field":"head","code":"invalid"}
```

Error message:
```
Commit created in fork, but PR creation failed: Validation Failed: {"resource":"PullRequest","field":"head","code":"invalid"} - https://docs.github.com/rest/pulls/pulls#create-a-pull-request. You can manually open a PR from devyendarm:openkpis-edited-kpis-add-to-cart-rate-1766383348758 to OpenKPIs:main
```

## Root Cause
When creating a PR from a fork, the code needs:
- **Base repository owner**: `OpenKPIs` (organization)
- **Fork owner**: `devyendarm` (user)
- **Head format**: `forkOwner:branchName` (e.g., `devyendarm:branch-name`)

The issue is that `GITHUB_OWNER` environment variable defaults to `'devyendarm'` but should be `'OpenKPIs'` for the base repository.

## Solution

### Option 1: Set Environment Variable (Recommended)
Set the `GITHUB_REPO_OWNER` environment variable in Vercel:

**For Production:**
```
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
```

**For Development:**
```
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
```

### Option 2: Manual PR Creation
If the environment variable cannot be set immediately, you can manually create the PR:

1. Go to: `https://github.com/OpenKPIs/openKPIs-Content/compare`
2. Select:
   - **Base**: `main` (from `OpenKPIs/openKPIs-Content`)
   - **Compare**: `openkpis-edited-kpis-add-to-cart-rate-1766383348758` (from `devyendarm/openKPIs-Content`)
3. Click "Create pull request"

## Code Location
The PR creation happens in `lib/services/github.ts` in the `syncViaForkAndPR` function around line 776:

```typescript
const prResponse = await userOctokit.pulls.create({
  owner: GITHUB_OWNER,  // Should be 'OpenKPIs' for organization repos
  repo: GITHUB_CONTENT_REPO,
  title: ...,
  head: `${forkOwner}:${branchName}`,  // Format: 'devyendarm:branch-name'
  base: 'main',
  ...
});
```

## Verification
After setting the environment variable:
1. The `GITHUB_OWNER` constant will be `'OpenKPIs'`
2. PRs will be created correctly from forks
3. The head format `forkOwner:branchName` will be valid

## Related Files
- `lib/services/github.ts` - Line 10: `GITHUB_OWNER` constant
- `lib/services/github.ts` - Line 776: PR creation with fork
- Environment variables in Vercel project settings

