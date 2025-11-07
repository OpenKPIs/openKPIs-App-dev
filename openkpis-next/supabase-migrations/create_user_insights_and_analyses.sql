-- ============================================
-- User Insights Table
-- Stores AI-generated insights saved by users
-- ============================================
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Insight Details
  insight_id TEXT NOT NULL, -- Original AI-generated insight ID
  group_name TEXT, -- Acquisition, Engagement, Conversion, Monetization, Retention
  title TEXT NOT NULL,
  rationale TEXT,
  data_requirements JSONB, -- Array of data requirements
  chart_hint TEXT,
  signal_strength TEXT, -- low, medium, high
  
  -- Full insight data as JSONB for flexibility
  insight_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, insight_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_group ON user_insights(group_name);
CREATE INDEX IF NOT EXISTS idx_user_insights_created ON user_insights(created_at DESC);

-- ============================================
-- User Analyses Table
-- Stores complete AI analysis sessions for users
-- ============================================
CREATE TABLE IF NOT EXISTS user_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Analysis Metadata
  title TEXT, -- User-defined title (optional)
  requirements TEXT, -- Original business requirements
  analytics_solution TEXT, -- Google Analytics (GA4), Adobe Analytics, etc.
  platforms TEXT[], -- Web, Mobile, Cross-Device, Omnichannel
  
  -- AI Expanded Requirements (JSONB)
  ai_expanded JSONB,
  
  -- Selected Items (references to analysis_basket or stored as JSONB)
  selected_items JSONB, -- { kpis: [], metrics: [], dimensions: [] }
  
  -- Selected Insights (array of insight IDs)
  selected_insights TEXT[],
  
  -- Dashboards (array of dashboard IDs)
  dashboard_ids UUID[],
  
  -- Full analysis data for easy retrieval
  analysis_data JSONB, -- Complete snapshot of the analysis
  
  -- Status
  status TEXT DEFAULT 'active', -- active, archived
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  
  -- User can have multiple analyses
  -- No unique constraint needed
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_analyses_user_id ON user_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_status ON user_analyses(status);
CREATE INDEX IF NOT EXISTS idx_user_analyses_created ON user_analyses(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view their own insights" ON user_insights;
DROP POLICY IF EXISTS "Users can insert their own insights" ON user_insights;
DROP POLICY IF EXISTS "Users can update their own insights" ON user_insights;
DROP POLICY IF EXISTS "Users can delete their own insights" ON user_insights;
DROP POLICY IF EXISTS "Users can view their own analyses" ON user_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON user_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON user_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON user_analyses;

-- Users can only see their own insights
CREATE POLICY "Users can view their own insights"
  ON user_insights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own insights
CREATE POLICY "Users can insert their own insights"
  ON user_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own insights
CREATE POLICY "Users can update their own insights"
  ON user_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own insights
CREATE POLICY "Users can delete their own insights"
  ON user_insights
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can only see their own analyses
CREATE POLICY "Users can view their own analyses"
  ON user_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert their own analyses"
  ON user_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses
CREATE POLICY "Users can update their own analyses"
  ON user_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own analyses
CREATE POLICY "Users can delete their own analyses"
  ON user_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

