-- ============================================================
-- Jestly — Subdomain tracking (cooldown + anti-abuse)
-- ============================================================

-- Timestamp du dernier changement de sous-domaine
alter table public.sites
  add column if not exists subdomain_changed_at timestamptz;

-- Compteur de changements (reset quotidien côté app, max 5/jour)
alter table public.sites
  add column if not exists subdomain_change_count int not null default 0;

-- Date de reset du compteur
alter table public.sites
  add column if not exists subdomain_count_reset_at timestamptz not null default now();
