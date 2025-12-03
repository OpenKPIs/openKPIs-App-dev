# Supabase API Keys - Clarification

## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.


## Current Code Approach: ✅ **Publishable and Secret Keys** (NEW)

The code uses the **new Supabase API key naming**:

### What the Code Uses:

1. **For Regular Client (with RLS):**
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ← Replaces old `anon` key
   - Used in: `lib/supabase/client.ts`, `lib/supabase/server.ts` (createClient)

2. **For Admin Client (bypasses RLS):**
   - `SUPABASE_SECRET_KEY` ← Replaces old `service_role` key
   - Used in: `lib/supabase/server.ts` (createAdminClient)

### Key Mapping:

| Old Name | New Name | What It Does |
|----------|----------|--------------|
| `anon` key | `publishable` key | Public key, respects RLS, safe for client-side |
| `service_role` key | `secret` key | Private key, bypasses RLS, server-side only |

**Important:** The keys are functionally identical - Supabase just renamed them. The `secret` key is the same as the old `service_role` key.

---

## What You Need in Vercel:

### Required Environment Variables:

```bash
# Public key (for client-side and regular server operations)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>

# Secret key (for admin operations that bypass RLS)
SUPABASE_SECRET_KEY=<secret-key>
```

### Where to Get These in Supabase:

1. **Go to Supabase Dashboard:**
   - Settings → API

2. **You'll see:**
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** → Use for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** → Use for `SUPABASE_SECRET_KEY`

**Note:** If your Supabase project still shows "anon" and "service_role" instead of "publishable" and "secret":
- **"anon" key** → Use as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **"service_role" key** → Use as `SUPABASE_SECRET_KEY`

They're the same keys, just different names.

---

## Why Pages Are Failing:

The pages use `createAdminClient()` which requires `SUPABASE_SECRET_KEY`.

**In `lib/supabase/server.ts`:**
```typescript
export function createAdminClient() {
  const config = getSupabaseServerConfig(false); // Uses SUPABASE_SECRET_KEY
  // ...
}
```

**If `SUPABASE_SECRET_KEY` is missing or wrong:**
- `createAdminClient()` throws error
- Pages crash with "Something went wrong"

---

## Verification Checklist:

### ✅ Check in Supabase Dashboard:
- [ ] Go to Settings → API
- [ ] Note which keys you see:
  - If you see **"publishable"** and **"secret"** → Use those names
  - If you see **"anon"** and **"service_role"** → Use those values but with new variable names

### ✅ Check in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set
  - Value = "publishable" key (or "anon" key if that's what Supabase shows)
- [ ] `SUPABASE_SECRET_KEY` is set
  - Value = "secret" key (or "service_role" key if that's what Supabase shows)
- [ ] Both are set for **Production** environment

### ✅ Verify the Secret Key:
The `SUPABASE_SECRET_KEY` should:
- Start with `sb_secret_...` (Supabase secret key format)
- Be the **longer** of the two keys (secret keys are longer than publishable keys)
- Be labeled as **"secret"** or **"service_role"** in Supabase
- **NOT** be the publishable/anon key

---

## Common Confusion:

### ❌ Wrong Understanding:
- "Secret_rol (anon)" - This mixes up the concepts
- `anon` and `publishable` are the same thing (public keys)
- `service_role` and `secret` are the same thing (private keys)

### ✅ Correct Understanding:
- **Public Keys** (safe for client-side):
  - Old name: `anon` key
  - New name: `publishable` key
  - Variable: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

- **Private Keys** (server-side only, bypasses RLS):
  - Old name: `service_role` key
  - New name: `secret` key
  - Variable: `SUPABASE_SECRET_KEY`

---

## Quick Fix:

1. **Get Secret Key from Supabase:**
   - Dashboard → Settings → API
   - Copy the **"secret"** key (or **"service_role"** if that's what it's called)

2. **Add to Vercel:**
   - Key: `SUPABASE_SECRET_KEY`
   - Value: The secret/service_role key from Supabase
   - Environment: Production

3. **Redeploy**

---

## Summary:

**Code Uses:** ✅ Publishable and Secret keys (NEW approach)

**What You Need:**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key (or anon if that's what Supabase shows)
- `SUPABASE_SECRET_KEY` = secret key (or service_role if that's what Supabase shows)

**The Issue:** `SUPABASE_SECRET_KEY` is likely missing or incorrect in Vercel, causing `createAdminClient()` to fail.

