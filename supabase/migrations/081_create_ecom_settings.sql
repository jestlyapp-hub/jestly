-- 081_create_ecom_settings.sql
-- Préférences ROAS / attribution / alertes par user (1 row par user).

CREATE TABLE IF NOT EXISTS public.ecom_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ROAS thresholds
  roas_profitability_threshold numeric(8,4) NOT NULL DEFAULT 2.0,
  roas_warning_threshold numeric(8,4) NOT NULL DEFAULT 1.5,
  net_margin_percent numeric(5,2) NOT NULL DEFAULT 50.0,

  -- Attribution
  attribution_window_days int NOT NULL DEFAULT 7,
  attribution_model text NOT NULL DEFAULT 'last_touch'
    CHECK (attribution_model IN ('first_touch', 'last_touch', 'linear', 'u_shaped')),

  -- Currency
  default_currency text NOT NULL DEFAULT 'EUR',

  -- Alerts
  alerts_enabled boolean NOT NULL DEFAULT true,
  alert_drop_threshold_percent numeric(5,2) NOT NULL DEFAULT 20.0,
  alert_min_spend_cents bigint NOT NULL DEFAULT 5000,

  -- Email notifications
  email_digest_enabled boolean NOT NULL DEFAULT false,
  email_digest_frequency text NOT NULL DEFAULT 'weekly'
    CHECK (email_digest_frequency IN ('daily', 'weekly', 'monthly')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ecom_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users manage own ecom_settings" ON public.ecom_settings;
CREATE POLICY "users manage own ecom_settings" ON public.ecom_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger (réutilise set_updated_at créé par 071)
DROP TRIGGER IF EXISTS trg_ecom_settings_updated_at ON public.ecom_settings;
CREATE TRIGGER trg_ecom_settings_updated_at
  BEFORE UPDATE ON public.ecom_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
