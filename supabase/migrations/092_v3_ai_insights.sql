-- 092_v3_ai_insights.sql
-- AI Insights : briefs quotidiens (Claude API) + anomalies détectées.

CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily_summary','anomaly','recommendation')),
  severity TEXT CHECK (severity IN ('info','warning','critical')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  context JSONB,
  language TEXT NOT NULL DEFAULT 'fr',
  recommendations JSONB,
  delivered_via JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_store_created ON public.ai_insights(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_store_unread ON public.ai_insights(store_id) WHERE read_at IS NULL;

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ai_insights_owner_all" ON public.ai_insights;
CREATE POLICY "ai_insights_owner_all" ON public.ai_insights
  FOR ALL USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
