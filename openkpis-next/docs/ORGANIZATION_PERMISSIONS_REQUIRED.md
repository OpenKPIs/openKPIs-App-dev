# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


# GitHub Organization Permissions Required

## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.



## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.


## Issue: Can't See Developer Settings

If you can't see "Developer settings" in your GitHub organization, it's a **permissions issue**.

---

## Required Permissions

To create OAuth Apps and GitHub Apps for an organization, you need:

- **Owner** role, OR
- **Admin** role with "Manage organization settings" permission

---

## How to Check Your Permissions

### Step 1: Check Your Role

1. Go to: `https://github.com/organizations/OpenKPIs/people`
2. Find your username
3. Check your role:
   - ✅ **Owner** = Full access
   - ✅ **Member** with Admin permissions = May have access
   - ❌ **Member** = No access to developer settings

### Step 2: Check Organization Settings Access

1. Go to: `https://github.com/organizations/OpenKPIs/settings/profile`
2. Look at the left sidebar
3. If you see **"Developer settings"** → ✅ You have access
4. If you DON'T see it → ❌ You need higher permissions

---

## Solutions

### Solution 1: Get Organization Owner to Grant Permissions

**Ask an organization owner to:**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/member_privileges`
2. Find your username
3. Change your role to **"Owner"** or grant **"Admin"** with full permissions

**OR**

1. Go to: `https://github.com/organizations/OpenKPIs/settings/roles`
2. Create a custom role with "Manage organization settings" permission
3. Assign that role to you

### Solution 2: Create Apps Under Personal Account (Temporary)

**⚠️ NOT RECOMMENDED FOR PRODUCTION**

If you can't get organization permissions, you can temporarily create apps under your personal account:

1. Go to: `https://github.com/settings/developers/oauth_apps`
2. Create OAuth Apps there
3. **Note:** These will show your personal name during login (not organization name)
4. **Later:** Transfer to organization when you get permissions

### Solution 3: Organization Owner Creates Apps

**Best Option:** Have an organization owner create the apps:

1. Organization owner follows the migration guide
2. Shares the credentials with you
3. You configure them in Supabase and Vercel

---

## Alternative: Check Organization Settings Structure

Sometimes the URL structure varies. Try these:

### For OAuth Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/oauth_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/oauth_apps`

### For GitHub Apps:
- `https://github.com/organizations/OpenKPIs/settings/developers/github_apps`
- `https://github.com/organizations/OpenKPIs/settings/apps/github_apps`

### General Developer Settings:
- `https://github.com/organizations/OpenKPIs/settings/developers`
- `https://github.com/organizations/OpenKPIs/settings/profile` (then click Developer settings)

---

## Step-by-Step: Getting to Developer Settings

### Method 1: Via Organization Page

1. **Go to Organization:**
   ```
   https://github.com/OpenKPIs
   ```

2. **Click "Settings" Tab:**
   - Top navigation bar → "Settings"

3. **Find Developer Settings:**
   - Left sidebar → Scroll down
   - Look for "Developer settings" section
   - Click it

4. **Select App Type:**
   - For OAuth Apps: Click "OAuth Apps"
   - For GitHub Apps: Click "GitHub Apps"

### Method 2: Via Your Profile

1. **Click Your Profile Picture** (top-right)

2. **Select "Your organizations"**

3. **Click "OpenKPIs"**

4. **Click "Settings" Tab**

5. **Find "Developer settings" in left sidebar**

---

## What You Should See

If you have the right permissions, you should see:

**Left Sidebar in Organization Settings:**
```
Profile
People
Teams
...
Developer settings  ← This section
  OAuth Apps
  GitHub Apps
  Personal access tokens
```

---

## Quick Permission Check

Run this check:

1. ✅ Can you access: `https://github.com/organizations/OpenKPIs/settings/profile`?
   - If NO → You're not a member or not logged in
   - If YES → Continue

2. ✅ Do you see "Developer settings" in the left sidebar?
   - If NO → You need Owner/Admin permissions
   - If YES → You have access!

3. ✅ Can you click "Developer settings"?
   - If NO → Permission issue
   - If YES → You're good to go!

---

## Contact Organization Owner

If you can't get access, contact an organization owner and ask them to:

1. **Grant you Owner/Admin role**, OR
2. **Create the apps themselves** and share credentials

**Message Template:**
```
Hi! I need to create OAuth Apps and GitHub Apps for OpenKPIs organization 
to migrate from personal account to organization account. 

Could you either:
1. Grant me Owner/Admin permissions, OR
2. Create the apps and share the credentials?

I need to create:
- OAuth App for PROD
- OAuth App for DEV  
- GitHub App for PROD
- GitHub App for DEV

Thanks!
```

---

## Summary

**Problem:** Can't see Developer settings  
**Cause:** Insufficient permissions (need Owner/Admin)  
**Solutions:**
1. Get Owner/Admin permissions from organization owner
2. Have organization owner create the apps
3. Temporarily create under personal account (not recommended)

**Best Practice:** Organization apps should be created by organization owners/admins to maintain proper access control.





