-- ============================================================
-- 004_client_detail.sql — Client CRM detail tables & extensions
-- ============================================================

-- ─── Extend clients table ───
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS address JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;

-- ─── Client Notes ───
CREATE TABLE IF NOT EXISTS public.client_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON public.client_notes(client_id, created_at DESC);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_notes_select" ON public.client_notes
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "client_notes_insert" ON public.client_notes
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "client_notes_update" ON public.client_notes
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "client_notes_delete" ON public.client_notes
  FOR DELETE USING (user_id = auth.uid());

-- Auto-update updated_at on client_notes
CREATE TRIGGER set_client_notes_updated_at
  BEFORE UPDATE ON public.client_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ─── Client Events (timeline) ───
CREATE TABLE IF NOT EXISTS public.client_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id  UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
    'note_added','order_created','order_delivered','order_cancelled',
    'status_changed','client_created','client_updated','payment_received'
  )),
  payload    JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_events_client ON public.client_events(client_id, created_at DESC);

ALTER TABLE public.client_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_events_select" ON public.client_events
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "client_events_insert" ON public.client_events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ─── Trigger: auto-update last_order_at on new order ───
CREATE OR REPLACE FUNCTION public.fn_update_client_last_order()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.clients
  SET last_order_at = now()
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_client_last_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_client_last_order();
