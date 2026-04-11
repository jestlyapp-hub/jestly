-- ═══════════════════════════════════════════════════════════════════
-- 065 — Cockpit Abonnements
-- Table pour suivre les abonnements SaaS/outils des freelances
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,

  -- Identité
  name          text not null,
  logo_url      text,
  domain        text,                -- ex: notion.so, figma.com
  color_tag     text,                -- hex color pour le fallback

  -- Facturation
  amount_cents  integer not null default 0,
  billing_frequency text not null default 'monthly'
    check (billing_frequency in ('monthly', 'quarterly', 'yearly')),
  billing_day   integer not null default 1
    check (billing_day between 1 and 31),
  currency      text not null default 'EUR',

  -- Classification
  category      text not null default 'other'
    check (category in ('design', 'marketing', 'hosting', 'tools', 'media', 'finance', 'communication', 'other')),
  is_tax_deductible boolean not null default false,

  -- Statut & usage
  status        text not null default 'active'
    check (status in ('active', 'paused', 'to_cancel', 'cancelled')),
  last_used_at  timestamptz,

  -- Méta
  notes         text,
  budget_limit_cents integer,        -- budget max perso pour cet abo

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index
create index if not exists idx_subscriptions_owner on public.subscriptions(owner_id);
create index if not exists idx_subscriptions_status on public.subscriptions(owner_id, status);
create index if not exists idx_subscriptions_billing on public.subscriptions(owner_id, billing_day);

-- RLS
alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = owner_id);

create policy "Users can insert own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = owner_id);

create policy "Users can delete own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = owner_id);

-- Updated_at trigger
create or replace function public.fn_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.fn_subscriptions_updated_at();
