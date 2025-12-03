# Migrate to OpenKPIs Organization GitHub Accounts

## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly


## Overview

This guide covers migrating from personal GitHub account OAuth/Apps to OpenKPIs organization accounts. You'll need separate configurations for **DEV** and **PROD** environments.

## What Needs to Be Created

### For Each Environment (DEV & PROD):

1. **GitHub OAuth App** (for user login)
   - Client ID
   - Client Secret
   - Callback URL

2. **GitHub App** (for repository API access)
   - App ID
   - Installation ID
   - Private Key
   - Webhook Secret

3. **Personal Access Token (PAT)** (optional, for additional API access)
   - Fine-grained token with repo permissions

---

## Step 1: Create GitHub OAuth Apps (for Login)

### 1.1 Create OAuth App for PROD

1. **Go to OpenKPIs Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"OAuth Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access
   - Or create the OAuth Apps under your personal account (not recommended for production)

2. **Create New OAuth App:**
   - Click **"New OAuth App"**
   - Fill in:
     - **Application name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **Authorization callback URL:** `https://YOUR-PROD-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ **CRITICAL:** Replace `YOUR-PROD-SUPABASE-PROJECT` with your actual Supabase project URL
       - Get this from: Supabase Dashboard → Settings → API → Project URL
     - **Application description:** `OpenKPIs Production OAuth App for user authentication`

3. **Register Application:**
   - Click **"Register application"**

4. **Save Credentials:**
   - **Client ID:** Copy and save (you'll need this)
   - **Client Secret:** Click "Generate a new client secret" → Copy and save
   - ⚠️ **IMPORTANT:** Client Secret is shown only once - save it immediately!

### 1.2 Create OAuth App for DEV

1. **Create Another OAuth App:**
   - Click **"New OAuth App"** again
   - Fill in:
     - **Application name:** `OpenKPIs Development`
     - **Homepage URL:** `http://localhost:3000` (or your dev URL)
     - **Authorization callback URL:** `https://YOUR-DEV-SUPABASE-PROJECT.supabase.co/auth/v1/callback`
       - ⚠️ Use your **DEV Supabase project URL** (different from PROD)
     - **Application description:** `OpenKPIs Development OAuth App for user authentication`

2. **Register and Save Credentials:**
   - Save **Client ID** and **Client Secret** for DEV

---

## Step 2: Create GitHub Apps (for Repository Access)

### 2.1 Create GitHub App for PROD

1. **Go to Organization Settings:**
   
   **Option A: Direct Navigation**
   - Navigate to: `https://github.com/organizations/OpenKPIs/settings/profile`
   - Then click on **"Developer settings"** in the left sidebar
   - Click **"GitHub Apps"**
   
   **Option B: Step-by-Step Navigation**
   - Click your profile picture (top-right) → **"Your organizations"**
   - Click **"OpenKPIs"** organization
   - Click **"Settings"** tab (top navigation)
   - In left sidebar, scroll down to find **"Developer settings"**
   - Click **"Developer settings"** → **"GitHub Apps"**
   
   **⚠️ IMPORTANT:** If you don't see "Developer settings":
   - You need **Owner** or **Admin** permissions in the organization
   - Contact an organization owner to grant you access

2. **Create New GitHub App:**
   - Click **"New GitHub App"**
   - Fill in:
     - **GitHub App name:** `OpenKPIs Production`
     - **Homepage URL:** `https://openkpis.org`
     - **User authorization callback URL:** `https://openkpis.org/auth/callback`
     - **Webhook URL:** `https://openkpis.org/api/webhooks/github`
     - **Webhook secret:** Generate a strong secret (save it - you'll need `GITHUB_WEBHOOK_SECRET`)
     - **Webhook events:** Select:
       - ✅ `Pull requests`
       - ✅ `Pull request reviews`
       - ✅ `Push`
       - ✅ `Repository`

3. **Set Permissions:**
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Metadata:** Read-only
     - **Pull requests:** Read and write
     - **Issues:** Read and write (optional)
   - **Account permissions:** (usually none needed)

4. **Where can this GitHub App be installed?**
   - Select: **"Only on this account"** or **"Any account"** (depending on your needs)

5. **Create GitHub App:**
   - Click **"Create GitHub App"**

6. **Save Credentials:**
   - **App ID:** Copy and save (you'll need `GITHUB_APP_ID`)
   - **Generate Private Key:**
     - Click **"Generate a private key"**
     - Download the `.pem` file
     - ⚠️ **IMPORTANT:** This is shown only once - save it securely!
     - Convert to base64 (see Step 2.3)

### 2.2 Install GitHub App on Repository

1. **Install App:**
   - After creating the app, click **"Install App"**
   - Or go to: `https://github.com/organizations/OpenKPIs/settings/installations`
   - Select the app: **"OpenKPIs Production"**
   - Click **"Install"**

2. **Select Repository:**
   - Choose: **"Only select repositories"**
   - Select: `OpenKPIs/openKPIs-Content` (your content repository)
   - Click **"Install"**

3. **Get Installation ID:**
   - After installation, note the **Installation ID** from the URL
   - URL format: `https://github.com/settings/installations/XXXXXX`
   - The number (`XXXXXX`) is your `GITHUB_INSTALLATION_ID`
   - Or use API: `GET https://api.github.com/app/installations` (with App JWT)

### 2.3 Convert Private Key to Base64

**Option A: Using Node.js Script (Recommended)**

1. **Use the existing script:**
   ```bash
   cd openkpis-next
   npm run encode:github-key
   ```
   - Follow prompts to paste your private key
   - Copy the base64 output

**Option B: Manual Conversion**

1. **On Windows (PowerShell):**
   ```powershell
   $key = Get-Content -Path "path\to\your\private-key.pem" -Raw
   $bytes = [System.Text.Encoding]::UTF8.GetBytes($key)
   [Convert]::ToBase64String($bytes)
   ```

2. **On Mac/Linux:**
   ```bash
   base64 -i your-private-key.pem
   ```

3. **Save the base64 string** - this is your `GITHUB_APP_PRIVATE_KEY_B64`

### 2.4 Create GitHub App for DEV

1. **Repeat Steps 2.1-2.3 for DEV:**
   - Name: `OpenKPIs Development`
   - Webhook URL: `https://your-dev-url.vercel.app/api/webhooks/github` (or localhost tunnel)
   - Install on DEV content repository (if separate)
   - Save all credentials

---

## Step 3: Update Supabase Configuration

### 3.1 Update PROD Supabase Project

1. **Go to Supabase Dashboard:**
   - Navigate to: `https://supabase.com/dashboard`
   - Select your **PROD project**

2. **Configure GitHub OAuth:**
   - Go to: **Authentication** → **Providers**
   - Click **GitHub**
   - Enable: **Toggle ON**
   - **Client ID:** Paste PROD OAuth App Client ID
   - **Client Secret:** Paste PROD OAuth App Client Secret
   - Click **Save**

3. **Configure Redirect URLs:**
   - Go to: **Authentication** → **URL Configuration**
   - Under **Redirect URLs**, add:
     ```
     https://openkpis.org/auth/callback
     ```
   - Click **Save**

### 3.2 Update DEV Supabase Project

1. **Repeat for DEV Supabase:**
   - Use DEV OAuth App credentials
   - Add redirect URL: `http://localhost:3000/auth/callback` (or your dev URL)

---

## Step 4: Update Vercel Environment Variables

### 4.1 Production Environment Variables

1. **Go to Vercel Dashboard:**
   - Navigate to: `https://vercel.com/dashboard`
   - Select your project
   - Go to: **Settings** → **Environment Variables**

2. **Update/Create These Variables for Production:**

   **GitHub OAuth (for Login):**
   - ❌ **NOT NEEDED** - OAuth is configured in Supabase, not in code

   **GitHub App (for Repository Access):**
   ```
   GITHUB_APP_ID=<PROD-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<PROD-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<PROD-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<PROD-Webhook-Secret>
   ```

   **Repository Configuration:**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
   GITHUB_APP_REPO_NAME=openKPIs-App
   NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
   ```

   **Supabase (if not already set):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-prod-publishable-key>
   SUPABASE_SECRET_KEY=<your-prod-secret-key>
   ```

3. **Set Environment:**
   - Make sure these are set for **Production** environment
   - Click **Save**

### 4.2 Development/Preview Environment Variables

1. **Create Separate Variables for Preview/Development:**

   **GitHub App (DEV):**
   ```
   GITHUB_APP_ID=<DEV-GitHub-App-ID>
   GITHUB_INSTALLATION_ID=<DEV-Installation-ID>
   GITHUB_APP_PRIVATE_KEY_B64=<DEV-Base64-Private-Key>
   GITHUB_WEBHOOK_SECRET=<DEV-Webhook-Secret>
   ```

   **Repository Configuration (DEV):**
   ```
   GITHUB_REPO_OWNER=OpenKPIs
   NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
   GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
   ```

   **Supabase (DEV):**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-dev-publishable-key>
   SUPABASE_SECRET_KEY=<your-dev-secret-key>
   ```

2. **Set Environment:**
   - Set these for **Preview** and/or **Development** environments
   - This allows different configs for different deployments

---

## Step 5: Update Webhook Configuration

### 5.1 Update PROD Repository Webhook

1. **Go to Content Repository:**
   - Navigate to: `https://github.com/OpenKPIs/openKPIs-Content`
   - Go to: **Settings** → **Webhooks**

2. **Update Existing Webhook or Create New:**
   - **Payload URL:** `https://openkpis.org/api/webhooks/github`
   - **Content type:** `application/json`
   - **Secret:** Use the `GITHUB_WEBHOOK_SECRET` from Step 2.1
   - **Events:** Select:
     - ✅ `Pull requests`
     - ✅ `Pull request reviews`
     - ✅ `Push`
   - **Active:** ✅ Checked

3. **Save Webhook**

### 5.2 Update DEV Repository Webhook (if separate)

1. **Repeat for DEV repository** (if you have a separate dev content repo)

---

## Step 6: Verify Configuration

### 6.1 Test PROD Login

1. **Test OAuth Login:**
   - Go to: `https://openkpis.org`
   - Click **"Sign in with GitHub"**
   - Should redirect to GitHub (OpenKPIs organization)
   - After authorization, should redirect back to app
   - ✅ Should see your name from organization account

2. **Test GitHub App Access:**
   - Try creating/editing a KPI
   - Should create PR in `OpenKPIs/openKPIs-Content`
   - ✅ PR should be created successfully

3. **Test Webhook:**
   - Create a test PR in the content repository
   - Webhook should receive event
   - Check Vercel logs for webhook processing

### 6.2 Test DEV Login

1. **Test on DEV environment:**
   - Use preview URL or localhost
   - Verify login works with DEV OAuth App
   - Verify GitHub App works for DEV repository

---

## Step 7: Clean Up Old Personal Account Apps

### 7.1 Remove Old OAuth Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/developers/oauth_apps`
   - Find old OAuth apps
   - Delete or revoke access

### 7.2 Remove Old GitHub Apps

1. **Go to Personal Account:**
   - Navigate to: `https://github.com/settings/apps`
   - Find old GitHub Apps
   - Uninstall from repositories
   - Delete apps

### 7.3 Remove Old Installations

1. **Check Installations:**
   - Navigate to: `https://github.com/settings/installations`
   - Uninstall old personal account apps from repositories

---

## Summary Checklist

### ✅ PROD Environment

- [ ] Created GitHub OAuth App for PROD (OpenKPIs org)
- [ ] Created GitHub App for PROD (OpenKPIs org)
- [ ] Installed GitHub App on `OpenKPIs/openKPIs-Content`
- [ ] Updated Supabase PROD with OAuth credentials
- [ ] Updated Vercel PROD environment variables
- [ ] Updated webhook on PROD repository
- [ ] Tested PROD login
- [ ] Tested PROD GitHub App (PR creation)

### ✅ DEV Environment

- [ ] Created GitHub OAuth App for DEV (OpenKPIs org)
- [ ] Created GitHub App for DEV (OpenKPIs org)
- [ ] Installed GitHub App on DEV repository
- [ ] Updated Supabase DEV with OAuth credentials
- [ ] Updated Vercel DEV/Preview environment variables
- [ ] Updated webhook on DEV repository (if separate)
- [ ] Tested DEV login
- [ ] Tested DEV GitHub App

### ✅ Cleanup

- [ ] Removed old personal OAuth Apps
- [ ] Removed old personal GitHub Apps
- [ ] Uninstalled old personal app installations

---

## Environment Variable Reference

### Production
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<prod-app-id>
GITHUB_INSTALLATION_ID=<prod-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<prod-base64-key>
GITHUB_WEBHOOK_SECRET=<prod-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content
GITHUB_APP_REPO_NAME=openKPIs-App
NEXT_PUBLIC_GITHUB_APP_REPO_NAME=openKPIs-App
```

### Development
```bash
# GitHub App (Repository Access)
GITHUB_APP_ID=<dev-app-id>
GITHUB_INSTALLATION_ID=<dev-installation-id>
GITHUB_APP_PRIVATE_KEY_B64=<dev-base64-key>
GITHUB_WEBHOOK_SECRET=<dev-webhook-secret>

# Repository Configuration
GITHUB_REPO_OWNER=OpenKPIs
NEXT_PUBLIC_GITHUB_REPO_OWNER=OpenKPIs
GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
NEXT_PUBLIC_GITHUB_CONTENT_REPO_NAME=openKPIs-Content-Dev
```

---

## Important Notes

1. **OAuth Apps are configured in Supabase**, not in Vercel environment variables
2. **GitHub Apps are configured in Vercel** via environment variables
3. **Separate apps for DEV and PROD** ensure isolation
4. **Organization apps** show organization name during login (not personal name)
5. **Webhook secrets** must match between GitHub and Vercel
6. **Private keys** are shown only once - save them securely!

---

## Troubleshooting

### Issue: Login shows personal name
- **Cause:** Still using personal OAuth App
- **Fix:** Verify Supabase is using organization OAuth App credentials

### Issue: PR creation fails
- **Cause:** GitHub App not installed on repository
- **Fix:** Install GitHub App on the content repository

### Issue: Webhook not receiving events
- **Cause:** Webhook secret mismatch or URL incorrect
- **Fix:** Verify webhook secret matches `GITHUB_WEBHOOK_SECRET` in Vercel

### Issue: "Bad OAuth State" error
- **Cause:** Callback URL mismatch
- **Fix:** Verify OAuth App callback URL matches Supabase project URL

---

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check Vercel logs: Dashboard → Deployments → Function Logs
3. Check GitHub App installation: Settings → Installations
4. Verify all environment variables are set correctly

