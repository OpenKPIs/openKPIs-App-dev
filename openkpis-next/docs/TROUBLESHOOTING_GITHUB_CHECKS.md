# Troubleshooting GitHub PR Check Failures

## "Verified Gate / verify-status-check" Failing

### What This Check Is

The "Verified Gate" checks are typically:
1. **GitHub Branch Protection Rules** - Requiring specific status checks to pass
2. **GitHub App Integration** - Third-party app checking PR status
3. **Custom Workflow** - Not visible in `.github/workflows/`

### How to Diagnose

1. **View Check Details:**
   - Go to your PR on GitHub
   - Scroll to "Checks" section
   - Click "Details" next to failing check
   - Copy the error logs

2. **Check Branch Protection:**
   - Go to: Repository → Settings → Branches
   - Check if `main` branch has protection rules
   - Look for required status checks

3. **Check GitHub Apps:**
   - Go to: Repository → Settings → Integrations → GitHub Apps
   - Look for apps that might add status checks

### Common Causes

1. **Missing Required Status Check:**
   - Branch protection requires a check that doesn't exist
   - Check name mismatch (case-sensitive)

2. **CI Workflow Not Running:**
   - Workflow file has syntax errors
   - Workflow not triggered by PR events
   - Missing workflow permissions

3. **Third-Party App Issue:**
   - App configuration error
   - App not installed on repository
   - App permissions issue

### Solutions

#### If It's a Branch Protection Rule Issue:

1. **Temporarily Disable Protection:**
   - Repository → Settings → Branches
   - Edit branch protection rule
   - Remove "verify-status-check" from required checks
   - Or disable protection temporarily

2. **Fix the Check:**
   - Create a workflow that creates this status check
   - Or configure the app/service that should create it

#### If It's a CI Workflow Issue:

1. **Check Workflow Syntax:**
   ```bash
   # Validate YAML
   yamllint .github/workflows/*.yml
   ```

2. **Check Workflow Permissions:**
   - Ensure workflow has necessary permissions
   - Check if workflow needs `pull_request` trigger

3. **Test Locally:**
   ```bash
   # Run checks locally
   npm run lint
   npm run type-check
   npm run build
   ```

### Quick Fix: Disable the Check

If the check is not needed:

1. **Remove from Branch Protection:**
   - Settings → Branches → Edit rule
   - Remove "verify-status-check" from required checks

2. **Or Create a Passing Check:**
   - Add a workflow that always passes:
   ```yaml
   name: verify-status-check
   on:
     pull_request:
   jobs:
     verify:
       runs-on: ubuntu-latest
       steps:
         - name: Verify
           run: echo "Verified"
   ```

### Next Steps

1. Share the actual error logs from the failing check
2. Identify which repository the PR is in
3. Check branch protection settings
4. Verify CI workflow is running correctly

