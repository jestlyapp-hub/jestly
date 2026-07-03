-- 096_order_manual_attribution.sql
-- Attribution manuelle d'une source marketing par commande Shopify.
--
-- L'attribution manuelle est une HYPOTHÈSE, pas une mesure : elle vit dans
-- sa propre table et ne touche JAMAIS les champs d'attribution réels de
-- shopify_orders (utm_*, tracking_status), qui restent la référence de vérité.
-- Le ROAS est toujours affiché en double : mesuré vs avec attributions manuelles.

CREATE TABLE IF NOT EXISTS public.order_manual_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES public.shopify_orders(id) ON DELETE CASCADE,

  -- 'ghost' = choix explicite de laisser la commande non attribuée
  channel text NOT NULL CHECK (channel IN ('google_ads', 'seo', 'pinterest', 'other', 'ghost')),

  -- Niveau de confiance de l'hypothèse — OBLIGATOIRE dès qu'un canal est choisi
  confidence text CHECK (confidence IN ('sure', 'assumed', 'guessed')),
  CONSTRAINT confidence_required_unless_ghost
    CHECK (channel = 'ghost' OR confidence IS NOT NULL),

  note text,
  attributed_at timestamptz NOT NULL DEFAULT now(),
  attributed_by text,

  UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_order_manual_attribution_user
  ON public.order_manual_attribution(user_id, channel);

ALTER TABLE public.order_manual_attribution ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own manual attribution" ON public.order_manual_attribution;
CREATE POLICY "users read own manual attribution" ON public.order_manual_attribution
  FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE/DELETE via service_role uniquement (routes côté server).
