-- ══════════════════════════════════════════════════════════
-- 035 — Portfolio case study page fields
-- Adds content sections + gallery + SEO for public pages
-- ══════════════════════════════════════════════════════════

-- Content sections
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_intro_text text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_challenge_text text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_solution_text text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_result_text text;

-- Gallery: ordered list of project_items IDs to show publicly
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_gallery_item_ids uuid[] NOT NULL DEFAULT '{}';

-- SEO
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_seo_title text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS portfolio_seo_description text;
