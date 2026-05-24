"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/shopify/formatters";

interface Props {
  data: { source: string; revenue: number; sessions?: number }[];
}

const COLORS = ["#7C3AED", "#A78BFA", "#C4B5FD", "#DDD6FE", "#6D28D9", "#5B21B6", "#4C1D95", "#3B0764"];

export default function SourcesDonut({ data }: Props) {
  const chartData = data.map((d, i) => ({
    name: prettySource(d.source),
    value: d.revenue,
    color: COLORS[i % COLORS.length],
  }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <h3 className="text-[14px] font-bold text-[#191919] mb-1">Sources de trafic</h3>
      <p className="text-[11px] text-[#8A8A88] mb-4">CA généré par canal</p>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={2}>
                {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
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
            <li key={d.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate text-[#5A5A58]">{d.name}</span>
              </span>
              <span className="font-semibold text-[#191919] tabular-nums">{formatCurrency(d.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function prettySource(s: string): string {
  if (!s || s === "direct" || s === "web") return "Direct";
  const map: Record<string, string> = {
    google: "Google",
    pinterest: "Pinterest",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    email: "Email",
    klaviyo: "Klaviyo",
  };
  return map[s.toLowerCase()] ?? s;
}
