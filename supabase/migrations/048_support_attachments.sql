-- 048_support_attachments.sql
-- Enhanced support system: sender_type, last_message_preview, category, attachments

-- 1. Add sender_type to support_messages
ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS sender_type TEXT NOT NULL DEFAULT 'user' CHECK (sender_type IN ('user', 'admin', 'system'));

-- Backfill sender_type from is_admin
UPDATE public.support_messages SET sender_type = 'admin' WHERE is_admin = true;

-- 2. Add columns to support_tickets
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS last_message_preview TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 3. Create support_attachments table
CREATE TABLE IF NOT EXISTS public.support_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.support_messages(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket ON public.support_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_attachments_message ON public.support_attachments(message_id);

-- 5. RLS on attachments
ALTER TABLE public.support_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_attachments" ON public.support_attachments FOR ALL USING (
  ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id = auth.uid())
);
