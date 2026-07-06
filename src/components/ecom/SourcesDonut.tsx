"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/shopify/formatters";
import { DISPLAY_CHANNEL_META, type DisplayChannel } from "@/lib/gads/channels";

interface Props {
  data: { channel: DisplayChannel; revenue: number; orders?: number }[];
}

/**
 * Sources de trafic — CA par canal unifié (même vérité que la vue Commandes).
 * Le fantôme apparaît en « Non attribué », jamais fondu dans « Direct ».
 */
export default function SourcesDonut({ data }: Props) {
  const chartData = data.map((d) => ({
    channel: d.channel,
    name: DISPLAY_CHANNEL_META[d.channel].label,
    value: d.revenue,
    color: DISPLAY_CHANNEL_META[d.channel].dot,
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <h3 className="text-[14px] font-bold text-[var(--ecom-navy)] mb-1">Sources de trafic</h3>
      <p className="text-[11px] text-[var(--ecom-muted)] mb-4">CA par canal — attribution unifiée</p>
      {chartData.length === 0 ? (
        <p className="text-[12px] text-[#8A8A88] py-8 text-center">Aucune commande sur la période</p>
      ) : (
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={2}>
                {chartData.map((entry) => <Cell key={entry.channel} fill={entry.color} />)}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((v: any) => formatCurrency(Number(v))) as any}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#8A8A88]">Total</span>
            <span className="text-[12px] font-bold text-[#191919]">{formatCurrency(total)}</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-[12px]">
          {chartData.slice(0, 6).map((d) => (
            <li key={d.channel} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate text-[#5A5A58]">{d.name}</span>
              </span>
              <span className="font-semibold text-[#191919] tabular-nums">{formatCurrency(d.value)}</span>
            </li>
          ))}
        </ul>
      </div>
      )}
    </div>
  );
}
