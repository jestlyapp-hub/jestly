"use client";

import { Suspense, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { RefreshCw, Loader2, Target } from "lucide-react";
import Link from "next/link";
import AdsKpiGrid from "@/components/ecom/ads/AdsKpiGrid";
import AdsStatusBadges from "@/components/ecom/ads/AdsStatusBadges";
import SpendRevenueChart from "@/components/ecom/ads/SpendRevenueChart";
import TopCampaignsList from "@/components/ecom/ads/TopCampaignsList";
import AdsAlertsPanel from "@/components/ecom/ads/AdsAlertsPanel";
import CampaignsTable from "@/components/ecom/ads/CampaignsTable";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import InsightsBar from "@/components/ecom/ads/InsightsBar";
import { computeRoas } from "@/lib/ads/roas-engine";
import { formatRoas } from "@/lib/ads/formatters";
import type { CampaignRow, ProfitStatus } from "@/lib/ads/types";

interface OverviewResponse {
  range: { from: string; to: string };
  kpis: Record<string, { value?: number; value_cents?: number | null; formatted: string; delta_percent: number | null; status?: ProfitStatus }>;
  campaigns_by_status: { profitable: number; warning: number; unprofitable: number; total: number };
}

interface TimelineResponse { points: Array<{ date: string; spend_cents: number; revenue_cents: number; orders: number; roas: number | null }> }
interface CampaignsResponse { campaigns: CampaignRow[]; total: number }
interface TopResponse { campaigns: CampaignRow[] }
interface AlertsResponse { alerts: Array<{ id: string; alert_type: string; severity: "info" | "warning" | "critical"; campaign_id: string | null; campaign_name: string | null; provider: string | null; title: string; message: string; recommendation: string | null; detected_at: string; status: string }> }
interface PinterestStatus { connected: boolean; integration?: { external_account_id: string | null; status: string } }

function AdsOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const range = (searchParams.get("range") ?? "30d") as "7d" | "30d" | "90d" | "custom";
  const sortBy = searchParams.get("sortBy") ?? "spend";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";
  const status = (searchParams.get("status") ?? "all") as ProfitStatus | "all";
  const search = searchParams.get("search") ?? "";

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("range", range);
    return p.toString();
  }, [range]);

  const campaignsQuery = useMemo(() => {
    const p = new URLSearchParams();
    p.set("range", range);
    p.set("sortBy", sortBy);
    p.set("sortOrder", sortOrder);
    if (status !== "all") p.set("status", status);
    if (search) p.set("search", search);
    return p.toString();
  }, [range, sortBy, sortOrder, status, search]);

  const { data: overview, mutate: mutateOverview } = useApi<OverviewResponse>(`/api/ecom/ads/overview?${queryString}`);
  const { data: pinterestStatus } = useApi<PinterestStatus>("/api/integrations/pinterest/status");
  const { data: timeline } = useApi<TimelineResponse>(`/api/ecom/ads/timeline?${queryString}`);
  const { data: topProfit } = useApi<TopResponse>(`/api/ecom/ads/top?type=profitable&limit=5&${queryString}`);
  const { data: topUnprofit } = useApi<TopResponse>(`/api/ecom/ads/top?type=unprofitable&limit=5&${queryString}`);
  const { data: campaignsRes, mutate: mutateCampaigns } = useApi<CampaignsResponse>(`/api/ecom/ads/campaigns?${campaignsQuery}`);
  const { data: alertsRes, mutate: mutateAlerts } = useApi<AlertsResponse>("/api/ecom/ads/alerts?status=active");

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await apiFetch("/api/ecom/ads/refresh", { method: "POST", body: { full: false } });
      toast.success("Recompute lancé");
      mutateOverview(); mutateCampaigns(); mutateAlerts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    } finally {
      setRefreshing(false);
    }
  };

  const updateParam = useCallback((key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value == null || value === "" || (key === "status" && value === "all")) p.delete(key);
    else p.set(key, value);
    router.replace(`/ecom/ads?${p.toString()}`);
  }, [searchParams, router]);

  // Insights bar : auto-message basé sur deltas
  const insight = useMemo(() => {
    if (!overview) return null;
    const roasDelta = overview.kpis.roas?.delta_percent;
    const spendDelta = overview.kpis.spend?.delta_percent;
    if (roasDelta != null && roasDelta < -10) {
      return `votre ROAS baisse de ${Math.abs(roasDelta).toFixed(1)}% vs la période précédente. ${overview.campaigns_by_status.unprofitable > 0 ? `${overview.campaigns_by_status.unprofitable} campagne(s) à mettre en pause.` : "Vérifiez les recommandations."}`;
    }
    if (roasDelta != null && roasDelta > 10) {
      return `votre ROAS progresse de +${roasDelta.toFixed(1)}% — bonne dynamique !`;
    }
    if (spendDelta != null && spendDelta > 30) {
      return `vous avez augmenté votre dépense de +${spendDelta.toFixed(1)}% — vérifiez que le revenu suit.`;
    }
    return null;
  }, [overview]);

  const kpis = overview ? [
    { label: "Dépense", value: overview.kpis.spend.formatted, delta_percent: overview.kpis.spend.delta_percent, positiveIsGood: false },
    { label: "Revenue", value: overview.kpis.revenue.formatted, delta_percent: overview.kpis.revenue.delta_percent, positiveIsGood: true },
    { label: "ROAS réel", value: overview.kpis.roas.formatted, delta_percent: overview.kpis.roas.delta_percent, positiveIsGood: true, status: overview.kpis.roas.status },
    { label: "Commandes", value: overview.kpis.orders.formatted, delta_percent: overview.kpis.orders.delta_percent, positiveIsGood: true },
    { label: "CPC moyen", value: overview.kpis.cpc.formatted, delta_percent: overview.kpis.cpc.delta_percent, positiveIsGood: false },
    { label: "CPA moyen", value: overview.kpis.cpa.formatted, delta_percent: overview.kpis.cpa.delta_percent, positiveIsGood: false },
  ] : [];

  if (overview && overview.campaigns_by_status.total === 0) {
    // Cas 1 : aucune intégration Ads connectée
    const adsConnected = pinterestStatus?.connected && pinterestStatus?.integration?.external_account_id;
    if (!adsConnected) {
      return (
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EEFF] flex items-center justify-center mx-auto mb-4">
            <Target className="text-[#7C3AED]" size={26} />
          </div>
          <h1 className="text-[22px] font-bold text-[#191919] mb-2">Aucune campagne</h1>
          <p className="text-[13px] text-[#5A5A58] mb-5">
            Connectez une régie publicitaire pour voir vos campagnes et calculer le ROAS réel basé sur vos commandes Shopify.
          </p>
          <Link href="/ecom/settings?tab=integrations" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold rounded-md">
            Connecter Pinterest →
          </Link>
        </div>
      );
    }
    // Cas 2 : intégration connectée mais pas encore de performance calculée
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EEFF] flex items-center justify-center mx-auto mb-4">
          <Target className="text-[#7C3AED]" size={26} />
        </div>
        <h1 className="text-[22px] font-bold text-[#191919] mb-2">Calcul ROAS en attente</h1>
        <p className="text-[13px] text-[#5A5A58] mb-5">
          Pinterest est connecté mais le calcul ROAS n&apos;a pas encore tourné.
          Lance un recompute pour croiser tes métriques Ads avec tes commandes Shopify.
        </p>
        <button
          onClick={handleRefresh} disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold rounded-md disabled:opacity-50"
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Lancer le calcul maintenant
        </button>
        <p className="text-[11px] text-[#8A8A88] mt-3">
          Le cron auto tourne toutes les 6h30 — tu peux aussi attendre.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold text-[#191919] tracking-tight">Performance Ads</h1>
          <p className="text-[12px] text-[#8A8A88] mt-0.5">ROAS réel basé sur vos vraies commandes Shopify attribuées</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={range} onChange={(v) => updateParam("range", v)} />
          <button
            onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] disabled:opacity-50"
          >
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Actualiser
          </button>
        </div>
      </header>

      {/* KPI grid */}
      <AdsKpiGrid kpis={kpis} loading={!overview} />

      {/* Status badges */}
      {overview && <AdsStatusBadges {...overview.campaigns_by_status} />}

      {/* Insights bar */}
      <InsightsBar message={insight} />

      {/* Chart */}
      {timeline && <SpendRevenueChart points={timeline.points} />}

      {/* Top 3 columns + alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <TopCampaignsList title="Top rentables" type="profitable" campaigns={topProfit?.campaigns ?? []} />
        <TopCampaignsList title="À pause / surveiller" type="unprofitable" campaigns={topUnprofit?.campaigns ?? []} />
        <AdsAlertsPanel alerts={alertsRes?.alerts ?? []} onChange={mutateAlerts} />
      </div>

      {/* Campaigns table */}
      <CampaignsTable
        campaigns={campaignsRes?.campaigns ?? []}
        total={campaignsRes?.total ?? 0}
        onSortChange={(by, order) => {
          updateParam("sortBy", by);
          updateParam("sortOrder", order);
        }}
        onStatusFilter={(s) => updateParam("status", s === "all" ? null : s)}
        onSearchChange={(s) => updateParam("search", s || null)}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        currentStatus={status}
        currentSearch={search}
        exportHref={`/api/ecom/ads/export?range=${range}`}
      />

      {/* Footer mini-stats */}
      {overview && (
        <div className="text-[11px] text-[#8A8A88] text-center py-2">
          ROAS global : <strong className="text-[#191919]">{formatRoas(computeRoas(
            overview.kpis.revenue.value_cents ?? 0,
            overview.kpis.spend.value_cents ?? 0,
          ))}</strong> · MAJ {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

export default function EcomAdsPage() {
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <AdsOverviewContent />
    </Suspense>
  );
}
