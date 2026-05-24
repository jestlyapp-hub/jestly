-- 075_sync_state_table.sql
-- État de synchronisation par intégration : utilisé par le sync delta
-- et la barre de progression de l'initial sync.

CREATE TABLE IF NOT EXISTS public.shopify_sync_state (
  integration_id uuid PRIMARY KEY REFERENCES public.integrations(id) ON DELETE CASCADE,
  last_orders_sync_at timestamptz,
  last_products_sync_at timestamptz,
  last_customers_sync_at timestamptz,
  last_analytics_sync_at timestamptz,
  last_sessions_sync_at timestamptz,
  initial_sync_completed boolean NOT NULL DEFAULT false,
  initial_sync_started_at timestamptz,
  initial_sync_completed_at timestamptz,
  initial_sync_progress jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_sync_state_updated_at ON public.shopify_sync_state;
CREATE TRIGGER trg_sync_state_updated_at
  BEFORE UPDATE ON public.shopify_sync_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS : un user voit l'état de sync de ses propres intégrations
ALTER TABLE public.shopify_sync_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sync_state_select_own ON public.shopify_sync_state;
CREATE POLICY sync_state_select_own ON public.shopify_sync_state
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));
