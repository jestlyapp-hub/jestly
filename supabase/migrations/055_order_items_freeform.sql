-- Migration 055: Extend order_items for freeform line items (manual orders)
--
-- Currently order_items requires product_id NOT NULL and is only used by
-- the public checkout flow. This migration makes product_id nullable and
-- adds label/description columns so manual orders can have detailed pricing.

-- 1. Drop existing FK constraint on product_id
DO $$ BEGIN
  ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- 2. Make product_id nullable
ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;

-- 3. Recreate FK with ON DELETE SET NULL (product deletion won't remove manual lines)
ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- 4. Add label and description columns
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT '';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS description TEXT;

-- 5. Constraint: a line must have either a product_id or a non-empty label
ALTER TABLE order_items ADD CONSTRAINT order_items_identity_check
  CHECK (product_id IS NOT NULL OR label != '');

-- 6. Backfill label for existing items (from linked product name)
UPDATE order_items SET label = p.name
FROM products p
WHERE order_items.product_id = p.id AND order_items.label = '';

-- 7. Add missing RLS policies (migration 003 only created SELECT + INSERT)
DO $$ BEGIN
  CREATE POLICY "Users can update own order items"
    ON order_items FOR UPDATE
    USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own order items"
    ON order_items FOR DELETE
    USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
