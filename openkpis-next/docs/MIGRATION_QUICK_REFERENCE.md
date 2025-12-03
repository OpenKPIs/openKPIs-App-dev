# Migration to OpenKPIs Org - Quick Reference

## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


# Migration to OpenKPIs Org - Quick Reference

## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


# Migration to OpenKPIs Org - Quick Reference

## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.



## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.



## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.



## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.


## What You Need to Create

### For PROD:
1. ✅ GitHub OAuth App → Supabase PROD
2. ✅ GitHub App → Vercel PROD env vars
3. ✅ Webhook → GitHub repository

### For DEV:
1. ✅ GitHub OAuth App → Supabase DEV
2. ✅ GitHub App → Vercel DEV env vars
3. ✅ Webhook → GitHub repository (if separate)

---

## Quick Steps

### 1. Create OAuth Apps (Login)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/developers`
- **PROD Callback:** `https://YOUR-PROD-SUPABASE.supabase.co/auth/v1/callback`
- **DEV Callback:** `https://YOUR-DEV-SUPABASE.supabase.co/auth/v1/callback`
- **Save:** Client ID + Client Secret → Use in Supabase

### 2. Create GitHub Apps (Repository Access)
- **Location:** `https://github.com/organizations/OpenKPIs/settings/apps`
- **Webhook URL PROD:** `https://openkpis.org/api/webhooks/github`
- **Webhook URL DEV:** `https://your-dev-url.vercel.app/api/webhooks/github`
- **Save:** App ID + Installation ID + Private Key (base64) + Webhook Secret → Use in Vercel

### 3. Update Supabase
- **PROD:** Authentication → Providers → GitHub → Use PROD OAuth credentials
- **DEV:** Authentication → Providers → GitHub → Use DEV OAuth credentials

### 4. Update Vercel
- **PROD Environment:**
  ```
  GITHUB_APP_ID=<prod-app-id>
  GITHUB_INSTALLATION_ID=<prod-installation-id>
  GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
  GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>
  GITHUB_REPO_OWNER=OpenKPIs
  NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
  ```
- **DEV Environment:** Same variables with DEV values

### 5. Update Webhooks
- **Repository:** Settings → Webhooks
- **URL:** Match your app URL
- **Secret:** Match `GITHUB_WEBHOOK_SECRET` in Vercel

---

## Key Differences: Personal vs Organization

| Aspect | Personal Account | Organization Account |
|--------|-----------------|---------------------|
| **Login Display** | Shows personal name | Shows organization name |
| **App Location** | `github.com/settings/apps` | `github.com/organizations/ORG/settings/apps` |
| **OAuth App** | Personal OAuth Apps | Organization OAuth Apps |
| **GitHub App** | Personal GitHub Apps | Organization GitHub Apps |

---

## Environment Variables Checklist

### ✅ PROD
- [ ] `GITHUB_APP_ID` (PROD GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (PROD Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (PROD Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (PROD Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ DEV
- [ ] `GITHUB_APP_ID` (DEV GitHub App)
- [ ] `GITHUB_INSTALLATION_ID` (DEV Installation)
- [ ] `GITHUB_APP_PRIVATE_KEY_B64` (DEV Private Key, base64)
- [ ] `GITHUB_WEBHOOK_SECRET` (DEV Webhook Secret)
- [ ] `GITHUB_REPO_OWNER=OpenKPIs`
- [ ] `NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs`

### ✅ Supabase (OAuth)
- [ ] PROD Supabase → GitHub Provider → PROD OAuth credentials
- [ ] DEV Supabase → GitHub Provider → DEV OAuth credentials

---

## Testing Checklist

### ✅ PROD
- [ ] Login shows organization name (not personal)
- [ ] PR creation works
- [ ] Webhook receives events

### ✅ DEV
- [ ] Login works with DEV OAuth
- [ ] PR creation works on DEV repo
- [ ] Webhook works on DEV

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Still shows personal name | Check Supabase uses org OAuth App |
| PR creation fails | Verify GitHub App installed on repo |
| Webhook not working | Check webhook secret matches Vercel |
| Bad OAuth state | Verify callback URL in OAuth App |

---

## Full Guide
See: `docs/MIGRATE_TO_ORG_GITHUB_ACCOUNTS.md` for detailed instructions.



