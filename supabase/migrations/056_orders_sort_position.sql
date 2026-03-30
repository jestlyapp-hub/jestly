-- Migration 056: Add sort_position to orders for manual drag-and-drop reordering
--
-- Strategy: gap integers (multiples of 1000) to allow insertions between
-- neighbours without renumbering all rows on every move.

-- 1. Add column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sort_position INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill existing orders based on created_at DESC (most recent = lowest position = top)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) * 1000 AS pos
  FROM orders
)
UPDATE orders SET sort_position = ranked.pos FROM ranked WHERE orders.id = ranked.id;

-- 3. Index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_orders_sort_position ON orders (user_id, sort_position);

-- 4. Trigger: new orders default to top of list (min - 1000)
CREATE OR REPLACE FUNCTION fn_orders_default_sort_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sort_position = 0 THEN
    SELECT COALESCE(MIN(sort_position), 1000) - 1000 INTO NEW.sort_position
    FROM orders WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_default_sort_position ON orders;
CREATE TRIGGER trg_orders_default_sort_position
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION fn_orders_default_sort_position();

NOTIFY pgrst, 'reload schema';
