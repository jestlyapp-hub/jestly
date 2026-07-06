-- 102_ecom_settings_goals.sql
-- Objectif mensuel (refonte ECOM, carte blanche C) : CA et/ou Net Profit visés
-- par mois. Jauge de progression sur le Dashboard (réalisé vs objectif vs
-- prorata du mois écoulé). 0 = pas d'objectif défini.

ALTER TABLE public.ecom_settings
  ADD COLUMN IF NOT EXISTS monthly_revenue_goal_cents bigint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_net_profit_goal_cents bigint NOT NULL DEFAULT 0;
