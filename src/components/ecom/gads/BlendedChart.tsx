"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/ads/formatters";
import type { BlendedTimelinePoint } from "@/lib/costs/blended";

interface Props {
  points: BlendedTimelinePoint[];
  costsConfigured: boolean;
}

interface TooltipEntry { name?: string; value?: number; color?: string; dataKey?: string }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E3F0] rounded-lg shadow-sm p-2.5 text-[12px]">
      <div className="font-semibold text-[#1a1535] mb-1">
        {label ? format(parseISO(label), "d MMM yyyy", { locale: fr }) : ""}
      </div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#5A5A58]">{String(p.name)} :</span>
          <span className="font-semibold text-[#1a1535] tabular-nums">
            {p.dataKey === "mer" ? `${Number(p.value ?? 0).toFixed(2)}×` : formatCurrency(Number(p.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function BlendedChart({ points, costsConfigured }: Props) {
  const data = points.map((p) => ({
    date: p.date,
    revenue: p.revenue_cents,
    spend: p.spend_cents,
    net_profit: p.net_profit_cents ?? undefined,
    mer: p.rolling_mer ?? 0,
  }));

  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#1a1535]">Revenue, dépense et profit net dans le temps</h3>
          <p className="text-[11px] text-[#8A8A88]">
            Évolution journalière · MER lissé sur 7 jours glissants
            {!costsConfigured && " · profit net masqué tant que les coûts ne sont pas renseignés"}
          </p>
        </div>
      </div>
      <div className="h-[300px]">
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
            <ReferenceLine yAxisId="left" y={0} stroke="#B4B4B2" strokeWidth={1} />
            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#7C3AED" />
            <Bar yAxisId="left" dataKey="spend" name="Dépense Ads" fill="#DDD6FE" />
            {costsConfigured && (
              <Line yAxisId="left" type="monotone" dataKey="net_profit" name="Profit net" stroke="#059669" strokeWidth={1.8} dot={false} />
            )}
            <Line yAxisId="right" type="monotone" dataKey="mer" name="MER 7 j" stroke="#1a1535" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
