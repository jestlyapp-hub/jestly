-- 008_custom_workflow.sql — Notion-like orders V1
-- order_boards → order_statuses (board_id + view) → orders.status_id
-- order_fields (user_id) → orders.custom_fields

-- =========================
-- 1. ORDER BOARDS
-- =========================
CREATE TABLE IF NOT EXISTS public.order_boards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'Board principal',
  is_default    BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_boards_user ON order_boards(user_id);

-- =========================
-- 2. ORDER STATUSES (colonnes Kanban, liees au board + view)
-- =========================
CREATE TABLE IF NOT EXISTS public.order_statuses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id         UUID NOT NULL REFERENCES public.order_boards(id) ON DELETE CASCADE,
  slug             TEXT NOT NULL DEFAULT '',
  name             TEXT NOT NULL,
  color            TEXT NOT NULL DEFAULT 'gray',
  view             TEXT NOT NULL DEFAULT 'production'
    CHECK (view IN ('production', 'cash')),
  position         INT NOT NULL DEFAULT 0,
  is_archived      BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_statuses_board_view_pos
  ON order_statuses(board_id, view, position);

-- =========================
-- 3. ORDER FIELDS (proprietes custom, liees au user)
-- =========================
CREATE TABLE IF NOT EXISTS public.order_fields (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key                TEXT NOT NULL,
  label              TEXT NOT NULL,
  field_type         TEXT NOT NULL DEFAULT 'text'
    CHECK (field_type IN ('text','number','select','multi_select','date','url','money','boolean')),
  options            JSONB DEFAULT '[]'::jsonb,
  is_required        BOOLEAN DEFAULT false,
  is_visible_on_card BOOLEAN DEFAULT false,
  position           INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_order_fields_user ON order_fields(user_id, position);

-- =========================
-- 4. ALTER ORDERS — ajouter status_id FK + custom_fields JSONB
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN status_id UUID REFERENCES public.order_statuses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'custom_fields'
  ) THEN
    ALTER TABLE orders ADD COLUMN custom_fields JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_status_id ON orders(status_id);

-- =========================
-- 5. RLS
-- =========================
ALTER TABLE order_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fields ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own boards"
    ON order_boards FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own statuses"
    ON order_statuses FOR ALL
    USING (board_id IN (SELECT id FROM order_boards WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own fields"
    ON order_fields FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
