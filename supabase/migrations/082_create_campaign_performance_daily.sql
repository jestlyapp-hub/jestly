-- 082_create_campaign_performance_daily.sql
-- Performance journalière par campagne, multi-provider.
-- Croise les data Ads (spend, impressions) avec les vraies commandes Shopify attribuées.

CREATE TABLE IF NOT EXISTS public.campaign_performance_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  provider text NOT NULL CHECK (provider IN ('pinterest', 'google_ads', 'meta_ads', 'tiktok_ads')),
  campaign_id text NOT NULL,
  campaign_name text NOT NULL,

  -- Data depuis l'Ads platform
  ads_spend_cents bigint DEFAULT 0,
  ads_impressions bigint DEFAULT 0,
  ads_clicks bigint DEFAULT 0,
  ads_outbound_clicks bigint DEFAULT 0,
  ads_conversions numeric(12,2) DEFAULT 0,
  ads_conversions_value_cents bigint DEFAULT 0,
  ads_reported_roas numeric(8,4),

  -- Data Shopify réelles attribuées
  shopify_orders_count int DEFAULT 0,
  shopify_revenue_cents bigint DEFAULT 0,
  shopify_attributable_order_ids text[],

  -- Calculs
  real_roas numeric(8,4),
  roas_delta numeric(8,4),
  marginal_roas numeric(8,4),
  is_profitable boolean,
  profit_status text CHECK (profit_status IN ('profitable', 'warning', 'unprofitable', 'unmatched')),
  attribution_method text,
  attribution_confidence numeric(3,2),

  metadata jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, date, provider, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_perf_user_date
  ON public.campaign_performance_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_perf_user_provider
  ON public.campaign_performance_daily(user_id, provider, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_perf_campaign
  ON public.campaign_performance_daily(user_id, provider, campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_perf_status
  ON public.campaign_performance_daily(user_id, profit_status, date DESC)
  WHERE profit_status IN ('warning', 'unprofitable');

ALTER TABLE public.campaign_performance_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own performance" ON public.campaign_performance_daily;
CREATE POLICY "users read own performance" ON public.campaign_performance_daily
  FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE faits uniquement via service_role (côté server), pas de policy write client.
