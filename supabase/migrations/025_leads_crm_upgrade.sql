-- ============================================================
-- 025 — Leads CRM upgrade: add enrichment columns for unified lead pipeline
-- ============================================================

-- Add new columns to existing leads table (all nullable for backwards compat)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company     TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status      TEXT NOT NULL DEFAULT 'new';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS page_path   TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS block_type  TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS block_label TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_source  TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_medium  TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS referrer    TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS amount      NUMERIC;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes       TEXT;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);

-- Index for source filtering
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (source);
