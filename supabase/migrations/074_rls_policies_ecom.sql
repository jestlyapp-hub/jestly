-- 074_rls_policies_ecom.sql
-- Row Level Security stricte sur toutes les tables ecom.
-- Un utilisateur ne voit que ses propres intégrations et le cache associé.

-- ── integrations ──────────────────────────────────────────────────
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integrations_select_own ON public.integrations;
CREATE POLICY integrations_select_own ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS integrations_insert_own ON public.integrations;
CREATE POLICY integrations_insert_own ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS integrations_update_own ON public.integrations;
CREATE POLICY integrations_update_own ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS integrations_delete_own ON public.integrations;
CREATE POLICY integrations_delete_own ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- ── Helper : un user possède l'integration si son user_id matche ──
CREATE OR REPLACE FUNCTION public.fn_user_owns_integration(p_integration_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.integrations
    WHERE id = p_integration_id AND user_id = auth.uid()
  );
$$;

-- ── shopify_orders ────────────────────────────────────────────────
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_orders_select_own ON public.shopify_orders;
CREATE POLICY shopify_orders_select_own ON public.shopify_orders
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));

-- ── shopify_products ──────────────────────────────────────────────
ALTER TABLE public.shopify_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_products_select_own ON public.shopify_products;
CREATE POLICY shopify_products_select_own ON public.shopify_products
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));

-- ── shopify_customers ─────────────────────────────────────────────
ALTER TABLE public.shopify_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_customers_select_own ON public.shopify_customers;
CREATE POLICY shopify_customers_select_own ON public.shopify_customers
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));

-- ── shopify_sessions_daily ────────────────────────────────────────
ALTER TABLE public.shopify_sessions_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_sessions_select_own ON public.shopify_sessions_daily;
CREATE POLICY shopify_sessions_select_own ON public.shopify_sessions_daily
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));

-- ── shopify_analytics_daily ───────────────────────────────────────
ALTER TABLE public.shopify_analytics_daily ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_analytics_select_own ON public.shopify_analytics_daily;
CREATE POLICY shopify_analytics_select_own ON public.shopify_analytics_daily
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));

-- ── shopify_webhook_events ────────────────────────────────────────
ALTER TABLE public.shopify_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shopify_webhooks_select_own ON public.shopify_webhook_events;
CREATE POLICY shopify_webhooks_select_own ON public.shopify_webhook_events
  FOR SELECT USING (public.fn_user_owns_integration(integration_id));

-- Note : les INSERT/UPDATE/DELETE sur shopify_* sont faits uniquement via
-- service_role (côté server, jamais côté client). Pas de policies écriture.
