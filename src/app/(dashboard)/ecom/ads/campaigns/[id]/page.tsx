"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

import { use, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { ArrowLeft, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import AdsKpiGrid from "@/components/ecom/ads/AdsKpiGrid";
import CampaignFunnel from "@/components/ecom/ads/CampaignFunnel";
import CampaignStatusBadge from "@/components/ecom/ads/CampaignStatusBadge";
import SpendRevenueChart from "@/components/ecom/ads/SpendRevenueChart";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import { formatCurrency, formatRoas, formatNumberFr, formatPercent, formatProvider, providerEmoji, formatAttributionMethod, formatConfidence } from "@/lib/ads/formatters";
import type { AdsProvider } from "@/lib/ads/types";

interface DetailResponse {
  range: { from: string; to: string };
  campaign: {
    provider: string; campaign_id: string; campaign_name: string;
    spend: number; revenue: number; orders: number;
    impressions: number; clicks: number; outbound: number;
    real_roas: number | null; ctr: number | null; cpc_cents: number | null;
  };
  timeline: Array<{ date: string; spend_cents: number; revenue_cents: number; orders: number; roas: number | null }>;
  funnel: { impressions: number; clicks: number; outbound_clicks: number; orders: number };
  attributed_order_ids: string[];
}

interface OrdersResponse {
  orders: Array<{
    id: string; name: string; created_at: string; total_price: number; currency: string;
    email: string | null; financial_status: string;
    attribution_method: string | null; attribution_weight: number | null;
  }>;
}

interface AdsResponse {
  ad_groups: Array<{ pinterest_ad_group_id: string; name: string; status: string; budget_in_micro_currency: number | null }>;
  ads: Array<{ pinterest_ad_id: string; name: string | null; status: string; pin_id: string | null; ad_group_id: string }>;
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  usePageTitle("Détail campagne ECOM");
  const { id } = use(params);
  const searchParams = useSearchParams();
  const provider = (searchParams.get("provider") ?? "pinterest") as AdsProvider;
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const [refreshing, setRefreshing] = useState(false);

  const q = `?provider=${provider}&range=${range}`;
  const { data: detail, mutate: mutateDetail } = useApi<DetailResponse>(`/api/ecom/ads/campaigns/${id}${q}`);
  const { data: ordersRes } = useApi<OrdersResponse>(`/api/ecom/ads/campaigns/${id}/orders${q}`);
  const { data: adsRes } = useApi<AdsResponse>(`/api/ecom/ads/campaigns/${id}/ads?provider=${provider}`);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await apiFetch("/api/ecom/ads/refresh", { method: "POST", body: { full: false } });
      toast.success("Recompute lancé");
      mutateDetail();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec");
    } finally {
      setRefreshing(false);
    }
  };

  if (!detail) {
    return <div className="py-10 text-center"><Loader2 size={20} className="animate-spin text-[#7C3AED] mx-auto" /></div>;
  }

  const c = detail.campaign;
  const kpis = [
    { label: "Dépense", value: formatCurrency(c.spend), delta_percent: null, positiveIsGood: false },
    { label: "Revenue", value: formatCurrency(c.revenue), delta_percent: null, positiveIsGood: true },
    { label: "ROAS", value: formatRoas(c.real_roas), delta_percent: null, positiveIsGood: true, status: c.real_roas == null ? "unmatched" as const : c.real_roas >= 2 ? "profitable" as const : c.real_roas >= 1.5 ? "warning" as const : "unprofitable" as const },
    { label: "Commandes", value: formatNumberFr(c.orders), delta_percent: null, positiveIsGood: true },
    { label: "CTR", value: c.ctr != null ? formatPercent(c.ctr, 2) : "—", delta_percent: null, positiveIsGood: true },
    { label: "CPC", value: c.cpc_cents != null ? formatCurrency(c.cpc_cents) : "—", delta_percent: null, positiveIsGood: false },
  ];

  return (
    <div className="space-y-5">
      <Link href="/ecom/ads" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919]">
        <ArrowLeft size={12} /> Retour Performance Ads
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[20px]">{providerEmoji(provider)}</span>
            <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">{c.campaign_name}</h1>
            <CampaignStatusBadge status={c.real_roas == null ? "unmatched" : c.real_roas >= 2 ? "profitable" : c.real_roas >= 1.5 ? "warning" : "unprofitable"} size="md" />
          </div>
          <p className="text-[12px] text-[#8A8A88]">{formatProvider(provider)} · ID {c.campaign_id}</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={range} onChange={setRange} />
          <button onClick={handleRefresh} disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] disabled:opacity-50">
            {refreshing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Resync
          </button>
        </div>
      </header>

      <AdsKpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <SpendRevenueChart points={detail.timeline} />
        </div>
        <CampaignFunnel
          impressions={detail.funnel.impressions}
          clicks={detail.funnel.clicks}
          outbound_clicks={detail.funnel.outbound_clicks}
          orders={detail.funnel.orders}
        />
      </div>

      {/* Ad groups */}
      {adsRes && adsRes.ad_groups.length > 0 && (
        <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
          <h3 className="text-[13px] font-bold text-[#191919] mb-3">Ad groups ({adsRes.ad_groups.length})</h3>
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] border-b border-[#EFEFEF]">
                <th className="pb-2">Nom</th>
                <th className="pb-2">Statut</th>
                <th className="pb-2 text-right">Budget (micro)</th>
              </tr>
            </thead>
            <tbody>
              {adsRes.ad_groups.map((g) => (
                <tr key={g.pinterest_ad_group_id} className="border-b border-[#F7F7F5] last:border-0">
                  <td className="py-2 text-[12px] text-[#191919]">{g.name}</td>
                  <td className="py-2 text-[11px] text-[#8A8A88]">{g.status}</td>
                  <td className="py-2 text-[12px] tabular-nums text-right text-[#191919]">
                    {g.budget_in_micro_currency != null ? formatCurrency(Math.round(Number(g.budget_in_micro_currency) / 10000)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ads */}
      {adsRes && adsRes.ads.length > 0 && (
        <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
          <h3 className="text-[13px] font-bold text-[#191919] mb-3">Annonces ({adsRes.ads.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] border-b border-[#EFEFEF]">
                  <th className="pb-2">Nom</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2">Pin ID</th>
                  <th className="pb-2">Ad group</th>
                </tr>
              </thead>
              <tbody>
                {adsRes.ads.slice(0, 50).map((a) => (
                  <tr key={a.pinterest_ad_id} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                    <td className="py-2 text-[12px] text-[#191919] truncate max-w-[300px]">{a.name ?? "—"}</td>
                    <td className="py-2 text-[11px] text-[#8A8A88]">{a.status}</td>
                    <td className="py-2 text-[11px] text-[#8A8A88]">{a.pin_id ?? "—"}</td>
                    <td className="py-2 text-[11px] text-[#8A8A88]">{a.ad_group_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {adsRes.ads.length > 50 && (
              <p className="text-[11px] text-[#8A8A88] mt-2 text-center">+ {adsRes.ads.length - 50} annonces non affichées</p>
            )}
          </div>
        </div>
      )}

      {/* Commandes attribuées */}
      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
        <h3 className="text-[13px] font-bold text-[#191919] mb-3">
          Commandes attribuées ({ordersRes?.orders?.length ?? 0})
        </h3>
        {(ordersRes?.orders ?? []).length === 0 ? (
          <p className="text-[12px] text-[#8A8A88] py-3 text-center">Aucune commande attribuée sur la période</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-semibold uppercase tracking-wide text-[#8A8A88] border-b border-[#EFEFEF]">
                <th className="pb-2">N°</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Email</th>
                <th className="pb-2 text-right">Montant</th>
                <th className="pb-2">Méthode</th>
                <th className="pb-2 text-right">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {ordersRes!.orders.map((o) => (
                <tr key={o.id} className="border-b border-[#F7F7F5] last:border-0 hover:bg-[#FBFBFA]">
                  <td className="py-2 text-[12px] font-semibold text-[#191919]">{o.name}</td>
                  <td className="py-2 text-[11px] text-[#8A8A88]">
                    {new Date(o.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-2 text-[11px] text-[#5A5A58] truncate max-w-[200px]">{o.email ?? "—"}</td>
                  <td className="py-2 text-[12px] tabular-nums text-right font-semibold text-[#191919]">{formatCurrency(Math.round(o.total_price * 100), o.currency)}</td>
                  <td className="py-2 text-[11px] text-[#5A5A58]">{formatAttributionMethod(o.attribution_method)}</td>
                  <td className="py-2 text-[11px] tabular-nums text-right text-[#5A5A58]">{formatConfidence(o.attribution_weight)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
