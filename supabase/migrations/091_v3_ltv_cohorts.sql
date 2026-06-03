-- 091_v3_ltv_cohorts.sql
-- LTV / cohortes mensuelles (recalcul nightly).

CREATE TABLE IF NOT EXISTS public.ltv_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  cohort_month DATE NOT NULL,
  n_customers INTEGER NOT NULL,
  ltv_30d_cents INTEGER NOT NULL DEFAULT 0,
  ltv_60d_cents INTEGER NOT NULL DEFAULT 0,
  ltv_90d_cents INTEGER NOT NULL DEFAULT 0,
  ltv_180d_cents INTEGER NOT NULL DEFAULT 0,
  ltv_365d_cents INTEGER NOT NULL DEFAULT 0,
  repeat_rate_30d NUMERIC,
  repeat_rate_90d NUMERIC,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, cohort_month)
);

CREATE INDEX IF NOT EXISTS idx_ltv_cohorts_store ON public.ltv_cohorts(store_id, cohort_month);

ALTER TABLE public.ltv_cohorts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ltv_cohorts_owner_select" ON public.ltv_cohorts;
CREATE POLICY "ltv_cohorts_owner_select" ON public.ltv_cohorts
  FOR SELECT USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
