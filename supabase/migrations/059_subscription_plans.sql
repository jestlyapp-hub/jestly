-- ═══════════════════════════════════════════════════════════════════════
-- Migration 059 : Système d'abonnements — plans + business tier
--
-- Ajoute le plan "business" au CHECK constraint profiles.plan
-- Crée la table subscription_events pour l'audit trail
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Étendre le CHECK constraint pour supporter "business" et "starter" ──
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check
  CHECK (plan IN ('free', 'starter', 'pro', 'business'));

-- Normaliser les plans "free" existants vers "starter" pour cohérence
-- (les deux sont traités identiquement dans le code)
COMMENT ON COLUMN public.profiles.plan IS 'Plan actif: free/starter (gratuit), pro, business';

-- ── 2. Table d'audit des événements abonnement ──
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  -- Types: plan_changed, quota_exceeded, resource_blocked, payment_failed, subscription_canceled, subscription_reactivated
  from_plan TEXT,
  to_plan TEXT,
  resource_type TEXT, -- sites, orders_per_month, active_projects, pages_per_site
  resource_count INTEGER,
  resource_limit INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_user ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_sub_events_created ON public.subscription_events(created_at DESC);

-- RLS
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription events"
  ON public.subscription_events
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can insert (for API routes)
CREATE POLICY "Service can insert subscription events"
  ON public.subscription_events
  FOR INSERT
  WITH CHECK (true);
