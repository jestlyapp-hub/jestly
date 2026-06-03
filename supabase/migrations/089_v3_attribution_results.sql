-- 089_v3_attribution_results.sql
-- Résultats du moteur d'attribution multi-touch, une ligne par (store, order, modèle).

CREATE TABLE IF NOT EXISTS public.attribution_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  order_total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  model TEXT NOT NULL CHECK (model IN ('last_click','first_click','linear','time_decay','position_based')),
  touchpoints JSONB NOT NULL DEFAULT '[]',
  attributed_channels JSONB NOT NULL DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, order_id, model)
);

CREATE INDEX IF NOT EXISTS idx_attribution_store_model ON public.attribution_results(store_id, model);
CREATE INDEX IF NOT EXISTS idx_attribution_store_order ON public.attribution_results(store_id, order_id);

ALTER TABLE public.attribution_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attribution_owner_select" ON public.attribution_results;
CREATE POLICY "attribution_owner_select" ON public.attribution_results
  FOR SELECT USING (
    store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
  );
