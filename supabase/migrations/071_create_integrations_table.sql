-- 071_create_integrations_table.sql
-- Table multi-tenant `integrations` : une ligne par (user, provider, shop_domain).
-- Le token est chiffré au repos via pgsodium (colonne bytea).

CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('shopify', 'ga4', 'google_ads', 'pinterest', 'klaviyo', 'clarity')),
  shop_domain text,
  access_token_encrypted bytea NOT NULL,
  access_token_nonce bytea NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  webhooks_subscribed text[] NOT NULL DEFAULT '{}',
  webhook_secret_encrypted bytea,
  webhook_secret_nonce bytea,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error', 'disconnected')),
  last_sync_at timestamptz,
  last_error text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, shop_domain)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_provider ON public.integrations(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON public.integrations(status) WHERE status = 'active';

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_integrations_updated_at ON public.integrations;
CREATE TRIGGER trg_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
