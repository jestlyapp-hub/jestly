"use client";

import { formatNumber } from "@/lib/shopify/formatters";

interface Props {
  data: { sessions: number; cart: number; checkout: number; purchase: number };
}

export default function Funnel({ data }: Props) {
  const steps = [
    { label: "Sessions", value: data.sessions, color: "#DDD6FE" },
    { label: "Ajout panier", value: data.cart, color: "#C4B5FD" },
    { label: "Checkout", value: data.checkout, color: "#A78BFA" },
    { label: "Achat", value: data.purchase, color: "#7C3AED" },
  ];
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#191919] mb-1">Funnel conversion</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">Taux de passage entre étapes</p>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const pct = (s.value / max) * 100;
          const dropPct = i > 0 && steps[i - 1].value > 0
            ? (1 - s.value / steps[i - 1].value) * 100
            : null;
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#5A5A58] font-medium">{s.label}</span>
                <span className="font-semibold text-[#191919] tabular-nums">{formatNumber(s.value)}</span>
              </div>
              <div className="h-6 bg-[#F7F7F5] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                />
              </div>
              {dropPct != null && dropPct > 0 && (
                <p className="text-[10px] text-rose-500 mt-0.5">−{dropPct.toFixed(1)} % de drop</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
