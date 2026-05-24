-- 084_create_ad_creative_performance.sql
-- Performance journalière au niveau ad creative (drill-down).

CREATE TABLE IF NOT EXISTS public.ad_creative_performance_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  provider text NOT NULL,
  campaign_id text NOT NULL,
  ad_group_id text,
  ad_id text NOT NULL,
  ad_name text,

  spend_cents bigint DEFAULT 0,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  conversions numeric(12,2) DEFAULT 0,
  conversions_value_cents bigint DEFAULT 0,

  ctr numeric(6,4),
  cpc_cents bigint,
  cpm_cents bigint,

  metadata jsonb NOT NULL DEFAULT '{}',
  computed_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, date, provider, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_ad_perf_campaign
  ON public.ad_creative_performance_daily(user_id, provider, campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_perf_user_date
  ON public.ad_creative_performance_daily(user_id, date DESC);

ALTER TABLE public.ad_creative_performance_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own ad perf" ON public.ad_creative_performance_daily;
CREATE POLICY "users read own ad perf" ON public.ad_creative_performance_daily
  FOR SELECT USING (auth.uid() = user_id);
