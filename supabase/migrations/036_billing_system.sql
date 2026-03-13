-- ============================================================
-- 036 — Billing System: Lignes facturables + Exports
-- ============================================================

-- ── Billing items (lignes facturables) ──
CREATE TABLE IF NOT EXISTS billing_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,

  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,                       -- type de prestation libre
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit        TEXT DEFAULT 'unité',       -- unité, heure, jour, forfait, lot
  unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total       NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  currency    TEXT NOT NULL DEFAULT 'EUR',
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 0,  -- ex: 20.00 for 20% TVA
  tax_amount  NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price * tax_rate / 100) STORED,
  total_ttc   NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price * (1 + tax_rate / 100)) STORED,

  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft','to_validate','validated','ready','exported','invoiced','cancelled')),

  performed_at DATE,                     -- date de réalisation
  delivered_at DATE,                     -- date de livraison
  period_start DATE,                     -- début période couverte
  period_end   DATE,                     -- fin période couverte

  source      TEXT DEFAULT 'manual'
              CHECK (source IN ('manual','order','task','template','recurring')),

  tags        TEXT[] DEFAULT '{}',
  notes       TEXT,
  recurring   BOOLEAN NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_items_user    ON billing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_items_client  ON billing_items(client_id);
CREATE INDEX IF NOT EXISTS idx_billing_items_status  ON billing_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_items_period  ON billing_items(user_id, performed_at);

-- RLS
ALTER TABLE billing_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_items_select ON billing_items;
DROP POLICY IF EXISTS billing_items_insert ON billing_items;
DROP POLICY IF EXISTS billing_items_update ON billing_items;
DROP POLICY IF EXISTS billing_items_delete ON billing_items;
CREATE POLICY billing_items_select ON billing_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY billing_items_insert ON billing_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY billing_items_update ON billing_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY billing_items_delete ON billing_items FOR DELETE USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION fn_billing_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_billing_items_updated ON billing_items;
CREATE TRIGGER trg_billing_items_updated BEFORE UPDATE ON billing_items
FOR EACH ROW EXECUTE FUNCTION fn_billing_items_updated_at();

-- ── Billing exports ──
CREATE TABLE IF NOT EXISTS billing_exports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       TEXT,
  format      TEXT NOT NULL DEFAULT 'pdf'
              CHECK (format IN ('pdf','csv','excel','json')),
  period_start DATE,
  period_end   DATE,
  total_ht    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc   NUMERIC(12,2) NOT NULL DEFAULT 0,
  item_count  INT NOT NULL DEFAULT 0,
  file_url    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_exports_user ON billing_exports(user_id);

ALTER TABLE billing_exports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_exports_select ON billing_exports;
DROP POLICY IF EXISTS billing_exports_insert ON billing_exports;
DROP POLICY IF EXISTS billing_exports_delete ON billing_exports;
CREATE POLICY billing_exports_select ON billing_exports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY billing_exports_insert ON billing_exports FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY billing_exports_delete ON billing_exports FOR DELETE USING (user_id = auth.uid());

-- ── Junction: export <-> items ──
CREATE TABLE IF NOT EXISTS billing_export_items (
  export_id UUID NOT NULL REFERENCES billing_exports(id) ON DELETE CASCADE,
  item_id   UUID NOT NULL REFERENCES billing_items(id) ON DELETE CASCADE,
  PRIMARY KEY (export_id, item_id)
);

-- ── Billing templates (prestations types réutilisables) ──
CREATE TABLE IF NOT EXISTS billing_templates (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  unit        TEXT DEFAULT 'unité',
  unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'EUR',
  tax_rate    NUMERIC(5,2) NOT NULL DEFAULT 0,
  tags        TEXT[] DEFAULT '{}',
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_templates_user ON billing_templates(user_id);

ALTER TABLE billing_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_templates_select ON billing_templates;
DROP POLICY IF EXISTS billing_templates_insert ON billing_templates;
DROP POLICY IF EXISTS billing_templates_update ON billing_templates;
DROP POLICY IF EXISTS billing_templates_delete ON billing_templates;
CREATE POLICY billing_templates_select ON billing_templates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY billing_templates_insert ON billing_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY billing_templates_update ON billing_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY billing_templates_delete ON billing_templates FOR DELETE USING (user_id = auth.uid());
