-- 083_create_attribution_touches.sql
-- Trace par order de chaque "touchpoint" attribué (multi-touch ready).

CREATE TABLE IF NOT EXISTS public.order_attribution_touches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id text NOT NULL,
  touch_index int NOT NULL,
  touch_at timestamptz,
  provider text CHECK (provider IN ('pinterest', 'google_ads', 'meta_ads', 'tiktok_ads', 'organic', 'direct')),
  campaign_id text,
  campaign_name text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referring_site text,
  landing_path text,
  attribution_weight numeric(4,3),
  attribution_method text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, order_id, touch_index)
);

CREATE INDEX IF NOT EXISTS idx_attribution_touches_order
  ON public.order_attribution_touches(user_id, order_id);
CREATE INDEX IF NOT EXISTS idx_attribution_touches_campaign
  ON public.order_attribution_touches(user_id, provider, campaign_id, touch_at DESC);

ALTER TABLE public.order_attribution_touches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own touches" ON public.order_attribution_touches;
CREATE POLICY "users read own touches" ON public.order_attribution_touches
  FOR SELECT USING (auth.uid() = user_id);
