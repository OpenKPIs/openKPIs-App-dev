# GitHub Login - Multi-User Access Fix

## Problem
GitHub login works only for your account but fails for other users, **especially when trying to switch accounts in the same browser**. This is typically caused by:
1. **Existing session conflicts** - You're already logged in, so OAuth uses your existing session
2. **GitHub auto-authorization** - GitHub auto-authorizes with the account you're already logged into
3. **Cookie/session persistence** - Supabase cookies from the first account interfere with the second account's login

---

## Root Causes

**Important:** If configuration issues (callback URL, redirect URL, Client ID/Secret) were the problem, **your login would also fail**. Since your login works, the issue is likely:

### 1. OAuth State Cookie Issues (MOST LIKELY)
Supabase stores the OAuth state parameter in cookies. If cookies aren't being set/read properly for other users, the state won't match and OAuth will fail. This can happen due to:
- Browser privacy settings blocking third-party cookies
- Cookie extensions (ad blockers, privacy tools)
- Different browser cookie handling
- SameSite/Secure cookie settings

### 2. Existing Session/Cookies (Why Your Login Works)
You might already be logged in with valid cookies, so you're not going through the full OAuth flow. Other users starting fresh hit the OAuth flow and encounter cookie issues.

### 3. Browser-Specific Cookie Handling
Different browsers handle cookies differently, especially with:
- SameSite attribute
- Secure flag (HTTPS requirement)
- Third-party cookie blocking

### 4. GitHub App vs OAuth App Confusion
If you're using a **GitHub App** (not OAuth App), it might be installed only for your account. However, OAuth login uses **OAuth App**, which should work for all users.

---

## Diagnostic Steps

### Step 1: Check What Type of GitHub Integration You're Using

**Option A: GitHub OAuth App (via Supabase)**
- Used for user authentication
- Configured in Supabase Dashboard → Authentication → Providers → GitHub
- Requires Client ID and Client Secret from GitHub

**Option B: GitHub App (for repository access)**
- Used for API access to repositories
- Configured with App ID, Installation ID, and Private Key
- This is separate from OAuth login

**For login, you need Option A (GitHub OAuth App).**

---

## Step 2: Verify Supabase GitHub OAuth App Configuration

### 2.1 Check Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Click on **GitHub**

### 2.2 Verify Settings
Check that:
- ✅ **Enabled** is turned ON
- ✅ **Client ID** is set (from GitHub OAuth App)
- ✅ **Client Secret** is set (from GitHub OAuth App)
- ✅ **Redirect URL** is configured correctly

### 2.3 Check Redirect URL
The redirect URL in Supabase should be:
```
https://your-project.supabase.co/auth/v1/callback
```

**NOT** your app's URL like `https://openkpis.org/auth/callback` - that's configured separately in Supabase URL Configuration.

---

## Step 3: Check GitHub OAuth App Settings

### 3.1 Access GitHub OAuth App
1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** (not "GitHub Apps")
3. Find your OAuth app (or create one if missing)

### 3.2 Verify OAuth App Configuration

**Application name:** `OpenKPIs` (or your app name)

**Homepage URL:**
```
https://openkpis.org
```

**Authorization callback URL:**
```
https://your-project.supabase.co/auth/v1/callback
```
⚠️ **CRITICAL**: This must be your **Supabase project URL** + `/auth/v1/callback`, NOT your app's URL.

**To get your Supabase URL:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Append `/auth/v1/callback`

### 3.3 Check OAuth App Permissions
The OAuth app should request these scopes (configured in code):
- `read:user` - Read user profile
- `user:email` - Access user email
- `public_repo` - Access public repositories (if needed)

These are set in `lib/supabase/auth.ts`:
```typescript
scopes: 'read:user user:email public_repo',
```

---

## Step 4: Verify Supabase Redirect URL Configuration

### 4.1 Check Allowed Redirect URLs
1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, ensure these are added:
   ```
   https://openkpis.org/auth/callback
   http://localhost:3000/auth/callback
   ```

### 4.2 Site URL
Under **Site URL**, set:
```
https://openkpis.org
```

---

## Step 5: Test with Another User

### 5.1 Test Your Own Login (Fresh)
**First, test if YOU can log in from scratch:**
1. **Sign out completely** from the site
2. **Clear all cookies** for `openkpis.org` and your Supabase domain
3. Use **Incognito/Private** browsing mode
4. Go to `https://openkpis.org`
5. Click **Sign in with GitHub**
6. Complete the OAuth flow

**If this fails for you too**, it's a configuration issue.  
**If this works for you but not others**, it's likely a cookie/browser issue.

### 5.2 Test with Another User
1. Use **Incognito/Private** browsing mode
2. Or clear all cookies for `openkpis.org` and `github.com`
3. Go to `https://openkpis.org`
4. Click **Sign in with GitHub`
5. Should redirect to GitHub authorization page
6. After authorizing, should redirect back successfully

### 5.3 Check for Errors
- **Browser Console (F12)**: Check for JavaScript errors
- **Network Tab**: Check for failed API calls
- **Application Tab → Cookies**: Check if Supabase cookies are being set
- **Supabase Dashboard**: Check Authentication → Logs for errors

### 5.4 Check Cookie Settings
In browser DevTools → Application → Cookies:
- Look for cookies from your Supabase domain (e.g., `xxxxx.supabase.co`)
- Check if they have `SameSite` and `Secure` flags set
- If cookies are missing, that's the issue

---

## Common Issues and Fixes

### Issue 1: "Application not found" or "Invalid client"
**Cause:** GitHub OAuth App Client ID/Secret mismatch

**Fix:**
1. Verify Client ID and Secret in Supabase match GitHub OAuth App
2. Regenerate Client Secret in GitHub if needed
3. Update Supabase with new secret

### Issue 2: "Redirect URI mismatch"
**Cause:** Callback URL in GitHub OAuth App doesn't match Supabase URL

**Fix:**
1. Update GitHub OAuth App callback URL to: `https://your-project.supabase.co/auth/v1/callback`
2. Wait 1-2 minutes for changes to propagate

### Issue 3: "bad_oauth_state" error
**Cause:** Redirect URL not configured in Supabase

**Fix:**
1. Add `https://openkpis.org/auth/callback` to Supabase Redirect URLs
2. Clear browser cookies
3. Try again

### Issue 4: Login works for you but not others
**Cause:** OAuth state cookies aren't being set/read properly for other users

**Fix:**
1. **Check if cookies are being set:**
   - Have another user open DevTools → Application → Cookies
   - Check if Supabase cookies (from `xxxxx.supabase.co`) are present
   - If missing, cookies are being blocked

2. **Browser cookie settings:**
   - Check if browser blocks third-party cookies
   - Check if privacy extensions are blocking cookies
   - Try a different browser

3. **Supabase cookie configuration:**
   - Supabase manages OAuth state via cookies automatically
   - The cookies should have `SameSite=Lax` and `Secure=true` (for HTTPS)
   - If cookies aren't being set, check Supabase Dashboard → Authentication → Settings

4. **Test your own fresh login:**
   - Sign out completely
   - Clear all cookies
   - Try logging in fresh
   - If it fails, it's a configuration issue
   - If it works, it's likely a browser/cookie issue for other users

**Note:** GitHub App is for API access, not OAuth login. OAuth login uses OAuth App, which should work for all users. The issue is likely cookie-related, not GitHub App installation.

---

## Verification Checklist

Before testing with another user, verify:

- [ ] GitHub OAuth App exists (not just GitHub App)
- [ ] OAuth App callback URL is: `https://your-project.supabase.co/auth/v1/callback`
- [ ] Supabase GitHub provider is enabled with correct Client ID/Secret
- [ ] Supabase Redirect URLs include: `https://openkpis.org/auth/callback`
- [ ] Site URL in Supabase is: `https://openkpis.org`
- [ ] Environment variables are set correctly in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Tested in incognito mode to avoid cookie issues

---

## Quick Test

### Test 1: Fresh Login (Incognito)
1. **Open incognito window**
2. **Go to:** `https://openkpis.org`
3. **Click:** "Sign in with GitHub"
4. **Expected:** Redirects to GitHub, then back to app successfully

### Test 2: Account Switching (Same Browser)
**Enterprise-standard behavior:**
1. **Go to:** `https://openkpis.org` (you can be logged in or not)
2. **Click:** "Sign in with GitHub"
3. **Expected:** GitHub shows account selection screen (even if you're already logged into GitHub)
4. **Select a different account** (or the same one)
5. **Authorize the app**
6. **Expected:** Redirects back to app with the selected account logged in

**How it works:**
- The app uses `prompt: 'select_account'` in the OAuth request
- This forces GitHub to show the account picker, allowing account switching
- Supabase automatically handles session replacement when a new OAuth completes
- No manual cookie clearing or sign-out needed - this is handled by the OAuth flow

**If Test 1 works but Test 2 fails**, the issue is account switching in the same browser. The code handles this using the enterprise-standard OAuth approach:
- Uses `prompt: 'select_account'` to force GitHub to show account selection screen
- Lets Supabase handle session management automatically
- The callback route properly exchanges the OAuth code for a new session, replacing any existing session

**If both tests fail**, it's a configuration issue (callback URL, redirect URL, etc.)

---

## Need More Help?

1. **Check Supabase Logs:**
   - Supabase Dashboard → Authentication → Logs
   - Look for failed login attempts

2. **Check Browser Console:**
   - Open DevTools (F12) → Console
   - Look for errors during login

3. **Check Network Requests:**
   - Open DevTools (F12) → Network
   - Look for failed requests to Supabase or GitHub

4. **Verify Environment Variables:**
   - Check Vercel Dashboard → Settings → Environment Variables
   - Ensure all Supabase variables are set for Production

---

## Summary

**The code supports all users** - there are no hardcoded restrictions.

**Most likely causes:**
1. ❌ GitHub OAuth App callback URL is wrong
2. ❌ Supabase Redirect URL not configured
3. ❌ Client ID/Secret mismatch between GitHub and Supabase
4. ❌ GitHub App (not OAuth) is installed only for your account (this doesn't affect login, but might affect other features)

**Fix priority:**
1. **HIGHEST**: Verify GitHub OAuth App callback URL matches Supabase URL
2. **HIGH**: Check Supabase Redirect URLs include your app URL
3. **MEDIUM**: Verify Client ID/Secret in Supabase match GitHub OAuth App

