"use client";

/**
 * Comparateur de campagnes (2 à 4) — panneau latéral. Barres côte à côte pour
 * répondre d'un coup d'œil à « laquelle mérite plus de budget ? ». SUM/SUM,
 * couleurs constantes, DA Jestly. Aucune donnée inventée : « — » quand absent.
 */
import { useMemo } from "react";
import { X } from "lucide-react";
import { formatCurrency, formatRoas, formatNumberFr } from "@/lib/ads/formatters";
import type { CampaignRow } from "@/lib/gads/campaign-analytics";
import { CampaignStatusChip } from "./campaign-ui";
import PremiumChart, { type ChartSeries, type ChartPoint } from "@/components/ecom/dashboard/PremiumChart";

const PALETTE = ["#7C3AED", "#EC4899", "#0EA5E9", "#F59E0B"];

interface Metric {
  key: string;
  label: string;
  value: (r: CampaignRow) => number | null;
  format: (v: number | null) => string;
  /** true = plus haut est mieux (pour le repère « meilleure »). */
  higherBetter: boolean;
}

const METRICS: Metric[] = [
  { key: "spend", label: "Dépense", value: (r) => r.spend_cents, format: (v) => v != null ? formatCurrency(v) : "—", higherBetter: false },
  { key: "roas_jestly", label: "ROAS Jestly", value: (r) => r.roas_jestly, format: formatRoas, higherBetter: true },
  { key: "roas_google", label: "ROAS Google", value: (r) => r.roas_google, format: formatRoas, higherBetter: true },
  { key: "ca", label: "CA Shopify attribué", value: (r) => r.jestly_revenue_cents || null, format: (v) => v != null ? formatCurrency(v) : "—", higherBetter: true },
  { key: "cpa", label: "CPA", value: (r) => r.cpa_cents, format: (v) => v != null ? formatCurrency(v) : "—", higherBetter: false },
  { key: "orders", label: "Ventes attribuées", value: (r) => r.jestly_orders, format: (v) => v != null ? formatNumberFr(v) : "—", higherBetter: true },
];

export default function CompareDrawer({ rows, days, beRoas, onClose }: { rows: CampaignRow[]; days: string[]; beRoas: number | null; onClose: () => void }) {
  // Graphe unifié superposé : dépense de chaque campagne dans le temps (donnée
  // déjà présente via spend_by_day, aligné sur `days` — aucun appel réseau).
  const chartData: ChartPoint[] = useMemo(() => days.map((date, i) => {
    const point: ChartPoint = { date };
    rows.forEach((r, idx) => { point[`c${idx}`] = r.spend_by_day[i] ?? 0; });
    return point;
  }), [days, rows]);
  const chartSeries: ChartSeries[] = rows.map((r, idx) => ({
    key: `c${idx}`, label: r.name.length > 22 ? r.name.slice(0, 21) + "…" : r.name,
    color: PALETTE[idx], kind: "line", axis: "left", unit: "currency", defaultOn: true,
  }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[var(--ecom-surface-0)] h-full overflow-y-auto shadow-2xl border-l border-[var(--ecom-card-border)]">
        <div className="sticky top-0 bg-[var(--ecom-surface-1)] border-b border-[var(--ecom-card-border)] px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-[15px] font-bold text-[var(--ecom-navy)]">Comparer {rows.length} campagnes</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--ecom-surface-sunken)] text-[#5A5A58]" aria-label="Fermer"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Légende campagnes */}
          <div className="flex flex-wrap gap-3">
            {rows.map((r, i) => (
              <div key={r.campaign_id} className="flex items-center gap-2 text-[12px]">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: PALETTE[i] }} />
                <span className="font-medium text-[var(--ecom-navy)] max-w-[180px] truncate" title={r.name}>{r.name}</span>
                <CampaignStatusChip status={r.status_display} />
              </div>
            ))}
          </div>

          {beRoas != null && (
            <p className="text-[11px] text-[#8A8A88]">Seuil de rentabilité (BE-ROAS) : <span className="font-semibold text-[var(--ecom-navy)]">{formatRoas(beRoas)}</span> — au-dessus = rentable.</p>
          )}

          {/* Graphe unifié superposé (dépense dans le temps) */}
          {days.length > 1 && (
            <PremiumChart
              data={chartData}
              series={chartSeries}
              title="Dépense dans le temps"
              subtitle="Évolution journalière de la dépense par campagne — repère les montées en budget et leurs effets"
              height={220}
            />
          )}

          {/* Barres par métrique */}
          <div className="space-y-4">
            {METRICS.map((m) => {
              const vals = rows.map((r) => m.value(r));
              const max = Math.max(1, ...vals.map((v) => v ?? 0));
              const best = bestIndex(vals, m.higherBetter);
              return (
                <div key={m.key}>
                  <div className="text-[11px] font-semibold text-[#5A5A58] mb-1.5 uppercase tracking-wide">{m.label}</div>
                  <div className="space-y-1.5">
                    {rows.map((r, i) => {
                      const v = vals[i];
                      const pct = v != null && v > 0 ? Math.max(3, (v / max) * 100) : 0;
                      return (
                        <div key={r.campaign_id} className="flex items-center gap-2">
                          <div className="flex-1 h-6 bg-[#F1F1EF] rounded overflow-hidden relative">
                            <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: PALETTE[i], opacity: best === i ? 1 : 0.55 }} />
                          </div>
                          <span className={`w-28 text-right tabular-nums text-[12px] ${best === i ? "font-bold text-[var(--ecom-navy)]" : "text-[#5A5A58]"}`}>
                            {m.format(v)}{best === i && rows.length > 1 && v != null ? " ★" : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[#8A8A88]">★ = meilleure valeur de la ligne. Le ROAS Jestly dépend du rattachement commande↔campagne ; à faible couverture, appuie-toi sur le ROAS Google et la dépense.</p>
        </div>
      </div>
    </div>
  );
}

/** Index de la meilleure valeur (haute ou basse selon higherBetter), ignore null/0. */
function bestIndex(vals: Array<number | null>, higherBetter: boolean): number {
  let best = -1, bestVal = higherBetter ? -Infinity : Infinity;
  vals.forEach((v, i) => {
    if (v == null || v === 0) return;
    if (higherBetter ? v > bestVal : v < bestVal) { bestVal = v; best = i; }
  });
  return best;
}
