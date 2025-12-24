# RLS Architecture & Security - Enterprise Compliance

## Critical Security Issue Identified

**Current Problem:** Public content pages are using `createAdminClient()` (service role key) which **bypasses all RLS policies**. This is a **security anti-pattern**.

## Why This Is Wrong

### Service Role Key Should NEVER Be Used For Public Pages

1. **Bypasses All Security:**
   - Service role key ignores ALL RLS policies
   - Anyone accessing the page can see ALL data (including drafts)
   - Security relies entirely on application-level checks (which can have bugs)

2. **Violates Defense in Depth:**
   - Security should be enforced at the database level (RLS)
   - Application-level checks are a secondary layer, not primary

3. **Enterprise Risk:**
   - If visibility check has a bug → all data exposed
   - If RLS is disabled → no protection at all
   - Service role key in client code → potential key exposure

## Correct Enterprise Architecture

### ✅ Use Anon Key for Public Content

**All public content pages should use `createClient()` (anon key):**

```typescript
// ✅ CORRECT - Respects RLS
const supabase = await createClient();
const kpi = await fetchKpiBySlug(supabase, slug);
```

**RLS policies handle filtering:**
- Published content: Visible to everyone
- Draft content: Only visible to owner
- Admin/Editor: Can see all (via RLS policy)

### ❌ Never Use Service Role for Public Pages

```typescript
// ❌ WRONG - Bypasses RLS
const admin = createAdminClient();
const kpi = await fetchKpiBySlug(admin, slug);
```

## When to Use Service Role Key

**Only use `createAdminClient()` for:**

1. **Admin Operations:**
   - Editor review page (admin-only)
   - Background jobs
   - Data migrations

2. **Internal APIs:**
   - Admin-only endpoints
   - System operations

3. **Never for:**
   - Public content pages
   - User-facing features
   - Any page accessible to non-admins

## Required RLS Policies

For this architecture to work, you need RLS policies that:

```sql
-- Allow public read of published content
CREATE POLICY prod_kpis_select_published
ON prod_kpis
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Allow owners to see their own drafts
CREATE POLICY prod_kpis_select_own
ON prod_kpis
FOR SELECT
TO authenticated
USING (
  status = 'published' OR
  created_by = auth.jwt() ->> 'email' OR
  created_by = (SELECT github_username FROM prod_user_profiles WHERE id = auth.uid())
);

-- Allow admins/editors to see all
CREATE POLICY prod_kpis_select_admin
ON prod_kpis
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM prod_user_profiles
    WHERE id = auth.uid()
    AND (user_role IN ('admin', 'editor') OR is_admin = true OR is_editor = true)
  )
);
```

## Migration Plan

1. **Fix all detail pages** to use `createClient()` instead of `createAdminClient()`
2. **Verify RLS policies** are correctly configured
3. **Test that:**
   - Published content is visible to everyone
   - Draft content is only visible to owners
   - Admins can see all content
4. **Remove service role key** from all public page code

## Security Benefits

After migration:

✅ **Database-level security** (RLS) as primary defense  
✅ **Application-level checks** as secondary validation  
✅ **No service role key** in public-facing code  
✅ **Defense in depth** architecture  
✅ **Enterprise-grade security** compliance

## References

- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Defense in Depth](https://owasp.org/www-community/Defense_in_depth)
- [Principle of Least Privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege)










