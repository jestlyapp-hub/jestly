-- ============================================================
-- 029 — Projects V3 Enhancements
-- Brief integration + portfolio fields
-- ============================================================

-- Add brief_template_id to projects
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='brief_template_id') THEN
    ALTER TABLE projects ADD COLUMN brief_template_id uuid;
  END IF;
END $$;

-- Add portfolio_images to projects (curated gallery for public portfolio)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='portfolio_images') THEN
    ALTER TABLE projects ADD COLUMN portfolio_images text[] DEFAULT '{}';
  END IF;
END $$;

-- Add portfolio_category for portfolio filtering
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='portfolio_category') THEN
    ALTER TABLE projects ADD COLUMN portfolio_category text DEFAULT '';
  END IF;
END $$;

-- Add portfolio_external_url for case study links
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='portfolio_external_url') THEN
    ALTER TABLE projects ADD COLUMN portfolio_external_url text;
  END IF;
END $$;

-- Add share_enabled boolean for explicit sharing control
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='share_enabled') THEN
    ALTER TABLE projects ADD COLUMN share_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Create Supabase Storage bucket for project assets (manual step if needed)
-- Bucket name: project-assets
-- This is handled via the upload API route with admin client
