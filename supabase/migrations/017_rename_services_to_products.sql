-- ============================================================
-- Migration 017: Rename services → products + clean column names
-- Idempotent — safe to re-run
-- ============================================================

BEGIN;

-- ──────────────────────────────────────────────────
-- 1. Add missing columns from 016 (IF NOT EXISTS)
-- ──────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='checkout_mode') THEN
    ALTER TABLE services ADD COLUMN checkout_mode text NOT NULL DEFAULT 'checkout';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='delivery_type') THEN
    ALTER TABLE services ADD COLUMN delivery_type text NOT NULL DEFAULT 'none';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='delivery_file_path') THEN
    ALTER TABLE services ADD COLUMN delivery_file_path text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='delivery_url') THEN
    ALTER TABLE services ADD COLUMN delivery_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='cta_label') THEN
    ALTER TABLE services ADD COLUMN cta_label text NOT NULL DEFAULT 'Acheter';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='stripe_price_id') THEN
    ALTER TABLE services ADD COLUMN stripe_price_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='cover_image_url') THEN
    ALTER TABLE services ADD COLUMN cover_image_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='form_schema_json') THEN
    ALTER TABLE services ADD COLUMN form_schema_json jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='short_description') THEN
    ALTER TABLE services ADD COLUMN short_description text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='long_description') THEN
    ALTER TABLE services ADD COLUMN long_description text;
  END IF;
END $$;

-- ──────────────────────────────────────────────────
-- 2. Convert obsolete types
-- ──────────────────────────────────────────────────
UPDATE services SET type = 'service' WHERE type = 'formation';
UPDATE services SET type = 'pack' WHERE type = 'subscription';

-- ──────────────────────────────────────────────────
-- 3. Rename table: services → products
-- ──────────────────────────────────────────────────
ALTER TABLE IF EXISTS services RENAME TO products;

-- ──────────────────────────────────────────────────
-- 4. Rename columns
-- ──────────────────────────────────────────────────
ALTER TABLE products RENAME COLUMN user_id TO owner_id;
ALTER TABLE products RENAME COLUMN title TO name;
ALTER TABLE products RENAME COLUMN checkout_mode TO mode;

-- ──────────────────────────────────────────────────
-- 5. Add status column, migrate from is_active, drop is_active
-- ──────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN status text NOT NULL DEFAULT 'draft';
UPDATE products SET status = CASE WHEN is_active = true THEN 'active' ELSE 'draft' END;
ALTER TABLE products DROP COLUMN is_active;

-- ──────────────────────────────────────────────────
-- 6. Convert price to price_cents (integer)
-- ──────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN price_cents integer NOT NULL DEFAULT 0;
UPDATE products SET price_cents = ROUND(price * 100)::integer;
ALTER TABLE products DROP COLUMN price;

-- ──────────────────────────────────────────────────
-- 7. Update CHECK constraints
-- ──────────────────────────────────────────────────
-- Drop old type constraint if it exists
DO $$ BEGIN
  ALTER TABLE products DROP CONSTRAINT IF EXISTS services_type_check;
  ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE products ADD CONSTRAINT products_type_check
  CHECK (type IN ('service', 'pack', 'digital', 'lead_magnet'));

DO $$ BEGIN
  ALTER TABLE products DROP CONSTRAINT IF EXISTS products_mode_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE products ADD CONSTRAINT products_mode_check
  CHECK (mode IN ('checkout', 'contact'));

ALTER TABLE products ADD CONSTRAINT products_status_check
  CHECK (status IN ('draft', 'active', 'archived'));

-- ──────────────────────────────────────────────────
-- 8. Rename FK in orders: service_id → product_id
-- ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_service_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE orders RENAME COLUMN service_id TO product_id;

ALTER TABLE orders ADD CONSTRAINT orders_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- ──────────────────────────────────────────────────
-- 9. Rename FK in order_items: service_id → product_id
-- ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_service_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE order_items RENAME COLUMN service_id TO product_id;

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────
-- 10. Recreate FK in site_product_links
-- ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE site_product_links DROP CONSTRAINT IF EXISTS site_product_links_product_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE site_product_links ADD CONSTRAINT site_product_links_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ──────────────────────────────────────────────────
-- 11. Recreate index
-- ──────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_services_user_id;
CREATE INDEX IF NOT EXISTS idx_products_owner_id ON products(owner_id);

-- ──────────────────────────────────────────────────
-- 12. Recreate trigger
-- ──────────────────────────────────────────────────
DROP TRIGGER IF EXISTS set_services_updated_at ON products;
DROP TRIGGER IF EXISTS set_products_updated_at ON products;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────
-- 13. Recreate RLS policies
-- ──────────────────────────────────────────────────
-- Drop old service policies
DROP POLICY IF EXISTS "Users can view own services" ON products;
DROP POLICY IF EXISTS "Users can insert own services" ON products;
DROP POLICY IF EXISTS "Users can update own services" ON products;
DROP POLICY IF EXISTS "Users can delete own services" ON products;
DROP POLICY IF EXISTS "Public can view active services" ON products;

-- Drop any existing product policies (idempotent)
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Owner policies
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (owner_id = auth.uid());

-- Public read policy
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- ──────────────────────────────────────────────────
-- 14. Recreate RPC fn_public_checkout
-- ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_public_checkout(
  p_site_id uuid,
  p_product_id uuid,
  p_name text,
  p_email text,
  p_phone text DEFAULT NULL,
  p_message text DEFAULT NULL,
  p_form_data jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_site record;
  v_product record;
  v_client_id uuid;
  v_order_id uuid;
BEGIN
  -- 1. Validate site
  SELECT id, owner_id INTO v_site
  FROM sites
  WHERE id = p_site_id AND status = 'published';

  IF v_site IS NULL THEN
    RETURN jsonb_build_object('error', 'Site not found or not published');
  END IF;

  -- 2. Validate product
  SELECT id, name, price_cents, mode INTO v_product
  FROM products
  WHERE id = p_product_id
    AND owner_id = v_site.owner_id
    AND status = 'active';

  IF v_product IS NULL THEN
    RETURN jsonb_build_object('error', 'Product not found or not active');
  END IF;

  -- 3. Upsert client
  v_client_id := fn_upsert_client(v_site.owner_id, p_name, p_email, p_phone);

  -- 4. Create order
  INSERT INTO orders (user_id, client_id, product_id, title, description, amount, status, priority)
  VALUES (
    v_site.owner_id,
    v_client_id,
    v_product.id,
    v_product.name,
    COALESCE(p_message, ''),
    v_product.price_cents::numeric / 100,
    'new',
    'normal'
  )
  RETURNING id INTO v_order_id;

  -- 5. Save form submission if any
  IF p_form_data IS NOT NULL AND p_form_data != '{}'::jsonb THEN
    INSERT INTO order_submissions (order_id, form_data)
    VALUES (v_order_id, p_form_data);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'product_name', v_product.name,
    'amount', v_product.price_cents::numeric / 100,
    'mode', v_product.mode
  );
END;
$$;

-- ──────────────────────────────────────────────────
-- 15. Refresh PostgREST schema cache
-- ──────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';

COMMIT;
