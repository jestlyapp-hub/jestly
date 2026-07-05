-- 101_pps_responses.sql
-- Post-Purchase Survey : « Comment avez-vous connu la boutique ? »
-- posée sur la page de statut de commande Shopify. Complément du pixel pour
-- les ventes fantômes : niveau 4 de la hiérarchie d'attribution (jamais
-- prioritaire sur pixel / natif / manuel). Multi-boutiques via pixel_shops.

CREATE TABLE IF NOT EXISTS public.pps_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.pixel_shops(id) ON DELETE CASCADE,
  shopify_order_id text NOT NULL,
  answer text NOT NULL
    CHECK (answer IN ('google', 'pinterest', 'instagram_tiktok', 'word_of_mouth', 'other')),
  answered_at timestamptz NOT NULL DEFAULT now(),

  -- Une seule réponse par commande — la première fait foi.
  UNIQUE (shop_id, shopify_order_id)
);

CREATE INDEX IF NOT EXISTS idx_pps_responses_shop
  ON public.pps_responses(shop_id, answered_at DESC);

ALTER TABLE public.pps_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own pps responses" ON public.pps_responses;
CREATE POLICY "users read own pps responses" ON public.pps_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pixel_shops ps
      WHERE ps.id = pps_responses.shop_id AND ps.user_id = auth.uid()
    )
  );
-- Écritures via service_role uniquement (endpoint public côté server).
