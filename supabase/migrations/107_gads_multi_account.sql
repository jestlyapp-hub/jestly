-- 107_gads_multi_account.sql
-- Google Ads multi-comptes : un customer_id Google Ads par BOUTIQUE Shopify.
--
-- Avant : un seul compte Google Ads (GOOGLE_ADS_CUSTOMER_ID global) → toutes les
-- tables gads_* scopées par user_id uniquement. Impossible de distinguer la
-- dépense de deux boutiques (ex. L'Horloge Murale + Mignou, sous-comptes du même
-- MCC).
-- Après : chaque boutique (integration Shopify) a son compte Google Ads
-- (gads_accounts), et toutes les données gads_* portent l'integration_id.
--
-- Les credentials OAuth (developer token, client, refresh token, MCC/login-
-- customer-id) restent partagés au niveau serveur (même MCC) ; SEUL le
-- customer_id diffère par boutique — stocké dans gads_accounts.
--
-- Backfill : toutes les données gads existantes appartiennent à la boutique
-- PRINCIPALE (la plus ancienne) de leur user (aujourd'hui : LHM pour Gabriel,
-- unique compte Google Ads configuré). Aucune donnée croisée.

-- ── gads_accounts : mapping boutique ↔ compte Google Ads ─────────────
CREATE TABLE IF NOT EXISTS public.gads_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  -- Compte annonceur Google Ads (10 chiffres, sans tirets).
  customer_id text NOT NULL,
  -- Compte manager (MCC). null → utilise le login-customer-id global (même MCC).
  login_customer_id text,
  currency text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Une boutique = au plus un compte Google Ads.
  UNIQUE (user_id, integration_id),
  -- Un compte Google Ads n'est rattaché qu'à une boutique (anti-double-emploi).
  UNIQUE (customer_id)
);

CREATE INDEX IF NOT EXISTS idx_gads_accounts_user ON public.gads_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gads_accounts_integration ON public.gads_accounts(integration_id);

DROP TRIGGER IF EXISTS trg_gads_accounts_updated_at ON public.gads_accounts;
CREATE TRIGGER trg_gads_accounts_updated_at
  BEFORE UPDATE ON public.gads_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.gads_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own gads accounts" ON public.gads_accounts;
CREATE POLICY "users read own gads accounts" ON public.gads_accounts
  FOR SELECT USING (auth.uid() = user_id);
-- Écritures via service_role uniquement (route owner-gated côté serveur).

-- ── Colonne integration_id sur les tables gads_* ─────────────────────
ALTER TABLE public.gads_daily             ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.gads_product_daily     ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.gads_campaigns         ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.gads_campaign_daily    ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.gads_campaign_products ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.gads_budget_history    ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;
ALTER TABLE public.gads_manual_overrides  ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES public.integrations(id) ON DELETE CASCADE;

-- ── Backfill : boutique principale (plus ancienne intégration Shopify) ──
-- Toutes les données gads existantes sont mono-compte (LHM) → rattachées à la
-- boutique principale de leur propriétaire.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'gads_daily','gads_product_daily','gads_campaigns','gads_campaign_daily',
    'gads_campaign_products','gads_budget_history','gads_manual_overrides'
  ] LOOP
    EXECUTE format($f$
      UPDATE public.%I g SET integration_id = (
        SELECT i.id FROM public.integrations i
        WHERE i.user_id = g.user_id AND i.provider = 'shopify'
        ORDER BY (i.status = 'active') DESC, i.created_at ASC
        LIMIT 1
      )
      WHERE g.integration_id IS NULL
    $f$, t);
  END LOOP;
END $$;

-- ── NOT NULL (données backfillées) sur les tables de données gads ────
-- gads_manual_overrides laissée nullable (table legacy, aujourd'hui vide).
ALTER TABLE public.gads_daily             ALTER COLUMN integration_id SET NOT NULL;
ALTER TABLE public.gads_product_daily     ALTER COLUMN integration_id SET NOT NULL;
ALTER TABLE public.gads_campaigns         ALTER COLUMN integration_id SET NOT NULL;
ALTER TABLE public.gads_campaign_daily    ALTER COLUMN integration_id SET NOT NULL;
ALTER TABLE public.gads_campaign_products ALTER COLUMN integration_id SET NOT NULL;
ALTER TABLE public.gads_budget_history    ALTER COLUMN integration_id SET NOT NULL;

-- ── UNIQUE : inclure integration_id (deux boutiques peuvent avoir la même
--    campagne / le même item le même jour sans collision) ──────────────
ALTER TABLE public.gads_daily             DROP CONSTRAINT IF EXISTS gads_daily_user_id_campaign_name_date_key;
ALTER TABLE public.gads_daily             ADD  CONSTRAINT gads_daily_uid_integ_campaign_date_key UNIQUE (user_id, integration_id, campaign_name, date);

ALTER TABLE public.gads_product_daily     DROP CONSTRAINT IF EXISTS gads_product_daily_user_id_item_id_date_key;
ALTER TABLE public.gads_product_daily     ADD  CONSTRAINT gads_product_daily_uid_integ_item_date_key UNIQUE (user_id, integration_id, item_id, date);

ALTER TABLE public.gads_campaigns         DROP CONSTRAINT IF EXISTS gads_campaigns_user_id_campaign_id_key;
ALTER TABLE public.gads_campaigns         ADD  CONSTRAINT gads_campaigns_uid_integ_campaign_key UNIQUE (user_id, integration_id, campaign_id);

ALTER TABLE public.gads_campaign_daily    DROP CONSTRAINT IF EXISTS gads_campaign_daily_user_id_campaign_id_date_key;
ALTER TABLE public.gads_campaign_daily    ADD  CONSTRAINT gads_campaign_daily_uid_integ_campaign_date_key UNIQUE (user_id, integration_id, campaign_id, date);

ALTER TABLE public.gads_campaign_products DROP CONSTRAINT IF EXISTS gads_campaign_products_user_id_campaign_id_item_id_date_key;
ALTER TABLE public.gads_campaign_products ADD  CONSTRAINT gads_campaign_products_uid_integ_campaign_item_date_key UNIQUE (user_id, integration_id, campaign_id, item_id, date);

-- ── Index par boutique (lecture scopée) ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_gads_daily_integ_date            ON public.gads_daily(integration_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gads_product_daily_integ_date    ON public.gads_product_daily(integration_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gads_campaigns_integ             ON public.gads_campaigns(integration_id);
CREATE INDEX IF NOT EXISTS idx_gads_campaign_daily_integ_date   ON public.gads_campaign_daily(integration_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gads_campaign_products_integ_date ON public.gads_campaign_products(integration_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gads_budget_history_integ        ON public.gads_budget_history(integration_id, campaign_id, observed_at DESC);
