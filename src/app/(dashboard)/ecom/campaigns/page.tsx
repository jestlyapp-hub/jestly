"use client";

/**
 * Onglet Campagnes — liste premium des campagnes Google Ads (actives, en pause,
 * terminées). Métriques Google + ROAS Jestly croisé (résolution unifiée), tri,
 * filtres (statut, rentabilité, recherche), sélecteur de colonnes, ligne de
 * total, insights automatiques, comparateur 2-4 campagnes, export CSV.
 *
 * Honnêteté d'attribution : un bandeau indique quelle part du CA Google Ads a pu
 * être rattachée à une campagne précise — l'auto-tagging sans utm_campaign reste
 * agrégé plutôt qu'attribué au hasard.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Columns3, Info, GitCompareArrows } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { formatCurrency, formatNumberFr, formatRoas, formatPercent } from "@/lib/ads/formatters";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import ExportCsvButton from "@/components/ecom/gads/ExportCsvButton";
import { TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { InsightCard } from "@/components/ecom/premium/InsightCard";
import type { CampaignRow, CampaignAnalytics, CampaignInsight, CampaignStatusFilter, RentabilityFilter } from "@/lib/gads/campaign-analytics";
import { CampaignStatusChip, ProfitabilityDot, channelTypeLabel, Sparkline } from "@/components/ecom/campaigns/campaign-ui";
import CompareDrawer from "@/components/ecom/campaigns/CompareDrawer";

type ApiShape = CampaignAnalytics & { insights: CampaignInsight[] };

interface Col {
  id: string;
  label: string;
  tooltip?: string;
  default: boolean;
  value: (r: CampaignRow) => number | null;
  render: (r: CampaignRow) => string;
}

const COLS: Col[] = [
  { id: "spend", label: "Dépense", default: true, value: (r) => r.spend_cents, render: (r) => formatCurrency(r.spend_cents) },
  { id: "budget", label: "Budget/j", tooltip: "Budget quotidien actuel de la campagne (Google Ads)", default: true, value: (r) => r.current_budget_cents, render: (r) => r.current_budget_cents != null ? formatCurrency(r.current_budget_cents) : "—" },
  { id: "clicks", label: "Clics", default: false, value: (r) => r.clicks, render: (r) => formatNumberFr(r.clicks) },
  { id: "impressions", label: "Impr.", default: false, value: (r) => r.impressions, render: (r) => formatNumberFr(r.impressions) },
  { id: "ctr", label: "CTR", default: false, value: (r) => r.ctr, render: (r) => r.ctr != null ? formatPercent(r.ctr) : "—" },
  { id: "cpc", label: "CPC moyen", default: false, value: (r) => r.avg_cpc_cents, render: (r) => r.avg_cpc_cents != null ? formatCurrency(r.avg_cpc_cents) : "—" },
  { id: "conv", label: "Conv. Google", tooltip: "Conversions déclarées par Google sur la période", default: false, value: (r) => r.google_conversions, render: (r) => formatNumberFr(Math.round(r.google_conversions)) },
  { id: "roas_google", label: "ROAS Google", tooltip: "Ce que Google s'attribue : valeur de conversion Google ÷ dépense. Surestime souvent.", default: true, value: (r) => r.roas_google, render: (r) => formatRoas(r.roas_google) },
  { id: "roas_jestly", label: "ROAS Jestly", tooltip: "CA Shopify réel attribué à cette campagne (résolution unifiée : mesuré + pixel + tes attributions manuelles) ÷ dépense. Ton chiffre de pilotage — dépend d'un rattachement commande↔campagne (voir bandeau).", default: true, value: (r) => r.roas_jestly, render: (r) => formatRoas(r.roas_jestly) },
  { id: "ca", label: "CA Shopify attribué", tooltip: "CA Shopify réel attribué à cette campagne via la résolution unifiée", default: true, value: (r) => r.jestly_revenue_cents, render: (r) => r.jestly_revenue_cents > 0 ? formatCurrency(r.jestly_revenue_cents) : "—" },
  { id: "cpa", label: "CPA", tooltip: "Dépense ÷ ventes attribuées (résolution Jestly)", default: false, value: (r) => r.cpa_cents, render: (r) => r.cpa_cents != null ? formatCurrency(r.cpa_cents) : "—" },
];

const STATUS_FILTERS: { value: CampaignStatusFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "active", label: "Actives" },
  { value: "paused", label: "En pause" },
  { value: "ended", label: "Terminées" },
];
const RENT_FILTERS: { value: RentabilityFilter; label: string }[] = [
  { value: "all", label: "Rentabilité : toutes" },
  { value: "profitable", label: "Rentables" },
  { value: "loss", label: "En perte" },
];
type Preset = "all" | "potential" | "cut";
const PRESET_FILTERS: { value: Preset; label: string }[] = [
  { value: "all", label: "Priorité : toutes" },
  { value: "potential", label: "À fort potentiel" },
  { value: "cut", label: "À couper" },
];

const STORAGE_KEY = "ecom_campaigns_columns";

export default function CampaignsPage() {
  usePageTitle("Campagnes ECOM");
  const { from, to } = useAnalyticsRange();
  const [status, setStatus] = useState<CampaignStatusFilter>("all");
  const [rent, setRent] = useState<RentabilityFilter>("all");
  const [preset, setPreset] = useState<Preset>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("__default");
  const [sortDesc, setSortDesc] = useState(true);
  const [visible, setVisible] = useState<Set<string>>(new Set(COLS.filter((c) => c.default).map((c) => c.id)));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setVisible(new Set(JSON.parse(saved) as string[]));
    } catch { /* défauts */ }
  }, []);
  const toggleCol = (id: string) => {
    const next = new Set(visible);
    if (next.has(id)) next.delete(id); else next.add(id);
    setVisible(next);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* ignore */ }
  };

  const api = useApi<ApiShape>(`/api/ecom/campaigns?from=${from}&to=${to}`);
  const data = api.data;

  const shownCols = COLS.filter((c) => visible.has(c.id));

  const rows = useMemo(() => {
    let list = data?.rows ?? [];
    if (status !== "all") list = list.filter((r) => r.status_display === status);
    if (rent !== "all") list = list.filter((r) => rent === "profitable" ? r.profitable === true : r.profitable === false);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    // Presets de priorité (surchargent le tri manuel) :
    //  - fort potentiel : rentables, triées par ROAS Jestly décroissant (les
    //    meilleures candidates à plus de budget) ;
    //  - à couper : en perte avec dépense, triées par dépense décroissante (le
    //    gaspillage le plus lourd d'abord).
    if (preset === "potential") {
      list = list.filter((r) => r.profitable === true);
      list = [...list].sort((a, b) => (b.roas_jestly ?? -1) - (a.roas_jestly ?? -1));
    } else if (preset === "cut") {
      list = list.filter((r) => r.profitable === false && r.spend_cents > 0);
      list = [...list].sort((a, b) => b.spend_cents - a.spend_cents);
    } else if (sortBy !== "__default") {
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
  }, [data?.rows, status, rent, preset, search, sortBy, sortDesc]);

  // Totaux de la sélection filtrée (recalculés côté client — cohérents avec les filtres).
  const totals = useMemo(() => {
    const spend = rows.reduce((s, r) => s + r.spend_cents, 0);
    const revenue = rows.reduce((s, r) => s + r.jestly_revenue_cents, 0);
    const convValue = rows.reduce((s, r) => s + r.google_conversion_value_cents, 0);
    const orders = rows.reduce((s, r) => s + r.jestly_orders, 0);
    return {
      spend, revenue, orders,
      roas_jestly: spend > 0 ? revenue / spend : null,
      roas_google: spend > 0 ? convValue / spend : null,
    };
  }, [rows]);

  const onSort = (id: string) => {
    if (sortBy === id) setSortDesc(!sortDesc);
    else { setSortBy(id); setSortDesc(true); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else if (next.size < 4) next.add(id);
    setSelected(next);
  };
  const selectedRows = (data?.rows ?? []).filter((r) => selected.has(r.campaign_id));

  const cov = data?.attribution_coverage;
  const coveragePct = cov && cov.google_revenue_cents > 0
    ? Math.round((cov.matched_to_campaign_cents / cov.google_revenue_cents) * 100) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[var(--ecom-navy)]">Campagnes</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Toutes tes campagnes Google Ads — dépense, budget, ROAS croisé au CA Shopify réel, plus clair que Google Ads.
          </p>
        </div>
        <ExportCsvButton filename={`campagnes-${from}-${to}.csv`} rows={rows.map((r) => ({
          campagne: r.name,
          statut: r.status_display,
          type: channelTypeLabel(r.channel_type),
          depense_eur: (r.spend_cents / 100).toFixed(2).replace(".", ","),
          budget_jour_eur: r.current_budget_cents != null ? (r.current_budget_cents / 100).toFixed(2).replace(".", ",") : "",
          clics: r.clicks,
          impressions: r.impressions,
          ctr_pct: r.ctr ?? "",
          cpc_eur: r.avg_cpc_cents != null ? (r.avg_cpc_cents / 100).toFixed(2).replace(".", ",") : "",
          conversions_google: r.google_conversions,
          roas_google: r.roas_google ?? "",
          roas_jestly: r.roas_jestly ?? "",
          ca_shopify_attribue_eur: (r.jestly_revenue_cents / 100).toFixed(2).replace(".", ","),
          cpa_eur: r.cpa_cents != null ? (r.cpa_cents / 100).toFixed(2).replace(".", ",") : "",
          rentable: r.profitable == null ? "" : r.profitable ? "oui" : "non",
        }))} />
      </div>

      {/* Insights automatiques */}
      {data && data.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.insights.map((ins, i) => (
            <InsightCard
              key={i}
              nature={ins.nature}
              message={ins.message}
              impact={ins.impact_cents != null ? formatCurrency(ins.impact_cents) : undefined}
              href={`/ecom/campaigns/${ins.campaign_id}?from=${from}&to=${to}`}
            />
          ))}
        </div>
      )}

      {/* Bandeau honnêteté d'attribution */}
      {cov && cov.google_revenue_cents > 0 && (
        <div className="flex items-start gap-2.5 bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-lg px-4 py-2.5 text-[11px] text-[#5A5A58]">
          <Info size={13} className="text-[#8A8A88] shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-[var(--ecom-navy)]">Rattachement à une campagne : {coveragePct}%</span> du CA Google Ads résolu
            ({formatCurrency(cov.matched_to_campaign_cents)} sur {formatCurrency(cov.google_revenue_cents)}
            {cov.matched_manual_cents > 0 && <> · dont {formatCurrency(cov.matched_manual_cents)} rattaché à la main</>}).
            Le reste ({formatCurrency(cov.unmatched_cents)}) provient de clics auto-taggés (gclid) sans <code className="text-[10px]">utm_campaign</code> exploitable : il reste au niveau du canal, jamais réparti au hasard.
            Ouvre une campagne → <span className="font-medium text-[var(--ecom-brand-violet)]">« Rattacher des ventes »</span> pour l&apos;affecter à la main et faire monter son ROAS Jestly.
          </span>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={status} onChange={setStatus} options={STATUS_FILTERS} />
        <Segmented value={rent} onChange={setRent} options={RENT_FILTERS} />
        <Segmented value={preset} onChange={setPreset} options={PRESET_FILTERS} />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une campagne…"
          className="px-2.5 py-1.5 text-[12px] bg-white border border-[var(--ecom-card-border)] rounded-md focus:outline-none focus:border-[#7C3AED] text-[var(--ecom-navy)] w-56" />
        <div className="ml-auto flex items-center gap-2">
          {selected.size >= 2 && (
            <button onClick={() => setCompareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
              <GitCompareArrows size={13} /> Comparer ({selected.size})
            </button>
          )}
          <div className="relative">
            <button onClick={() => setPickerOpen(!pickerOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[var(--ecom-navy)] border border-[var(--ecom-card-border)] hover:bg-[var(--ecom-surface-sunken)]">
              <Columns3 size={13} /> Colonnes ({shownCols.length})
            </button>
            {pickerOpen && (
              <div className="absolute right-0 mt-1 z-20 bg-white border border-[var(--ecom-card-border)] rounded-lg shadow-lg p-2 w-56">
                {COLS.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 px-2 py-1 text-[12px] text-[var(--ecom-navy)] hover:bg-[var(--ecom-surface-sunken)] rounded cursor-pointer">
                    <input type="checkbox" checked={visible.has(c.id)} onChange={() => toggleCol(c.id)} className="accent-[#7C3AED]" />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}
      {api.loading && <TableSkeleton rows={8} />}

      {!api.loading && !api.error && (
        <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--ecom-card-border)] bg-[var(--ecom-surface-sunken)] text-left text-[11px] text-[#5A5A58]">
                  <th className="px-2 py-2.5 w-8"></th>
                  <th className="px-3 py-2.5 font-medium sticky left-0 bg-[var(--ecom-surface-sunken)]">Campagne</th>
                  <th className="px-3 py-2.5 font-medium">Dépense 30 j</th>
                  {shownCols.map((c) => (
                    <th key={c.id} className="px-3 py-2.5 font-medium text-right whitespace-nowrap cursor-pointer select-none hover:text-[var(--ecom-navy)]"
                      title={c.tooltip} onClick={() => onSort(c.id)}>
                      {c.label}{sortBy === c.id && <span className="text-[#7C3AED]"> {sortDesc ? "↓" : "↑"}</span>}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-medium text-right whitespace-nowrap" title="Verdict de rentabilité de la campagne : ROAS Jestly vs seuil de rentabilité (BE-ROAS)">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.campaign_id} className="border-b border-[#EFEFEF] align-middle hover:bg-[var(--ecom-surface-sunken)]">
                    <td className="px-2 py-2.5">
                      <input type="checkbox" className="accent-[#7C3AED]" checked={selected.has(r.campaign_id)}
                        disabled={!selected.has(r.campaign_id) && selected.size >= 4}
                        onChange={() => toggleSelect(r.campaign_id)} title="Sélectionner pour comparer" />
                    </td>
                    <td className="px-3 py-2.5 max-w-[280px] sticky left-0 bg-inherit">
                      <Link href={`/ecom/campaigns/${r.campaign_id}?from=${from}&to=${to}`} className="group block">
                        <div className="flex items-center gap-2">
                          <CampaignStatusChip status={r.status_display} />
                          {r.sample_small && r.jestly_orders > 0 && (
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-[#F7F7F5] border border-[var(--ecom-card-border)] text-[#8A8A88] text-[10px] font-medium" title="Moins de 5 ventes : ROAS peu significatif">échantillon faible</span>
                          )}
                        </div>
                        <div className="font-medium text-[var(--ecom-navy)] line-clamp-1 group-hover:text-[#7C3AED] mt-0.5" title={r.name}>{r.name}</div>
                        <div className="text-[10px] text-[#8A8A88]">{channelTypeLabel(r.channel_type)}</div>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 w-28"><Sparkline values={r.spend_by_day} /></td>
                    {shownCols.map((c) => (
                      <td key={c.id} className={`px-3 py-2.5 text-right tabular-nums whitespace-nowrap ${c.render(r) === "—" ? "text-[#B4B4B2]" : "text-[var(--ecom-navy)]"}`}>
                        {c.render(r)}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-right"><ProfitabilityDot profitable={r.profitable} small={r.sample_small} /></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={shownCols.length + 4} className="px-3 py-10 text-center text-[#8A8A88]">
                      {status === "ended" ? "Aucune campagne terminée sur cette période." : "Aucune campagne ne correspond à ces filtres."}
                    </td>
                  </tr>
                )}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--ecom-card-border)] bg-[var(--ecom-surface-sunken)] font-semibold text-[var(--ecom-navy)]">
                    <td className="px-2 py-2.5"></td>
                    <td className="px-3 py-2.5 sticky left-0 bg-[var(--ecom-surface-sunken)]">Total ({rows.length})</td>
                    <td className="px-3 py-2.5"></td>
                    {shownCols.map((c) => (
                      <td key={c.id} className="px-3 py-2.5 text-right tabular-nums whitespace-nowrap">
                        {c.id === "spend" ? formatCurrency(totals.spend)
                          : c.id === "ca" ? (totals.revenue > 0 ? formatCurrency(totals.revenue) : "—")
                          : c.id === "roas_jestly" ? formatRoas(totals.roas_jestly)
                          : c.id === "roas_google" ? formatRoas(totals.roas_google)
                          : ""}
                      </td>
                    ))}
                    <td className="px-3 py-2.5"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      <p className="text-[11px] text-[#8A8A88]">
        <span className="font-medium text-[#5A5A58]">ROAS Jestly</span> = CA Shopify réel attribué à la campagne (résolution unifiée : mesuré + pixel + attributions manuelles) ÷ dépense — ton chiffre de pilotage ·
        <span className="font-medium text-[#5A5A58]"> ROAS Google</span> = ce que Google s&apos;attribue. Totaux en SUM/SUM sur la période. Coche 2 à 4 campagnes pour les comparer.
      </p>

      {compareOpen && (
        <CompareDrawer rows={selectedRows} days={data?.days ?? []} beRoas={data?.be_roas ?? null} onClose={() => setCompareOpen(false)} />
      )}
    </div>
  );
}

function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex items-center bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-md p-0.5">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            value === o.value ? "bg-white text-[var(--ecom-navy)] shadow-sm" : "text-[#5A5A58] hover:text-[var(--ecom-navy)]"
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
