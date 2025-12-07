# Why Contributions Not Showing - Complete Diagnosis

## ⚠️ Critical: Commits Must Be Merged to Main

**GitHub contributions only count when:**
1. ✅ Commits are on the default branch (main/master), OR
2. ✅ Commits are in branches that are part of merged PRs

**Your commits are on feature branches** (`created-kpis-...`), so they **won't count until the PR is merged to main**.

---

## Step-by-Step Diagnosis

### 1. Check if PR is Merged

**Go to the repository:**
- `https://github.com/devyendarm/OpenKPIs-Content-Dev`
- Find the PR that was created
- **Check status:**
  - ✅ **Merged** → Should count (may take time)
  - ⏳ **Open** → Won't count until merged
  - ❌ **Closed (not merged)** → Won't count

### 2. Check Commit Author Email

**GitHub matches contributions by email address.** The email in the commit must match a verified email in your GitHub account.

**Check the commit:**
1. Go to the PR
2. Click on the commit
3. Check the author email shown
4. **Verify it matches:**
   - Go to: `https://github.com/settings/emails`
   - Check if the commit email is in your verified emails list

**Common issues:**
- ❌ Email is `username@users.noreply.github.com` (not verified)
- ❌ Email doesn't match any verified email in your account
- ✅ Should be: `swapna.magantius@gmail.com` (your verified email)

### 3. Check Commit Author (Not Bot)

**The commit should show YOU, not the bot:**
1. Go to the commit in GitHub
2. **Should show:**
   - ✅ Your GitHub avatar
   - ✅ Your username: `swapnamagantius`
   - ✅ Links to your profile
   - ❌ NOT "OpenKPIs Bot"

### 4. Check Repository Visibility

**If repository is private:**
- Go to: `https://github.com/settings/profile`
- Scroll to "Contribution settings"
- ✅ Check "Include private contributions on my profile"

### 5. Check Time Delay

**GitHub can take up to 24 hours to update:**
- Usually appears within 1-5 minutes
- Can take up to 24 hours in rare cases
- If it's been more than 5 minutes, check other issues above

---

## Most Likely Issues (In Order)

### Issue 1: PR Not Merged (MOST COMMON)
**Symptom:** PR is still open
**Solution:** Merge the PR to main
**How to verify:** Check PR status in repository

### Issue 2: Email Mismatch
**Symptom:** Commit email doesn't match verified email
**Solution:** Ensure commit uses your verified GitHub email
**How to verify:** Check commit author email vs. your verified emails

### Issue 3: Commit Made by Bot
**Symptom:** Commit shows "OpenKPIs Bot" as author
**Solution:** This means user token wasn't used - check server logs
**How to verify:** Check commit author in GitHub

### Issue 4: Repository is Private
**Symptom:** Private repo, contributions not enabled
**Solution:** Enable "Include private contributions" in profile settings
**How to verify:** Check GitHub profile settings

---

## Quick Fix Checklist

- [ ] **PR is merged to main** (required!)
- [ ] **Commit email matches verified email** in your GitHub account
- [ ] **Commit shows your username** (not bot)
- [ ] **Private contributions enabled** (if repo is private)
- [ ] **Wait up to 24 hours** (usually 1-5 minutes)

---

## How to Fix

### If PR is Not Merged:
1. Go to the PR
2. Review it (if needed)
3. Click "Merge pull request"
4. Wait 1-5 minutes
5. Check your Contributions graph

### If Email Doesn't Match:
1. Check what email was used in the commit
2. Add that email to your GitHub account: `https://github.com/settings/emails`
3. Verify the email
4. Future commits will count (past commits won't retroactively count)

### If Commit Shows Bot:
1. Check server logs for: `[GitHub Sync] Using user token for commit`
2. If you see bot logs, the user token wasn't used
3. Sign in again to refresh token
4. Create a new KPI

---

## Summary

**Most likely cause:** PR is not merged to main.

**GitHub's rule:** Commits on feature branches only count after the PR is merged.

**Action:** Merge the PR, then wait 1-5 minutes for the contribution to appear.

