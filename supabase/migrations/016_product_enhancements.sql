-- ============================================================
-- 016: Product enhancements
-- Extends services table with checkout/delivery/CTA fields
-- ============================================================

-- New columns on services
ALTER TABLE services ADD COLUMN IF NOT EXISTS checkout_mode text NOT NULL DEFAULT 'checkout';
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_type text NOT NULL DEFAULT 'none';
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_file_path text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS delivery_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS cta_label text NOT NULL DEFAULT 'Acheter';
ALTER TABLE services ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Constraints
DO $$ BEGIN
  ALTER TABLE services ADD CONSTRAINT chk_checkout_mode CHECK (checkout_mode IN ('checkout', 'contact'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE services ADD CONSTRAINT chk_delivery_type CHECK (delivery_type IN ('file', 'url', 'message', 'none'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Extend type enum to support 'digital' (alias for formation) and 'lead_magnet'
-- Current check is: type IN ('service', 'pack', 'formation')
-- We need to drop and re-create the constraint
DO $$ BEGIN
  ALTER TABLE services DROP CONSTRAINT IF EXISTS services_type_check;
  ALTER TABLE services ADD CONSTRAINT services_type_check
    CHECK (type IN ('service', 'pack', 'formation', 'digital', 'lead_magnet', 'subscription'));
EXCEPTION WHEN undefined_object THEN
  -- If constraint doesn't exist by that name, try without
  ALTER TABLE services ADD CONSTRAINT services_type_check
    CHECK (type IN ('service', 'pack', 'formation', 'digital', 'lead_magnet', 'subscription'));
END $$;

-- Extend site_product_links with sort_order and is_featured
ALTER TABLE site_product_links ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE site_product_links ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Index for faster product lookups by site
CREATE INDEX IF NOT EXISTS idx_site_product_links_site ON site_product_links(site_id);
CREATE INDEX IF NOT EXISTS idx_site_product_links_product ON site_product_links(product_id);
