"use client";

/**
 * Analytics — Commandes : attribution manuelle par commande.
 *
 * Garde-fou n°1 : triple ROAS affiché en permanence — « mesuré » (données
 * captées uniquement) / « avec pixel » / « avec manuelles », jamais fondus.
 * Passe qualité B2 : tri cliquable sur toutes les colonnes, filtres rapides
 * (traçabilité, canal, « à qualifier »), compteur de résultats.
 */
import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import type { AttributionOrderRow, ChannelStats } from "@/lib/gads/attribution-aggregator";
import { CHANNEL_LABELS, CONFIDENCE_LABELS, type Channel } from "@/lib/gads/channels";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import OrderAttributionCell from "@/components/ecom/gads/OrderAttributionCell";
import AnalyticsPeriodFilter, { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { KpiGridSkeleton, TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { TRACKING_LABELS, formatDateFr } from "@/components/ecom/gads/format";

type ChannelFilter = Exclude<Channel, "ghost"> | "all";
type TrackingFilter = "all" | "tracked" | "ghost" | "unmatched";
type SortKey = "date" | "amount" | "tracking" | "measured" | "manual";

const CHANNEL_FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "pinterest", label: "Pinterest" },
  { value: "other", label: "Autre" },
];

const TRACKING_FILTERS: { value: TrackingFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "tracked", label: "Trackées" },
  { value: "ghost", label: "Fantômes" },
  { value: "unmatched", label: "Non rattachées" },
];

const PILL_BASE = "px-2.5 py-1 text-[11px] font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]";

export default function GadsOrdersPage() {
  const { from, to } = useAnalyticsRange();
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [trackingFilter, setTrackingFilter] = useState<TrackingFilter>("all");
  const [toQualifyOnly, setToQualifyOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDesc, setSortDesc] = useState(true);

  const api = useApi<{ orders: AttributionOrderRow[]; channels: ChannelStats[] }>(
    `/api/ecom/gads/orders?from=${from}&to=${to}`,
  );
  const orders = api.data?.orders ?? [];
  const channels = api.data?.channels ?? [];

  const visibleOrders = useMemo(() => {
    let list = orders;
    if (channelFilter !== "all") list = list.filter((o) => o.effective_channel === channelFilter);
    if (trackingFilter !== "all") list = list.filter((o) => o.tracking_status === trackingFilter);
    if (toQualifyOnly) list = list.filter((o) => o.manual == null);

    const dir = sortDesc ? -1 : 1;
    const key = (o: AttributionOrderRow): string | number => {
      switch (sortKey) {
        case "amount": return o.total_cents;
        case "tracking": return o.tracking_status ?? "zz";
        case "measured": return o.measured_channel ?? "zz";
        case "manual": return o.manual?.channel ?? "zz";
        default: return o.created_at;
      }
    };
    return [...list].sort((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka === kb) return 0;
      return (ka < kb ? -1 : 1) * dir;
    });
  }, [orders, channelFilter, trackingFilter, toQualifyOnly, sortKey, sortDesc]);

  const visibleChannels = channelFilter === "all" ? channels : channels.filter((c) => c.channel === channelFilter);
  const toQualifyCount = orders.filter((o) => o.manual == null && o.tracking_status !== "tracked").length;

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDesc(!sortDesc);
    else { setSortKey(k); setSortDesc(true); }
  };
  const arrow = (k: SortKey) => (sortKey === k ? <span className="text-[#7C3AED]"> {sortDesc ? "↓" : "↑"}</span> : null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1535]">Attribution par commande</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Attribue une source à chaque commande — la traçabilité réelle reste affichée en face de ton hypothèse
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <GadsTabs />
          <AnalyticsPeriodFilter />
        </div>
      </div>

      {/* Rappel de cadrage — toujours visible */}
      <div className="flex items-start gap-2 bg-[#F7F7F5] border border-[#E5E3F0] rounded-lg px-4 py-2.5 text-[11px] text-[#5A5A58]">
        <Info size={13} className="shrink-0 mt-[1px] text-[#8A8A88]" />
        <span>
          L&apos;attribution manuelle est une <span className="font-semibold text-[#1a1535]">hypothèse</span>, pas une mesure.
          Le ROAS mesuré reste la référence. Utilise les attributions manuelles pour explorer des scénarios,
          pas pour décider un budget sur une intuition.
        </span>
      </div>

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}

      {api.loading ? (
        <>
          <KpiGridSkeleton cards={4} />
          <TableSkeleton rows={8} />
        </>
      ) : (
        <>
          {/* Triple ROAS par canal */}
          <div className={`grid gap-3 ${visibleChannels.length > 1 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
            {visibleChannels.map((c) => <ChannelCard key={c.channel} stats={c} />)}
          </div>

          {/* Filtres + compteur */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[12px] font-medium text-[#5A5A58]">Canal :</span>
            <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E5E3F0] rounded-md p-0.5">
              {CHANNEL_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setChannelFilter(f.value)}
                  className={`${PILL_BASE} ${channelFilter === f.value ? "bg-white text-[#1a1535] shadow-sm" : "text-[#5A5A58] hover:text-[#1a1535]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-[12px] font-medium text-[#5A5A58]">Traçabilité :</span>
            <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E5E3F0] rounded-md p-0.5">
              {TRACKING_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setTrackingFilter(f.value)}
                  className={`${PILL_BASE} ${trackingFilter === f.value ? "bg-white text-[#1a1535] shadow-sm" : "text-[#5A5A58] hover:text-[#1a1535]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={() => setToQualifyOnly(!toQualifyOnly)}
              title="Commandes sans attribution manuelle — ce qu'il te reste à qualifier"
              className={`${PILL_BASE} border ${toQualifyOnly ? "bg-[#EDE9FE] border-[#C4B5FD] text-[#7C3AED]" : "bg-white border-[#E5E3F0] text-[#5A5A58] hover:text-[#1a1535]"}`}>
              À qualifier{toQualifyCount > 0 && ` (${toQualifyCount})`}
            </button>
            <span className="ml-auto text-[11px] text-[#8A8A88] tabular-nums">
              {visibleOrders.length} / {orders.length} commande{orders.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Tableau des commandes */}
          <div className="bg-white border border-[#E5E3F0] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[#E5E3F0] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                    <Th onClick={() => onSort("date")}>Commande{arrow("date")}</Th>
                    <Th onClick={() => onSort("amount")} right>Montant{arrow("amount")}</Th>
                    <th className="px-4 py-2.5 font-medium">Produit(s)</th>
                    <Th onClick={() => onSort("tracking")}>Traçabilité réelle{arrow("tracking")}</Th>
                    <Th onClick={() => onSort("measured")}>Canal mesuré{arrow("measured")}</Th>
                    <Th onClick={() => onSort("manual")}>Attribution manuelle{arrow("manual")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((o) => <OrderRow key={o.order_id} order={o} onSaved={() => void api.mutate()} />)}
                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[#8A8A88]">
                        Aucune commande ne correspond à ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children, onClick, right = false }: { children: React.ReactNode; onClick: () => void; right?: boolean }) {
  return (
    <th className={`px-4 py-2.5 font-medium cursor-pointer select-none hover:text-[#1a1535] ${right ? "text-right" : ""}`} onClick={onClick}>
      {children}
    </th>
  );
}

function ChannelCard({ stats: c }: { stats: ChannelStats }) {
  return (
    <div className="bg-white border border-[#E5E3F0] rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-bold text-[#1a1535]">{CHANNEL_LABELS[c.channel]}</span>
        {c.sample_small && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold"
            title="Moins de 5 ventes sur la période : le ROAS de ce canal n'est pas significatif">
            Échantillon faible
          </span>
        )}
      </div>
      {c.spend_cents == null ? (
        <p className="text-[11px] text-[#8A8A88]">
          <span className="font-semibold text-[#1a1535]">Dépense non renseignée</span> — ROAS non calculable
          (aucun coût n&apos;est inventé).
        </p>
      ) : (
        <div className="flex items-baseline gap-4 flex-wrap">
          <div title="Données captées par Shopify uniquement — la référence">
            <div className="text-[10px] text-[#8A8A88]">Mesuré Shopify</div>
            <div className="text-[18px] font-bold text-[#1a1535] tabular-nums">{formatRoas(c.roas_measured)}</div>
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
        <div className="font-medium text-[#1a1535]">{o.name ?? "—"}</div>
        <div className="text-[10px] text-[#8A8A88]">{formatDateFr(o.created_at.slice(0, 10), "d MMM yyyy")}</div>
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-[#1a1535]">{formatCurrency(o.total_cents)}</td>
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
