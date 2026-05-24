-- 085_create_ads_alerts.sql
-- Historique des alertes générées automatiquement par alerts-engine.

CREATE TABLE IF NOT EXISTS public.ads_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  alert_type text NOT NULL CHECK (alert_type IN (
    'campaign_unprofitable',
    'campaign_drop',
    'campaign_no_conversion',
    'budget_pacing_anomaly',
    'utm_missing'
  )),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),

  provider text,
  campaign_id text,
  campaign_name text,

  title text NOT NULL,
  message text NOT NULL,
  recommendation text,

  metric_value numeric,
  metric_label text,

  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  dismissed_at timestamptz,

  detected_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_status
  ON public.ads_alerts(user_id, status, severity, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_campaign
  ON public.ads_alerts(user_id, provider, campaign_id, detected_at DESC);

-- Note : déduplication faite côté code dans alerts-engine.ts
-- (impossible de mettre un index UNIQUE avec cast ::date — fonction non IMMUTABLE).

ALTER TABLE public.ads_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own alerts" ON public.ads_alerts;
CREATE POLICY "users manage own alerts" ON public.ads_alerts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
