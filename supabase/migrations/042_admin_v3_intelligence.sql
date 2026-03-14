-- ============================================================
-- Migration 042: Admin V3 Intelligence System
-- Tracking usage app, health score comptes, signaux
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. product_events — Événements produit pour tracking usage app
-- ────────────────────────────────────────────────────────────

-- Tracking des actions utilisateur dans le dashboard/app Jestly
-- Utilisé pour DAU/WAU/MAU, activation funnel, feature adoption, health score
CREATE TABLE IF NOT EXISTS product_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,         -- Convention: 'category.action' (ex: 'site.created', 'order.completed')
  event_category TEXT NOT NULL,     -- 'auth', 'onboarding', 'site', 'order', 'client', 'product', 'project', 'billing', 'search', 'settings'
  metadata JSONB DEFAULT '{}',     -- Contexte additionnel (resource_id, etc.)
  session_id TEXT,                  -- Optionnel: pour grouper actions par session
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes analytics performantes
CREATE INDEX idx_pe_user_created ON product_events(user_id, created_at DESC);
CREATE INDEX idx_pe_event_name ON product_events(event_name, created_at DESC);
CREATE INDEX idx_pe_category ON product_events(event_category, created_at DESC);
CREATE INDEX idx_pe_created ON product_events(created_at DESC);
-- Index pour DAU/WAU/MAU (date truncated queries)
CREATE INDEX idx_pe_user_date ON product_events(user_id, (created_at::date));

-- RLS: utilisateur voit ses propres événements, admin via service_role
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own events" ON product_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
-- Pas de SELECT policy pour les users normaux (pas besoin de lire ses events)
-- Admin accède via service_role (bypass RLS)


-- ────────────────────────────────────────────────────────────
-- 2. account_health_snapshots — Snapshots de santé calculés
-- ────────────────────────────────────────────────────────────

-- Snapshots de santé calculés périodiquement (ou à la demande) par l'admin
-- Score composé de signaux réels, pas de ML
CREATE TABLE IF NOT EXISTS account_health_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  tier TEXT NOT NULL CHECK (tier IN ('healthy', 'watch', 'risky', 'critical')),
  signals JSONB NOT NULL DEFAULT '{}',  -- Détail des signaux: { orders_30d, last_login, site_published, ... }
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id)  -- Un seul snapshot actif par compte (UPSERT)
);

CREATE INDEX idx_ahs_tier ON account_health_snapshots(tier);
CREATE INDEX idx_ahs_score ON account_health_snapshots(score);
CREATE INDEX idx_ahs_computed ON account_health_snapshots(computed_at DESC);

ALTER TABLE account_health_snapshots ENABLE ROW LEVEL SECURITY;
-- Pas de policy = admin-only via service_role


-- ────────────────────────────────────────────────────────────
-- 3. fn_compute_account_health — Fonction de calcul health score
-- ────────────────────────────────────────────────────────────

-- Calcule le health score d'un compte basé sur des signaux réels
-- Score 0-100, composé de:
--   - Récence dernière commande (0-20 pts)
--   - Nombre de commandes 30j (0-15 pts)
--   - Produits créés (0-10 pts)
--   - Clients actifs (0-10 pts)
--   - Site publié (0-15 pts)
--   - Projets actifs (0-10 pts)
--   - Profil complété (0-10 pts)
--   - Ancienneté compte (0-10 pts)
CREATE OR REPLACE FUNCTION fn_compute_account_health(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score INTEGER := 0;
  v_signals JSONB;
  v_tier TEXT;
  v_last_order_at TIMESTAMPTZ;
  v_orders_30d INTEGER;
  v_orders_total INTEGER;
  v_products INTEGER;
  v_clients INTEGER;
  v_sites_published INTEGER;
  v_projects INTEGER;
  v_profile_complete BOOLEAN;
  v_account_age_days INTEGER;
  v_has_billing BOOLEAN;
  v_events_7d INTEGER;
BEGIN
  -- Dernière commande
  SELECT MAX(created_at), COUNT(*) FILTER (WHERE created_at >= now() - INTERVAL '30 days'), COUNT(*)
  INTO v_last_order_at, v_orders_30d, v_orders_total
  FROM orders WHERE user_id = p_account_id;

  -- Produits
  SELECT COUNT(*) INTO v_products FROM products WHERE owner_id = p_account_id;

  -- Clients
  SELECT COUNT(*) INTO v_clients FROM clients WHERE user_id = p_account_id;

  -- Sites publiés
  SELECT COUNT(*) INTO v_sites_published FROM sites WHERE owner_id = p_account_id AND published = true;

  -- Projets
  SELECT COUNT(*) INTO v_projects FROM projects WHERE user_id = p_account_id;

  -- Profil complété
  SELECT (full_name IS NOT NULL AND full_name != '' AND business_name IS NOT NULL AND business_name != '')
  INTO v_profile_complete FROM profiles WHERE id = p_account_id;

  -- Ancienneté
  SELECT EXTRACT(DAY FROM now() - created_at)::INTEGER
  INTO v_account_age_days FROM profiles WHERE id = p_account_id;

  -- Billing actif
  SELECT EXISTS(SELECT 1 FROM billing_items WHERE user_id = p_account_id AND status NOT IN ('cancelled', 'draft'))
  INTO v_has_billing;

  -- Events produit récents (7 jours)
  SELECT COUNT(*) INTO v_events_7d FROM product_events
  WHERE user_id = p_account_id AND created_at >= now() - INTERVAL '7 days';

  -- ── Calcul du score ──

  -- Récence dernière commande (0-20 pts)
  IF v_last_order_at IS NOT NULL THEN
    IF v_last_order_at >= now() - INTERVAL '7 days' THEN v_score := v_score + 20;
    ELSIF v_last_order_at >= now() - INTERVAL '30 days' THEN v_score := v_score + 15;
    ELSIF v_last_order_at >= now() - INTERVAL '90 days' THEN v_score := v_score + 8;
    ELSE v_score := v_score + 3;
    END IF;
  END IF;

  -- Commandes 30 jours (0-15 pts)
  v_score := v_score + LEAST(v_orders_30d * 5, 15);

  -- Produits créés (0-10 pts)
  v_score := v_score + LEAST(v_products * 3, 10);

  -- Clients actifs (0-10 pts)
  v_score := v_score + LEAST(v_clients * 2, 10);

  -- Site publié (0-15 pts)
  IF v_sites_published > 0 THEN v_score := v_score + 15; END IF;

  -- Projets (0-10 pts)
  v_score := v_score + LEAST(v_projects * 2, 10);

  -- Profil complété (0-10 pts)
  IF v_profile_complete THEN v_score := v_score + 10; END IF;

  -- Ancienneté (0-10 pts) - bonus pour comptes matures actifs
  IF v_account_age_days > 180 AND v_orders_total > 0 THEN v_score := v_score + 10;
  ELSIF v_account_age_days > 90 AND v_orders_total > 0 THEN v_score := v_score + 7;
  ELSIF v_account_age_days > 30 THEN v_score := v_score + 3;
  END IF;

  -- Clamp à 100
  v_score := LEAST(v_score, 100);

  -- Tier
  IF v_score >= 70 THEN v_tier := 'healthy';
  ELSIF v_score >= 45 THEN v_tier := 'watch';
  ELSIF v_score >= 20 THEN v_tier := 'risky';
  ELSE v_tier := 'critical';
  END IF;

  -- Signaux détaillés
  v_signals := jsonb_build_object(
    'last_order_at', v_last_order_at,
    'orders_30d', v_orders_30d,
    'orders_total', v_orders_total,
    'products', v_products,
    'clients', v_clients,
    'sites_published', v_sites_published,
    'projects', v_projects,
    'profile_complete', v_profile_complete,
    'account_age_days', v_account_age_days,
    'has_billing', v_has_billing,
    'events_7d', v_events_7d
  );

  -- UPSERT le snapshot
  INSERT INTO account_health_snapshots (account_id, score, tier, signals, computed_at)
  VALUES (p_account_id, v_score, v_tier, v_signals, now())
  ON CONFLICT (account_id) DO UPDATE SET
    score = v_score,
    tier = v_tier,
    signals = v_signals,
    computed_at = now();

  RETURN jsonb_build_object('score', v_score, 'tier', v_tier, 'signals', v_signals);
END;
$$;


-- ────────────────────────────────────────────────────────────
-- 4. fn_compute_all_health_scores — Batch pour tous les comptes
-- ────────────────────────────────────────────────────────────

-- Recalcule le health score de tous les comptes actifs
CREATE OR REPLACE FUNCTION fn_compute_all_health_scores()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER := 0;
  v_user RECORD;
BEGIN
  FOR v_user IN SELECT id FROM profiles LOOP
    PERFORM fn_compute_account_health(v_user.id);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;
