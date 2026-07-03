"use client";

/**
 * Google Ads — Produits : CA par produit et répartition par canal attribué
 * (attribution effective : les choix manuels priment sur le mesuré).
 *
 * Garde-fou n°2 : le volume est affiché partout — moins de 5 ventes =
 * « échantillon faible », pour empêcher de sur-interpréter un ROAS
 * calculé sur 1 vente.
 */
import { useState } from "react";
import { Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency } from "@/lib/ads/formatters";
import type { ProductRow } from "@/lib/gads/attribution-aggregator";
import { CHANNEL_LABELS, type Channel } from "@/lib/gads/channels";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import type { Period } from "@/components/ecom/gads/format";

type ChannelFilter = Exclude<Channel, "ghost"> | "all";

const FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "pinterest", label: "Pinterest" },
  { value: "other", label: "Autre" },
];

const CHANNEL_CHIP: Record<string, string> = {
  google_ads: "bg-[#F0EEFF] text-[#7C3AED]",
  seo: "bg-emerald-50 text-emerald-700",
  pinterest: "bg-rose-50 text-rose-700",
  other: "bg-sky-50 text-sky-700",
  unattributed: "bg-[#F7F7F5] text-[#8A8A88]",
};

export default function GadsProductsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [filter, setFilter] = useState<ChannelFilter>("all");

  const api = useApi<{ products: ProductRow[] }>(
    `/api/ecom/gads/products?range=${period}&channel=${filter}`,
  );
  const products = api.data?.products ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#191919]">CA par produit</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Répartition du chiffre d&apos;affaires par produit et par canal attribué (choix manuels inclus)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <GadsTabs />
          <PeriodSelector value={period} onChange={(v) => setPeriod(v as Period)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium text-[#5A5A58]">Canal :</span>
        <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-md p-0.5">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                filter === f.value ? "bg-white text-[#191919] shadow-sm" : "text-[#5A5A58] hover:text-[#191919]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-[#8A8A88] flex items-center gap-1 ml-2">
          <Info size={11} />
          Moins de 5 ventes = échantillon faible, ROAS non significatif
        </span>
      </div>

      {api.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-[12px] text-rose-800">{api.error}</div>
      )}

      <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                <th className="px-4 py-2.5 font-medium">Produit</th>
                <th className="px-4 py-2.5 font-medium text-right">Ventes</th>
                <th className="px-4 py-2.5 font-medium text-right">Unités</th>
                <th className="px-4 py-2.5 font-medium text-right">CA</th>
                <th className="px-4 py-2.5 font-medium">Répartition par canal</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id ?? p.title} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA] align-top">
                  <td className="px-4 py-2.5 max-w-[280px]">
                    <div className="font-medium text-[#191919] line-clamp-2" title={p.title}>{p.title}</div>
                    {p.sample_small && (
                      <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold"
                        title="Moins de 5 ventes : tout ROAS calculé sur ce produit n'est pas significatif">
                        Échantillon faible — ROAS non significatif
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[#5A5A58]">{p.orders_count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-[#5A5A58]">{p.units}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-[#191919]">{formatCurrency(p.revenue_cents)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(p.by_channel).map(([channel, split]) => (
                        <span key={channel}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_CHIP[channel] ?? CHANNEL_CHIP.unattributed}`}>
                          {channel === "unattributed" ? "Non attribué" : CHANNEL_LABELS[channel as Channel]}
                          <span className="tabular-nums">{split.orders} · {formatCurrency(split.revenue_cents)}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#8A8A88]">
                    {api.loading ? "Chargement…" : "Aucune vente sur cette période / ce canal."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
