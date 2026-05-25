-- 086_campaign_perf_lifecycle_status.sql
-- Ajoute le statut de cycle de vie de la campagne (ACTIVE / PAUSED / ARCHIVED, etc.)
-- sur campaign_performance_daily, pour pouvoir filtrer les campagnes archivées dans
-- l'UI (toggle "Voir aussi les archivées", default off) sans les confondre avec le
-- profit_status (rentable / en perte). Renseigné par le ROAS engine depuis
-- pinterest_campaigns.status (et équivalents par provider).

ALTER TABLE public.campaign_performance_daily
  ADD COLUMN IF NOT EXISTS campaign_status text;

-- Index partiel pour exclure rapidement les archivées (cas par défaut de l'overview/table).
CREATE INDEX IF NOT EXISTS idx_campaign_perf_lifecycle
  ON public.campaign_performance_daily(user_id, provider, campaign_status, date DESC);
