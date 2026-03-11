-- ============================================================
-- 028 — Projects System V2
-- Full creative project management for freelancers
-- ============================================================

-- ─── Projects table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text DEFAULT '',
  project_type  text NOT NULL DEFAULT 'custom',
  color         text NOT NULL DEFAULT '#4F46E5',
  status        text NOT NULL DEFAULT 'draft',
  budget        numeric(12,2) DEFAULT 0,
  currency      text DEFAULT 'EUR',
  tags          text[] DEFAULT '{}',
  cover_url     text,
  client_id     uuid REFERENCES clients(id) ON DELETE SET NULL,
  product_id    uuid REFERENCES services(id) ON DELETE SET NULL,
  order_id      uuid REFERENCES orders(id) ON DELETE SET NULL,
  is_portfolio  boolean DEFAULT false,
  portfolio_description text,
  share_token   text UNIQUE,
  deadline      timestamptz,
  start_date    timestamptz,
  priority      text DEFAULT 'normal',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_share_token ON projects(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_portfolio ON projects(user_id, is_portfolio) WHERE is_portfolio = true;

-- ─── Project Folders ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_folders (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id     uuid REFERENCES project_folders(id) ON DELETE CASCADE,
  name          text NOT NULL,
  color         text DEFAULT '#8A8A88',
  position      integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_folders_project ON project_folders(project_id);

-- ─── Project Items (files, links, notes, images, videos) ───
CREATE TABLE IF NOT EXISTS project_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  folder_id     uuid REFERENCES project_folders(id) ON DELETE SET NULL,
  item_type     text NOT NULL DEFAULT 'note',
  title         text NOT NULL DEFAULT '',
  description   text DEFAULT '',
  content       text DEFAULT '',
  url           text,
  file_path     text,
  file_size     bigint,
  mime_type     text,
  thumbnail_url text,
  tags          text[] DEFAULT '{}',
  metadata      jsonb DEFAULT '{}',
  position      integer DEFAULT 0,
  is_pinned     boolean DEFAULT false,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id);
CREATE INDEX IF NOT EXISTS idx_project_items_folder ON project_items(folder_id);
CREATE INDEX IF NOT EXISTS idx_project_items_type ON project_items(item_type);

-- ─── RLS Policies ───────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;

-- Projects: user owns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='projects_select') THEN
    CREATE POLICY projects_select ON projects FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='projects_insert') THEN
    CREATE POLICY projects_insert ON projects FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='projects_update') THEN
    CREATE POLICY projects_update ON projects FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='projects' AND policyname='projects_delete') THEN
    CREATE POLICY projects_delete ON projects FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- Folders: user owns parent project
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_folders' AND policyname='project_folders_select') THEN
    CREATE POLICY project_folders_select ON project_folders FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_folders.project_id AND projects.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_folders' AND policyname='project_folders_insert') THEN
    CREATE POLICY project_folders_insert ON project_folders FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_folders.project_id AND projects.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_folders' AND policyname='project_folders_update') THEN
    CREATE POLICY project_folders_update ON project_folders FOR UPDATE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_folders.project_id AND projects.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_folders' AND policyname='project_folders_delete') THEN
    CREATE POLICY project_folders_delete ON project_folders FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_folders.project_id AND projects.user_id = auth.uid()));
  END IF;
END $$;

-- Items: user owns parent project
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_items' AND policyname='project_items_select') THEN
    CREATE POLICY project_items_select ON project_items FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_items' AND policyname='project_items_insert') THEN
    CREATE POLICY project_items_insert ON project_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_items' AND policyname='project_items_update') THEN
    CREATE POLICY project_items_update ON project_items FOR UPDATE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='project_items' AND policyname='project_items_delete') THEN
    CREATE POLICY project_items_delete ON project_items FOR DELETE USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid()));
  END IF;
END $$;

-- ─── Updated_at trigger ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'projects_updated_at') THEN
    CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'project_items_updated_at') THEN
    CREATE TRIGGER project_items_updated_at BEFORE UPDATE ON project_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
