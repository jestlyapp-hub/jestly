"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import AdsHeatmap from "@/components/ecom/ads/AdsHeatmap";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";

interface HeatmapResponse {
  range: { from: string; to: string };
  metric: string;
  cells: Array<{ day_of_week: number; hour: number; value: number; orders: number; spend_cents: number; revenue_cents: number }>;
}

function HeatmapContent() {
  const [metric, setMetric] = useState<"roas" | "spend" | "revenue" | "orders">("orders");
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "custom">("30d");
  const { data } = useApi<HeatmapResponse>(`/api/ecom/ads/heatmap?metric=${metric}&range=${range}`);

  return (
    <div className="space-y-5">
      <Link href="/ecom/ads" className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919]">
        <ArrowLeft size={12} /> Retour Performance Ads
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Heatmap horaire</h1>
          <p className="text-[12px] text-[#8A8A88]">Performance par jour de la semaine × heure (UTC)</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as typeof metric)}
            className="px-2.5 py-1.5 border border-[#E6E6E4] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
          >
            <option value="orders">Commandes</option>
            <option value="revenue">Revenue</option>
            <option value="spend">Dépense (besoin data)</option>
            <option value="roas">ROAS (besoin data)</option>
          </select>
          <PeriodSelector value={range} onChange={setRange} />
        </div>
      </header>

      {data && <AdsHeatmap cells={data.cells} metric={metric} />}

      <p className="text-[11px] text-[#8A8A88]">
        Note : la heatmap est calculée depuis vos commandes Shopify (horaire précis disponible).
        Les métriques spend/ROAS au niveau horaire ne sont pas dispo sur Pinterest Ads (granularité = jour minimum).
      </p>
    </div>
  );
}

export default function HeatmapPage() {
  return (
    <Suspense fallback={<div className="text-[13px] text-[#8A8A88] py-10 text-center">Chargement…</div>}>
      <HeatmapContent />
    </Suspense>
  );
}
