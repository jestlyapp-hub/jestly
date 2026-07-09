-- 106_order_campaign_attribution.sql
-- Couche « campagne » de l'attribution manuelle : rattacher une commande à une
-- CAMPAGNE Google Ads précise, exactement comme on attribue déjà un canal.
--
-- Débloque le ROAS Jestly PAR campagne : pour LHM, les commandes Google Ads
-- n'ont ni utm_campaign exploitable ni gclid décodé → 0 % de rattachement
-- automatique. Ce rattachement manuel est la seule voie honnête pour ventiler
-- le CA Google Ads (déjà résolu au niveau canal) vers les bonnes campagnes.
--
-- Couche SÉPARÉE : ne touche JAMAIS les champs Shopify natifs ni tracking_status.
-- Réutilise la table order_manual_attribution (déjà UNIQUE(order_id)).
--
-- campaign_id = id Google (text) de gads_campaigns. Pas de FK dure : la clé
-- métier de gads_campaigns est UNIQUE(user_id, campaign_id), pas campaign_id
-- seul — l'appartenance (la campagne appartient bien à l'utilisateur) est donc
-- validée au niveau applicatif (route). Nullable : la plupart des attributions
-- de canal restent sans campagne.

ALTER TABLE public.order_manual_attribution
  ADD COLUMN IF NOT EXISTS campaign_id text;

-- Un rattachement à une campagne n'a de sens que pour le canal Google Ads.
-- (Contrainte souple : campaign_id NULL toujours permis ; s'il est posé, le
-- canal doit être google_ads.)
ALTER TABLE public.order_manual_attribution
  DROP CONSTRAINT IF EXISTS campaign_requires_google_ads;
ALTER TABLE public.order_manual_attribution
  ADD CONSTRAINT campaign_requires_google_ads
  CHECK (campaign_id IS NULL OR channel = 'google_ads');

CREATE INDEX IF NOT EXISTS idx_order_manual_attribution_campaign
  ON public.order_manual_attribution(user_id, campaign_id)
  WHERE campaign_id IS NOT NULL;
