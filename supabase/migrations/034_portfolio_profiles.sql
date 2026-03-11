-- ══════════════════════════════════════════════════════════
-- 034 — Enrich project portfolio fields for site builder
-- Adds display fields so blocks can consume polished data
-- ══════════════════════════════════════════════════════════

-- Add portfolio display fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_display_title text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_subtitle text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_result text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_summary text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_cover_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_cover_item_id uuid REFERENCES project_items(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_slug text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_cta_label text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_cta_url text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_featured boolean NOT NULL DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_display_order int NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_visibility text NOT NULL DEFAULT 'draft' CHECK (portfolio_visibility IN ('draft', 'public'));

-- Index for efficient portfolio queries
CREATE INDEX IF NOT EXISTS idx_projects_portfolio_v2
  ON projects (user_id, portfolio_visibility, portfolio_display_order)
  WHERE is_portfolio = true;

-- Unique slug per user for future /projets/slug pages
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_portfolio_slug
  ON projects (user_id, portfolio_slug)
  WHERE portfolio_slug IS NOT NULL;
