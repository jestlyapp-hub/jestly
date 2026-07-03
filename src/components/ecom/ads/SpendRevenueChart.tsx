"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/ads/formatters";

interface Props {
  points: Array<{ date: string; spend_cents: number; revenue_cents: number; orders: number; roas: number | null }>;
  title?: string;
  subtitle?: string;
  revenueName?: string;
}

interface TooltipEntry { name?: string; value?: number; color?: string; dataKey?: string }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-lg shadow-sm p-2.5 text-[12px]">
      <div className="font-semibold text-[#191919] mb-1">
        {label ? format(parseISO(label), "d MMM yyyy", { locale: fr }) : ""}
      </div>
      {payload.map((p) => {
        const isMoney = p.dataKey === "spend" || p.dataKey === "revenue";
        return (
          <div key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[#5A5A58]">{String(p.name)} :</span>
            <span className="font-semibold text-[#191919]">
              {isMoney ? formatCurrency(Number(p.value ?? 0)) : (Number(p.value ?? 0)).toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function SpendRevenueChart({
  points,
  title = "Dépense vs revenue attribuée",
  subtitle = "Évolution journalière, ROAS lissé sur 7 jours glissants",
  revenueName = "Revenue",
}: Props) {
  const data = points.map((p) => ({
    date: p.date,
    spend: p.spend_cents,
    revenue: p.revenue_cents,
    roas: p.roas ?? 0,
  }));

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#191919]">{title}</h3>
          <p className="text-[11px] text-[#8A8A88]">{subtitle}</p>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8A8A88" }}
              tickFormatter={(v) => { try { return format(parseISO(v), "d MMM", { locale: fr }); } catch { return v; } }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#8A8A88" }}
              tickFormatter={(v) => `${(v / 100).toFixed(0)} €`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#8A8A88" }}
              tickFormatter={(v) => `${v.toFixed(1)}×`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar yAxisId="left" dataKey="spend" name="Dépense" fill="#DDD6FE" />
            <Bar yAxisId="left" dataKey="revenue" name={revenueName} fill="#7C3AED" />
            <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS 7 j" stroke="#191919" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
