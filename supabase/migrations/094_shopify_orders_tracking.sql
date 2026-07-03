-- 094_shopify_orders_tracking.sql
-- Flag de traçabilité des commandes Shopify (socle du dashboard Google Ads).
--
-- 3 états DISTINCTS, calculés à la sync depuis customerJourneySummary :
--   'tracked'   : momentsCount > 0 ET attribution exploitable (utm ou referrer présent)
--   'ghost'     : momentsCount = 0 → parcours vide, vente non attribuable
--                 (ex. consentement cookies refusé)
--   'unmatched' : momentsCount > 0 MAIS aucun signal d'attribution exploitable
-- NULL = inconnu : journey non disponible (commande pas encore resynchronisée,
-- ou Shopify n'a pas fini de traiter le parcours — champ `ready` à false).
-- Une vente ghost ne doit JAMAIS être comptée comme trackée ni confondue avec unmatched.

ALTER TABLE public.shopify_orders
  ADD COLUMN IF NOT EXISTS journey_moments_count int,
  ADD COLUMN IF NOT EXISTS tracking_status text
    CHECK (tracking_status IN ('tracked', 'ghost', 'unmatched'));

CREATE INDEX IF NOT EXISTS idx_shopify_orders_tracking
  ON public.shopify_orders(integration_id, tracking_status);
