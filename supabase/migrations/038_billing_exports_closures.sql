-- ============================================================
-- 038 — Billing Exports enrichis + Clôtures de périodes
-- ============================================================

-- ── Enrichir billing_exports ──
ALTER TABLE billing_exports
  ADD COLUMN IF NOT EXISTS total_tva    NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS filename     TEXT,
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed','failed','archived')),
  ADD COLUMN IF NOT EXISTS client_ids   UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS client_count INT NOT NULL DEFAULT 0;

-- Update policy pour permettre les mises à jour
DROP POLICY IF EXISTS billing_exports_update ON billing_exports;
CREATE POLICY billing_exports_update ON billing_exports FOR UPDATE USING (user_id = auth.uid());

-- RLS sur billing_export_items
ALTER TABLE billing_export_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_export_items_select ON billing_export_items;
DROP POLICY IF EXISTS billing_export_items_insert ON billing_export_items;
DROP POLICY IF EXISTS billing_export_items_delete ON billing_export_items;
CREATE POLICY billing_export_items_select ON billing_export_items FOR SELECT
  USING (export_id IN (SELECT id FROM billing_exports WHERE user_id = auth.uid()));
CREATE POLICY billing_export_items_insert ON billing_export_items FOR INSERT
  WITH CHECK (export_id IN (SELECT id FROM billing_exports WHERE user_id = auth.uid()));
CREATE POLICY billing_export_items_delete ON billing_export_items FOR DELETE
  USING (export_id IN (SELECT id FROM billing_exports WHERE user_id = auth.uid()));

-- Index sur période exports
CREATE INDEX IF NOT EXISTS idx_billing_exports_period ON billing_exports(user_id, period_start, period_end);

-- ── Clôtures de périodes ──
CREATE TABLE IF NOT EXISTS billing_period_closures (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Période clôturée
  period_year  INT NOT NULL,
  period_month INT NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
  period_label TEXT NOT NULL, -- "mars 2026"

  -- Snapshot des totaux au moment de la clôture
  total_ht     NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_tva    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_ttc    NUMERIC(12,2) NOT NULL DEFAULT 0,
  item_count   INT NOT NULL DEFAULT 0,
  client_count INT NOT NULL DEFAULT 0,

  -- Détail par statut au moment de la clôture
  snapshot     JSONB NOT NULL DEFAULT '{}',
  -- {
  --   drafts: 0, to_validate: 0, validated: 0, ready: 0,
  --   exported: 5, invoiced: 3, cancelled: 0,
  --   health_score: 92,
  --   anomaly_count: 1,
  --   top_clients: [{ id, name, total_ht }],
  --   categories: [{ name, total_ht }],
  --   export_ids: ["uuid1", "uuid2"]
  -- }

  -- Statut de la clôture
  status       TEXT NOT NULL DEFAULT 'closed'
               CHECK (status IN ('closed','reopened')),

  closed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reopened_at  TIMESTAMPTZ,
  notes        TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Un seul enregistrement par user+mois
  UNIQUE(user_id, period_year, period_month)
);

CREATE INDEX IF NOT EXISTS idx_billing_closures_user   ON billing_period_closures(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_closures_period ON billing_period_closures(user_id, period_year DESC, period_month DESC);

-- RLS
ALTER TABLE billing_period_closures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS billing_closures_select ON billing_period_closures;
DROP POLICY IF EXISTS billing_closures_insert ON billing_period_closures;
DROP POLICY IF EXISTS billing_closures_update ON billing_period_closures;
DROP POLICY IF EXISTS billing_closures_delete ON billing_period_closures;
CREATE POLICY billing_closures_select ON billing_period_closures FOR SELECT USING (user_id = auth.uid());
CREATE POLICY billing_closures_insert ON billing_period_closures FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY billing_closures_update ON billing_period_closures FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY billing_closures_delete ON billing_period_closures FOR DELETE USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION fn_billing_closures_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_billing_closures_updated ON billing_period_closures;
CREATE TRIGGER trg_billing_closures_updated BEFORE UPDATE ON billing_period_closures
FOR EACH ROW EXECUTE FUNCTION fn_billing_closures_updated_at();
