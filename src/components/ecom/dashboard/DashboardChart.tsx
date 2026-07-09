"use client";

/**
 * Graphe premium du Dashboard. Aires en dégradé doux (Revenue violet, Net Profit
 * vert), barres de dépense discrètes en fond, MER en ligne sur axe droit. Grille
 * horizontale ultra-légère, tooltip custom + crosshair, toggle de séries pour ne
 * pas empiler 4 échelles, animation d'entrée depuis la baseline (reduced-motion
 * respecté), coupe au jour courant (pas de courbe fantôme sur le futur), gestion
 * des négatifs. DA Jestly.
 */
import { useMemo, useState } from "react";
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/ads/formatters";
import type { BlendedTimelinePoint } from "@/lib/costs/blended";

const COLORS = {
  revenue: "#7C3AED",
  spend: "#C4B5FD",
  profit: "#0F9D6B",
  mer: "#1a1535",
};

type SeriesKey = "revenue" | "spend" | "profit" | "mer";

interface TooltipEntry { name?: string; value?: number; color?: string; dataKey?: string }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E3F0] rounded-lg shadow-md p-2.5 text-[12px] min-w-[150px]">
      <div className="font-semibold text-[#1a1535] mb-1.5">{label ? format(parseISO(label), "EEE d MMM", { locale: fr }) : ""}</div>
      {payload.filter((p) => p.value != null).map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2 py-0.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#5A5A58] flex-1">{String(p.name)}</span>
          <span className="font-semibold text-[#1a1535] tabular-nums">
            {p.dataKey === "mer" ? `${Number(p.value ?? 0).toFixed(2)}×` : formatCurrency(Number(p.value ?? 0))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardChart({ points, costsConfigured }: { points: BlendedTimelinePoint[]; costsConfigured: boolean }) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    revenue: true, spend: true, profit: costsConfigured, mer: false,
  });
  const toggle = (k: SeriesKey) => setVisible((v) => ({ ...v, [k]: !v[k] }));

  const todayIso = new Date().toISOString().slice(0, 10);
  const data = useMemo(() => points.map((p) => {
    const future = p.date > todayIso; // ne pas dessiner le futur à 0
    return {
      date: p.date,
      revenue: future ? null : p.revenue_cents,
      spend: future ? null : p.spend_cents,
      profit: future || !costsConfigured ? null : (p.net_profit_cents ?? null),
      mer: future ? null : (p.rolling_mer ?? null),
    };
  }), [points, todayIso, costsConfigured]);

  const hasNegativeProfit = data.some((d) => (d.profit ?? 0) < 0);
  const showRightAxis = visible.mer;

  const SERIES: { key: SeriesKey; label: string; color: string; disabled?: boolean }[] = [
    { key: "revenue", label: "Revenue", color: COLORS.revenue },
    { key: "spend", label: "Dépense", color: COLORS.spend },
    { key: "profit", label: "Profit net", color: COLORS.profit, disabled: !costsConfigured },
    { key: "mer", label: "MER 7 j", color: COLORS.mer },
  ];

  return (
    <div className="bg-white border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#1a1535]">Revenue, dépense et profit net dans le temps</h3>
          <p className="text-[11px] text-[#8A8A88]">
            Évolution journalière · MER lissé sur 7 j
            {!costsConfigured && " · profit net masqué tant que les coûts ne sont pas renseignés"}
          </p>
        </div>
        {/* Toggle segmenté de séries */}
        <div className="inline-flex items-center gap-1 bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-md p-0.5">
          {SERIES.map((s) => (
            <button key={s.key} onClick={() => !s.disabled && toggle(s.key)} disabled={s.disabled}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                visible[s.key] && !s.disabled ? "bg-white text-[var(--ecom-navy)] shadow-sm" : "text-[#8A8A88] hover:text-[var(--ecom-navy)]"
              }`}
              title={s.disabled ? "Renseigne tes coûts pour le profit net" : undefined}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: s.color, opacity: visible[s.key] && !s.disabled ? 1 : 0.4 }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: showRightAxis ? 8 : 4, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.revenue} stopOpacity={0.28} />
                <stop offset="100%" stopColor={COLORS.revenue} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-profit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.profit} stopOpacity={0.24} />
                <stop offset="100%" stopColor={COLORS.profit} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#F0EEF5" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#B4B4B2" }} tickLine={false} axisLine={false}
              tickFormatter={(v) => { try { return format(parseISO(v), "d MMM", { locale: fr }); } catch { return v; } }} minTickGap={24} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#B4B4B2" }} tickLine={false} axisLine={false}
              width={44} tickFormatter={(v) => `${Math.round(v / 100)} €`} />
            {showRightAxis && (
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: COLORS.mer }} tickLine={false} axisLine={false}
                width={38} tickFormatter={(v) => `${v.toFixed(1)}×`} />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#C4B5FD", strokeWidth: 1, strokeDasharray: "3 3" }} />
            {hasNegativeProfit && <ReferenceLine yAxisId="left" y={0} stroke="#D4D4D2" strokeWidth={1} />}

            {visible.spend && (
              <Bar yAxisId="left" dataKey="spend" name="Dépense" fill={COLORS.spend} radius={[3, 3, 0, 0]} barSize={10}
                isAnimationActive={!reduce} animationDuration={500} />
            )}
            {visible.revenue && (
              <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} strokeWidth={2}
                fill="url(#grad-revenue)" connectNulls={false} dot={false} activeDot={{ r: 3 }}
                isAnimationActive={!reduce} animationDuration={500} />
            )}
            {visible.profit && costsConfigured && (
              <Area yAxisId="left" type="monotone" dataKey="profit" name="Profit net" stroke={COLORS.profit} strokeWidth={2}
                fill="url(#grad-profit)" connectNulls={false} dot={false} activeDot={{ r: 3 }}
                isAnimationActive={!reduce} animationDuration={500} />
            )}
            {visible.mer && (
              <Line yAxisId="right" type="monotone" dataKey="mer" name="MER 7 j" stroke={COLORS.mer} strokeWidth={1.5}
                dot={false} connectNulls={false} isAnimationActive={!reduce} animationDuration={500} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
