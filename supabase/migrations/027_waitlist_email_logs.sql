-- ══════════════════════════════════════════════════════
--  027 — Waitlist email logs
-- ══════════════════════════════════════════════════════

CREATE TABLE public.waitlist_email_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id   UUID REFERENCES public.waitlist(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  template_key  TEXT NOT NULL,
  sent_by       TEXT NOT NULL,           -- 'system' or admin email
  status        TEXT NOT NULL DEFAULT 'sent',  -- sent | failed
  error_message TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_email_logs_template   ON public.waitlist_email_logs(template_key);
CREATE INDEX idx_email_logs_recipient  ON public.waitlist_email_logs(recipient_email);
CREATE INDEX idx_email_logs_created    ON public.waitlist_email_logs(created_at DESC);
CREATE INDEX idx_email_logs_waitlist   ON public.waitlist_email_logs(waitlist_id);

-- RLS
ALTER TABLE public.waitlist_email_logs ENABLE ROW LEVEL SECURITY;

-- Admin read-only
CREATE POLICY "email_logs_admin_read" ON public.waitlist_email_logs
  FOR SELECT TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'jestlyapp@gmail.com'
  );

-- Insert from service_role only (server-side)
CREATE POLICY "email_logs_service_insert" ON public.waitlist_email_logs
  FOR INSERT TO service_role
  WITH CHECK (true);
