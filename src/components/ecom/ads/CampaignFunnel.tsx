"use client";

import { formatNumberFr, formatPercent } from "@/lib/ads/formatters";

interface Props {
  impressions: number;
  clicks: number;
  outbound_clicks: number;
  orders: number;
}

export default function CampaignFunnel({ impressions, clicks, outbound_clicks, orders }: Props) {
  const steps = [
    { label: "Impressions", value: impressions, color: "#DDD6FE" },
    { label: "Clics", value: clicks, color: "#C4B5FD" },
    { label: "Clics sortants", value: outbound_clicks, color: "#A78BFA" },
    { label: "Achats", value: orders, color: "#7C3AED" },
  ];
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#191919] mb-1">Funnel de conversion</h3>
      <p className="text-[11px] text-[#8A8A88] mb-3">Taux de passage à chaque étape</p>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const pct = (s.value / max) * 100;
          const dropRate = i > 0 && steps[i - 1].value > 0
            ? (1 - s.value / steps[i - 1].value) * 100
            : null;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#5A5A58] font-medium">{s.label}</span>
                <span className="font-semibold text-[#191919] tabular-nums">{formatNumberFr(s.value)}</span>
              </div>
              <div className="h-6 bg-[#F7F7F5] rounded overflow-hidden relative">
                <div className="h-full rounded transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
              </div>
              {dropRate != null && dropRate > 0 && (
                <p className="text-[10px] text-rose-500 mt-0.5">−{formatPercent(dropRate, 1)} drop</p>
              )}
              {dropRate != null && dropRate <= 0 && (
                <p className="text-[10px] text-emerald-600 mt-0.5">Pas de perte</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
