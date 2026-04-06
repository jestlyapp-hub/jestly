-- ═══════════════════════════════════════════════════════════════
-- Migration 063 — Catégories personnalisables pour le calendrier
-- ═══════════════════════════════════════════════════════════════

-- 1. Table calendar_categories
CREATE TABLE IF NOT EXISTS public.calendar_categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  color       text        NOT NULL DEFAULT '#6366F1',
  icon        text,
  position    int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_calendar_categories_user ON public.calendar_categories(user_id);

ALTER TABLE public.calendar_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_categories' AND policyname = 'cal_cat_select') THEN
    CREATE POLICY cal_cat_select ON public.calendar_categories FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_categories' AND policyname = 'cal_cat_insert') THEN
    CREATE POLICY cal_cat_insert ON public.calendar_categories FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_categories' AND policyname = 'cal_cat_update') THEN
    CREATE POLICY cal_cat_update ON public.calendar_categories FOR UPDATE USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_categories' AND policyname = 'cal_cat_delete') THEN
    CREATE POLICY cal_cat_delete ON public.calendar_categories FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- 2. Ajouter category_id sur calendar_events (nullable pour rétrocompatibilité)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'calendar_events' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.calendar_events
      ADD COLUMN category_id uuid REFERENCES public.calendar_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendar_events_category_id ON public.calendar_events(category_id);

-- 3. Trigger updated_at
CREATE OR REPLACE TRIGGER set_calendar_categories_updated_at
  BEFORE UPDATE ON public.calendar_categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. Recharger le cache PostgREST
NOTIFY pgrst, 'reload schema';
