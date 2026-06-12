-- 093_ad_creative_revenue_columns.sql
-- ROAS par visuel/pin : ajoute le numérateur Shopify à ad_creative_performance_daily
-- (symétrique de campaign_performance_daily). La dépense par ad existe déjà via
-- pinterest_metrics_daily (entity_type='ad') ; ces colonnes reçoivent le revenue
-- des commandes matchées en utm_content_exact (tracking template {adid}).

ALTER TABLE public.ad_creative_performance_daily
  ADD COLUMN IF NOT EXISTS campaign_name text,
  ADD COLUMN IF NOT EXISTS pin_id text,
  ADD COLUMN IF NOT EXISTS shopify_orders_count int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shopify_revenue_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shopify_attributable_order_ids text[],
  ADD COLUMN IF NOT EXISTS real_roas numeric(10,4),
  ADD COLUMN IF NOT EXISTS profit_status text
    CHECK (profit_status IN ('profitable', 'warning', 'unprofitable', 'unmatched')),
  ADD COLUMN IF NOT EXISTS attribution_confidence numeric(4,3);

-- Vue "Visuels" : tri/agrégation par pin sur une fenêtre de dates.
CREATE INDEX IF NOT EXISTS idx_ad_perf_pin
  ON public.ad_creative_performance_daily(user_id, provider, pin_id, date DESC);
