-- 077_create_oauth_states.sql
-- États CSRF temporaires pour les flows OAuth multi-provider (Pinterest, Google Ads, …).
-- Le state est créé au démarrage du flow et consommé (supprimé) au callback.

create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  state text unique not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  redirect_to text,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  created_at timestamptz not null default now()
);

create index if not exists idx_oauth_states_state on public.oauth_states(state);
create index if not exists idx_oauth_states_user on public.oauth_states(user_id);

-- Nettoyage des states expirés (appelable par cron).
create or replace function public.cleanup_expired_oauth_states() returns void as $$
  delete from public.oauth_states where expires_at < now();
$$ language sql;

alter table public.oauth_states enable row level security;

-- Policies (idempotentes via do/exception : Postgres n'a pas CREATE POLICY IF NOT EXISTS).
do $$ begin
  create policy "users read own states" on public.oauth_states for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "users insert own states" on public.oauth_states for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "users delete own states" on public.oauth_states for delete using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
