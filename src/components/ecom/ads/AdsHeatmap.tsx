"use client";

import { useMemo } from "react";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";

interface Cell { day_of_week: number; hour: number; value: number; orders: number; spend_cents: number; revenue_cents: number }

interface Props {
  cells: Cell[];
  metric: "roas" | "spend" | "revenue" | "orders";
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function AdsHeatmap({ cells, metric }: Props) {
  const max = Math.max(...cells.map((c) => c.value), 1);
  const min = Math.min(...cells.map((c) => c.value));

  // Insight : meilleurs créneaux (top 3 cellules)
  const insight = useMemo(() => {
    const sorted = [...cells].filter((c) => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 3);
    if (sorted.length === 0) return null;
    return sorted.map((c) => `${DAYS[c.day_of_week]} ${c.hour}h`).join(", ");
  }, [cells]);

  const colorFor = (value: number) => {
    if (max === min) return "#F7F7F5";
    const t = (value - min) / (max - min);
    if (metric === "roas") {
      // Rouge → vert
      if (value === 0) return "#F7F7F5";
      const hue = 0 + t * 130; // 0=rouge, 130=vert
      return `hsl(${hue}, 60%, ${85 - t * 30}%)`;
    }
    // Blanc → violet
    if (value === 0) return "#F7F7F5";
    return `rgba(124, 58, 237, ${0.1 + t * 0.8})`;
  };

  const formatValue = (c: Cell) => {
    if (metric === "roas") return formatRoas(c.value);
    if (metric === "orders") return formatNumberFr(c.value);
    return formatCurrency(c.value);
  };

  const formatTooltip = (c: Cell) => {
    const day = DAYS[c.day_of_week];
    return `${day} ${c.hour}h · ${c.orders} cmd · ${formatCurrency(c.revenue_cents)} revenue`;
  };

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#191919]">Heatmap horaire</h3>
          <p className="text-[11px] text-[#8A8A88]">7 jours × 24 heures · {metric}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr>
              <th className="text-[#8A8A88] font-normal w-10"></th>
              {Array.from({ length: 24 }, (_, h) => (
                <th key={h} className="text-[#8A8A88] font-normal text-center px-0.5">
                  {h % 3 === 0 ? `${h}h` : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, d) => (
              <tr key={d}>
                <td className="text-[#8A8A88] font-medium pr-2">{day}</td>
                {Array.from({ length: 24 }, (_, h) => {
                  const cell = cells.find((c) => c.day_of_week === d && c.hour === h);
                  if (!cell) return <td key={h} className="h-6"></td>;
                  return (
                    <td key={h} className="p-0">
                      <div
                        className="h-6 w-full rounded-sm hover:ring-2 hover:ring-[#7C3AED] hover:z-10 relative cursor-pointer"
                        style={{ backgroundColor: colorFor(cell.value) }}
                        title={formatTooltip(cell)}
                      >
                        {cell.value > 0 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-[#191919] opacity-0 hover:opacity-100">
                            {formatValue(cell)}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {insight && (
        <div className="mt-3 px-3 py-2 bg-[#F0EEFF] border border-[#DDD6FE] rounded text-[11px] text-[#5B21B6]">
          <strong>Meilleurs créneaux :</strong> {insight}
        </div>
      )}
    </div>
  );
}
