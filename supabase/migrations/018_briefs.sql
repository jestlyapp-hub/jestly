-- 018_briefs.sql — Brief templates & responses system

-- 1. brief_templates
CREATE TABLE IF NOT EXISTS brief_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  version int NOT NULL DEFAULT 1,
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. product_brief_settings (1:1 with services)
CREATE TABLE IF NOT EXISTS product_brief_settings (
  product_id uuid PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  template_id uuid REFERENCES brief_templates(id) ON DELETE SET NULL,
  is_required boolean NOT NULL DEFAULT true,
  locked_version int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. order_brief_responses (1:1 with orders)
CREATE TABLE IF NOT EXISTS order_brief_responses (
  order_id uuid PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  template_id uuid REFERENCES brief_templates(id),
  template_version int NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. order_files
CREATE TABLE IF NOT EXISTS order_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  field_id text NOT NULL,
  file_url text NOT NULL,
  file_name text,
  file_size int,
  created_at timestamptz DEFAULT now()
);

-- ═══ RLS ═══

ALTER TABLE brief_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_brief_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_brief_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;

-- brief_templates: owner_id = auth.uid()
CREATE POLICY "brief_templates_select" ON brief_templates FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "brief_templates_insert" ON brief_templates FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "brief_templates_update" ON brief_templates FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "brief_templates_delete" ON brief_templates FOR DELETE USING (owner_id = auth.uid());

-- product_brief_settings: via join services.user_id = auth.uid()
CREATE POLICY "pbs_select" ON product_brief_settings FOR SELECT
  USING (EXISTS (SELECT 1 FROM services WHERE services.id = product_id AND services.user_id = auth.uid()));
CREATE POLICY "pbs_insert" ON product_brief_settings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM services WHERE services.id = product_id AND services.user_id = auth.uid()));
CREATE POLICY "pbs_update" ON product_brief_settings FOR UPDATE
  USING (EXISTS (SELECT 1 FROM services WHERE services.id = product_id AND services.user_id = auth.uid()));
CREATE POLICY "pbs_delete" ON product_brief_settings FOR DELETE
  USING (EXISTS (SELECT 1 FROM services WHERE services.id = product_id AND services.user_id = auth.uid()));

-- order_brief_responses: via join orders.user_id = auth.uid()
CREATE POLICY "obr_select" ON order_brief_responses FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));
CREATE POLICY "obr_insert" ON order_brief_responses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));
CREATE POLICY "obr_update" ON order_brief_responses FOR UPDATE
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- order_files: via join orders.user_id = auth.uid()
CREATE POLICY "of_select" ON order_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));
CREATE POLICY "of_insert" ON order_files FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.user_id = auth.uid()));

-- ═══ Triggers updated_at ═══

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_brief_templates_updated_at
  BEFORE UPDATE ON brief_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_brief_settings_updated_at
  BEFORE UPDATE ON product_brief_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_brief_responses_updated_at
  BEFORE UPDATE ON order_brief_responses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══ Storage bucket ═══

INSERT INTO storage.buckets (id, name, public)
VALUES ('order-uploads', 'order-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "order_uploads_insert" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-uploads');

-- Allow public read
CREATE POLICY "order_uploads_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'order-uploads');
