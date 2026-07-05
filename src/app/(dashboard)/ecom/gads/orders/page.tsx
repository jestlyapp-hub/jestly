"use client";

/**
 * Google Ads — Commandes : attribution manuelle par commande.
 *
 * Garde-fou n°1 : double ROAS affiché en permanence — « mesuré » (données
 * captées uniquement) vs « avec attributions manuelles », avec l'écart en %.
 * Le tracking_status réel reste affiché sur chaque ligne : l'attribution
 * manuelle est une hypothèse, jamais une mesure.
 */
import { useState } from "react";
import { Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import type { AttributionOrderRow, ChannelStats } from "@/lib/gads/attribution-aggregator";
import { CHANNEL_LABELS, CONFIDENCE_LABELS, type Channel } from "@/lib/gads/channels";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import OrderAttributionCell from "@/components/ecom/gads/OrderAttributionCell";
import { TRACKING_LABELS, formatDateFr, type Period } from "@/components/ecom/gads/format";

type ChannelFilter = Exclude<Channel, "ghost"> | "all";

const FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "pinterest", label: "Pinterest" },
  { value: "other", label: "Autre" },
];

export default function GadsOrdersPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [filter, setFilter] = useState<ChannelFilter>("all");

  const api = useApi<{ orders: AttributionOrderRow[]; channels: ChannelStats[] }>(
    `/api/ecom/gads/orders?range=${period}`,
  );
  const orders = api.data?.orders ?? [];
  const channels = api.data?.channels ?? [];

  const visibleOrders = filter === "all" ? orders : orders.filter((o) => o.effective_channel === filter);
  const visibleChannels = filter === "all" ? channels : channels.filter((c) => c.channel === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#191919]">Attribution par commande</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Attribue une source à chaque commande — la traçabilité réelle reste affichée en face de ton hypothèse
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <GadsTabs />
          <PeriodSelector value={period} onChange={(v) => setPeriod(v as Period)} />
        </div>
      </div>

      {/* Rappel de cadrage — toujours visible */}
      <div className="flex items-start gap-2 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[11px] text-[#5A5A58]">
        <Info size={13} className="shrink-0 mt-[1px] text-[#8A8A88]" />
        <span>
          L&apos;attribution manuelle est une <span className="font-semibold text-[#191919]">hypothèse</span>, pas une mesure.
          Le ROAS mesuré reste la référence. Utilise les attributions manuelles pour explorer des scénarios,
          pas pour décider un budget sur une intuition.
        </span>
      </div>

      {/* Filtre canal */}
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
      </div>

      {api.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-[12px] text-rose-800">{api.error}</div>
      )}

      {/* Double ROAS par canal */}
      <div className={`grid gap-3 ${visibleChannels.length > 1 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
        {visibleChannels.map((c) => <ChannelCard key={c.channel} stats={c} />)}
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                <th className="px-4 py-2.5 font-medium">Commande</th>
                <th className="px-4 py-2.5 font-medium text-right">Montant</th>
                <th className="px-4 py-2.5 font-medium">Produit(s)</th>
                <th className="px-4 py-2.5 font-medium">Traçabilité réelle</th>
                <th className="px-4 py-2.5 font-medium">Canal mesuré</th>
                <th className="px-4 py-2.5 font-medium">Attribution manuelle</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((o) => <OrderRow key={o.order_id} order={o} onSaved={() => void api.mutate()} />)}
              {visibleOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#8A8A88]">
                    {api.loading ? "Chargement…" : "Aucune commande sur cette période / ce canal."}
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

function ChannelCard({ stats: c }: { stats: ChannelStats }) {
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-bold text-[#191919]">{CHANNEL_LABELS[c.channel]}</span>
        {c.sample_small && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold"
            title="Moins de 5 ventes sur la période : le ROAS de ce canal n'est pas significatif">
            Échantillon faible
          </span>
        )}
      </div>
      {c.spend_cents == null ? (
        <p className="text-[11px] text-[#8A8A88]">
          <span className="font-semibold text-[#191919]">Dépense non renseignée</span> — ROAS non calculable
          (aucun coût n&apos;est inventé).
        </p>
      ) : (
        <div className="flex items-baseline gap-4 flex-wrap">
          <div title="Données captées par Shopify uniquement — la référence">
            <div className="text-[10px] text-[#8A8A88]">Mesuré Shopify</div>
            <div className="text-[18px] font-bold text-[#191919] tabular-nums">{formatRoas(c.roas_measured)}</div>
          </div>
          <div title="Mesuré + sources récupérées par le pixel Jestly sur les commandes fantômes">
            <div className="text-[10px] text-[#8A8A88]">Avec pixel Jestly</div>
            <div className="text-[18px] font-bold text-sky-700 tabular-nums">{formatRoas(c.roas_with_pixel)}</div>
          </div>
          <div title="Mesuré + tes attributions manuelles (hypothèses)">
            <div className="text-[10px] text-[#8A8A88]">Avec manuelles</div>
            <div className="text-[18px] font-bold text-[#7C3AED] tabular-nums">{formatRoas(c.roas_with_manual)}</div>
          </div>
          {c.delta_percent != null && c.delta_percent !== 0 && (
            <span className={`text-[11px] font-semibold ${c.delta_percent > 0 ? "text-emerald-600" : "text-rose-600"}`}
              title="Écart du ROAS avec manuelles par rapport au mesuré">
              {c.delta_percent > 0 ? "+" : ""}{c.delta_percent} %
            </span>
          )}
        </div>
      )}
      <p className="text-[10px] text-[#8A8A88] mt-2">
        {c.orders_effective} vente{c.orders_effective > 1 ? "s" : ""} :{" "}
        {c.orders_effective - c.orders_from_manual} mesurée{c.orders_effective - c.orders_from_manual > 1 ? "s" : ""},{" "}
        {c.orders_from_manual} manuelle{c.orders_from_manual > 1 ? "s" : ""}
        {c.orders_from_pixel > 0 && <> · pixel : +{c.orders_from_pixel}</>}
        {" · "}{formatCurrency(c.revenue_effective_cents)}
      </p>
    </div>
  );
}

function OrderRow({ order: o, onSaved }: { order: AttributionOrderRow; onSaved: () => void }) {
  const tracking = TRACKING_LABELS[o.tracking_status ?? "unknown"];
  return (
    <tr className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA] align-top">
      <td className="px-4 py-2.5 whitespace-nowrap">
        <div className="font-medium text-[#191919]">{o.name ?? "—"}</div>
        <div className="text-[10px] text-[#8A8A88]">{formatDateFr(o.created_at.slice(0, 10), "d MMM yyyy")}</div>
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-[#191919]">{formatCurrency(o.total_cents)}</td>
      <td className="px-4 py-2.5 max-w-[220px]">
        <span className="text-[#5A5A58] line-clamp-2" title={o.products.join(", ")}>
          {o.products.join(", ") || "—"}
        </span>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5" title={tracking.description}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${tracking.dot}`} />
          <span className="text-[#5A5A58]">{tracking.label.replace(/s$/, "")}</span>
        </span>
      </td>
      <td className="px-4 py-2.5 whitespace-nowrap text-[#5A5A58]">
        <div>{o.measured_channel ? CHANNEL_LABELS[o.measured_channel] : "—"}</div>
        {o.pixel && (
          <span
            className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-semibold"
            title={`Source récupérée par le pixel Jestly (${o.pixel.match_method === "cart_attribute" ? "attribut de panier" : "proximité temporelle"}) — distincte du natif Shopify`}
          >
            Pixel : {o.pixel.resolved_source === "direct" ? "Direct" : CHANNEL_LABELS[o.pixel.resolved_source as Channel] ?? o.pixel.resolved_source}
            · {Math.round(o.pixel.confidence * 100)} %
          </span>
        )}
      </td>
      <td className="px-4 py-2.5 min-w-[260px]">
        <OrderAttributionCell order={o} onSaved={onSaved} />
        {o.manual && (
          <p className="text-[10px] text-[#8A8A88] mt-1">
            Posée : {CHANNEL_LABELS[o.manual.channel]}
            {o.manual.confidence && <> · confiance {CONFIDENCE_LABELS[o.manual.confidence].toLowerCase()}</>}
          </p>
        )}
      </td>
    </tr>
  );
}
