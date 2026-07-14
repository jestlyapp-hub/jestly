"use client";

/**
 * Détail d'une campagne Google Ads — mini-dashboard scopé campagne, aussi riche
 * que le Dashboard boutique. Verdict CAMPAGNE mis en avant (vs contexte boutique
 * discret), graphe unifié (même moteur que le Dashboard) avec markers de budget,
 * KPIs configurables persistés, analyses actionnables (score, tendance,
 * recommandation de budget, simulateur, comparaison boutique), tiroir d'insights,
 * et produits de la campagne (diffusés vs sans diffusion) avec marge.
 */
import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCcw } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { useEcomPref } from "@/components/ecom/EcomPrefsProvider";
import { TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import ConfigurableKpiGrid from "@/components/ecom/dashboard/ConfigurableKpiGrid";
import MetricSelector from "@/components/ecom/dashboard/MetricSelector";
import InsightsDrawer from "@/components/ecom/dashboard/InsightsDrawer";
import PremiumChart, { type ChartSeries, type ChartPoint, type ChartMarker } from "@/components/ecom/dashboard/PremiumChart";
import CampaignVerdictHero from "@/components/ecom/campaigns/CampaignVerdictHero";
import { CampaignScoreBadge, CampaignTrendBadge, BudgetRecommendationCard, ShopComparison } from "@/components/ecom/campaigns/CampaignAnalysis";
import BudgetSimulator from "@/components/ecom/campaigns/BudgetSimulator";
import AttachSalesPanel from "@/components/ecom/campaigns/AttachSalesPanel";
import { CAMPAIGN_METRIC_CATALOG, DEFAULT_CAMPAIGN_KPI_IDS, CAMPAIGN_HIGHLIGHT_IDS } from "@/lib/gads/campaign-metric-catalog";
import type { CampaignDetail, CampaignProductRowOut } from "@/lib/gads/campaign-detail";

const CHART_COLORS = { spend: "#C4B5FD", ca: "#7C3AED", profit: "#0F9D6B", roas: "#1a1535" };

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { from, to } = useAnalyticsRange();
  usePageTitle("Détail campagne");
  const [attachOpen, setAttachOpen] = useState(false);
  const [kpiIds, setKpiIds] = useEcomPref<string[]>("campaign_kpis", DEFAULT_CAMPAIGN_KPI_IDS);

  const api = useApi<CampaignDetail>(`/api/ecom/campaigns/${id}?from=${from}&to=${to}`);
  const d = api.data;

  const chartData: ChartPoint[] = useMemo(() => (d?.timeline ?? []).map((p) => ({
    date: p.date,
    spend: p.spend_cents,
    ca: p.jestly_revenue_cents,
    profit: p.net_profit_cents,
    roas: p.rolling_roas,
  })), [d?.timeline]);

  // Markers : changements de budget archivés (gads_budget_history) superposés à
  // la courbe — « le jour où tu es passé à X €/j ».
  const markers: ChartMarker[] = useMemo(() => {
    const hist = d?.budget_history ?? [];
    const days = new Set((d?.timeline ?? []).map((p) => p.date));
    const out: ChartMarker[] = [];
    let prev: number | null = null;
    const byDate = new Map<string, string>();
    for (const h of hist) {
      const date = h.observed_at.slice(0, 10);
      if (prev == null || h.budget_cents !== prev) {
        if (days.has(date)) byDate.set(date, formatCurrency(h.budget_cents));
        prev = h.budget_cents;
      }
    }
    for (const [date, label] of byDate) out.push({ date, label });
    return out;
  }, [d?.budget_history, d?.timeline]);

  const series: ChartSeries[] = [
    { key: "spend", label: "Dépense", color: CHART_COLORS.spend, kind: "bar", axis: "left", unit: "currency", defaultOn: true },
    { key: "ca", label: "CA attribué", color: CHART_COLORS.ca, kind: "area", axis: "left", unit: "currency", defaultOn: true, gradient: true },
    { key: "profit", label: "Profit net", color: CHART_COLORS.profit, kind: "area", axis: "left", unit: "currency", defaultOn: !!d?.costs_configured, disabled: !d?.costs_configured, disabledHint: "Renseigne tes coûts pour le profit net", gradient: true },
    { key: "roas", label: "ROAS Jestly 7 j", color: CHART_COLORS.roas, kind: "line", axis: "right", unit: "ratio_x", defaultOn: false },
  ];

  const backHref = `/ecom/campaigns?from=${from}&to=${to}`;

  return (
    <div className="space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-[12px] text-[#5A5A58] hover:text-[#7C3AED]">
        <ArrowLeft size={14} /> Toutes les campagnes
      </Link>

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}
      {api.loading && <TableSkeleton rows={6} />}

      {d && (
        <>
          <CampaignVerdictHero d={d} onAttach={() => setAttachOpen(true)} />

          {d.insights.length > 0 && <InsightsDrawer insights={d.insights} storageKey="campaign_insights_open" />}

          {/* KPIs configurables */}
          <div className="flex items-center justify-between gap-3">
            <p className="ecom-label">Indicateurs de la campagne</p>
            <MetricSelector label="Métriques" selected={kpiIds} onChange={setKpiIds} onReset={() => setKpiIds(DEFAULT_CAMPAIGN_KPI_IDS)} catalog={CAMPAIGN_METRIC_CATALOG} />
          </div>
          <ConfigurableKpiGrid metrics={d.metrics} selectedIds={kpiIds} catalog={CAMPAIGN_METRIC_CATALOG} highlightIds={CAMPAIGN_HIGHLIGHT_IDS} />

          {/* Graphe unifié */}
          <div id="graphe">
            <PremiumChart
              data={chartData}
              series={series}
              markers={markers}
              title="Dépense, CA attribué et profit net dans le temps"
              subtitle={`Évolution journalière · ROAS Jestly lissé sur 7 j${!d.costs_configured ? " · profit net masqué tant que les coûts ne sont pas renseignés" : ""}${markers.length > 0 ? " · repères = changements de budget" : ""}`}
            />
          </div>

          {/* Analyses actionnables */}
          <section id="analyse" className="space-y-3">
            <p className="ecom-label">Analyse &amp; leviers</p>
            <ShopComparison campaignRoas={d.roas_jestly} shopRoas={d.shop_roas_jestly} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CampaignScoreBadge score={d.score} />
              <CampaignTrendBadge trend={d.trend} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BudgetRecommendationCard recommendation={d.budget_recommendation} />
              <BudgetSimulator currentBudgetCents={d.current_budget_cents} roasJestly={d.roas_jestly} />
            </div>
          </section>

          {/* Produits */}
          <div id="produits" className="space-y-5">
            <ProductSection title="Produits diffusés" rows={d.products_active} emptyLabel="Aucun produit diffusé par cette campagne sur la période." />
            {d.products_inactive.length > 0 && (
              <ProductSection
                title="Produits sans diffusion récente"
                subtitle="Ces produits ne diffusent plus dans la campagne sur la période (exclus, en pause ou sans budget). Ceux qui vendaient sont des candidats à réactiver."
                rows={d.products_inactive}
                inactive
                emptyLabel=""
              />
            )}
          </div>

          {attachOpen && (
            <AttachSalesPanel
              campaignId={d.campaign_id}
              campaignName={d.name}
              from={from}
              to={to}
              onClose={() => setAttachOpen(false)}
              onAttached={() => void api.mutate()}
            />
          )}
        </>
      )}
    </div>
  );
}

function ProductSection({ title, subtitle, rows, inactive = false, emptyLabel }: {
  title: string; subtitle?: string; rows: CampaignProductRowOut[]; inactive?: boolean; emptyLabel: string;
}) {
  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--ecom-card-border)]">
        <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">{title} <span className="text-[#8A8A88] font-normal">({rows.length})</span></h3>
        {subtitle && <p className="text-[11px] text-[#8A8A88] mt-0.5">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--ecom-card-border)] bg-[var(--ecom-surface-sunken)] text-left text-[11px] text-[#5A5A58]">
              <th className="px-3 py-2 font-medium">Produit</th>
              <th className="px-3 py-2 font-medium text-right">Dépense</th>
              <th className="px-3 py-2 font-medium text-right">Clics</th>
              <th className="px-3 py-2 font-medium text-right">Conv. Google</th>
              <th className="px-3 py-2 font-medium text-right">CA attribué</th>
              <th className="px-3 py-2 font-medium text-right">ROAS Jestly</th>
              <th className="px-3 py-2 font-medium text-right" title="CA attribué − COGS (si coût produit renseigné)">Marge</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={`border-b border-[#EFEFEF] ${r.candidate_exclude ? "bg-amber-50/50" : r.candidate_reactivate ? "bg-emerald-50/40" : "hover:bg-[var(--ecom-surface-sunken)]"}`}>
                <td className="px-3 py-2.5 max-w-[320px]">
                  <div className="flex items-center gap-2.5">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- CDN Shopify
                      <img src={r.image_url} alt="" width={32} height={32} className={`w-8 h-8 rounded-md object-cover border border-[#EFEFEF] shrink-0 ${inactive ? "grayscale opacity-70" : ""}`} />
                    ) : (
                      <span className="w-8 h-8 rounded-md bg-[#F7F7F5] border border-[#EFEFEF] shrink-0" />
                    )}
                    <div>
                      <div className={`font-medium line-clamp-1 ${r.unknown_item ? "text-[#8A8A88] italic" : inactive ? "text-[#5A5A58] line-through decoration-[#D4D4D2]" : "text-[var(--ecom-navy)]"}`} title={r.title}>{r.title}</div>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {r.candidate_exclude && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-semibold" title="Dépense sans aucune conversion — candidat à l'exclusion du flux">
                            <AlertTriangle size={9} /> À exclure ?
                          </span>
                        )}
                        {r.candidate_reactivate && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-semibold" title="Ne diffuse plus mais a généré des ventes — candidat à réactiver">
                            <RefreshCcw size={9} /> À réactiver ?
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{r.spend_cents > 0 ? formatCurrency(r.spend_cents) : "—"}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{formatNumberFr(r.clicks)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{formatNumberFr(Math.round(r.google_conversions))}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{r.jestly_revenue_cents > 0 ? formatCurrency(r.jestly_revenue_cents) : "—"}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{formatRoas(r.roas_jestly)}</td>
                <td className={`px-3 py-2.5 text-right tabular-nums ${r.margin_cents == null ? "text-[#B4B4B2]" : r.margin_cents >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  title={r.margin_cents == null ? "Coût produit non renseigné — marge non disponible" : undefined}>
                  {r.margin_cents == null ? "—" : formatCurrency(r.margin_cents)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && emptyLabel && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[#8A8A88]">{emptyLabel}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
