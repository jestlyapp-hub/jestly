-- 012_dynamic_columns.sql
-- Add is_system + config columns to order_fields for dynamic columns support

ALTER TABLE order_fields
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS config    JSONB   NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_order_fields_system
  ON order_fields(user_id, is_system);

-- RPC: strip a custom field key from all orders for a given user
CREATE OR REPLACE FUNCTION strip_custom_field_key(p_user_id UUID, p_key TEXT)
RETURNS void LANGUAGE sql AS $$
  UPDATE orders
  SET custom_fields = custom_fields - p_key
  WHERE user_id = p_user_id
    AND custom_fields ? p_key;
$$;

NOTIFY pgrst, 'reload schema';
