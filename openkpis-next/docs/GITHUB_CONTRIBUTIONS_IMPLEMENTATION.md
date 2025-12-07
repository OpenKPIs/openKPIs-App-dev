# GitHub Contributions - User Token Priority Implementation

## Summary

Implemented the correct priority order for GitHub contributions:
1. **User Token** (with silent refresh if logged in) - Primary approach
2. **Prompt Login** (if not logged in) - Secondary approach
3. **Bot Token** (ONLY as last resort) - Fallback for rare failures

## Changes Made

### 1. OAuth Scopes Updated
- **File**: `lib/supabase/auth.ts`
- **Change**: Updated scope from `public_repo` to `repo` for full repository access

### 2. Token Storage (Cross-Device Support)
- **File**: `app/auth/callback/route.ts`
- **Change**: Store GitHub OAuth token in both:
  - Cookie (device-specific, immediate use)
  - Supabase `user_metadata` (cross-device support)

### 3. GitHub Sync Service (Priority Implementation)
- **File**: `lib/services/github.ts`
- **Changes**:
  - `getUserOAuthTokenWithRefresh()`: Gets token with priority:
    1. Cookie (device-specific)
    2. user_metadata (cross-device)
    3. Silent refresh attempt
    4. Require reauth if all fail
  - `commitWithUserToken()`: Commits as user (counts toward contributions)
  - `commitWithBotToken()`: Commits as bot (last resort only)
  - `syncToGitHub()`: Implements priority order:
    1. Try user token (with silent refresh)
    2. If requiresReauth → return error
    3. Bot token (ONLY as last resort)

### 4. All Sync Routes Updated
- **Files**: 
  - `app/api/items/create/route.ts`
  - `app/api/kpis/[id]/sync-github/route.ts`
  - `app/api/metrics/[id]/sync-github/route.ts`
  - `app/api/dimensions/[id]/sync-github/route.ts`
  - `app/api/events/[id]/sync-github/route.ts`
  - `app/api/dashboards/[id]/sync-github/route.ts`
  - `lib/services/entityUpdates.ts`
- **Changes**:
  - Get authenticated user
  - Pass `userId` to `syncToGitHub()`
  - Handle `requiresReauth` response (401 status)

## User Experience Flow

### Scenario 1: User Logged In + Token Valid
1. User creates/edits item
2. System gets token from cookie/user_metadata
3. Token is valid → Commit as user ✅
4. **Result**: Commit counts toward GitHub contributions

### Scenario 2: User Logged In + Token Expired
1. User creates/edits item
2. System detects expired token
3. Attempts silent refresh
4. If refresh succeeds → Commit as user ✅
5. If refresh fails → Return `requiresReauth: true`
6. **Result**: User prompted to re-authorize

### Scenario 3: User Not Logged In
1. User creates/edits item
2. System detects no user session
3. Return `requiresReauth: true` (401 status)
4. **Result**: User prompted to sign in

### Scenario 4: All Token Methods Fail (Rare)
1. User token unavailable/expired
2. Silent refresh fails
3. User not logged in
4. **Last Resort**: Use bot token ⚠️
5. **Result**: Commit made, but does NOT count toward contributions (with warning log)

## API Response Format

### Success (User Token)
```json
{
  "success": true,
  "commit_sha": "...",
  "pr_number": 123,
  "pr_url": "https://github.com/...",
  "branch": "...",
  "file_path": "..."
}
```

### Requires Reauth
```json
{
  "success": false,
  "error": "GitHub authorization required",
  "requiresReauth": true
}
```
**Status**: 401

### Bot Fallback (Last Resort)
```json
{
  "success": true,
  "commit_sha": "...",
  "pr_number": 123,
  "pr_url": "https://github.com/...",
  "branch": "...",
  "file_path": "..."
}
```
**Note**: Logs warning that bot was used

## Frontend Handling (Future)

When frontend receives `requiresReauth: true`:
1. Show modal: "Sign in with GitHub to track your contributions"
2. User clicks "Sign In" → Redirect to `/auth/signin`
3. After sign-in → Retry the operation

## Security Notes

1. **Token Storage**: 
   - Cookie: HTTP-only, secure, same-site: lax
   - user_metadata: Encrypted by Supabase
2. **Token Expiration**: 8 hours (configurable)
3. **Silent Refresh**: Only attempts if user is logged in
4. **Bot Token**: Only used when all user token methods fail

## Testing Checklist

- [ ] User logged in + valid token → Commit as user
- [ ] User logged in + expired token → Silent refresh → Commit as user
- [ ] User logged in + refresh fails → Returns requiresReauth
- [ ] User not logged in → Returns requiresReauth
- [ ] All methods fail → Bot token used (last resort)
- [ ] Cross-device: Token from user_metadata works
- [ ] Same device: Token from cookie works

## Next Steps

1. **Frontend**: Handle `requiresReauth` response with user-friendly modal
2. **Monitoring**: Add logging/metrics for token refresh success rate
3. **Token Refresh**: Consider implementing proactive token refresh before expiration

