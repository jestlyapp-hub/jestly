-- 090_v3_profit_costs.sql
-- Profit Engine : COGS par produit/variante (historisés) + réglages financiers de la boutique.

CREATE TABLE IF NOT EXISTS public.product_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id TEXT,
  cogs_cents INTEGER NOT NULL CHECK (cogs_cents >= 0),
  shipping_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cost_cents >= 0),
  effective_from DATE NOT NULL,
  effective_to DATE,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv_upload')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, product_id, variant_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_product_costs_store_product ON public.product_costs(store_id, product_id);

CREATE TABLE IF NOT EXISTS public.store_financial_settings (
  store_id UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  payment_processor_fee_percent NUMERIC NOT NULL DEFAULT 1.4,
  payment_processor_fee_fixed_cents INTEGER NOT NULL DEFAULT 25,
  shopify_monthly_subscription_cents INTEGER NOT NULL DEFAULT 0,
  shopify_transaction_fee_percent NUMERIC NOT NULL DEFAULT 0,
  additional_monthly_fixed_costs_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_store_financial_settings_updated_at ON public.store_financial_settings;
CREATE TRIGGER trg_store_financial_settings_updated_at
  BEFORE UPDATE ON public.store_financial_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.product_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_financial_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_costs_owner_all" ON public.product_costs;
CREATE POLICY "product_costs_owner_all" ON public.product_costs
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "store_financial_settings_owner_all" ON public.store_financial_settings;
CREATE POLICY "store_financial_settings_owner_all" ON public.store_financial_settings
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
