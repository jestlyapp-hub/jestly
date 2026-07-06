"use client";

import { formatNumber } from "@/lib/shopify/formatters";

interface Props {
  // cart / checkout à null = étape non suivie par le pixel MVP.
  data: { sessions: number; cart: number | null; checkout: number | null; purchase: number };
}

export default function Funnel({ data }: Props) {
  const steps: { label: string; value: number | null; color: string }[] = [
    { label: "Sessions", value: data.sessions, color: "#DDD6FE" },
    { label: "Ajout panier", value: data.cart, color: "#C4B5FD" },
    { label: "Checkout", value: data.checkout, color: "#A78BFA" },
    { label: "Achat", value: data.purchase, color: "#7C3AED" },
  ];
  const tracked = steps.filter((s) => s.value != null) as { label: string; value: number; color: string }[];
  const max = Math.max(...tracked.map((s) => s.value), 1);
  const convRate = data.sessions > 0 ? (data.purchase / data.sessions) * 100 : null;

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-[14px] font-bold text-[#191919]">Funnel conversion</h3>
        {convRate != null && (
          <span className="text-[11px] text-[#5A5A58]">
            Sessions → Achat <span className="font-bold text-[#7C3AED] tabular-nums">{convRate.toFixed(2)} %</span>
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#8A8A88] mb-4">Sessions pixel first-party · achats Shopify</p>
      <div className="space-y-2">
        {steps.map((s) => {
          if (s.value == null) {
            return (
              <div key={s.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-[#5A5A58] font-medium">{s.label}</span>
                  <span className="text-[#B4B4B2] italic text-[10px]">non suivi</span>
                </div>
                <div className="h-6 bg-[#F7F7F5] rounded overflow-hidden border border-dashed border-[#E6E6E4]" />
              </div>
            );
          }
          const pct = (s.value / max) * 100;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#5A5A58] font-medium">{s.label}</span>
                <span className="font-semibold text-[#191919] tabular-nums">{formatNumber(s.value)}</span>
              </div>
              <div className="h-6 bg-[#F7F7F5] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${Math.max(pct, s.value > 0 ? 3 : 0)}%`, backgroundColor: s.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-[#8A8A88] mt-3">
        Ajout panier et Checkout ne sont pas encore captés par le pixel — affichés « non suivi » plutôt qu&apos;à zéro.
      </p>
    </div>
  );
}
