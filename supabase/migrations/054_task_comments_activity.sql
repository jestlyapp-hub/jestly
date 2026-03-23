-- ═══════════════════════════════════════════════════════════════════
-- 054 — Task Comments & Activity Log
-- Ajoute commentaires et historique d'activité aux tâches
-- ═══════════════════════════════════════════════════════════════════

-- ── Task Comments ──
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_created ON public.task_comments(created_at DESC);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_comments_select" ON public.task_comments
  FOR SELECT USING (
    user_id = auth.uid()
    OR task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid())
  );

CREATE POLICY "task_comments_insert" ON public.task_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "task_comments_update" ON public.task_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "task_comments_delete" ON public.task_comments
  FOR DELETE USING (user_id = auth.uid());

-- ── Task Activity Log ──
CREATE TABLE IF NOT EXISTS public.task_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON public.task_activity_log(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_created ON public.task_activity_log(created_at DESC);

ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "task_activity_select" ON public.task_activity_log
  FOR SELECT USING (
    user_id = auth.uid()
    OR task_id IN (SELECT id FROM public.tasks WHERE user_id = auth.uid())
  );

CREATE POLICY "task_activity_insert" ON public.task_activity_log
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ── Related tasks (JSONB array of task IDs) ──
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS related_task_ids JSONB DEFAULT '[]'::jsonb;
