"use client";

/**
 * Graphe premium CONFIGURABLE — moteur partagé du Dashboard et du détail
 * campagne. Aires en dégradé doux, barres discrètes, lignes sur axe droit,
 * grille horizontale ultra-légère, tooltip custom + crosshair, toggle de séries
 * (pour ne pas empiler les échelles), coupe au jour courant (pas de courbe
 * fantôme sur le futur), ligne de référence sur les négatifs, markers verticaux
 * (ex. changements de budget), animation d'entrée respectant reduced-motion.
 *
 * La grammaire visuelle est UNIQUE : Dashboard et campagne passent seulement une
 * config de séries différente → aucune divergence de rendu. DA Jestly.
 */
import { useMemo, useState } from "react";
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";
import { useReducedMotion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency, formatNumberFr } from "@/lib/ads/formatters";

export type SeriesKind = "area" | "bar" | "line";
export type SeriesAxis = "left" | "right";
export type SeriesUnit = "currency" | "ratio_x" | "number" | "percent";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  kind: SeriesKind;
  axis: SeriesAxis;
  unit: SeriesUnit;
  defaultOn?: boolean;
  disabled?: boolean;
  disabledHint?: string;
  /** Remplissage dégradé sous l'aire (aires uniquement). */
  gradient?: boolean;
}

export interface ChartMarker {
  /** Doit correspondre à une date de `data` (YYYY-MM-DD). */
  date: string;
  label: string;
}

export interface ChartPoint {
  date: string;
  [key: string]: number | null | string;
}

function fmtValue(v: number, unit: SeriesUnit): string {
  switch (unit) {
    case "currency": return formatCurrency(v);
    case "ratio_x": return `${v.toFixed(2)}×`;
    case "number": return formatNumberFr(Math.round(v));
    case "percent": return `${(v * 100).toFixed(1)} %`;
  }
}

function fmtAxis(v: number, unit: SeriesUnit): string {
  switch (unit) {
    case "currency": return `${Math.round(v / 100)} €`;
    case "ratio_x": return `${v.toFixed(1)}×`;
    case "number": return formatNumberFr(Math.round(v));
    case "percent": return `${Math.round(v * 100)} %`;
  }
}

interface TooltipEntry { name?: string; value?: number; color?: string; dataKey?: string }

function makeTooltip(unitByKey: Map<string, SeriesUnit>) {
  return function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#E5E3F0] rounded-lg shadow-md p-2.5 text-[12px] min-w-[150px]">
        <div className="font-semibold text-[#1a1535] mb-1.5">{label ? format(parseISO(label), "EEE d MMM", { locale: fr }) : ""}</div>
        {payload.filter((p) => p.value != null).map((p) => (
          <div key={String(p.dataKey)} className="flex items-center gap-2 py-0.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[#5A5A58] flex-1">{String(p.name)}</span>
            <span className="font-semibold text-[#1a1535] tabular-nums">
              {fmtValue(Number(p.value ?? 0), unitByKey.get(String(p.dataKey)) ?? "currency")}
            </span>
          </div>
        ))}
      </div>
    );
  };
}

export default function PremiumChart({
  data, series, markers, title, subtitle, height = 300,
}: {
  data: ChartPoint[];
  series: ChartSeries[];
  markers?: ChartMarker[];
  title: string;
  subtitle?: string;
  height?: number;
}) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(series.map((s) => [s.key, !!s.defaultOn && !s.disabled])),
  );
  const toggle = (s: ChartSeries) => { if (!s.disabled) setVisible((v) => ({ ...v, [s.key]: !v[s.key] })); };

  const unitByKey = useMemo(() => new Map(series.map((s) => [s.key, s.unit])), [series]);
  const CustomTooltip = useMemo(() => makeTooltip(unitByKey), [unitByKey]);

  // Coupe au jour courant : aucune série n'est dessinée sur le futur (pas de
  // plongeon fantôme à 0). Les valeurs restent null → recharts saute le point.
  const todayIso = new Date().toISOString().slice(0, 10);
  const chartData = useMemo(() => data.map((p) => {
    if (String(p.date) > todayIso) {
      const nulled: ChartPoint = { date: p.date };
      for (const s of series) nulled[s.key] = null;
      return nulled;
    }
    return p;
  }), [data, series, todayIso]);

  const visibleSeries = series.filter((s) => visible[s.key] && !s.disabled);
  const rightSeries = visibleSeries.filter((s) => s.axis === "right");
  const leftSeries = visibleSeries.filter((s) => s.axis === "left");
  const showRightAxis = rightSeries.length > 0;
  const leftUnit: SeriesUnit = leftSeries[0]?.unit ?? "currency";
  const rightUnit: SeriesUnit = rightSeries[0]?.unit ?? "ratio_x";
  const rightColor = rightSeries[0]?.color ?? "#1a1535";
  const hasNegativeLeft = leftSeries.some((s) => chartData.some((d) => (Number(d[s.key] ?? 0)) < 0));

  const areaSeries = visibleSeries.filter((s) => s.kind === "area");
  // Ordre de RENDU (empilement) indépendant de l'ordre du toggle : barres en
  // fond, puis aires, puis lignes au premier plan.
  const kindOrder: Record<SeriesKind, number> = { bar: 0, area: 1, line: 2 };
  const renderSeries = [...visibleSeries].sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind]);

  return (
    <div className="bg-white border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-[14px] font-bold text-[#1a1535]">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#8A8A88]">{subtitle}</p>}
        </div>
        {/* Toggle segmenté de séries */}
        <div className="inline-flex flex-wrap items-center gap-1 bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-md p-0.5">
          {series.map((s) => (
            <button key={s.key} onClick={() => toggle(s)} disabled={s.disabled}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                visible[s.key] && !s.disabled ? "bg-white text-[var(--ecom-navy)] shadow-sm" : "text-[#8A8A88] hover:text-[var(--ecom-navy)]"
              }`}
              title={s.disabled ? s.disabledHint : undefined}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: s.color, opacity: visible[s.key] && !s.disabled ? 1 : 0.4 }} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: showRightAxis ? 8 : 4, left: 4, bottom: 4 }}>
            <defs>
              {areaSeries.filter((s) => s.gradient).map((s) => (
                <linearGradient key={s.key} id={`pchart-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.26} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#F0EEF5" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#B4B4B2" }} tickLine={false} axisLine={false}
              tickFormatter={(v) => { try { return format(parseISO(v), "d MMM", { locale: fr }); } catch { return v; } }} minTickGap={24} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#B4B4B2" }} tickLine={false} axisLine={false}
              width={44} tickFormatter={(v) => fmtAxis(v, leftUnit)} />
            {showRightAxis && (
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: rightColor }} tickLine={false} axisLine={false}
                width={38} tickFormatter={(v) => fmtAxis(v, rightUnit)} />
            )}
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#C4B5FD", strokeWidth: 1, strokeDasharray: "3 3" }} />
            {hasNegativeLeft && <ReferenceLine yAxisId="left" y={0} stroke="#D4D4D2" strokeWidth={1} />}

            {markers?.map((mk, i) => (
              <ReferenceLine key={`mk-${i}`} yAxisId="left" x={mk.date} stroke="#C4B5FD" strokeWidth={1} strokeDasharray="4 3"
                label={{ value: mk.label, position: "top", fontSize: 9, fill: "#8A8A88" }} />
            ))}

            {renderSeries.map((s) => {
              if (s.kind === "bar") {
                return <Bar key={s.key} yAxisId={s.axis} dataKey={s.key} name={s.label} fill={s.color} radius={[3, 3, 0, 0]} barSize={10}
                  isAnimationActive={!reduce} animationDuration={500} />;
              }
              if (s.kind === "line") {
                return <Line key={s.key} yAxisId={s.axis} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={1.5}
                  dot={false} connectNulls={false} isAnimationActive={!reduce} animationDuration={500} />;
              }
              return <Area key={s.key} yAxisId={s.axis} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2}
                fill={s.gradient ? `url(#pchart-grad-${s.key})` : "none"} connectNulls={false} dot={false} activeDot={{ r: 3 }}
                isAnimationActive={!reduce} animationDuration={500} />;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
