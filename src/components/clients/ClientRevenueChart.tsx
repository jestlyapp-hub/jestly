"use client";

import type { ClientRevenueMonth } from "@/types";

interface Props {
  months: ClientRevenueMonth[];
}

export default function ClientRevenueChart({ months }: Props) {
  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div className="bg-white rounded-xl border border-[#E6E6E4] p-5">
      <h3 className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Revenus (12 mois)</h3>
      <div className="flex items-end gap-1.5 h-[140px]">
        {months.map((m) => {
          const pct = (m.revenue / maxRevenue) * 100;
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div className="w-full flex flex-col items-center justify-end h-[110px]">
                {m.revenue > 0 && (
                  <span className="text-[9px] text-[#999] mb-1">{m.revenue}€</span>
                )}
                <div
                  className="w-full max-w-[28px] rounded-t-sm transition-all"
                  style={{
                    height: `${Math.max(pct, m.revenue > 0 ? 4 : 0)}%`,
                    backgroundColor: m.revenue > 0 ? "#4F46E5" : "#EFEFEF",
                  }}
                />
              </div>
              <span className="text-[9px] text-[#999] truncate w-full text-center">
                {m.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
