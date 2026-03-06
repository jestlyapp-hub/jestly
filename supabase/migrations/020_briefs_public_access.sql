-- 020_briefs_public_access.sql
-- Allow anonymous (public) read access for brief resolution at checkout

-- brief_templates: allow public SELECT (needed for checkout brief rendering)
DO $$ BEGIN
  CREATE POLICY "brief_templates_public_select" ON brief_templates FOR SELECT
    TO anon
    USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- product_briefs: allow public SELECT (needed to resolve product → brief link)
DO $$ BEGIN
  CREATE POLICY "pb_public_select" ON product_briefs FOR SELECT
    TO anon
    USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
