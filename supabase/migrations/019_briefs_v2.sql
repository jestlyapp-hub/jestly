-- 019_briefs_v2.sql — Refonte briefs: product_briefs (M:N), snapshots commandes

-- 1. product_briefs (many-to-many: produit <-> brief_template)
CREATE TABLE IF NOT EXISTS product_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  brief_template_id uuid NOT NULL REFERENCES brief_templates(id) ON DELETE CASCADE,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(owner_id, product_id, brief_template_id)
);

ALTER TABLE product_briefs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "pb_select" ON product_briefs FOR SELECT
    USING (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "pb_insert" ON product_briefs FOR INSERT
    WITH CHECK (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "pb_update" ON product_briefs FOR UPDATE
    USING (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "pb_delete" ON product_briefs FOR DELETE
    USING (owner_id = auth.uid());
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_briefs_product ON product_briefs(product_id);

-- 2. Add snapshot columns to order_brief_responses
ALTER TABLE order_brief_responses ADD COLUMN IF NOT EXISTS brief_name text;
ALTER TABLE order_brief_responses ADD COLUMN IF NOT EXISTS pinned jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE order_brief_responses ADD COLUMN IF NOT EXISTS fields_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 3. Add mime_type to order_files + field_key alias
ALTER TABLE order_files ADD COLUMN IF NOT EXISTS mime_type text;
-- Rename field_id -> field_key for consistency (keep both for compat)
ALTER TABLE order_files ADD COLUMN IF NOT EXISTS field_key text;
-- Backfill field_key from field_id
UPDATE order_files SET field_key = field_id WHERE field_key IS NULL;

-- 4. Reload schema cache
NOTIFY pgrst, 'reload schema';
