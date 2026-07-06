"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

/**
 * Analytics — Product Analytics (Partie A3).
 * Ventes, CA, COGS, marge, dépense Google Ads par produit (item_id mappé),
 * double ROAS (déclaré vs croisé), CPA/CPC, sparkline CA.
 * Les produits à dépense > 0 et 0 conversion remontent en premier :
 * candidats à l'exclusion du flux Shopping.
 * Granularité produit (le mapping agrège les variantes — variante à venir).
 */
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Columns3, Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import type { ProductAnalyticsRow } from "@/lib/gads/product-analytics";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import ExportCsvButton from "@/components/ecom/gads/ExportCsvButton";
import { TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";

type ChannelFilter = "all" | "google_ads" | "seo" | "pinterest" | "other";

const FILTERS: { value: ChannelFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "pinterest", label: "Pinterest" },
  { value: "other", label: "Autre" },
];

// ── Colonnes affichables (préférence persistée) ──────────────────
interface Col {
  id: string;
  label: string;
  tooltip?: string;
  default: boolean;
  value: (r: ProductAnalyticsRow) => number | null;
  render: (r: ProductAnalyticsRow) => string;
}

const COLS: Col[] = [
  { id: "orders", label: "Ventes", default: true, value: (r) => r.orders_count, render: (r) => formatNumberFr(r.orders_count) },
  { id: "units", label: "Unités", default: false, value: (r) => r.units, render: (r) => formatNumberFr(r.units) },
  { id: "revenue", label: "CA", tooltip: "Somme des lignes d'articles (remises déduites), HORS frais de port et taxes — diffère volontairement du CA TTC de la Vue d'ensemble", default: true, value: (r) => r.revenue_cents, render: (r) => formatCurrency(r.revenue_cents) },
  { id: "nc_revenue", label: "CA nouveaux clients", default: false, value: (r) => r.nc_revenue_cents, render: (r) => formatCurrency(r.nc_revenue_cents) },
  { id: "cogs", label: "COGS", tooltip: "Coût d'achat des unités vendues (versions en vigueur à la date de commande)", default: false, value: (r) => r.cogs_cents, render: (r) => r.cogs_cents != null ? formatCurrency(r.cogs_cents) : "non renseigné" },
  { id: "margin", label: "Marge brute", default: true, value: (r) => r.gross_margin_cents, render: (r) => r.gross_margin_cents != null ? formatCurrency(r.gross_margin_cents) : "—" },
  { id: "spend", label: "Dépense Ads", default: true, value: (r) => r.ads?.spend_cents ?? null, render: (r) => r.ads ? formatCurrency(r.ads.spend_cents) : "non disponible" },
  { id: "clicks", label: "Clics", default: false, value: (r) => r.ads?.clicks ?? null, render: (r) => r.ads ? formatNumberFr(r.ads.clicks) : "—" },
  { id: "impressions", label: "Impressions", default: false, value: (r) => r.ads?.impressions ?? null, render: (r) => r.ads ? formatNumberFr(r.ads.impressions) : "—" },
  { id: "roas_declared", label: "ROAS déclaré", tooltip: "Valeur de conversion Google ÷ dépense — le chiffre de Google, son modèle d'attribution", default: true, value: (r) => r.roas_declared, render: (r) => formatRoas(r.roas_declared) },
  { id: "roas_crossed", label: "ROAS croisé", tooltip: "CA Shopify attribué Google (mesuré + pixel) ÷ dépense — le chiffre de vérité", default: true, value: (r) => r.roas_crossed, render: (r) => formatRoas(r.roas_crossed) },
  { id: "cpa", label: "CPA", tooltip: "Dépense ÷ ventes attribuées Google (croisé)", default: false, value: (r) => r.cpa_cents, render: (r) => r.cpa_cents != null ? formatCurrency(r.cpa_cents) : "—" },
  { id: "cpc", label: "Coût / clic", default: false, value: (r) => r.cpc_cents, render: (r) => r.cpc_cents != null ? formatCurrency(r.cpc_cents) : "—" },
  { id: "aov", label: "AOV produit", default: false, value: (r) => r.aov_cents, render: (r) => r.aov_cents != null ? formatCurrency(r.aov_cents) : "—" },
  { id: "share", label: "% CA total", default: true, value: (r) => r.revenue_share, render: (r) => r.revenue_share != null ? `${(r.revenue_share * 100).toFixed(1)} %` : "—" },
];

const STORAGE_KEY = "gads_products_columns";

export default function ProductAnalyticsPage() {
  usePageTitle("Produits ECOM");
  const { from, to } = useAnalyticsRange();
  const [filter, setFilter] = useState<ChannelFilter>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("__default");
  const [sortDesc, setSortDesc] = useState(true);
  const [visible, setVisible] = useState<Set<string>>(new Set(COLS.filter((c) => c.default).map((c) => c.id)));
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setVisible(new Set(JSON.parse(saved) as string[]));
    } catch { /* préférence illisible : défauts */ }
  }, []);
  const toggleCol = (id: string) => {
    const next = new Set(visible);
    if (next.has(id)) next.delete(id); else next.add(id);
    setVisible(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
  };

  const api = useApi<{ rows: ProductAnalyticsRow[]; days: string[]; wasted_spend_cents: number; ads_data_available: boolean }>(
    `/api/ecom/gads/products?from=${from}&to=${to}&channel=${filter}`,
  );
  const data = api.data;

  const shownCols = COLS.filter((c) => visible.has(c.id));
  const rows = useMemo(() => {
    let list = data?.rows ?? [];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (sortBy !== "__default") {
      const col = COLS.find((c) => c.id === sortBy);
      if (col) {
        list = [...list].sort((a, b) => {
          const va = col.value(a), vb = col.value(b);
          if (va == null && vb == null) return 0;
          if (va == null) return 1;
          if (vb == null) return -1;
          return sortDesc ? vb - va : va - vb;
        });
      }
    }
    return list;
  }, [data?.rows, search, sortBy, sortDesc]);

  const maxSpend = Math.max(1, ...(data?.rows ?? []).map((r) => r.ads?.spend_cents ?? 0));

  const onSort = (id: string) => {
    if (sortBy === id) setSortDesc(!sortDesc);
    else { setSortBy(id); setSortDesc(true); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1535]">Product Analytics</h1>
          <p className="text-[12px] text-[#8A8A88]">
            CA, marge et dépense Google Ads par produit — granularité produit (les variantes sont agrégées)
          </p>
        </div>
        <ExportCsvButton filename={`produits-${from}-${to}.csv`} rows={rows.map((r) => ({
          produit: r.title,
          ventes: r.orders_count,
          unites: r.units,
          ca_eur: (r.revenue_cents / 100).toFixed(2).replace(".", ","),
          ca_nouveaux_clients_eur: (r.nc_revenue_cents / 100).toFixed(2).replace(".", ","),
          cogs_eur: r.cogs_cents != null ? (r.cogs_cents / 100).toFixed(2).replace(".", ",") : "",
          marge_brute_eur: r.gross_margin_cents != null ? (r.gross_margin_cents / 100).toFixed(2).replace(".", ",") : "",
          depense_ads_eur: r.ads ? (r.ads.spend_cents / 100).toFixed(2).replace(".", ",") : "",
          clics: r.ads?.clicks ?? "",
          impressions: r.ads?.impressions ?? "",
          roas_declare: r.roas_declared ?? "",
          roas_croise: r.roas_crossed ?? "",
          depense_sans_conversion: r.wasted_spend ? "oui" : "",
        }))} />
      </div>

      {/* Encart budget gaspillé — la ligne qui compte à faible volume */}
      {data && data.wasted_spend_cents > 0 && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-900">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">Budget consommé sans conversion : {formatCurrency(data.wasted_spend_cents)}</span>{" "}
            sur la période — les produits concernés sont remontés en tête de tableau, candidats à l&apos;exclusion du flux Shopping.
          </span>
        </div>
      )}
      {data && !data.ads_data_available && (
        <div className="flex items-center gap-2 bg-[#F7F7F5] border border-[#E5E3F0] rounded-lg px-4 py-2.5 text-[11px] text-[#5A5A58]">
          <Info size={13} className="text-[#8A8A88]" />
          Dépense par produit non disponible sur la période — elle arrive avec la prochaine sync API (toutes les 6 h) ou via « Actualiser depuis l&apos;API » sur la Vue d&apos;ensemble.
        </div>
      )}

      {/* Filtres + colonnes */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E5E3F0] rounded-md p-0.5">
          {FILTERS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                filter === f.value ? "bg-white text-[#1a1535] shadow-sm" : "text-[#5A5A58] hover:text-[#1a1535]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit…"
          className="px-2.5 py-1.5 text-[12px] bg-white border border-[#E5E3F0] rounded-md focus:outline-none focus:border-[#7C3AED] text-[#1a1535] w-56" />
        <div className="relative ml-auto">
          <button onClick={() => setPickerOpen(!pickerOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[#1a1535] border border-[#E5E3F0] hover:bg-[#FBFBFA]">
            <Columns3 size={13} /> Colonnes ({shownCols.length})
          </button>
          {pickerOpen && (
            <div className="absolute right-0 mt-1 z-20 bg-white border border-[#E5E3F0] rounded-lg shadow-lg p-2 w-56">
              {COLS.map((c) => (
                <label key={c.id} className="flex items-center gap-2 px-2 py-1 text-[12px] text-[#1a1535] hover:bg-[#FBFBFA] rounded cursor-pointer">
                  <input type="checkbox" checked={visible.has(c.id)} onChange={() => toggleCol(c.id)} className="accent-[#7C3AED]" />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}
      {api.loading && <TableSkeleton rows={8} />}

      {!api.loading && (
      <div className="bg-white border border-[#E5E3F0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E3F0] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                <th className="px-3 py-2.5 font-medium">Produit</th>
                <th className="px-3 py-2.5 font-medium">CA 30 j</th>
                {shownCols.map((c) => (
                  <th key={c.id} className="px-3 py-2.5 font-medium text-right whitespace-nowrap cursor-pointer select-none hover:text-[#1a1535]"
                    title={c.tooltip} onClick={() => onSort(c.id)}>
                    {c.label}{sortBy === c.id && <span className="text-[#7C3AED]"> {sortDesc ? "↓" : "↑"}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className={`border-b border-[#EFEFEF] align-top ${r.wasted_spend ? "bg-amber-50/50" : "hover:bg-[#FBFBFA]"}`}>
                  <td className="px-3 py-2.5 max-w-[280px]">
                    <div className="flex items-start gap-2.5">
                      {r.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- CDN Shopify
                        <img src={r.image_url} alt="" width={32} height={32} className="w-8 h-8 rounded-md object-cover border border-[#EFEFEF] shrink-0" />
                      ) : (
                        <span className="w-8 h-8 rounded-md bg-[#F7F7F5] border border-[#EFEFEF] shrink-0" />
                      )}
                      <div>
                        <div className={`font-medium line-clamp-2 ${r.unknown_item ? "text-[#8A8A88] italic" : "text-[#1a1535]"}`} title={r.title}>{r.title}</div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {r.wasted_spend && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-semibold"
                              title="Dépense publicitaire sans aucune conversion sur la période — candidat à l'exclusion du flux Shopping">
                              <AlertTriangle size={9} /> Dépense sans conversion
                            </span>
                          )}
                          {r.sample_small && r.orders_count > 0 && (
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-[#F7F7F5] border border-[#E5E3F0] text-[#8A8A88] text-[10px] font-medium"
                              title="Moins de 5 ventes : tout ROAS sur ce produit n'est pas significatif">
                              Échantillon faible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 w-28">
                    <Sparkline values={r.revenue_by_day} />
                    {r.ads && r.ads.spend_cents > 0 && (
                      <div className="mt-1 h-1 rounded bg-[#EDE9FE]" title={`Dépense : ${formatCurrency(r.ads.spend_cents)}`}>
                        <div className="h-1 rounded bg-[#A78BFA]" style={{ width: `${Math.min(100, (r.ads.spend_cents / maxSpend) * 100)}%` }} />
                      </div>
                    )}
                  </td>
                  {shownCols.map((c) => (
                    <td key={c.id} className={`px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${
                      c.render(r) === "non renseigné" || c.render(r) === "non disponible" ? "text-[#B4B4B2] italic text-[11px]" : "text-[#1a1535]"
                    }`}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={shownCols.length + 2} className="px-3 py-10 text-center text-[#8A8A88]">
                    {api.loading ? "Chargement…" : "Aucun produit sur cette période / ce filtre."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
      <p className="text-[11px] text-[#8A8A88]">
        ROAS croisé = CA Shopify attribué Google (mesuré + pixel) ÷ dépense produit · ROAS déclaré = chiffre de Google.
        <span className="font-medium text-[#5A5A58]"> Le CA de cette vue somme les lignes d&apos;articles, hors frais de port et taxes</span> —
        il est donc légèrement inférieur au CA TTC de la Vue d&apos;ensemble : c&apos;est voulu, la granularité produit se juge hors port.
        Granularité produit : les item_id du flux Shopping (variantes) sont agrégés au produit.
      </p>
    </div>
  );
}

/** Sparkline CA — SVG nu, sans dépendance. */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2 || values.every((v) => v === 0)) {
    return <div className="h-6 flex items-center text-[10px] text-[#B4B4B2]">—</div>;
  }
  const max = Math.max(...values);
  const w = 100, h = 22;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - (v / max) * (h - 2) - 1}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-6" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#7C3AED" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
