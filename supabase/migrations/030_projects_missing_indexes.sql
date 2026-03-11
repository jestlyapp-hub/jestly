-- ============================================================
-- 030 — Projects: add missing indexes for performance
-- Safe to run on existing databases (IF NOT EXISTS guards)
-- ============================================================

-- Sorting: default list ordered by updated_at DESC
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Public share page: lookup by token
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token) WHERE share_token IS NOT NULL;

-- Public portfolio API: filter by user + is_portfolio
CREATE INDEX IF NOT EXISTS idx_projects_portfolio ON projects(user_id, is_portfolio) WHERE is_portfolio = true;
