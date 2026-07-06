"use client";

/**
 * ECOM — Commandes (refonte : fusion de la liste Shopify et de la vue
 * attribution). UNE seule vue commandes : paiement/envoi/client + traçabilité
 * réelle + canal mesuré + attribution manuelle (confiance), triple ROAS en
 * tête, tri toutes colonnes, filtres, recherche, export CSV.
 * La période vient de la barre globale (URL ?from&to).
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { Info, Search } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import { formatFinancialStatus, formatFulfillmentStatus } from "@/lib/shopify/formatters";
import type { AttributionOrderRow, ChannelStats } from "@/lib/gads/attribution-aggregator";
import { CHANNEL_LABELS, CONFIDENCE_LABELS, type Channel } from "@/lib/gads/channels";
import OrderAttributionCell from "@/components/ecom/gads/OrderAttributionCell";
import ExportCsvButton from "@/components/ecom/gads/ExportCsvButton";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { KpiGridSkeleton, TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { TRACKING_LABELS, formatDateFr } from "@/components/ecom/gads/format";
import { usePageTitle } from "@/lib/hooks/use-page-title";

type ChannelFilter = Exclude<Channel, "ghost"> | "all";
type TrackingFilter = "all" | "tracked" | "ghost" | "unmatched";
type SortKey = "date" | "amount" | "payment" | "tracking" | "measured" | "manual";

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

const STATUS_CLS: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  gray: "bg-[#F7F7F5] text-[#5A5A58] border-[var(--ecom-card-border)]",
};

const PILL_BASE = "px-2.5 py-1 text-[11px] font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]";

export default function EcomOrdersPage() {
  usePageTitle("Commandes ECOM");
  const { from, to } = useAnalyticsRange();
  const [search, setSearch] = useState("");
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
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        (o.name ?? "").toLowerCase().includes(q) ||
        (o.email ?? "").toLowerCase().includes(q) ||
        o.products.some((p) => p.toLowerCase().includes(q)),
      );
    }
    if (channelFilter !== "all") list = list.filter((o) => o.effective_channel === channelFilter);
    if (trackingFilter !== "all") list = list.filter((o) => o.tracking_status === trackingFilter);
    if (toQualifyOnly) list = list.filter((o) => o.manual == null);

    const dir = sortDesc ? -1 : 1;
    const key = (o: AttributionOrderRow): string | number => {
      switch (sortKey) {
        case "amount": return o.total_cents;
        case "payment": return o.financial_status ?? "zz";
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
  }, [orders, search, channelFilter, trackingFilter, toQualifyOnly, sortKey, sortDesc]);

  const visibleChannels = channelFilter === "all" ? channels : channels.filter((c) => c.channel === channelFilter);
  const toQualifyCount = orders.filter((o) => o.manual == null && o.tracking_status !== "tracked").length;

  const exportRows = visibleOrders.map((o) => ({
    commande: o.name ?? "",
    date: o.created_at.slice(0, 10),
    montant_eur: (o.total_cents / 100).toFixed(2).replace(".", ","),
    client: o.email ?? "",
    paiement: o.financial_status ?? "",
    envoi: o.fulfillment_status ?? "",
    tracabilite: o.tracking_status ?? "inconnue",
    canal_mesure: o.measured_channel ?? "",
    pixel: o.pixel?.resolved_source ?? "",
    attribution_manuelle: o.manual?.channel ?? "",
    confiance: o.manual?.confidence ?? "",
    produits: o.products.join(" | "),
  }));

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDesc(!sortDesc);
    else { setSortKey(k); setSortDesc(true); }
  };
  const arrow = (k: SortKey) => (sortKey === k ? <span className="text-[#7C3AED]"> {sortDesc ? "↓" : "↑"}</span> : null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--ecom-navy)]">Commandes</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Paiement, envoi et attribution au même endroit — la traçabilité réelle en face de ton hypothèse
          </p>
        </div>
        <ExportCsvButton filename={`commandes-${from}-${to}.csv`} rows={exportRows} />
      </div>

      <div className="flex items-start gap-2 bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-lg px-4 py-2.5 text-[11px] text-[#5A5A58]">
        <Info size={13} className="shrink-0 mt-[1px] text-[#8A8A88]" />
        <span>
          L&apos;attribution manuelle est une <span className="font-semibold text-[var(--ecom-navy)]">hypothèse</span>, pas une mesure.
          Le ROAS mesuré reste la référence.
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
          <div className={`grid gap-3 ${visibleChannels.length > 1 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
            {visibleChannels.map((c) => <ChannelCard key={c.channel} stats={c} />)}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A8A88]" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="N°, email, produit…"
                className="pl-8 pr-3 py-1.5 text-[12px] bg-white border border-[var(--ecom-card-border)] rounded-md focus:outline-none focus:border-[#7C3AED] text-[var(--ecom-navy)] w-56" />
            </div>
            <span className="text-[12px] font-medium text-[#5A5A58]">Canal :</span>
            <div className="inline-flex items-center bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-md p-0.5">
              {CHANNEL_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setChannelFilter(f.value)}
                  className={`${PILL_BASE} ${channelFilter === f.value ? "bg-white text-[var(--ecom-navy)] shadow-sm" : "text-[#5A5A58] hover:text-[var(--ecom-navy)]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-[12px] font-medium text-[#5A5A58]">Traçabilité :</span>
            <div className="inline-flex items-center bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-md p-0.5">
              {TRACKING_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setTrackingFilter(f.value)}
                  className={`${PILL_BASE} ${trackingFilter === f.value ? "bg-white text-[var(--ecom-navy)] shadow-sm" : "text-[#5A5A58] hover:text-[var(--ecom-navy)]"}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <button onClick={() => setToQualifyOnly(!toQualifyOnly)}
              title="Commandes sans attribution manuelle — ce qu'il te reste à qualifier"
              className={`${PILL_BASE} border ${toQualifyOnly ? "bg-[#EDE9FE] border-[#C4B5FD] text-[#7C3AED]" : "bg-white border-[var(--ecom-card-border)] text-[#5A5A58] hover:text-[var(--ecom-navy)]"}`}>
              À qualifier{toQualifyCount > 0 && ` (${toQualifyCount})`}
            </button>
            <span className="ml-auto text-[11px] text-[#8A8A88] tabular-nums">
              {visibleOrders.length} / {orders.length} commande{orders.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--ecom-card-border)] bg-[var(--ecom-surface-sunken)] text-left text-[11px] text-[#5A5A58]">
                    <Th onClick={() => onSort("date")}>Commande{arrow("date")}</Th>
                    <Th onClick={() => onSort("amount")} right>Montant{arrow("amount")}</Th>
                    <th className="px-3 py-2.5 font-medium">Client</th>
                    <Th onClick={() => onSort("payment")}>Paiement / Envoi{arrow("payment")}</Th>
                    <Th onClick={() => onSort("tracking")}>Traçabilité{arrow("tracking")}</Th>
                    <Th onClick={() => onSort("measured")}>Canal mesuré{arrow("measured")}</Th>
                    <Th onClick={() => onSort("manual")}>Attribution manuelle{arrow("manual")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((o) => <OrderRow key={o.order_id} order={o} onSaved={() => void api.mutate()} />)}
                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[#8A8A88]">
                        Aucune commande ne correspond à ces filtres sur la période.
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
    <th className={`px-3 py-2.5 font-medium cursor-pointer select-none hover:text-[var(--ecom-navy)] whitespace-nowrap ${right ? "text-right" : ""}`} onClick={onClick}>
      {children}
    </th>
  );
}

function ChannelCard({ stats: c }: { stats: ChannelStats }) {
  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-bold text-[var(--ecom-navy)]">{CHANNEL_LABELS[c.channel]}</span>
        {c.sample_small && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold"
            title="Moins de 5 ventes sur la période : le ROAS de ce canal n'est pas significatif">
            Échantillon faible
          </span>
        )}
      </div>
      {c.spend_cents == null ? (
        <p className="text-[11px] text-[#8A8A88]">
          <span className="font-semibold text-[var(--ecom-navy)]">Dépense non renseignée</span> — ROAS non calculable.
        </p>
      ) : (
        <div className="flex items-baseline gap-4 flex-wrap">
          <div title="Données captées par Shopify uniquement — la référence">
            <div className="text-[10px] text-[#8A8A88]">Mesuré Shopify</div>
            <div className="text-[18px] font-bold text-[var(--ecom-navy)] tabular-nums">{formatRoas(c.roas_measured)}</div>
          </div>
          <div title="Mesuré + sources récupérées par le pixel Jestly sur les commandes fantômes">
            <div className="text-[10px] text-[#8A8A88]">Avec pixel Jestly</div>
            <div className="text-[18px] font-bold text-sky-700 tabular-nums">{formatRoas(c.roas_with_pixel)}</div>
          </div>
          <div title="Mesuré + tes attributions manuelles (hypothèses)">
            <div className="text-[10px] text-[#8A8A88]">Avec manuelles</div>
            <div className="text-[18px] font-bold text-[#7C3AED] tabular-nums">{formatRoas(c.roas_with_manual)}</div>
          </div>
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
  const fin = formatFinancialStatus(o.financial_status);
  const ful = formatFulfillmentStatus(o.fulfillment_status);
  return (
    <tr className="border-b border-[#EFEFEF] hover:bg-[var(--ecom-surface-sunken)] align-top">
      <td className="px-3 py-2.5 whitespace-nowrap">
        <Link href={`/ecom/orders/${o.order_id}` as never} className="font-medium text-[var(--ecom-navy)] hover:text-[#7C3AED]">
          {o.name ?? "—"}
        </Link>
        <div className="text-[10px] text-[#8A8A88]">{formatDateFr(o.created_at.slice(0, 10), "d MMM yyyy")}</div>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-[var(--ecom-navy)]">{formatCurrency(o.total_cents)}</td>
      <td className="px-3 py-2.5 text-[#5A5A58] truncate max-w-[160px]">{o.email ?? "—"}</td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${STATUS_CLS[fin.color] ?? STATUS_CLS.gray}`}>
          {fin.label}
        </span>
        <span className={`ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${STATUS_CLS[ful.color] ?? STATUS_CLS.gray}`}>
          {ful.label}
        </span>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5" title={tracking.description}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${tracking.dot}`} />
          <span className="text-[#5A5A58]">{tracking.label.replace(/s$/, "")}</span>
        </span>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap text-[#5A5A58]">
        <div>{o.measured_channel ? CHANNEL_LABELS[o.measured_channel] : "—"}</div>
        {o.pixel && (
          <span
            className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-semibold"
            title={`Source récupérée par le pixel Jestly (${o.pixel.match_method === "cart_attribute" ? "attribut de panier" : "proximité temporelle"})`}
          >
            Pixel : {o.pixel.resolved_source === "direct" ? "Direct" : CHANNEL_LABELS[o.pixel.resolved_source as Channel] ?? o.pixel.resolved_source}
            · {Math.round(o.pixel.confidence * 100)} %
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 min-w-[250px]">
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
