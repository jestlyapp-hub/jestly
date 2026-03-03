-- 007_kanban_statuses.sql — Extend order statuses for Kanban board

-- 1. Drop old CHECK constraint on orders.status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Re-create with all statuses (old + new)
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'new',
    'brief_received',
    'in_progress',
    'in_review',
    'validated',
    'delivered',
    'invoiced',
    'paid',
    'cancelled',
    'refunded',
    'dispute'
  ));

-- 3. Add checklist + tags columns (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'checklist'
  ) THEN
    ALTER TABLE orders ADD COLUMN checklist JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tags'
  ) THEN
    ALTER TABLE orders ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 4. Index on status for Kanban queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- 5. Migrate old 'delivered' → 'validated'
UPDATE orders SET status = 'validated' WHERE status = 'delivered';
