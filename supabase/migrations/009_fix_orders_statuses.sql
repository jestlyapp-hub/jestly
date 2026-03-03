-- 009_fix_orders_statuses.sql — Ensure V1 statuses work + add missing columns
-- Safety net: works even if migration 007 was never applied.
-- The V1 module uses 4 statuses: new, in_progress, delivered, paid

-- 1. Drop old CHECK constraint (any version — from 001 or 007)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Add CHECK with ALL valid statuses (original + kanban + V1)
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'new', 'in_progress', 'delivered', 'paid',
    'brief_received', 'in_review', 'validated', 'invoiced',
    'cancelled', 'refunded', 'dispute'
  ));

-- 3. Ensure checklist + tags columns exist (safety net for 007)
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

-- 4. Index on status (idempotent)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- 5. Revert validated → delivered
UPDATE orders SET status = 'delivered' WHERE status = 'validated';

-- 6. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
