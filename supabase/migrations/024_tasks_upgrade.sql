-- 024: Upgrade tasks table for full productivity system
-- Adds missing columns, fixes status/priority constraints

-- 1. Add missing columns
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS order_title TEXT,
  ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update status constraint to include 'completed'
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('todo', 'in_progress', 'done', 'completed'));

-- 3. Update priority constraint to use 'medium' instead of 'normal'
-- First migrate existing 'normal' values
UPDATE public.tasks SET priority = 'medium' WHERE priority = 'normal';

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- 4. Create index on archived_at for fast archive queries
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON public.tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
