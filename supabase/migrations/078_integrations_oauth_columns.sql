-- 078_integrations_oauth_columns.sql
-- Étend `integrations` pour le modèle OAuth (refresh token) des providers Ads.
-- Shopify (client_credentials) continue d'utiliser secret_encrypted ; ces colonnes
-- restent nulles pour lui.

alter table public.integrations
  add column if not exists oauth_refresh_token_encrypted text,
  add column if not exists oauth_access_token_encrypted text,
  add column if not exists oauth_token_expires_at timestamptz,
  add column if not exists external_account_id text,
  add column if not exists external_account_name text;

create index if not exists idx_integrations_external_account
  on public.integrations(provider, external_account_id);
