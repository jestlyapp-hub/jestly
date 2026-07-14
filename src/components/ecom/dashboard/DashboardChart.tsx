"use client";

/**
 * Graphe premium du Dashboard — Revenue (aire violette), dépense (barres),
 * Net Profit (aire verte), MER 7 j (ligne, axe droit). Simple config passée au
 * moteur partagé `PremiumChart` : même grammaire visuelle que le détail campagne,
 * aucune divergence. Coupe au jour courant, toggle de séries, gestion des
 * négatifs, reduced-motion — tout est géré par PremiumChart.
 */
import { useMemo } from "react";
import PremiumChart, { type ChartSeries, type ChartPoint } from "./PremiumChart";
import type { BlendedTimelinePoint } from "@/lib/costs/blended";

const COLORS = { revenue: "#7C3AED", spend: "#C4B5FD", profit: "#0F9D6B", mer: "#1a1535" };

export default function DashboardChart({ points, costsConfigured }: { points: BlendedTimelinePoint[]; costsConfigured: boolean }) {
  const data: ChartPoint[] = useMemo(() => points.map((p) => ({
    date: p.date,
    revenue: p.revenue_cents,
    spend: p.spend_cents,
    profit: costsConfigured ? (p.net_profit_cents ?? null) : null,
    mer: p.rolling_mer ?? null,
  })), [points, costsConfigured]);

  const series: ChartSeries[] = [
    { key: "revenue", label: "Revenue", color: COLORS.revenue, kind: "area", axis: "left", unit: "currency", defaultOn: true, gradient: true },
    { key: "spend", label: "Dépense", color: COLORS.spend, kind: "bar", axis: "left", unit: "currency", defaultOn: true },
    { key: "profit", label: "Profit net", color: COLORS.profit, kind: "area", axis: "left", unit: "currency", defaultOn: costsConfigured, disabled: !costsConfigured, disabledHint: "Renseigne tes coûts pour le profit net", gradient: true },
    { key: "mer", label: "MER 7 j", color: COLORS.mer, kind: "line", axis: "right", unit: "ratio_x", defaultOn: false },
  ];

  return (
    <PremiumChart
      data={data}
      series={series}
      title="Revenue, dépense et profit net dans le temps"
      subtitle={`Évolution journalière · MER lissé sur 7 j${!costsConfigured ? " · profit net masqué tant que les coûts ne sont pas renseignés" : ""}`}
    />
  );
}
