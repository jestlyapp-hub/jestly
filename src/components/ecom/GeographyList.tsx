"use client";

import { formatCurrency } from "@/lib/shopify/formatters";

interface Props {
  data: { country: string; revenue: number; orders: number }[];
}

export default function GeographyList({ data }: Props) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#191919] mb-1">Géographie</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">Top pays par CA</p>
      {data.length === 0 ? (
        <p className="text-[12px] text-[#8A8A88] py-3 text-center">Aucune donnée géographique</p>
      ) : (
        <ul className="space-y-2">
          {data.slice(0, 8).map((d) => {
            const pct = (d.revenue / max) * 100;
            return (
              <li key={d.country}>
                <div className="flex items-baseline justify-between text-[11px] mb-1">
                  <span className="text-[#191919] font-medium">{d.country}</span>
                  <span className="text-[#8A8A88] tabular-nums">{formatCurrency(d.revenue)}</span>
                </div>
                <div className="h-1 bg-[#F7F7F5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7C3AED]" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
