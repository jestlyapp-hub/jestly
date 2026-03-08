-- ============================================================
-- 026 — Waitlist table for beta signup CRM
-- ============================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  first_name    TEXT        NOT NULL,
  twitter       TEXT,
  job_type      TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'new',
  source        TEXT,
  referrer      TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  notes         TEXT,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  score         INT         NOT NULL DEFAULT 0,
  invited_at    TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON public.waitlist (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist (status);
CREATE INDEX IF NOT EXISTS idx_waitlist_job ON public.waitlist (job_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);

-- RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Public: insert only (controlled via API route, not direct client access)
CREATE POLICY "waitlist_public_insert" ON public.waitlist
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- No public read — admin reads via service role or authenticated admin queries
CREATE POLICY "waitlist_admin_read" ON public.waitlist
  FOR SELECT TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jestlyapp@gmail.com'
  );

-- Admin update
CREATE POLICY "waitlist_admin_update" ON public.waitlist
  FOR UPDATE TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jestlyapp@gmail.com'
  );

-- Admin delete
CREATE POLICY "waitlist_admin_delete" ON public.waitlist
  FOR DELETE TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jestlyapp@gmail.com'
  );
