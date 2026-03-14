-- ============================================================
-- Migration 041: Admin Panel
-- Tables et fonctions pour le panneau d'administration Jestly
-- ============================================================

-- ============================================================
-- 1. admin_audit_logs — Journal d'audit des actions admin
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,           -- ex: 'access_granted', 'access_denied', 'view_account', 'export_data', 'update_note'
  target_type TEXT,               -- ex: 'account', 'waitlist', 'billing', 'system'
  target_id TEXT,                 -- ex: UUID utilisateur ou ID ressource
  metadata JSONB DEFAULT '{}',   -- contexte additionnel
  ip_address TEXT,
  user_agent TEXT,
  result TEXT DEFAULT 'success',  -- 'success' ou 'denied'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes par acteur et chronologie
CREATE INDEX idx_admin_audit_actor ON admin_audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_admin_audit_action ON admin_audit_logs(action, created_at DESC);
CREATE INDEX idx_admin_audit_target ON admin_audit_logs(target_type, target_id);
CREATE INDEX idx_admin_audit_created ON admin_audit_logs(created_at DESC);

-- RLS activé mais aucune policy = accès uniquement via service_role
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. admin_account_notes — Notes internes sur les comptes
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_account_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES auth.users(id),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes par compte et chronologie
CREATE INDEX idx_admin_notes_account ON admin_account_notes(account_id, created_at DESC);
-- Index partiel pour les notes épinglées (accès rapide)
CREATE INDEX idx_admin_notes_pinned ON admin_account_notes(account_id, is_pinned) WHERE is_pinned = true;

-- RLS activé, accès admin uniquement via service_role
ALTER TABLE admin_account_notes ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. admin_account_flags — Drapeaux/tags sur les comptes
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_account_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES auth.users(id),
  flag_type TEXT NOT NULL,        -- 'watch', 'support_issue', 'churn_risk', 'high_value', 'blocked', 'vip'
  reason TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  UNIQUE(account_id, flag_type)
);

-- Index pour requêtes par compte
CREATE INDEX idx_admin_flags_account ON admin_account_flags(account_id);
-- Index partiel pour les flags actifs (non résolus)
CREATE INDEX idx_admin_flags_type ON admin_account_flags(flag_type) WHERE resolved_at IS NULL;

-- RLS activé, accès admin uniquement via service_role
ALTER TABLE admin_account_flags ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. Trigger updated_at sur admin_account_notes
-- ============================================================

CREATE TRIGGER set_admin_notes_updated_at
  BEFORE UPDATE ON admin_account_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- ============================================================
-- 5. fn_admin_global_stats — Statistiques globales admin
--    SECURITY DEFINER : vérifie que l'appelant est l'admin
-- ============================================================

CREATE OR REPLACE FUNCTION fn_admin_global_stats(p_admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_result JSONB;
  v_now TIMESTAMPTZ := now();
  v_week_ago TIMESTAMPTZ := now() - INTERVAL '7 days';
  v_month_ago TIMESTAMPTZ := now() - INTERVAL '30 days';
BEGIN
  -- Vérification : seul l'admin Jestly peut appeler cette fonction
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_admin_id;

  IF v_email IS NULL OR lower(v_email) != 'jestlyapp@gmail.com' THEN
    RAISE EXCEPTION 'Accès refusé : utilisateur non autorisé';
  END IF;

  SELECT jsonb_build_object(
    -- Compteurs globaux
    'total_users',    (SELECT count(*) FROM profiles),
    'total_orders',   (SELECT count(*) FROM orders),
    'total_revenue',  COALESCE((
      SELECT sum(amount) FROM orders
      WHERE status IN ('paid', 'delivered', 'invoiced')
    ), 0),
    'total_products', (SELECT count(*) FROM products),
    'total_clients',  (SELECT count(*) FROM clients),
    'total_sites',    (SELECT count(*) FROM sites),
    'total_waitlist', (SELECT count(*) FROM waitlist),
    'total_leads',    (SELECT count(*) FROM leads),
    'total_projects', (SELECT count(*) FROM projects),

    -- Nouveaux utilisateurs cette semaine / ce mois
    'users_this_week',  (SELECT count(*) FROM profiles WHERE created_at >= v_week_ago),
    'users_this_month', (SELECT count(*) FROM profiles WHERE created_at >= v_month_ago),

    -- Commandes cette semaine / ce mois
    'orders_this_week',  (SELECT count(*) FROM orders WHERE created_at >= v_week_ago),
    'orders_this_month', (SELECT count(*) FROM orders WHERE created_at >= v_month_ago),

    -- Revenu cette semaine / ce mois (commandes payées/livrées/facturées)
    'revenue_this_week',  COALESCE((
      SELECT sum(amount) FROM orders
      WHERE status IN ('paid', 'delivered', 'invoiced')
        AND created_at >= v_week_ago
    ), 0),
    'revenue_this_month', COALESCE((
      SELECT sum(amount) FROM orders
      WHERE status IN ('paid', 'delivered', 'invoiced')
        AND created_at >= v_month_ago
    ), 0)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
