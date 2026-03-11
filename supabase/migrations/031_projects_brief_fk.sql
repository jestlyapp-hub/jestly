-- ============================================================
-- 031 — Fix missing FK: projects.brief_template_id → brief_templates
-- Without this FK, PostgREST cannot resolve the join and returns PGRST200
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_projects_brief_template' AND table_name = 'projects'
  ) THEN
    ALTER TABLE projects
      ADD CONSTRAINT fk_projects_brief_template
      FOREIGN KEY (brief_template_id) REFERENCES brief_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
