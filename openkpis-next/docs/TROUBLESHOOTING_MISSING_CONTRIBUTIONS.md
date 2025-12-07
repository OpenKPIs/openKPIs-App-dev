# Troubleshooting Missing Contributions

## Problem: Contribution Not Showing on Profile

A KPI/item was created and committed to GitHub, but it doesn't appear in the user's profile contributions.

## Diagnostic Checklist

### 1. Check if Contribution Record Exists

**Query the database directly:**
```sql
-- Check if contribution record exists
SELECT * FROM {prefix}_contributions 
WHERE item_slug = 'revenue-per-visit' 
AND item_type = 'kpi'
ORDER BY created_at DESC;
```

**What to look for:**
- ✅ Record exists with correct `item_slug`
- ✅ `user_id` matches the logged-in user's ID
- ✅ `status` is 'pending', 'completed', or 'failed'

### 2. Verify User ID Match

**Issue**: The `user_id` in the contribution record must match the logged-in user's Supabase `user.id`.

**Check:**
```sql
-- Get user's Supabase ID
SELECT id, email, user_metadata->>'user_name' as github_username 
FROM auth.users 
WHERE user_metadata->>'user_name' = 'swapnamagantius';

-- Then check contributions
SELECT * FROM {prefix}_contributions 
WHERE user_id = '<user-id-from-above>';
```

**Common mismatch causes:**
- User signed in with different account
- User signed in before/after item creation
- Environment mismatch (dev vs prod tables)

### 3. Check Environment Table Prefix

**Issue**: Contributions might be in a different environment table.

**Check:**
- Is `NEXT_PUBLIC_APP_ENV` set correctly?
- Are you checking the right table prefix?
  - `dev_contributions` (if `NEXT_PUBLIC_APP_ENV=dev`)
  - `prod_contributions` (if `NEXT_PUBLIC_APP_ENV=prod`)
  - `contributions` (if no prefix)

**Query:**
```sql
-- Check all possible tables
SELECT 'dev_contributions' as table_name, COUNT(*) as count 
FROM dev_contributions 
WHERE item_slug = 'revenue-per-visit'
UNION ALL
SELECT 'prod_contributions' as table_name, COUNT(*) as count 
FROM prod_contributions 
WHERE item_slug = 'revenue-per-visit'
UNION ALL
SELECT 'contributions' as table_name, COUNT(*) as count 
FROM contributions 
WHERE item_slug = 'revenue-per-visit';
```

### 4. Check if Contribution Creation Failed Silently

**Issue**: The contribution record creation might have failed but was caught silently.

**Check application logs:**
- Look for: `"Error creating contribution record"`
- Look for: `"Exception creating contribution"`

**The code catches errors silently:**
```typescript
// From app/api/items/create/route.ts
if (contribError) {
  console.error('Error creating contribution record:', contribError);
  // Non-critical - continue even if contribution record fails
}
```

**Fix**: Check Supabase logs or application logs for errors.

### 5. Verify PR Was Created and Merged

**Check GitHub:**
1. Go to: `https://github.com/OpenKPIs/OpenKPIs-Content-Dev/pulls`
2. Search for PRs with "revenue-per-visit" in the title/branch
3. Check if PR was merged

**If PR exists but not merged:**
- Contribution status will be `'pending'`
- Should still show in profile (with pending status)

**If PR was merged:**
- Webhook should update status to `'completed'`
- Check webhook logs for errors

### 6. Check Webhook Status Update

**Issue**: PR was merged but webhook didn't update contribution status.

**Check webhook logs:**
- Look for: `"[GitHub Webhook] Updated contribution status"`
- Look for: `"[GitHub Webhook] Error updating contributions"`

**Verify webhook configuration:**
- Is webhook configured on `OpenKPIs-Content-Dev` repository?
- Is `GITHUB_WEBHOOK_SECRET` set correctly in Vercel?
- Did webhook receive the PR merge event?

### 7. Check Profile Query

**Verify the profile page query:**
```typescript
// From app/myprofile/page.tsx
const { data: contributions } = await supabase
  .from(contributionsTable)  // Check this is correct table
  .select('*')
  .eq('user_id', typedUser.id)  // Check this matches
  .order('created_at', { ascending: false })
  .limit(50);
```

**Common issues:**
- Wrong table prefix
- User ID mismatch
- Query limit (only shows 50 most recent)

## Quick Fixes

### Fix 1: Manually Create Contribution Record

If the record doesn't exist, create it manually:

```sql
-- First, get the user ID
SELECT id FROM auth.users 
WHERE user_metadata->>'user_name' = 'swapnamagantius';

-- Then get the item ID
SELECT id FROM {prefix}_kpis 
WHERE slug = 'revenue-per-visit';

-- Create contribution record
INSERT INTO {prefix}_contributions (
  user_id,
  item_type,
  item_id,
  item_slug,
  action,
  status,
  created_at
) VALUES (
  '<user-id>',
  'kpi',
  '<item-id>',
  'revenue-per-visit',
  'created',
  'completed',  -- or 'pending' if PR not merged
  NOW()
);
```

### Fix 2: Update Contribution Status

If record exists but status is wrong:

```sql
UPDATE {prefix}_contributions
SET status = 'completed'
WHERE item_slug = 'revenue-per-visit'
AND item_type = 'kpi';
```

### Fix 3: Check User Authentication

**Verify user is signed in correctly:**
1. Check browser console for auth errors
2. Verify `user.id` in profile matches contribution `user_id`
3. Try signing out and signing back in

## Prevention

### Add Better Error Handling

**Current code silently fails:**
```typescript
if (contribError) {
  console.error('Error creating contribution record:', contribError);
  // Non-critical - continue even if contribution record fails
}
```

**Better approach:**
```typescript
if (contribError) {
  console.error('Error creating contribution record:', contribError);
  // Return error or retry
  // Don't silently fail - contributions are important!
}
```

### Add Contribution Verification

Add a check after item creation to verify contribution was created:

```typescript
// After creating item
const { data: contribution } = await admin
  .from(contributionsTable)
  .select('id')
  .eq('item_id', created.id)
  .eq('user_id', userId)
  .maybeSingle();

if (!contribution) {
  console.error('WARNING: Contribution record not created for item:', created.id);
  // Optionally: retry creation or alert admin
}
```

## Debugging Steps

1. **Check Database:**
   ```sql
   SELECT * FROM {prefix}_contributions 
   WHERE item_slug = 'revenue-per-visit';
   ```

2. **Check User ID:**
   - Get user ID from Supabase Auth dashboard
   - Compare with contribution `user_id`

3. **Check Environment:**
   - Verify `NEXT_PUBLIC_APP_ENV` matches table prefix
   - Check if using dev or prod environment

4. **Check Logs:**
   - Application logs for contribution creation errors
   - Webhook logs for status update errors

5. **Check GitHub:**
   - Verify PR was created
   - Check if PR was merged
   - Verify webhook received the event

## Common Issues Summary

| Issue | Symptom | Fix |
|-------|---------|-----|
| Contribution record not created | No record in database | Manually create record |
| User ID mismatch | Record exists but wrong user_id | Update user_id or check auth |
| Wrong environment table | Record in different table | Check table prefix |
| PR not merged | Status is 'pending' | Merge PR or update status |
| Webhook failed | Status not updated after merge | Check webhook logs, retry |
| Query limit | Only shows 50 most recent | Increase limit or check older records |

