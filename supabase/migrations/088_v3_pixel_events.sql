-- 088_v3_pixel_events.sql
-- Jestly Pixel : événements first-party collectés par l'Edge Function.
-- Aucun PII en clair : email haché SHA-256, IP hachée.

CREATE TABLE IF NOT EXISTS public.pixel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  event_name TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  occurred_at TIMESTAMPTZ NOT NULL,
  url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  country TEXT,
  device_type TEXT,
  fingerprint TEXT,
  email_hash TEXT,
  product_id TEXT,
  value_cents INTEGER,
  currency TEXT,
  raw_data JSONB,
  forwarded_to JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pixel_events_store_session ON public.pixel_events(store_id, session_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_store_email_hash ON public.pixel_events(store_id, email_hash);
CREATE INDEX IF NOT EXISTS idx_pixel_events_occurred_at ON public.pixel_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_pixel_events_store_event_name ON public.pixel_events(store_id, event_name);

ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pixel_events_owner_select" ON public.pixel_events;
CREATE POLICY "pixel_events_owner_select" ON public.pixel_events
  FOR SELECT USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );
-- L'insertion se fait via service_role depuis l'Edge Function (bypass RLS).
