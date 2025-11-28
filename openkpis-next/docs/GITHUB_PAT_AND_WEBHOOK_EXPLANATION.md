# GitHub PAT and Webhook Configuration

## Personal Access Token (PAT) - NOT USED

### ❌ PAT is NOT used in the application

**Answer:** No, Personal Access Tokens (PAT) are **not used** anywhere in the application.

### What IS Used Instead:

1. **GitHub OAuth App** (for user login)
   - Configured in Supabase
   - Provides OAuth tokens for user authentication
   - Used to authenticate users via GitHub

2. **GitHub App** (for repository API access)
   - Configured via environment variables:
     - `GITHUB_APP_ID`
     - `GITHUB_INSTALLATION_ID`
     - `GITHUB_APP_PRIVATE_KEY_B64`
   - Used for creating PRs, branches, and repository operations
   - Located in: `lib/services/github.ts`

3. **OAuth Provider Token** (for Giscus comments)
   - Extracted from Supabase session after GitHub login
   - Stored in cookie: `openkpis_github_token`
   - Used for Giscus authentication
   - Located in: `app/auth/callback/route.ts` and `app/api/auth/github-token/route.ts`

### Why No PAT?

- **GitHub App** provides better security and scoped permissions
- **OAuth tokens** are automatically managed by Supabase
- **No manual token management** needed

---

## Webhook Configuration

### What the Webhook Does

The webhook listens for GitHub events and updates the database when PRs are merged or closed.

**Location:** `app/api/webhooks/github/route.ts`

### Webhook Flow

```
User creates/edits item in app
  ↓
App creates PR in GitHub (via GitHub App)
  ↓
PR branch: {action}-{tableName}-{slug}-{timestamp}
  ↓
When PR is merged/closed → GitHub sends webhook event
  ↓
Webhook handler receives event
  ↓
Verifies signature (using GITHUB_WEBHOOK_SECRET)
  ↓
Extracts item info from branch name
  ↓
Updates contribution status in Supabase:
  - 'completed' if PR merged
  - 'failed' if PR closed without merge
  ↓
Updates item's github_pr_number and github_pr_url
```

### Webhook Configuration Steps

#### 1. In GitHub Repository

1. **Go to Repository Settings:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content/settings/hooks`
   - Or: Repository → Settings → Webhooks

2. **Add Webhook:**
   - Click **"Add webhook"**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
     - For DEV: `https://your-dev-url.vercel.app/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Generate a strong secret (save it!)
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews` (optional)
     - ✅ `Push` (optional)
   - **Active:** ✅ Checked

3. **Save Webhook**

#### 2. In Vercel Environment Variables

Set the webhook secret in Vercel:

```bash
GITHUB_WEBHOOK_SECRET=<your-webhook-secret>
```

**Important:** The secret in Vercel must **exactly match** the secret configured in GitHub.

#### 3. Webhook Security

The webhook verifies requests using HMAC SHA-256:

```typescript
// From app/api/webhooks/github/route.ts
const signature = request.headers.get('x-hub-signature-256');
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

if (webhookSecret && signature) {
  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')}`;

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
}
```

**If secret doesn't match:**
- Webhook returns `401 Unauthorized`
- Request is rejected
- No database updates occur

**If no secret configured:**
- Webhook processes anyway (for development)
- Warning logged: `GITHUB_WEBHOOK_SECRET not configured`

### What Events Are Processed

The webhook only processes:
- **Pull request events** with `action: 'closed'`
- Ignores all other events

### What Gets Updated

When a PR is closed:

1. **Contribution Status:**
   - Table: `prod_contributions`
   - Status set to:
     - `'completed'` if PR was merged
     - `'failed'` if PR was closed without merge

2. **Item Metadata** (if merged):
   - Table: `prod_kpis`, `prod_metrics`, etc.
   - Updates:
     - `github_pr_number` = PR number
     - `github_pr_url` = PR URL

### Branch Name Format

The webhook extracts item information from the PR branch name:

**Format:** `{action}-{tableName}-{slug}-{timestamp}`

**Examples:**
- `create-kpis-revenue-growth-1234567890`
- `update-metrics-page-views-1234567890`
- `create-dashboards-ecommerce-1234567890`

**Extraction:**
- `action` = First part (e.g., "create", "update")
- `tableName` = Second part (e.g., "kpis", "metrics")
- `slug` = Third part onwards, minus timestamp (e.g., "revenue-growth")
- `timestamp` = Last part (e.g., "1234567890")

### Testing the Webhook

#### 1. Test from GitHub

1. **Create a test PR** in the content repository
2. **Merge or close the PR**
3. **Check Vercel logs:**
   - Go to Vercel Dashboard → Deployments → Function Logs
   - Look for `[GitHub Webhook]` messages
   - Should see: `Updated contribution status to 'completed'`

#### 2. Test Manually (Development)

You can test locally using a tool like `ngrok`:

```bash
# Install ngrok
npm install -g ngrok

# Start local server
npm run dev

# In another terminal, expose localhost
ngrok http 3000

# Use ngrok URL in GitHub webhook:
# https://your-ngrok-url.ngrok.io/api/webhooks/github
```

#### 3. Check Webhook Delivery

In GitHub:
1. Go to: Repository → Settings → Webhooks
2. Click on your webhook
3. Scroll to **"Recent Deliveries"**
4. Check delivery status:
   - ✅ Green = Success
   - ❌ Red = Failed (check response)

### Troubleshooting

#### Issue: Webhook not receiving events

**Possible Causes:**
1. **Webhook URL incorrect**
   - Verify URL matches your app URL
   - Check for typos

2. **Webhook secret mismatch**
   - Verify `GITHUB_WEBHOOK_SECRET` in Vercel matches GitHub
   - Check for extra spaces or encoding issues

3. **Webhook not active**
   - Check "Active" checkbox in GitHub webhook settings

4. **Wrong events selected**
   - Ensure "Pull requests" event is selected

#### Issue: Webhook returns 401

**Cause:** Signature verification failed

**Fix:**
- Verify `GITHUB_WEBHOOK_SECRET` matches exactly
- Check for encoding issues (no extra spaces)
- Regenerate secret if needed

#### Issue: Webhook processes but doesn't update database

**Possible Causes:**
1. **Item not found**
   - Check logs: `Item not found for slug: {slug}`
   - Verify item exists in database

2. **Branch name format incorrect**
   - Check logs: `Unexpected branch format: {branchName}`
   - Verify branch follows format: `{action}-{tableName}-{slug}-{timestamp}`

3. **Database error**
   - Check logs for Supabase errors
   - Verify database connection

### Webhook Logs

The webhook logs important events:

**Success:**
```
[GitHub Webhook] Updated contribution status to 'completed' for item {id} (PR #{number})
```

**Warnings:**
```
[GitHub Webhook] Unexpected branch format: {branchName}
[GitHub Webhook] Item not found for slug: {slug}
[GitHub Webhook] PR number mismatch...
```

**Errors:**
```
[GitHub Webhook] Invalid signature
[GitHub Webhook] Error updating contributions for item {id}: {error}
[GitHub Webhook] Error processing webhook: {error}
```

---

## Summary

### PAT Usage
- ❌ **NOT USED** - No Personal Access Tokens in the application
- ✅ **GitHub App** used instead (more secure, scoped permissions)
- ✅ **OAuth tokens** used for user authentication and Giscus

### Webhook Configuration
- ✅ **Configured in:** GitHub repository settings
- ✅ **Endpoint:** `/api/webhooks/github`
- ✅ **Security:** HMAC SHA-256 signature verification
- ✅ **Purpose:** Update contribution status when PRs are merged/closed
- ✅ **Events:** Pull request events only
- ✅ **Secret:** Must match between GitHub and Vercel

---

## Quick Reference

### Webhook Setup Checklist

- [ ] Webhook created in GitHub repository
- [ ] Payload URL set correctly
- [ ] Webhook secret generated and saved
- [ ] `GITHUB_WEBHOOK_SECRET` set in Vercel (matches GitHub)
- [ ] "Pull requests" event selected
- [ ] Webhook is active
- [ ] Tested with a real PR merge

### Environment Variables

```bash
# Required for webhook
GITHUB_WEBHOOK_SECRET=<your-webhook-secret>

# Required for GitHub App (repository access)
GITHUB_APP_ID=<app-id>
GITHUB_INSTALLATION_ID=<installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<base64-private-key>
```

---

## Related Documentation

- **Migration Guide:** `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md`
- **Repository Setup:** `REPOSITORY_SETUP.md`
- **Webhook Code:** `app/api/webhooks/github/route.ts`

