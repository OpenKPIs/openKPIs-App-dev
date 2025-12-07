# GitHub Organization Repository Contributions - Supported Approach

## The Problem

In **organization repositories**, even users with `repo` scope **cannot create branches** unless they are collaborators. This is a GitHub limitation, not a code issue.

**The Counterintuitive Part:**
- If a user can't create a branch, they also can't commit to it
- If an App creates a branch, the user token cannot commit to it (404 error)
- This is a GitHub permissions model limitation for organization repos

## GitHub-Supported Solution

Based on GitHub's official documentation and best practices:

### Approach: Use GitHub App for Operations, Set Author to User

1. **GitHub App creates branch** (has organization write access)
2. **GitHub App creates commit** (has organization write access)
3. **Set `author` and `committer` to USER** (not App)
4. **GitHub counts contributions** when author email matches user's verified GitHub email

### Why This Works

GitHub counts contributions based on:
- **Author email** matching a **verified email** on the user's GitHub account
- The commit being on a branch that gets **merged to main**
- The author email being in the user's **GitHub email settings**

**Important:** GitHub doesn't care WHO made the commit (App or user). It only cares about the **author email** matching the user's verified email.

## Email Handling Strategy

### Priority Order

1. **Verified GitHub Email** (from GitHub API `/user/emails`)
   - Primary verified email (best)
   - Any verified email (fallback)
   - Cached in `user_profiles.github_verified_email` (24-hour cache)

2. **GitHub Noreply Format** (`username@users.noreply.github.com`)
   - Used if no verified email can be fetched
   - **Will count** if user has ANY verified email on their GitHub account
   - This is GitHub's standard format for privacy

3. **User Email** (last resort)
   - Only used if GitHub username is unavailable
   - May not count if not verified on GitHub

### What If User Has No Verified Email?

**According to GitHub:**
- Users **MUST** have at least one verified email to use GitHub
- Without verified email, users cannot:
  - Create repositories
  - Create issues/PRs
  - Authorize OAuth apps
  - Use GitHub Actions

**In Practice:**
- Every GitHub user should have at least one verified email
- If we can't fetch it, we use `username@users.noreply.github.com`
- This format will count if the user has ANY verified email on their account

## Implementation Details

### Code Flow

```typescript
// 1. Try to get verified email from cache
const cachedEmail = profile?.github_verified_email;

// 2. If cache expired, fetch from GitHub API
const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie();

// 3. Fallback to GitHub noreply format
if (!authorEmail) {
  authorEmail = `${githubUsername}@users.noreply.github.com`;
}

// 4. Use App to commit with user attribution
await appOctokit.repos.createOrUpdateFileContents({
  author: { name: userName, email: authorEmail },
  committer: { name: userName, email: authorEmail },
});
```

### Why App Instead of User Token?

**Organization Repository Limitations:**
- User tokens with `repo` scope **cannot create branches** in org repos
- User tokens **cannot commit** to App-created branches (404 error)
- This is a GitHub permissions model, not a code bug

**The Solution:**
- Use App for all operations (has org write access)
- Set author/committer to user (for contributions)
- This is the **GitHub-supported approach** for org repos

## Verification

### How to Verify Contributions Count

1. **Check commit author:**
   - Go to the commit on GitHub
   - Verify author name and email match the user
   - Should show: "User authored and committed" (not "Bot committed")

2. **Check user's contribution graph:**
   - Go to user's GitHub profile
   - Check if green square appears after PR is merged
   - May take a few minutes to update

3. **Verify email matches:**
   - User's GitHub Settings → Emails
   - Check if commit author email is in the list
   - Must be verified (green checkmark)

## Summary

✅ **This is the correct approach** for organization repositories  
✅ **Contributions will count** if author email matches verified email  
✅ **GitHub noreply format works** if user has any verified email  
✅ **No user action required** - email is fetched automatically  

The "bot approach" is actually the **GitHub-supported approach** for organization repositories. The key is setting author/committer correctly, which we do.

