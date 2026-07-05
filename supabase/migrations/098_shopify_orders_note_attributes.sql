-- 098_shopify_orders_note_attributes.sql
-- Attributs custom de commande (customAttributes GraphQL / note_attributes REST).
-- Nécessaire au matching pixel : le script pousse le session_id first-party
-- en cart attribute `_jestly_sid`, qui revient dans la commande.
-- Format stocké : [{ "key": "...", "value": "..." }] (forme GraphQL).

ALTER TABLE public.shopify_orders
  ADD COLUMN IF NOT EXISTS note_attributes jsonb;
