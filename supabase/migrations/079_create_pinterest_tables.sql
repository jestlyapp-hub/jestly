-- 079_create_pinterest_tables.sql
-- Cache des données Pinterest Ads (scopées par integration → user via RLS).
-- raw_data jsonb conservé partout (lisibilité future par un agent LLM).

create table if not exists public.pinterest_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  pinterest_ad_account_id text not null,
  name text not null,
  country text,
  currency text,
  owner_user_id text,
  metadata jsonb not null default '{}',
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, pinterest_ad_account_id)
);

create table if not exists public.pinterest_campaigns (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  ad_account_id text not null,
  pinterest_campaign_id text not null,
  name text not null,
  status text,
  objective_type text,
  start_time timestamptz,
  end_time timestamptz,
  daily_spend_cap_cents bigint,
  lifetime_spend_cap_cents bigint,
  metadata jsonb not null default '{}',
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, pinterest_campaign_id)
);
create index if not exists idx_pinterest_campaigns_account on public.pinterest_campaigns(integration_id, ad_account_id);

create table if not exists public.pinterest_ad_groups (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  campaign_id text not null,
  pinterest_ad_group_id text not null,
  name text not null,
  status text,
  budget_in_micro_currency bigint,
  bid_in_micro_currency bigint,
  targeting_spec jsonb,
  metadata jsonb not null default '{}',
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, pinterest_ad_group_id)
);
create index if not exists idx_pinterest_ad_groups_campaign on public.pinterest_ad_groups(integration_id, campaign_id);

create table if not exists public.pinterest_ads (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  ad_group_id text not null,
  pinterest_ad_id text not null,
  name text,
  status text,
  pin_id text,
  click_tracking_url text,
  metadata jsonb not null default '{}',
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, pinterest_ad_id)
);
create index if not exists idx_pinterest_ads_ad_group on public.pinterest_ads(integration_id, ad_group_id);

create table if not exists public.pinterest_metrics_daily (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  entity_type text not null check (entity_type in ('campaign', 'ad_group', 'ad')),
  entity_id text not null,
  date date not null,
  impressions bigint default 0,
  clicks bigint default 0,
  outbound_clicks bigint default 0,
  spend_cents bigint default 0,
  ctr numeric(8,4),
  cpc_cents bigint,
  conversions bigint default 0,
  conversion_value_cents bigint default 0,
  pinterest_reported_roas numeric(8,4),
  raw_data jsonb,
  created_at timestamptz not null default now(),
  unique (integration_id, entity_type, entity_id, date)
);
create index if not exists idx_pinterest_metrics_daily_entity on public.pinterest_metrics_daily(integration_id, entity_type, entity_id, date desc);
create index if not exists idx_pinterest_metrics_daily_date on public.pinterest_metrics_daily(integration_id, date desc);

create table if not exists public.pinterest_pins (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references public.integrations(id) on delete cascade,
  pinterest_pin_id text not null,
  board_id text,
  title text,
  description text,
  link text,
  pin_type text,
  is_promoted boolean default false,
  media_url text,
  metadata jsonb not null default '{}',
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (integration_id, pinterest_pin_id)
);
create index if not exists idx_pinterest_pins_promoted on public.pinterest_pins(integration_id, is_promoted);

-- RLS : lecture scopée par user via jointure integrations.
do $$
declare t text;
begin
  foreach t in array array[
    'pinterest_ad_accounts','pinterest_campaigns','pinterest_ad_groups',
    'pinterest_ads','pinterest_metrics_daily','pinterest_pins'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    begin
      execute format(
        'create policy "users read own %1$s" on public.%1$s for select using (integration_id in (select id from public.integrations where user_id = auth.uid()))',
        t
      );
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
