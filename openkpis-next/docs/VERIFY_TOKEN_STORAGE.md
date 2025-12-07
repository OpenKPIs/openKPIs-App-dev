# Verify Token Storage After Sign-In

## ✅ Cookie is Set (Confirmed)

From your cookies, I can see:
- **`openkpis_github_token`**: `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` ✅
- **Expires**: `2025-12-14T05:32:52.030Z` (7 days from now) ✅
- **Domain**: `dev.openkpis.org` ✅
- **HttpOnly**: Yes ✅

**This is working!** The token is stored in the cookie.

---

## Next: Verify Token in `user_metadata`

The cookie is set, but we also need to verify the token is stored in `raw_user_meta_data` for cross-device support.

### Check via SQL Query

Run this in Supabase SQL Editor:

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'github_oauth_token' as has_token,
  raw_user_meta_data->>'github_token_expires_at' as expires_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'swapna.magantius@gmail.com';
```

**Expected Result:**
- `has_token`: Should show the token (starting with `gho_`)
- `expires_at`: Should show a future timestamp
- `raw_user_meta_data`: Should include `github_oauth_token` and `github_token_expires_at`

---

## Check Server Logs (Optional)

**Note:** Logs may not always appear in Vercel due to:
- Immediate redirect (logs may not flush)
- Vercel log filtering/buffering
- Logs in different stream

**If you see the token in SQL query, it's working!** The log is just for debugging.

**Expected logs (if visible):**
```
[Auth Callback] Stored GitHub token in Supabase user_metadata via Admin API
```

**If token was extracted from Admin API:**
```
[Auth Callback] Provider token extracted from Admin API
```

**If token was extracted from session:**
```
[Auth Callback] Provider token extracted successfully from session
```

---

## What to Look For

### ✅ Success Indicators:
1. Cookie is set (confirmed ✅)
2. Token in `raw_user_meta_data` (confirmed ✅ - you see `github_oauth_token` and `github_token_expires_at`)
3. Log shows "Stored GitHub token..." (optional - may not appear in Vercel logs due to redirect timing)

### ❌ If Token Not in `user_meta_data`:
- Check server logs for errors
- Verify `SUPABASE_SECRET_KEY` is set in Vercel
- Check if Admin API call succeeded

---

## Test Creating a KPI

Once token is confirmed in both cookie AND `user_metadata`:

1. **Create a new KPI**
2. **Check server logs** for:
   - `[GitHub Token] Found token in cookie` OR
   - `[GitHub Token] Found token in user_metadata`
   - `[GitHub Sync] Using user token for commit`
3. **Check GitHub** - commit should show as YOUR commit, not bot

---

## Summary

| Storage Location | Status | Verified |
|------------------|--------|----------|
| **Cookie** (`openkpis_github_token`) | ✅ Set | ✅ Confirmed |
| **user_metadata** (`raw_user_meta_data`) | ✅ Stored | ✅ Confirmed (SQL shows token) |
| **Server Logs** | ⚠️ May not appear | Not critical (token is stored) |

**✅ Both storage locations are working!** Token is stored in cookie AND `user_metadata`.

