-- 010_ensure_workflow_tables.sql — Ensure order workflow tables exist + reload schema

-- Idempotent: only creates if not exists

-- 1. order_boards
CREATE TABLE IF NOT EXISTS order_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Board principal',
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. order_statuses
CREATE TABLE IF NOT EXISTS order_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES order_boards(id) ON DELETE CASCADE,
  slug TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  view TEXT NOT NULL DEFAULT 'production' CHECK (view IN ('production', 'cash')),
  position INT NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. order_fields
CREATE TABLE IF NOT EXISTS order_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_visible_on_card BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_order_statuses_board ON order_statuses(board_id);
CREATE INDEX IF NOT EXISTS idx_order_statuses_view ON order_statuses(view);
CREATE INDEX IF NOT EXISTS idx_order_fields_user ON order_fields(user_id);

-- 5. RLS (enable if not already)
ALTER TABLE order_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fields ENABLE ROW LEVEL SECURITY;

-- 6. Policies (idempotent with DO block)
DO $$
BEGIN
  -- order_boards
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_boards_user_policy' AND tablename = 'order_boards') THEN
    CREATE POLICY order_boards_user_policy ON order_boards
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  -- order_statuses: user owns the board
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_statuses_user_policy' AND tablename = 'order_statuses') THEN
    CREATE POLICY order_statuses_user_policy ON order_statuses
      FOR ALL USING (board_id IN (SELECT id FROM order_boards WHERE user_id = auth.uid()))
      WITH CHECK (board_id IN (SELECT id FROM order_boards WHERE user_id = auth.uid()));
  END IF;
  -- order_fields
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_fields_user_policy' AND tablename = 'order_fields') THEN
    CREATE POLICY order_fields_user_policy ON order_fields
      FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 7. Ensure status_id + custom_fields columns on orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN status_id UUID REFERENCES order_statuses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'custom_fields'
  ) THEN
    ALTER TABLE orders ADD COLUMN custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 8. Revert any 'validated' → 'delivered' (safety net)
UPDATE orders SET status = 'delivered' WHERE status = 'validated';

-- 9. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
