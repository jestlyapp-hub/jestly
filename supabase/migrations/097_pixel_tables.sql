-- 097_pixel_tables.sql
-- Pixel first-party Jestly (MVP usage perso, multi-boutiques).
-- Objectif : récupérer la source des ventes ghost (momentsCount = 0 côté
-- Shopify) via un identifiant first-party posé sur le domaine de la boutique.
-- Tables SÉPARÉES : rien n'écrit jamais dans shopify_orders (tracking_status
-- natif = référence de vérité). Sans rapport avec l'orpheline pixel_events (088).

-- ── Registre des boutiques : chaque shop = un pixel_id ──────────
CREATE TABLE IF NOT EXISTS public.pixel_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), -- = pixel_id public collé dans le thème
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain text NOT NULL,
  label text,
  is_active boolean NOT NULL DEFAULT true,       -- coupe-circuit sans toucher au thème
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, shop_domain)
);

ALTER TABLE public.pixel_shops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own pixel shops" ON public.pixel_shops;
CREATE POLICY "users read own pixel shops" ON public.pixel_shops
  FOR SELECT USING (auth.uid() = user_id);

-- ── Arrivées captées ─────────────────────────────────────────────
-- Colonnes plates = FIRST touch, jamais écrasées après la première visite.
-- last_touch (jsonb) = dernier passage porteur de signaux (utm/gclid/referrer).
CREATE TABLE IF NOT EXISTS public.pixel_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.pixel_shops(id) ON DELETE CASCADE,
  session_id text NOT NULL,

  gclid text,
  gbraid text,
  wbraid text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,

  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  last_touch jsonb,

  UNIQUE (shop_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_pixel_sessions_shop_seen
  ON public.pixel_sessions(shop_id, last_seen_at DESC);

ALTER TABLE public.pixel_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own pixel sessions" ON public.pixel_sessions;
CREATE POLICY "users read own pixel sessions" ON public.pixel_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pixel_shops ps
      WHERE ps.id = pixel_sessions.shop_id AND ps.user_id = auth.uid()
    )
  );

-- ── Commande → source récupérée par le pixel ─────────────────────
CREATE TABLE IF NOT EXISTS public.pixel_order_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.pixel_shops(id) ON DELETE CASCADE,
  -- ID Shopify brut : fonctionne pour toutes les boutiques, même non
  -- synchronisées dans Jestly (Mignou).
  shopify_order_id text NOT NULL,
  -- FK remplie seulement quand la commande existe dans le cache Jestly (LHM)
  -- → c'est elle qui branche la vue Attribution.
  order_id uuid REFERENCES public.shopify_orders(id) ON DELETE SET NULL,
  session_id text NOT NULL,

  resolved_source text NOT NULL
    CHECK (resolved_source IN ('google_ads', 'seo', 'pinterest', 'direct', 'other')),
  match_method text NOT NULL CHECK (match_method IN ('cart_attribute', 'time_proximity')),
  confidence numeric(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  matched_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (shop_id, shopify_order_id)
);

CREATE INDEX IF NOT EXISTS idx_pixel_order_attribution_order
  ON public.pixel_order_attribution(order_id) WHERE order_id IS NOT NULL;

ALTER TABLE public.pixel_order_attribution ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own pixel attribution" ON public.pixel_order_attribution;
CREATE POLICY "users read own pixel attribution" ON public.pixel_order_attribution
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pixel_shops ps
      WHERE ps.id = pixel_order_attribution.shop_id AND ps.user_id = auth.uid()
    )
  );
-- Écritures via service_role uniquement (endpoint de collecte + matching serveur).
