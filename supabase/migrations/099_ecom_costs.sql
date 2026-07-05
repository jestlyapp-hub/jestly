-- 099_ecom_costs.sql
-- Socle de vérité des coûts (Phase 1A analytics) : COGS versionnés par
-- produit, frais par commande (colonnes ecom_settings), dépenses récurrentes.
-- Alimente BE-ROAS (coûts variables uniquement) et Net Profit (tout).
-- NB : préfixe ecom_ pour ne jamais entrer en collision avec l'orpheline V3
-- `product_costs` (migration 090, non appliquée — voir docs/TICKET-CLEANUP-V3.md).

-- ── COGS versionnés par produit ──────────────────────────────────
-- Changer un coût = nouvelle ligne avec effective_from : le COGS d'une
-- commande = la version la plus récente dont effective_from ≤ date de commande.
CREATE TABLE IF NOT EXISTS public.ecom_product_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shopify_product_id text NOT NULL,
  unit_cost_cents bigint NOT NULL CHECK (unit_cost_cents >= 0),
  effective_from date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, shopify_product_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_ecom_product_costs_lookup
  ON public.ecom_product_costs(user_id, shopify_product_id, effective_from DESC);

ALTER TABLE public.ecom_product_costs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own product costs" ON public.ecom_product_costs;
CREATE POLICY "users read own product costs" ON public.ecom_product_costs
  FOR SELECT USING (auth.uid() = user_id);
-- Écritures via service_role (routes serveur).

-- ── Frais par commande : réglages à une ligne par user ───────────
ALTER TABLE public.ecom_settings
  ADD COLUMN IF NOT EXISTS shipping_cost_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_fee_percent numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_fee_fixed_cents int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS packaging_cost_cents int NOT NULL DEFAULT 0;

-- ── Dépenses récurrentes (abonnements, outils) ───────────────────
-- Déduites du Net Profit au prorata journalier de la plage analysée.
-- N'entrent JAMAIS dans le BE-ROAS (seuil par commande = coûts variables).
CREATE TABLE IF NOT EXISTS public.ecom_custom_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(btrim(label)) >= 2),
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  period text NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'yearly')),
  starts_on date NOT NULL DEFAULT current_date,
  ends_on date, -- null = toujours actif ; résiliation = poser la date, l'historique reste juste
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);

CREATE INDEX IF NOT EXISTS idx_ecom_custom_expenses_user
  ON public.ecom_custom_expenses(user_id, starts_on);

ALTER TABLE public.ecom_custom_expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own custom expenses" ON public.ecom_custom_expenses;
CREATE POLICY "users read own custom expenses" ON public.ecom_custom_expenses
  FOR SELECT USING (auth.uid() = user_id);
-- Écritures via service_role (routes serveur).
