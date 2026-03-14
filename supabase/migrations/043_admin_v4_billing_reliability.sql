-- ============================================================
-- Migration 043: Admin V4 — Billing & Reliability Intelligence
-- ============================================================

-- 1. billing_sync_events — Log des événements Stripe reçus via webhook
CREATE TABLE IF NOT EXISTS billing_sync_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,  -- Idempotence
  event_type TEXT NOT NULL,              -- ex: customer.subscription.updated
  customer_id TEXT,                      -- Stripe customer ID
  account_id UUID REFERENCES auth.users(id),  -- Jestly user lié
  payload JSONB DEFAULT '{}',           -- Données utiles extraites
  status TEXT DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'ignored')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bse_event_type ON billing_sync_events(event_type, created_at DESC);
CREATE INDEX idx_bse_account ON billing_sync_events(account_id, created_at DESC);
CREATE INDEX idx_bse_customer ON billing_sync_events(customer_id);
CREATE INDEX idx_bse_created ON billing_sync_events(created_at DESC);

ALTER TABLE billing_sync_events ENABLE ROW LEVEL SECURITY;
-- Admin-only via service_role

-- 2. Ajouter colonnes Stripe au profil si manquantes
-- stripe_customer_id et stripe_subscription_id existent déjà (migration 001)
-- Ajouter stripe_plan_id et subscription_status pour sync rapide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_plan_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_plan_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
    ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'none' CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'trial_ends_at') THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_period_end') THEN
    ALTER TABLE profiles ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends ON profiles(trial_ends_at) WHERE trial_ends_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_period_end ON profiles(current_period_end) WHERE current_period_end IS NOT NULL;
