-- ============================================================
-- 037 — Billing: Templates enrichis + Recurring Profiles
-- ============================================================

-- ── Enrich billing_templates ──
ALTER TABLE billing_templates
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ── Recurring billing profiles ──
CREATE TABLE IF NOT EXISTS recurring_billing_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  template_id   UUID REFERENCES billing_templates(id) ON DELETE SET NULL,

  -- Config (can override template or be standalone)
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  quantity      NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit          TEXT DEFAULT 'forfait',
  unit_price    NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  tax_rate      NUMERIC(5,2) NOT NULL DEFAULT 0,
  tags          TEXT[] DEFAULT '{}',

  -- Schedule
  frequency     TEXT NOT NULL DEFAULT 'monthly'
                CHECK (frequency IN ('monthly')),
  gen_day       INT NOT NULL DEFAULT 1
                CHECK (gen_day >= 1 AND gen_day <= 28),
  auto_generate BOOLEAN NOT NULL DEFAULT FALSE,

  -- Lifecycle
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','paused','ended')),
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date      DATE,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recurring_profiles_user   ON recurring_billing_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_profiles_client ON recurring_billing_profiles(client_id);
CREATE INDEX IF NOT EXISTS idx_recurring_profiles_status ON recurring_billing_profiles(user_id, status);

ALTER TABLE recurring_billing_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS recurring_profiles_select ON recurring_billing_profiles;
DROP POLICY IF EXISTS recurring_profiles_insert ON recurring_billing_profiles;
DROP POLICY IF EXISTS recurring_profiles_update ON recurring_billing_profiles;
DROP POLICY IF EXISTS recurring_profiles_delete ON recurring_billing_profiles;
CREATE POLICY recurring_profiles_select ON recurring_billing_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY recurring_profiles_insert ON recurring_billing_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY recurring_profiles_update ON recurring_billing_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY recurring_profiles_delete ON recurring_billing_profiles FOR DELETE USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION fn_recurring_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_recurring_profiles_updated ON recurring_billing_profiles;
CREATE TRIGGER trg_recurring_profiles_updated BEFORE UPDATE ON recurring_billing_profiles
FOR EACH ROW EXECUTE FUNCTION fn_recurring_profiles_updated_at();

-- ── Add recurring_profile_id to billing_items for tracing ──
ALTER TABLE billing_items
  ADD COLUMN IF NOT EXISTS recurring_profile_id UUID REFERENCES recurring_billing_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_billing_items_recurring ON billing_items(recurring_profile_id);
