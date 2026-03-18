-- Migration 046: Add archive/delete support to clients
-- Adds archived_at, deleted_at columns, updates status constraint, adds indexes

-- 1. Add archived_at and deleted_at timestamps
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update status constraint to include 'deleted'
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE public.clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('active', 'inactive', 'archived', 'deleted'));

-- 3. Backfill archived_at for existing archived clients
UPDATE public.clients SET archived_at = updated_at WHERE status = 'archived' AND archived_at IS NULL;

-- 4. Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_archived_at ON public.clients(archived_at);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients(deleted_at);
CREATE INDEX IF NOT EXISTS idx_clients_user_status ON public.clients(user_id, status);

-- 5. Verify columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' AND table_schema = 'public' ORDER BY ordinal_position;
