-- 103_gads_campaigns.sql
-- Onglet « Campagnes » du module ECOM — grain campagne Google Ads.
--
-- Ces tables sont l'ARCHIVE MAISON de Jestly : alimentées en APPEND par la
-- même sync 6 h que gads_daily/gads_product_daily. Elles deviennent la mémoire
-- long terme que Google ne garde plus (rétention API limitée à 37 mois glissants
-- depuis le 1er juin 2026) et reconstituent l'historique des budgets que
-- change_event ne restitue pas au-delà de 30 jours. Rien n'est jamais effacé de
-- façon destructive : les campagnes disparues de l'API restent, marquées par un
-- last_seen_at vieillissant.
--
-- item_id stocké BRUT (comme gads_product_daily) : le mapping vers le produit
-- Shopify se fait à la lecture, améliorable sans resync.

-- ── gads_campaigns : métadonnées + budget actuel (upsert à chaque sync) ──
CREATE TABLE IF NOT EXISTS public.gads_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Identifiant Google stable (chiffres). Clé métier, jamais réutilisé après
  -- suppression côté Google.
  campaign_id text NOT NULL,
  name text NOT NULL,
  -- ENABLED / PAUSED / REMOVED (tel que renvoyé par l'API, majuscules).
  status text NOT NULL DEFAULT 'UNKNOWN',
  -- SEARCH / SHOPPING / PERFORMANCE_MAX / DISPLAY / VIDEO…
  channel_type text,
  start_date date,
  end_date date,
  current_budget_cents bigint,
  bidding_strategy text,
  -- Dernière fois que l'API a renvoyé cette campagne : une campagne connue mais
  -- absente d'un pull récent est « terminée / archivée », jamais supprimée.
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_gads_campaigns_user
  ON public.gads_campaigns(user_id);

ALTER TABLE public.gads_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads campaigns" ON public.gads_campaigns;
CREATE POLICY "users read own gads campaigns" ON public.gads_campaigns
  FOR SELECT USING (auth.uid() = user_id);
-- Écritures via service_role uniquement (sync API côté server).

-- ── gads_campaign_daily : métriques campagne × jour (grain campaign_id) ──
-- Distinct de gads_daily (grain campaign_name) : l'id est stable même si la
-- campagne est renommée. La source la plus récente fait foi (upsert).
CREATE TABLE IF NOT EXISTS public.gads_campaign_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id text NOT NULL,
  date date NOT NULL,
  cost_cents bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  conversions numeric(12,2) NOT NULL DEFAULT 0,
  conversion_value_cents bigint NOT NULL DEFAULT 0,
  imported_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, campaign_id, date)
);

CREATE INDEX IF NOT EXISTS idx_gads_campaign_daily_user_date
  ON public.gads_campaign_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gads_campaign_daily_campaign
  ON public.gads_campaign_daily(user_id, campaign_id, date);

ALTER TABLE public.gads_campaign_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads campaign daily" ON public.gads_campaign_daily;
CREATE POLICY "users read own gads campaign daily" ON public.gads_campaign_daily
  FOR SELECT USING (auth.uid() = user_id);

-- ── gads_budget_history : archive des budgets (APPEND si changement) ──
-- change_event Google ne couvre que 30 jours et ne restitue pas les budgets
-- passés. Jestly archive donc lui-même : une ligne à chaque sync UNIQUEMENT si
-- le budget a bougé depuis la dernière observation. C'est l'atout produit
-- « archive Jestly au-delà de ce que Google conserve ».
CREATE TABLE IF NOT EXISTS public.gads_budget_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id text NOT NULL,
  budget_cents bigint NOT NULL,
  observed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gads_budget_history_campaign
  ON public.gads_budget_history(user_id, campaign_id, observed_at DESC);

ALTER TABLE public.gads_budget_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads budget history" ON public.gads_budget_history;
CREATE POLICY "users read own gads budget history" ON public.gads_budget_history
  FOR SELECT USING (auth.uid() = user_id);

-- ── gads_campaign_products : dépense produit PAR campagne (item × jour) ──
-- shopping_performance_view segmentée campaign.id × product_item_id × jour.
-- status_in_feed : 'active' pour tout item qui a de la diffusion (l'API ne
-- renvoie que ce qui diffuse) ; les produits « sans diffusion récente / exclus »
-- sont dérivés à la LECTURE (produit qui vendait via la campagne mais ne
-- diffuse plus). product_title = titre Google (fallback si item non mappé
-- vers Shopify ; le vrai nom Shopify est résolu à la lecture).
CREATE TABLE IF NOT EXISTS public.gads_campaign_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id text NOT NULL,
  item_id text NOT NULL,
  product_title text,
  date date NOT NULL,
  status_in_feed text NOT NULL DEFAULT 'active',
  cost_cents bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  conversions numeric(12,2) NOT NULL DEFAULT 0,
  conversion_value_cents bigint NOT NULL DEFAULT 0,
  imported_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, campaign_id, item_id, date)
);

CREATE INDEX IF NOT EXISTS idx_gads_campaign_products_user_date
  ON public.gads_campaign_products(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gads_campaign_products_campaign
  ON public.gads_campaign_products(user_id, campaign_id, date);

ALTER TABLE public.gads_campaign_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads campaign products" ON public.gads_campaign_products;
CREATE POLICY "users read own gads campaign products" ON public.gads_campaign_products
  FOR SELECT USING (auth.uid() = user_id);
