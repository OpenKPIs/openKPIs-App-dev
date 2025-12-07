# Token Priority for GitHub Contributions

## Answer: BOTH Cookie and user_metadata Are Checked

The code checks **both** cookie and `user_metadata` in priority order. If **either** has a valid token, commits are made as the **USER** (counts toward contributions). If **neither** has a token, it falls back to **BOT** (doesn't count).

---

## Priority Order (in `getUserOAuthTokenWithRefresh`)

### PRIORITY 1: Cookie (`openkpis_github_token`)
```typescript
// Line 95-106: Check cookie first
const cookieToken = cookieStore.get('openkpis_github_token')?.value;
if (cookieToken && cookieToken.trim().length > 0) {
  token = cookieToken;
  console.log('[GitHub Token] Found token in cookie');
}
```

**Why first?**
- ✅ Most recent (set on current device)
- ✅ Device-specific (immediate use)
- ✅ Fastest to access

**When used:**
- User just signed in (token fresh in cookie)
- Same device/browser session

---

### PRIORITY 2: user_metadata (`raw_user_meta_data.github_oauth_token`)
```typescript
// Line 108-114: Fallback to user_metadata
if (!token) {
  token = user.user_metadata?.github_oauth_token as string | undefined;
  if (token) {
    console.log('[GitHub Token] Found token in user_metadata');
  }
}
```

**Why second?**
- ✅ Cross-device support (works on any device)
- ✅ Persistent (survives cookie expiration)
- ✅ Backup if cookie is missing

**When used:**
- Cookie expired or cleared
- User on different device
- Cookie not set (but token stored in metadata)

---

### PRIORITY 3: Silent Refresh
```typescript
// Line 142: Try to refresh if expired
const refreshed = await refreshGitHubTokenSilently(supabase, userId);
```

**When used:**
- Token found but expired
- Attempts to get new token from Supabase

---

### PRIORITY 4: Require Re-auth
```typescript
// Line 150-156: No token available
return {
  token: null,
  requiresReauth: true,
  error: 'GitHub token expired. Please sign in again to track contributions.',
};
```

**When used:**
- No token in cookie
- No token in user_metadata
- Silent refresh failed

---

## How It Determines User vs Bot

### In `syncToGitHub()`:

```typescript
// Line 473-474: Get token (checks cookie THEN user_metadata)
const { token: userToken, requiresReauth } = 
  await getUserOAuthTokenWithRefresh(params.userId);

if (userToken) {
  // ✅ USER TOKEN FOUND (from cookie OR user_metadata)
  // Commits as USER → Counts toward contributions
  return await commitWithUserToken(userToken, params);
}

if (requiresReauth) {
  // ❌ NO TOKEN (neither cookie nor user_metadata)
  // Should require re-auth, but code might fall through...
}

// ❌ FALLBACK: Use bot (if no user token)
return await commitWithBotToken(params);
```

---

## Decision Flow

```
syncToGitHub() called
  ↓
getUserOAuthTokenWithRefresh()
  ↓
Check Cookie (PRIORITY 1)
  ├─ ✅ Found → Use USER token → commitWithUserToken() → ✅ USER COMMIT
  └─ ❌ Not found
      ↓
      Check user_metadata (PRIORITY 2)
      ├─ ✅ Found → Use USER token → commitWithUserToken() → ✅ USER COMMIT
      └─ ❌ Not found
          ↓
          Try Silent Refresh (PRIORITY 3)
          ├─ ✅ Success → Use USER token → commitWithUserToken() → ✅ USER COMMIT
          └─ ❌ Failed
              ↓
              Require Re-auth (PRIORITY 4)
              ├─ Should return error
              └─ But might fall through to bot
                  ↓
                  commitWithBotToken() → ❌ BOT COMMIT
```

---

## Which One Is More Important?

### For Immediate Use (Same Device):
**Cookie is more important** - it's checked first and is most recent.

### For Cross-Device Support:
**user_metadata is more important** - it works across devices and persists longer.

### For Reliability:
**Both are important** - cookie for speed, user_metadata for persistence.

---

## Current Problem

**Both cookie AND user_metadata are missing the token** because:
1. `providerToken` was `null` in the OAuth callback
2. Token never stored in cookie
3. Token never stored in user_metadata
4. Code falls back to bot → ❌ BOT COMMITS

---

## After the Fix

**Both will have the token**:
1. Token extracted via Admin API
2. Token stored in cookie ✅
3. Token stored in user_metadata ✅
4. Code uses user token → ✅ USER COMMITS

---

## Summary Table

| Source | Priority | When Used | Persistence | Cross-Device |
|--------|----------|-----------|------------|--------------|
| **Cookie** | 1st | Same device, recent sign-in | 7 days | ❌ No |
| **user_metadata** | 2nd | Cookie missing, different device | Until re-auth | ✅ Yes |
| **Silent Refresh** | 3rd | Token expired | N/A | N/A |
| **Bot Fallback** | Last | No token found | N/A | N/A |

**Key Point:** If **either** cookie **OR** user_metadata has a valid token, commits are made as **USER** (counts toward contributions). Only if **both** are missing does it fall back to **BOT**.

