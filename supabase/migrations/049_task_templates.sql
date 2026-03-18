-- ═══════════════════════════════════════════════════════════════
-- 049 — Task Templates (modèles de tâches personnalisés)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_system BOOLEAN NOT NULL DEFAULT false,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  default_priority TEXT DEFAULT 'medium' CHECK (default_priority IN ('low', 'medium', 'high', 'urgent')),
  tags JSONB DEFAULT '[]'::jsonb,
  subtasks JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_templates_user ON public.task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_system ON public.task_templates(is_system);

-- RLS
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own templates" ON public.task_templates;
CREATE POLICY "Users manage own templates" ON public.task_templates
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
