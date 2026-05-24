"use client";

import Link from "next/link";
import { ArrowRight, AlertCircle, AlertTriangle, Info, Target } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas, providerEmoji, formatProvider } from "@/lib/ads/formatters";
import AdsStatusBadges from "@/components/ecom/ads/AdsStatusBadges";
import type { ProfitStatus } from "@/lib/ads/types";

interface OverviewResponse {
  range: { from: string; to: string };
  kpis: Record<string, { value?: number; value_cents?: number | null; formatted: string; delta_percent: number | null; status?: ProfitStatus }>;
  campaigns_by_status: { profitable: number; warning: number; unprofitable: number; total: number };
  providers: string[];
}

interface AlertsResponse {
  alerts: Array<{ id: string; severity: "info" | "warning" | "critical"; title: string; message: string; recommendation: string | null; campaign_id: string | null; provider: string | null }>;
}

const SEV_ICON: Record<"critical" | "warning" | "info", typeof AlertCircle> = {
  critical: AlertCircle, warning: AlertTriangle, info: Info,
};
const SEV_COLOR: Record<"critical" | "warning" | "info", string> = {
  critical: "text-rose-600", warning: "text-amber-600", info: "text-blue-600",
};

export default function PerformanceAdsZone() {
  const { data: overview } = useApi<OverviewResponse>("/api/ecom/ads/overview?range=30d");
  const { data: alertsRes } = useApi<AlertsResponse>("/api/ecom/ads/alerts?status=active");

  // Empty state : pas d'integration Ads (=> overview retournera total=0)
  if (overview && overview.campaigns_by_status.total === 0) {
    return (
      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F0EEFF] flex items-center justify-center flex-shrink-0">
            <Target size={18} className="text-[#7C3AED]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-bold text-[#191919]">Performance Ads</h3>
            <p className="text-[12px] text-[#5A5A58] mt-0.5">
              Connectez Pinterest pour calculer le ROAS réel basé sur vos commandes Shopify.
            </p>
            <Link href="/ecom/settings?tab=integrations"
              className="inline-flex items-center gap-1 mt-2 text-[12px] font-semibold text-[#7C3AED] hover:underline">
              Connecter Pinterest <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
        <div className="h-20 bg-[#F7F7F5] rounded animate-pulse" />
      </div>
    );
  }

  // Top urgent alert
  const urgentAlert = (alertsRes?.alerts ?? []).sort((a, b) => {
    const order = { critical: 3, warning: 2, info: 1 };
    return order[b.severity] - order[a.severity];
  })[0];

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#191919] flex items-center gap-2">
            <Target size={14} className="text-[#7C3AED]" />
            Performance Ads
          </h3>
          <p className="text-[11px] text-[#8A8A88] mt-0.5">
            {overview.providers.slice(0, 3).map((p) => `${providerEmoji(p)} ${formatProvider(p)}`).join(" · ")} · 30 jours
          </p>
        </div>
        <Link href="/ecom/ads" className="text-[11px] text-[#7C3AED] hover:underline font-semibold whitespace-nowrap">
          Voir détail →
        </Link>
      </div>

      {/* 3 KPIs compacts */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Kpi label="Dépense 30j" value={overview.kpis.spend.formatted} />
        <Kpi label="Revenue attr." value={overview.kpis.revenue.formatted} />
        <Kpi label="ROAS" value={overview.kpis.roas.formatted}
          color={overview.kpis.roas.status === "profitable" ? "text-emerald-600" : overview.kpis.roas.status === "warning" ? "text-amber-600" : overview.kpis.roas.status === "unprofitable" ? "text-rose-600" : undefined} />
      </div>

      {/* Status badges */}
      <div className="pt-3 border-t border-[#EFEFEF] mb-3">
        <AdsStatusBadges {...overview.campaigns_by_status} />
      </div>

      {/* Alerte la plus urgente */}
      {urgentAlert && (() => {
        const Icon = SEV_ICON[urgentAlert.severity];
        const color = SEV_COLOR[urgentAlert.severity];
        return (
          <div className="pt-3 border-t border-[#EFEFEF]">
            <div className="text-[10px] uppercase tracking-wide text-[#8A8A88] mb-1.5 font-semibold">Alerte urgente</div>
            <Link
              href={urgentAlert.campaign_id ? `/ecom/ads/campaigns/${urgentAlert.campaign_id}?provider=${urgentAlert.provider}` : "/ecom/ads/alerts"}
              className="flex items-start gap-2 p-2 -mx-2 rounded hover:bg-[#FBFBFA] transition-colors"
            >
              <Icon size={12} className={`${color} mt-0.5 flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[#191919] line-clamp-1">{urgentAlert.title}</div>
                {urgentAlert.recommendation && (
                  <div className="text-[11px] text-[#5A5A58] line-clamp-2 mt-0.5">{urgentAlert.recommendation}</div>
                )}
              </div>
            </Link>
          </div>
        );
      })()}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[#8A8A88] mb-0.5">{label}</div>
      <div className={`text-[15px] font-bold tabular-nums ${color ?? "text-[#191919]"}`}>{value}</div>
    </div>
  );
}
