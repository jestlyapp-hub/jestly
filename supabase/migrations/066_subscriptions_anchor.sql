-- ═══════════════════════════════════════════════════════════════════
-- 066 — Subscriptions: billing_anchor_date pour quarterly/yearly exact
-- ═══════════════════════════════════════════════════════════════════

-- Date d'ancrage pour calcul exact des échéances quarterly/yearly
-- Ex: un abo trimestriel ancré au 2026-01-15 tombe les 15 jan, 15 avr, 15 jul, 15 oct
alter table public.subscriptions
  add column if not exists billing_anchor_date date;

-- Date rappel résiliation (optionnel)
alter table public.subscriptions
  add column if not exists cancel_reminder_date date;

-- Backfill: pour les abos existants, utiliser created_at comme anchor
update public.subscriptions
  set billing_anchor_date = created_at::date
  where billing_anchor_date is null;
