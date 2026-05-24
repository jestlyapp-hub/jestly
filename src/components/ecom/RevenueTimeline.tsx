"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { formatCurrency, formatNumber, formatDateShort } from "@/lib/shopify/formatters";

interface Props {
  data: { date: string; gross_sales: number; orders: number }[];
  comparison?: { date: string; gross_sales: number; orders: number }[];
}

interface TooltipPayloadEntry { name?: string; value?: number | string; color?: string }
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-lg shadow-sm p-2.5 text-[12px]">
      <div className="font-semibold text-[#191919] mb-1">{formatDateShort(label)}</div>
      {payload.map((p) => (
        <div key={String(p.name)} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#5A5A58]">{String(p.name)} :</span>
          <span className="font-semibold text-[#191919]">
            {p.name === "CA" ? formatCurrency(Number(p.value)) : formatNumber(Number(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueTimeline({ data, comparison }: Props) {
  const merged = data.map((d, i) => ({
    date: d.date,
    CA: d.gross_sales,
    Commandes: d.orders,
    "CA précédent": comparison?.[i]?.gross_sales ?? null,
  }));

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#191919]">Chiffre d&apos;affaires & commandes</h3>
          <p className="text-[11px] text-[#8A8A88]">Évolution journalière sur la période</p>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={merged} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A8A88" }} tickFormatter={formatDateShort} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#8A8A88" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#8A8A88" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Line yAxisId="left" type="monotone" dataKey="CA" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="Commandes" stroke="#8A8A88" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
            {comparison && (
              <Line yAxisId="left" type="monotone" dataKey="CA précédent" stroke="#A78BFA" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
