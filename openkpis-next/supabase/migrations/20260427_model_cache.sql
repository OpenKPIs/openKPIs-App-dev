-- ==============================================================================
-- OpenKPIs Global Model Cache Schema Update
-- ==============================================================================

-- 1. Create dev_model_cache
CREATE TABLE IF NOT EXISTS dev_model_cache (
    provider text PRIMARY KEY,
    models jsonb NOT NULL,
    last_updated timestamptz DEFAULT now()
);

-- 2. Create prod_model_cache (Optional, if using prod prefix)
CREATE TABLE IF NOT EXISTS prod_model_cache (
    provider text PRIMARY KEY,
    models jsonb NOT NULL,
    last_updated timestamptz DEFAULT now()
);
