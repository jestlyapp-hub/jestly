"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApi } from "@/lib/hooks/use-api";
import { ArrowLeft, Loader2 } from "lucide-react";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import { formatCurrency, formatNumberFr, formatRoas, providerEmoji, formatPercent } from "@/lib/ads/formatters";

interface ComparisonResponse {
  range: { from: string; to: string };
  campaigns: Array<{
    range: { from: string; to: string };
    campaign: {
      provider: string; campaign_id: string; campaign_name: string;
      spend: number; revenue: number; orders: number;
      impressions: number; clicks: number; outbound: number;
      real_roas: number | null; ctr: number | null; cpc_cents: number | null;
    };
  }>;
}

function ComparisonContent() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("campaign_ids") ?? "";
  const provider = searchParams.get("provider") ?? "pinterest";
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");

  const { data } = useApi<ComparisonResponse>(
    ids ? `/api/ecom/ads/comparison?campaign_ids=${ids}&provider=${provider}&range=${range}` : null,
  );

  if (!ids) {
    return (
      <div className="text-center py-12">
        <p className="text-[13px] text-[#5A5A58]">Sélectionnez 2 à 5 campagnes dans la table pour les comparer.</p>
        <Link href="/ecom/ads" className="text-[12px] text-[#7C3AED] hover:underline mt-2 inline-block">Retour à Performance Ads</Link>
      </div>
    );
  }

  if (!data) return <div className="py-10 text-center"><Loader2 size={20} className="animate-spin text-[#7C3AED] mx-auto" /></div>;

  const winners = {
    roas: data.campaigns.reduce((b, c) => (c.campaign.real_roas ?? 0) > (b?.campaign.real_roas ?? 0) ? c : b, data.campaigns[0]),
    revenue: data.campaigns.reduce((b, c) => c.campaign.revenue > b.campaign.revenue ? c : b, data.campaigns[0]),
    orders: data.campaigns.reduce((b, c) => c.campaign.orders > b.campaign.orders ? c : b, data.campaigns[0]),
  };

  return (
    <div className="space-y-5">
      <Link href="/ecom/ads" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919]">
        <ArrowLeft size={12} /> Retour Performance Ads
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Comparaison ({data.campaigns.length})</h1>
          <p className="text-[12px] text-[#8A8A88]">Côte à côte : performances par campagne</p>
        </div>
        <PeriodSelector value={range} onChange={setRange} />
      </header>

      <div className={`grid gap-3 grid-cols-1 md:grid-cols-${Math.min(data.campaigns.length, 3)}`} style={{ gridTemplateColumns: `repeat(${Math.min(data.campaigns.length, 5)}, minmax(0, 1fr))` }}>
        {data.campaigns.map((d) => {
          const c = d.campaign;
          const isBestRoas = winners.roas.campaign.campaign_id === c.campaign_id;
          const isBestRev = winners.revenue.campaign.campaign_id === c.campaign_id;
          return (
            <div key={c.campaign_id} className="bg-white border border-[#E6E6E4] rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3 pb-3 border-b border-[#EFEFEF]">
                <span className="text-[18px]">{providerEmoji(c.provider)}</span>
                <div className="min-w-0">
                  <Link href={`/ecom/ads/campaigns/${c.campaign_id}?provider=${c.provider}`}
                    className="text-[13px] font-bold text-[#191919] hover:text-[#7C3AED] line-clamp-2">
                    {c.campaign_name}
                  </Link>
                  <p className="text-[10px] text-[#8A8A88] mt-0.5">ID {c.campaign_id}</p>
                </div>
              </div>
              <Metric label="ROAS" value={formatRoas(c.real_roas)} highlight={isBestRoas} />
              <Metric label="Revenue" value={formatCurrency(c.revenue)} highlight={isBestRev} />
              <Metric label="Dépense" value={formatCurrency(c.spend)} />
              <Metric label="Commandes" value={formatNumberFr(c.orders)} />
              <Metric label="Impressions" value={formatNumberFr(c.impressions)} />
              <Metric label="Clics" value={formatNumberFr(c.clicks)} />
              <Metric label="CTR" value={c.ctr != null ? formatPercent(c.ctr, 2) : "—"} />
              <Metric label="CPC" value={c.cpc_cents != null ? formatCurrency(c.cpc_cents) : "—"} />
            </div>
          );
        })}
      </div>

      <div className="bg-[#F0EEFF] border border-[#DDD6FE] rounded-xl p-4 text-[12px] text-[#5B21B6]">
        <strong>Gagnants :</strong> meilleur ROAS = {winners.roas.campaign.campaign_name},
        meilleur revenue = {winners.revenue.campaign.campaign_name},
        plus de commandes = {winners.orders.campaign.campaign_name}.
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F7F7F5] last:border-0">
      <span className="text-[11px] text-[#8A8A88]">{label}</span>
      <span className={`text-[12px] tabular-nums font-semibold ${highlight ? "text-emerald-600" : "text-[#191919]"}`}>{value}</span>
    </div>
  );
}

export default function ComparisonPage() {
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <ComparisonContent />
    </Suspense>
  );
}
