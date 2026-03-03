-- 011_order_freelance_fields.sql — Add briefing, resources, category, external_ref, group fields

ALTER TABLE orders ADD COLUMN IF NOT EXISTS briefing     text         null;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS resources    jsonb        null default '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS category     text         null;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS external_ref text         null;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS group_id     uuid         null;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS group_index  int          null;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS group_total  int          null;

CREATE INDEX IF NOT EXISTS idx_orders_group ON orders (group_id) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_category ON orders (category) WHERE category IS NOT NULL;
