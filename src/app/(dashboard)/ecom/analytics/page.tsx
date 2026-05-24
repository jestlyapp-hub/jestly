"use client";

import { useApi } from "@/lib/hooks/use-api";
import { useDateRange } from "@/lib/hooks/use-date-range";
import PeriodFilterDropdown from "@/components/facturation/PeriodFilterDropdown";
import KpiCard from "@/components/ecom/KpiCard";
import RevenueTimeline from "@/components/ecom/RevenueTimeline";
import { formatCurrency, formatNumber } from "@/lib/shopify/formatters";

interface DashboardData {
  current: {
    kpis: { gross_sales: number; orders: number; aov: number; sessions: number; conversion_rate: number };
    timeline: { date: string; gross_sales: number; orders: number }[];
  };
}

export default function EcomAnalyticsPage() {
  const dr = useDateRange();
  const params = dr.range ? `?from=${dr.range.from}&to=${dr.range.to}` : "";
  const { data, loading } = useApi<DashboardData>(`/api/ecom/dashboard${params}`);

  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Analytics</h1>
          <p className="text-[12px] text-[#8A8A88] mt-0.5">Vue détaillée des performances</p>
        </div>
        <PeriodFilterDropdown value={dr.filter} onChange={dr.setFilter} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <KpiCard label="CA brut" value={formatCurrency(data?.current.kpis.gross_sales ?? 0)} loading={loading} />
        <KpiCard label="Commandes" value={formatNumber(data?.current.kpis.orders ?? 0)} loading={loading} />
        <KpiCard label="AOV" value={formatCurrency(data?.current.kpis.aov ?? 0)} loading={loading} />
        <KpiCard label="Conversion" value={`${(data?.current.kpis.conversion_rate ?? 0).toFixed(2)} %`} loading={loading} />
        <KpiCard label="Sessions" value={formatNumber(data?.current.kpis.sessions ?? 0)} loading={loading} />
      </div>

      {data && <RevenueTimeline data={data.current.timeline} />}

      <div className="mt-5 bg-white border border-[#E6E6E4] rounded-xl p-5">
        <h3 className="text-[13px] font-bold text-[#191919] mb-2">Analyses avancées</h3>
        <p className="text-[12px] text-[#8A8A88]">
          Cohort analysis, performance par device, heatmap horaire et drill-down ROAS arrivent prochainement.
        </p>
      </div>
    </div>
  );
}
