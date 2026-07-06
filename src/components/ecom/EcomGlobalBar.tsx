"use client";

/**
 * Barre globale du module ECOM (refonte) — visible sur TOUTES les vues :
 * sélecteur de boutique + période globale (URL ?from&to) + statut business
 * persistant (Rentable/En perte, Net Profit, qualité de donnée en pastilles).
 * « Le statut business toujours visible » — Triple Whale x Jestly.
 */
import Link from "next/link";
import { Activity } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import type { BlendedBoard } from "@/lib/costs/blended";
import ShopSelector from "@/components/ecom/gads/ShopSelector";
import AnalyticsPeriodFilter, { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";

export default function EcomGlobalBar() {
  const { from, to } = useAnalyticsRange();
  const { data: board } = useApi<BlendedBoard>(`/api/ecom/gads/blended?from=${from}&to=${to}`);
  const cur = board?.current;
  const q = board?.quality;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-white border border-[#E5E3F0] rounded-lg px-3 py-2 mb-4">
      <ShopSelector />
      <AnalyticsPeriodFilter />

      {/* Statut business persistant */}
      {cur && (
        <span className="inline-flex items-center gap-2 text-[12px]">
          {cur.status === "insufficient_data" ? (
            <span className="px-2 py-0.5 rounded-full bg-[#F7F7F5] border border-[#E5E3F0] text-[#8A8A88] font-semibold text-[11px]">
              Rentabilité non calculable
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full border font-semibold text-[11px] ${
              cur.status === "profitable"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}>
              {cur.status === "profitable" ? "✓ Rentable" : "✗ En perte"}
            </span>
          )}
          {cur.net_profit_cents != null && (
            <span className="text-[#5A5A58]">
              Net Profit{" "}
              <span className={`font-bold tabular-nums ${cur.net_profit_cents >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {cur.net_profit_cents < 0 ? `(${formatCurrency(Math.abs(cur.net_profit_cents))})` : formatCurrency(cur.net_profit_cents)}
              </span>
            </span>
          )}
          {cur.mer != null && (
            <span className="text-[#8A8A88] hidden md:inline" title="MER vs seuil de rentabilité (BE-ROAS)">
              MER {formatRoas(cur.mer)}{cur.be_roas != null && <> / seuil {formatRoas(cur.be_roas)}</>}
            </span>
          )}
        </span>
      )}

      {/* Qualité de donnée en pastilles + lien santé */}
      <span className="ml-auto inline-flex items-center gap-3 text-[11px] text-[#5A5A58]">
        {q && (
          <span className="hidden sm:inline-flex items-center gap-2.5" title="Traçabilité des commandes de la période">
            <Dot cls="bg-emerald-500" n={q.tracked} label="trackées" />
            <Dot cls="bg-rose-500" n={q.ghost} label="fantômes" />
            <Dot cls="bg-amber-500" n={q.unmatched} label="non ratt." />
            {q.pixel_recovered > 0 && <Dot cls="bg-sky-500" n={q.pixel_recovered} label="pixel" />}
          </span>
        )}
        <Link href="/ecom/health"
          className="inline-flex items-center gap-1 text-[#7C3AED] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] rounded">
          <Activity size={12} /> Santé des données
        </Link>
      </span>
    </div>
  );
}

function Dot({ cls, n, label }: { cls: string; n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${cls}`} />
      <span className="tabular-nums font-medium text-[#1a1535]">{n}</span>
      <span className="text-[#8A8A88]">{label}</span>
    </span>
  );
}
