-- ═══════════════════════════════════════════════════════════════
-- 050 — Fix product search trigger (migration 033 vs 017 conflict)
--
-- Problem: migration 033 created fn_sd_sync_product() using
-- OLD column names from the services table:
--   - NEW.user_id  → renamed to owner_id in migration 017
--   - NEW.title    → renamed to name in migration 017
--   - NEW.is_active → replaced by status in migration 017
--   - trigger created ON services → table renamed to products in 017
--
-- This caused: "record 'new' has no field 'user_id'" on INSERT
-- ═══════════════════════════════════════════════════════════════

-- 1. Fix the function to use correct column names
CREATE OR REPLACE FUNCTION fn_sd_sync_product()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    DELETE FROM search_documents WHERE entity_type = 'product' AND entity_id = OLD.id;
    RETURN OLD;
  END IF;

  PERFORM fn_upsert_search_doc(
    'product', NEW.id, NEW.owner_id,
    NEW.name,
    coalesce(NEW.category, ''),
    concat_ws(' ', NEW.short_description, NEW.long_description),
    ARRAY[]::text[],
    '/produits',
    coalesce(NEW.status, 'draft'),
    NULL,
    NEW.price_cents / 100.0,
    NEW.created_at::date,
    NEW.status = 'archived',
    jsonb_build_object('type', coalesce(NEW.type, ''), 'category', coalesce(NEW.category, '')),
    3.0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop old trigger (on services, which may or may not exist)
DROP TRIGGER IF EXISTS trg_sd_product ON services;
DROP TRIGGER IF EXISTS trg_sd_product ON products;

-- 3. Create trigger on the correct table (products)
CREATE TRIGGER trg_sd_product
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION fn_sd_sync_product();
