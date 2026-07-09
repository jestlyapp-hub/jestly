"use client";

/**
 * Graphe détail campagne : dépense vs CA Shopify attribué (barres) + ROAS Jestly
 * glissant 7 j (ligne, axe droit). Réutilise la grammaire premium de BlendedChart
 * (recharts, DA violet, tooltip fr).
 */
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/ads/formatters";
import type { CampaignDailyPoint } from "@/lib/gads/campaign-detail";

interface TooltipEntry { name?: string; value?: number; color?: string; dataKey?: string }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E3F0] rounded-lg shadow-sm p-2.5 text-[12px]">
      <div className="font-semibold text-[#1a1535] mb-1">{label ? format(parseISO(label), "d MMM yyyy", { locale: fr }) : ""}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#5A5A58]">{String(p.name)} :</span>
          <span className="font-semibold text-[#1a1535] tabular-nums">
            {p.dataKey === "roas" ? `${Number(p.value ?? 0).toFixed(2)}×` : formatCurrency(Number(p.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CampaignDetailChart({ points }: { points: CampaignDailyPoint[] }) {
  const data = points.map((p) => ({
    date: p.date,
    spend: p.spend_cents,
    revenue: p.jestly_revenue_cents,
    roas: p.rolling_roas ?? 0,
  }));
  const hasRevenue = points.some((p) => p.jestly_revenue_cents > 0);

  return (
    <div className="bg-white border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <div className="mb-3">
        <h3 className="text-[14px] font-bold text-[#1a1535]">Dépense, CA attribué et ROAS Jestly dans le temps</h3>
        <p className="text-[11px] text-[#8A8A88]">
          Évolution journalière · ROAS Jestly lissé sur 7 jours glissants
          {!hasRevenue && " · aucun CA Shopify rattachable à cette campagne sur la période (voir bandeau d'attribution)"}
        </p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFEFEF" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8A8A88" }}
              tickFormatter={(v) => { try { return format(parseISO(v), "d MMM", { locale: fr }); } catch { return v; } }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#8A8A88" }} tickFormatter={(v) => `${(v / 100).toFixed(0)} €`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#8A8A88" }} tickFormatter={(v) => `${v.toFixed(1)}×`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <ReferenceLine yAxisId="left" y={0} stroke="#B4B4B2" strokeWidth={1} />
            <Bar yAxisId="left" dataKey="spend" name="Dépense" fill="#DDD6FE" />
            <Bar yAxisId="left" dataKey="revenue" name="CA attribué" fill="#7C3AED" />
            <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS Jestly 7 j" stroke="#1a1535" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
