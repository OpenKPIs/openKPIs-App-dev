-- ============================================
-- Complete RLS Policies for DEV Environment
-- ============================================
-- This script creates RLS policies for ALL dev_* tables
-- Run this in your DEV Supabase project SQL Editor
-- ============================================

-- ============================================
-- Helper Functions (for checking admin/editor roles)
-- ============================================

-- Function to check if user is admin or editor
CREATE OR REPLACE FUNCTION is_admin_or_editor()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM dev_user_profiles
    WHERE id = auth.uid()
    AND (
      user_role IN ('admin', 'editor')
      OR is_admin = true
      OR is_editor = true
    )
  );
END;
$$;

-- Function to get user identifiers (github_username or email)
CREATE OR REPLACE FUNCTION get_user_identifiers()
RETURNS TABLE(github_username TEXT, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(p.github_username, '')::TEXT,
    COALESCE(p.email, '')::TEXT
  FROM dev_user_profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- ============================================
-- Step 1: Enable RLS on all dev_* tables
-- ============================================
ALTER TABLE IF EXISTS dev_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_dashboard_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_dashboard_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_dashboard_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_analysis_basket ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dev_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 2: Drop existing policies (idempotent)
-- ============================================
-- Content Tables
DO $$ 
DECLARE
  table_name TEXT;
  policy_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT unnest(ARRAY['dev_kpis', 'dev_metrics', 'dev_dimensions', 'dev_events', 'dev_dashboards'])
  LOOP
    FOR policy_name IN 
      SELECT unnest(ARRAY[
        table_name || '_select_published',
        table_name || '_select_own',
        table_name || '_select_admin',
        table_name || '_insert_own',
        table_name || '_update_own_draft',
        table_name || '_update_admin',
        table_name || '_delete_own_draft',
        table_name || '_delete_admin'
      ])
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- Content Tables: SELECT Policies
-- ============================================

-- Policy: Public can read published content
CREATE POLICY "dev_kpis_select_published"
ON dev_kpis FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "dev_metrics_select_published"
ON dev_metrics FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "dev_dimensions_select_published"
ON dev_dimensions FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "dev_events_select_published"
ON dev_events FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "dev_dashboards_select_published"
ON dev_dashboards FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Policy: Users can read their own content (all statuses)
CREATE POLICY "dev_kpis_select_own"
ON dev_kpis FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_metrics_select_own"
ON dev_metrics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dimensions_select_own"
ON dev_dimensions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_events_select_own"
ON dev_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dashboards_select_own"
ON dev_dashboards FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

-- Policy: Admins/editors can read everything
CREATE POLICY "dev_kpis_select_admin"
ON dev_kpis FOR SELECT
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_metrics_select_admin"
ON dev_metrics FOR SELECT
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_dimensions_select_admin"
ON dev_dimensions FOR SELECT
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_events_select_admin"
ON dev_events FOR SELECT
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_dashboards_select_admin"
ON dev_dashboards FOR SELECT
TO authenticated
USING (is_admin_or_editor());

-- ============================================
-- Content Tables: INSERT Policies
-- ============================================

CREATE POLICY "dev_kpis_insert_own"
ON dev_kpis FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_metrics_insert_own"
ON dev_metrics FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dimensions_insert_own"
ON dev_dimensions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_events_insert_own"
ON dev_events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dashboards_insert_own"
ON dev_dashboards FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

-- ============================================
-- Content Tables: UPDATE Policies
-- ============================================

-- Users can update their own drafts
CREATE POLICY "dev_kpis_update_own_draft"
ON dev_kpis FOR UPDATE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
)
WITH CHECK (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_metrics_update_own_draft"
ON dev_metrics FOR UPDATE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
)
WITH CHECK (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dimensions_update_own_draft"
ON dev_dimensions FOR UPDATE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
)
WITH CHECK (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_events_update_own_draft"
ON dev_events FOR UPDATE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
)
WITH CHECK (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dashboards_update_own_draft"
ON dev_dashboards FOR UPDATE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
)
WITH CHECK (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

-- Admins/editors can update anything
CREATE POLICY "dev_kpis_update_admin"
ON dev_kpis FOR UPDATE
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

CREATE POLICY "dev_metrics_update_admin"
ON dev_metrics FOR UPDATE
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

CREATE POLICY "dev_dimensions_update_admin"
ON dev_dimensions FOR UPDATE
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

CREATE POLICY "dev_events_update_admin"
ON dev_events FOR UPDATE
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

CREATE POLICY "dev_dashboards_update_admin"
ON dev_dashboards FOR UPDATE
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

-- ============================================
-- Content Tables: DELETE Policies
-- ============================================

-- Users can delete their own drafts
CREATE POLICY "dev_kpis_delete_own_draft"
ON dev_kpis FOR DELETE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_metrics_delete_own_draft"
ON dev_metrics FOR DELETE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dimensions_delete_own_draft"
ON dev_dimensions FOR DELETE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_events_delete_own_draft"
ON dev_events FOR DELETE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

CREATE POLICY "dev_dashboards_delete_own_draft"
ON dev_dashboards FOR DELETE
TO authenticated
USING (
  status = 'draft' AND
  EXISTS (
    SELECT 1 FROM get_user_identifiers() ids
    WHERE created_by = ids.github_username OR created_by = ids.email
  )
);

-- Admins/editors can delete anything
CREATE POLICY "dev_kpis_delete_admin"
ON dev_kpis FOR DELETE
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_metrics_delete_admin"
ON dev_metrics FOR DELETE
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_dimensions_delete_admin"
ON dev_dimensions FOR DELETE
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_events_delete_admin"
ON dev_events FOR DELETE
TO authenticated
USING (is_admin_or_editor());

CREATE POLICY "dev_dashboards_delete_admin"
ON dev_dashboards FOR DELETE
TO authenticated
USING (is_admin_or_editor());

-- ============================================
-- User-Specific Tables (likes, user_analyses, etc.)
-- ============================================

-- dev_likes: Users can only access their own likes
CREATE POLICY "dev_likes_all_own"
ON dev_likes FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- dev_user_analyses: Users can only access their own analyses
CREATE POLICY "dev_user_analyses_all_own"
ON dev_user_analyses FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- dev_user_insights: Users can only access their own insights
CREATE POLICY "dev_user_insights_all_own"
ON dev_user_insights FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- dev_analysis_basket: Users can only access their own basket
CREATE POLICY "dev_analysis_basket_all_own"
ON dev_analysis_basket FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- Dashboard Mapping Tables
-- ============================================

-- These tables are visible if parent dashboard is visible
CREATE POLICY "dev_dashboard_kpis_select"
ON dev_dashboard_kpis FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM dev_dashboards d
    WHERE d.id = dev_dashboard_kpis.dashboard_id
    AND (
      d.status = 'published'
      OR EXISTS (
        SELECT 1 FROM get_user_identifiers() ids
        WHERE d.created_by = ids.github_username OR d.created_by = ids.email
      )
      OR is_admin_or_editor()
    )
  )
);

CREATE POLICY "dev_dashboard_metrics_select"
ON dev_dashboard_metrics FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM dev_dashboards d
    WHERE d.id = dev_dashboard_metrics.dashboard_id
    AND (
      d.status = 'published'
      OR EXISTS (
        SELECT 1 FROM get_user_identifiers() ids
        WHERE d.created_by = ids.github_username OR d.created_by = ids.email
      )
      OR is_admin_or_editor()
    )
  )
);

CREATE POLICY "dev_dashboard_events_select"
ON dev_dashboard_events FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM dev_dashboards d
    WHERE d.id = dev_dashboard_events.dashboard_id
    AND (
      d.status = 'published'
      OR EXISTS (
        SELECT 1 FROM get_user_identifiers() ids
        WHERE d.created_by = ids.github_username OR d.created_by = ids.email
      )
      OR is_admin_or_editor()
    )
  )
);

CREATE POLICY "dev_dashboard_dimensions_select"
ON dev_dashboard_dimensions FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM dev_dashboards d
    WHERE d.id = dev_dashboard_dimensions.dashboard_id
    AND (
      d.status = 'published'
      OR EXISTS (
        SELECT 1 FROM get_user_identifiers() ids
        WHERE d.created_by = ids.github_username OR d.created_by = ids.email
      )
      OR is_admin_or_editor()
    )
  )
);

-- ============================================
-- Contributor Tables
-- ============================================

-- dev_contributors: Public read, admin/editor write
CREATE POLICY "dev_contributors_select_public"
ON dev_contributors FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "dev_contributors_all_admin"
ON dev_contributors FOR ALL
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

-- dev_contributions: Public read, admin/editor write
CREATE POLICY "dev_contributions_select_public"
ON dev_contributions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "dev_contributions_all_admin"
ON dev_contributions FOR ALL
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

-- ============================================
-- Profile Table (dev_user_profiles)
-- ============================================

-- Users can read their own profile
CREATE POLICY "dev_user_profiles_select_own"
ON dev_user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "dev_user_profiles_select_admin"
ON dev_user_profiles FOR SELECT
TO authenticated
USING (is_admin_or_editor());

-- Users can create their own profile
CREATE POLICY "dev_user_profiles_insert_own"
ON dev_user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Users can update their own profile (but cannot change role fields)
CREATE POLICY "dev_user_profiles_update_own"
ON dev_user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND user_role IS NOT DISTINCT FROM (SELECT user_role FROM dev_user_profiles WHERE id = auth.uid())
  AND is_admin IS NOT DISTINCT FROM (SELECT is_admin FROM dev_user_profiles WHERE id = auth.uid())
  AND is_editor IS NOT DISTINCT FROM (SELECT is_editor FROM dev_user_profiles WHERE id = auth.uid())
);

-- Admins can update any profile
CREATE POLICY "dev_user_profiles_update_admin"
ON dev_user_profiles FOR UPDATE
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

-- ============================================
-- Audit Log
-- ============================================

-- dev_audit_log: Admin/editor only
CREATE POLICY "dev_audit_log_all_admin"
ON dev_audit_log FOR ALL
TO authenticated
USING (is_admin_or_editor())
WITH CHECK (is_admin_or_editor());

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify policies were created:
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename LIKE 'dev_%'
-- GROUP BY tablename
-- ORDER BY tablename;






