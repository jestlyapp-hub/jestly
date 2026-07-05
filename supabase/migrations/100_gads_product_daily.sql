-- 100_gads_product_daily.sql
-- Dépense Google Ads par produit (shopping_performance_view, segmentée
-- product_item_id × jour). Alimentée par la MÊME sync 6 h que gads_daily
-- (upsert « la source fait foi », fenêtre glissante 30 j) — pas de 2e cron.
--
-- item_id stocké BRUT tel que renvoyé par l'API : le mapping vers le produit
-- Shopify se fait à la lecture (améliorable sans resync). Les non-mappables
-- restent visibles en « Produit inconnu », jamais ignorés en silence.

CREATE TABLE IF NOT EXISTS public.gads_product_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  date date NOT NULL,
  cost_cents bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  conversions numeric(12,2) NOT NULL DEFAULT 0,
  conversion_value_cents bigint NOT NULL DEFAULT 0,
  imported_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, item_id, date)
);

CREATE INDEX IF NOT EXISTS idx_gads_product_daily_user_date
  ON public.gads_product_daily(user_id, date DESC);

ALTER TABLE public.gads_product_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads product daily" ON public.gads_product_daily;
CREATE POLICY "users read own gads product daily" ON public.gads_product_daily
  FOR SELECT USING (auth.uid() = user_id);
-- Écritures via service_role uniquement (sync API côté server).
