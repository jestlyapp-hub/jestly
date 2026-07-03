-- 095_create_gads_tables.sql
-- Base Google Ads (import CSV) — tables SÉPARÉES du module Pinterest/V2.
-- Ne PAS écrire dans campaign_performance_daily : son cron fait du
-- delete-then-upsert par (user, provider) qui écraserait ces données.

-- ── gads_daily : une ligne par (campagne, jour) importée depuis le CSV ──
-- Le CSV le plus récent FAIT FOI : chaque import UPSERT et écrase les
-- valeurs existantes (Google reconsolide ses chiffres sur plusieurs jours).
CREATE TABLE IF NOT EXISTS public.gads_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name text NOT NULL,
  date date NOT NULL,
  cost_cents bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  impressions bigint NOT NULL DEFAULT 0,
  conversions numeric(12,2) NOT NULL DEFAULT 0,
  conversion_value_cents bigint NOT NULL DEFAULT 0,
  imported_at timestamptz NOT NULL DEFAULT now(),
  source_file text,

  -- Clé de déduplication des imports (scopée par utilisateur).
  UNIQUE (user_id, campaign_name, date)
);

CREATE INDEX IF NOT EXISTS idx_gads_daily_user_date
  ON public.gads_daily(user_id, date DESC);

ALTER TABLE public.gads_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads daily" ON public.gads_daily;
CREATE POLICY "users read own gads daily" ON public.gads_daily
  FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE via service_role uniquement (route d'import côté server).

-- ── gads_manual_overrides : commandes ajoutées/corrigées à la main ──
-- Garde-fou anti-biais : table SÉPARÉE, jamais fondue dans les données
-- CSV/Shopify. Le dashboard affiche "ROAS données brutes" et "ROAS avec
-- overrides manuels" séparément pour rendre l'impact des corrections visible.
CREATE TABLE IF NOT EXISTS public.gads_manual_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  campaign_name text,
  revenue_cents bigint NOT NULL DEFAULT 0,
  orders_count int NOT NULL DEFAULT 1 CHECK (orders_count >= 0),
  is_manual boolean NOT NULL DEFAULT true,
  -- Note obligatoire : chaque correction manuelle doit être justifiée.
  note text NOT NULL CHECK (char_length(btrim(note)) >= 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gads_manual_user_date
  ON public.gads_manual_overrides(user_id, date DESC);

ALTER TABLE public.gads_manual_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own gads manual" ON public.gads_manual_overrides;
CREATE POLICY "users read own gads manual" ON public.gads_manual_overrides
  FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE/DELETE via service_role uniquement (routes côté server).
