-- ================================================================
-- 060 — Onboarding questionnaire fields on profiles
-- ================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discovery_source     TEXT,
  ADD COLUMN IF NOT EXISTS freelance_type       TEXT,
  ADD COLUMN IF NOT EXISTS freelance_experience TEXT,
  ADD COLUMN IF NOT EXISTS client_volume        TEXT,
  ADD COLUMN IF NOT EXISTS main_goal            TEXT,
  ADD COLUMN IF NOT EXISTS wants_tips           BOOLEAN;
