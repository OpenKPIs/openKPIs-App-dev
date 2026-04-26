-- ==============================================================================
-- OpenKPIs Workspace: Tracking Plans
-- ==============================================================================
-- This script creates the Tracking Plans table to support the unified
-- Workspace / My Projects dashboard.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS dev_tracking_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  name text NOT NULL,
  description text,
  items jsonb DEFAULT '[]'::jsonb,
  custom_fields jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE dev_tracking_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tracking plans"
  ON dev_tracking_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracking plans"
  ON dev_tracking_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking plans"
  ON dev_tracking_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracking plans"
  ON dev_tracking_plans FOR DELETE
  USING (auth.uid() = user_id);
