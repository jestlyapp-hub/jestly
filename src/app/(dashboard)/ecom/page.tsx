"use client";

/**
 * ECOM — Dashboard (refonte « Triple Whale x Jestly »).
 * LE cockpit unique : fusion de l'ancien Tour de pilotage et de la Vue
 * d'ensemble Analytics. Statut business en premier, insights automatiques,
 * KPIs de vérité (MER, BE-ROAS, Net Profit), objectif mensuel, comparaison de
 * périodes, vue journalière repliable, et les widgets boutique (top produits,
 * sources, funnel, commandes récentes). Une info = un seul endroit.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronUp, Lightbulb, Target, Wallet } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import type { BlendedBoard } from "@/lib/costs/blended";
import type { EcomSettings } from "@/lib/ads/types";
import type { ProductAnalyticsRow } from "@/lib/gads/product-analytics";
import type { DisplayChannel } from "@/lib/gads/channels";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { buildInsights, baselineComparable, type Insight } from "@/lib/gads/insights";
import { computeGoalProgress, currentMonthRange } from "@/lib/gads/goals";
import type { PeriodFilter } from "@/lib/period-filter";
import PeriodFilterDropdown from "@/components/facturation/PeriodFilterDropdown";
import ImportCsvButton, { type ImportRecap } from "@/components/ecom/gads/ImportCsvButton";
import ApiSyncButton from "@/components/ecom/gads/ApiSyncButton";
import ImportRecapBanner from "@/components/ecom/gads/ImportRecapBanner";
import MissingDatesBanner from "@/components/ecom/gads/MissingDatesBanner";
import BlendedChart from "@/components/ecom/gads/BlendedChart";
import DailyDetailTable from "@/components/ecom/gads/DailyDetailTable";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { KpiGridSkeleton, CardSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import SourcesDonut from "@/components/ecom/SourcesDonut";
import TopProductsTable from "@/components/ecom/TopProductsTable";
import Funnel from "@/components/ecom/Funnel";
import RecentOrdersTable from "@/components/ecom/RecentOrdersTable";
import GeographyList from "@/components/ecom/GeographyList";
import AlertsPanel from "@/components/ecom/AlertsPanel";
import { VerdictHero } from "@/components/ecom/premium/VerdictHero";
import { InsightCard } from "@/components/ecom/premium/InsightCard";
import { Sparkline } from "@/components/ecom/premium/Sparkline";

interface ShopWidgetsData {
  top_products: { id: string; title: string; image_url: string | null; units: number; revenue: number }[];
  recent_orders: Array<{
    id: string; name: string; created_at: string; total_price: number; currency: string;
    email: string | null; financial_status: string | null; fulfillment_status: string | null;
    channel: DisplayChannel;
  }>;
  sources: { channel: DisplayChannel; revenue: number; orders: number }[];
  funnel: { sessions: number; cart: number | null; checkout: number | null; purchase: number };
  countries: { country: string; revenue: number; orders: number }[];
  alerts: { low_stock: { product_id: string; title: string; inventory: number }[]; pending_fulfillment: number; failed_webhooks: number };
}

export default function EcomDashboardPage() {
  usePageTitle("Dashboard ECOM");
  const { from, to } = useAnalyticsRange();
  const sp = useSearchParams();
  const [recap, setRecap] = useState<ImportRecap | null>(null);
  const [showDaily, setShowDaily] = useState(sp.get("view") === "daily");

  const compareOn = sp.get("compare") === "1";
  const cfrom = sp.get("cfrom");
  const cto = sp.get("cto");
  const compareQs = compareOn && cfrom && cto ? `&cfrom=${cfrom}&cto=${cto}` : "";

  const api = useApi<BlendedBoard>(`/api/ecom/gads/blended?from=${from}&to=${to}${compareQs}`);
  const productsApi = useApi<{ rows: ProductAnalyticsRow[]; wasted_spend_cents: number }>(
    `/api/ecom/gads/products?from=${from}&to=${to}&channel=all`,
  );
  const shopApi = useApi<ShopWidgetsData>(`/api/ecom/dashboard?from=${from}&to=${to}`);

  const board = api.data;
  const cur = board?.current;

  // La période de comparaison n'est une baseline exploitable que si elle a une
  // activité réelle. Sinon on masque les deltas (« +804 % » sur ~0 est absurde).
  const canCompare = board ? baselineComparable(board.previous) : true;
  const cmpDelta = (a: number | null | undefined, b: number | null | undefined): number | null =>
    canCompare ? delta(a, b) : null;

  const periodDays = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000) + 1;
  const periodLabel = periodDays > 0 && periodDays <= 366 ? `${periodDays} derniers jours` : "période sélectionnée";

  const insights: Insight[] = board
    ? buildInsights({
        current: board.current,
        previous: board.previous,
        quality: board.quality,
        products: productsApi.data?.rows,
        wastedSpendCents: productsApi.data?.wasted_spend_cents,
      })
    : [];

  const onImported = (r: ImportRecap) => {
    setRecap(r);
    void api.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1535]">Dashboard</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Rentabilité réelle : revenue Shopify croisé avec la dépense Ads et tes coûts
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <CompareControl />
          <ApiSyncButton onSynced={onImported} />
          <ImportCsvButton onImported={onImported} variant="secondary" />
        </div>
      </div>

      {recap && <ImportRecapBanner recap={recap} onDismiss={() => setRecap(null)} />}
      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}
      {board && <MissingDatesBanner missingDates={board.missing_dates} />}

      {cur && !cur.costs_configured && (
        <div className="flex flex-wrap items-center gap-3 bg-[#EDE9FE] border border-[#DDD6FE] rounded-lg px-4 py-3 text-[12px] text-[#1a1535]">
          <Wallet size={15} className="text-[#7C3AED]" />
          <span>
            <span className="font-semibold">Renseigne tes coûts pour débloquer la rentabilité réelle</span>{" "}
            — BE-ROAS et Net Profit ont besoin de tes COGS et frais par commande.
          </span>
          <Link href="/ecom/settings?tab=couts"
            className="ml-auto px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
            Réglages coûts →
          </Link>
        </div>
      )}

      {cur && board ? (
        <>
          <VerdictHero
            periodLabel={periodLabel}
            costsConfigured={cur.costs_configured}
            insufficientData={cur.status === "insufficient_data"}
            profitable={cur.status === "profitable"}
            netProfitLabel={cur.net_profit_cents != null
              ? (cur.net_profit_cents < 0 ? `(${formatCurrency(Math.abs(cur.net_profit_cents))})` : formatCurrency(cur.net_profit_cents))
              : null}
            netProfitNegative={cur.net_profit_cents != null && cur.net_profit_cents < 0}
            mer={cur.mer}
            beRoas={cur.be_roas}
            merLabel={cur.mer != null ? formatRoas(cur.mer) : null}
            beRoasLabel={cur.be_roas != null ? formatRoas(cur.be_roas) : null}
            calibrateHref="/ecom/settings?tab=couts"
          />
          {insights.length > 0 && <InsightsBlock insights={insights} />}

          {!canCompare && (
            <div className="flex items-center gap-2 bg-[var(--ecom-surface-sunken)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-sm)] px-4 py-2.5 text-[var(--ecom-fs-label)] text-[var(--ecom-muted)]">
              <span className="font-semibold text-[var(--ecom-navy)]">Nouvelle activité</span>
              — la période de comparaison n&apos;a quasiment aucune activité (moins de 10 € de dépense ou moins de 3 commandes).
              Les deltas sont masqués car ils ne seraient pas pertinents.
            </div>
          )}

          <p className="ecom-label pt-1">Acquisition</p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <Kpi label="Revenue" value={formatCurrency(cur.revenue_cents)}
              delta={cmpDelta(cur.revenue_cents, board.previous.revenue_cents)} goodWhenUp
              spark={board.timeline.map((p) => p.revenue_cents)}
              hint={`${formatNumberFr(cur.orders_count)} commandes`} />
            <Kpi label="Blended Ad Spend" value={formatCurrency(cur.spend_cents)}
              delta={cmpDelta(cur.spend_cents, board.previous.spend_cents)}
              spark={board.timeline.map((p) => p.spend_cents)}
              hint="Google Ads (CSV/API)" />
            <Kpi label="MER" value={formatRoas(cur.mer)}
              delta={cmpDelta(cur.mer, board.previous.mer)} goodWhenUp
              tooltip="MER = SUM(Revenue Shopify) ÷ SUM(Blended Ad Spend) sur la période"
              hint="Revenue ÷ dépense — insensible aux ventes fantômes" />
            <Kpi label="AOV" value={cur.aov_cents != null ? formatCurrency(cur.aov_cents) : "—"}
              delta={cmpDelta(cur.aov_cents, board.previous.aov_cents)} goodWhenUp
              tooltip="AOV = Revenue ÷ nombre de commandes"
              hint="Panier moyen" />
            <Kpi label="NC-ROAS" value={formatRoas(cur.nc_roas)}
              delta={cmpDelta(cur.nc_roas, board.previous.nc_roas)} goodWhenUp
              tooltip="NC-ROAS = CA des nouveaux clients (1re commande du customer_id) ÷ dépense"
              hint={`CA nouveaux clients ${formatCurrency(cur.nc_revenue_cents)}`} />
            <Kpi label="NCPA" value={cur.ncpa_cents != null ? formatCurrency(cur.ncpa_cents) : "—"}
              delta={cmpDelta(cur.ncpa_cents, board.previous.ncpa_cents)}
              tooltip="NCPA = dépense ÷ nombre de nouveaux clients"
              hint={`${cur.new_customers} nouveau${cur.new_customers > 1 ? "x" : ""} client${cur.new_customers > 1 ? "s" : ""}`} />
          </div>

          <p className="ecom-label pt-1">Rentabilité</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="BE-ROAS" highlight
              tooltip="BE-ROAS = AOV ÷ (AOV − coût variable moyen par commande). Coût variable = COGS + expédition + frais de paiement + emballage."
              value={!cur.costs_configured ? "non renseigné" : !cur.be_roas_reachable ? "∅" : formatRoas(cur.be_roas)}
              hint={!cur.costs_configured
                ? "Renseigne tes coûts"
                : !cur.be_roas_reachable
                  ? "Marge unitaire ≤ 0 : aucun ROAS ne rentabilise"
                  : `Coût variable moyen ${cur.variable_cost_per_order_cents != null ? formatCurrency(cur.variable_cost_per_order_cents) : "—"} / commande`}
              cta={!cur.costs_configured ? "/ecom/settings?tab=couts" : undefined} />
            <Kpi label="Net Profit" highlight
              tooltip="Net Profit = Revenue − COGS − dépense Ads − expédition − frais de paiement − emballage − dépenses récurrentes (prorata)"
              value={cur.net_profit_cents != null ? formatCurrency(cur.net_profit_cents) : "non renseigné"}
              spark={cur.costs_configured ? board.timeline.map((p) => p.net_profit_cents ?? 0) : undefined}
              delta={cmpDelta(cur.net_profit_cents, board.previous.net_profit_cents)} goodWhenUp
              tone={cur.net_profit_cents != null ? (cur.net_profit_cents >= 0 ? "positive" : "negative") : undefined}
              hint={cur.net_profit_cents != null
                ? `dont ${formatCurrency(cur.expenses_prorated_cents)} de dépenses récurrentes`
                : "Renseigne tes coûts"}
              cta={cur.net_profit_cents == null ? "/ecom/settings?tab=couts" : undefined} />
            <Kpi label="Net Margin"
              value={cur.net_margin != null ? `${(cur.net_margin * 100).toFixed(1)} %` : "non renseigné"}
              delta={cmpDelta(cur.net_margin, board.previous.net_margin)} goodWhenUp
              tooltip="Net Margin = Net Profit ÷ Revenue"
              hint="Net Profit ÷ Revenue" />
            <Kpi label="Couverture COGS"
              value={cur.cogs.total_units > 0 ? `${Math.round(cur.cogs.coverage * 100)} %` : "—"}
              hint={`${cur.cogs.covered_units}/${cur.cogs.total_units} unités avec coût renseigné`}
              cta={cur.cogs.coverage < 1 && cur.cogs.total_units > 0 ? "/ecom/settings?tab=couts" : undefined} />
          </div>

          <GoalGauges />

          <BlendedChart points={board.timeline} costsConfigured={cur.costs_configured}
            compare={compareOn ? board.previous_timeline : null} />

          {/* Vue journalière repliable (ex-Détail temporel) */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)]">
            <button onClick={() => setShowDaily(!showDaily)}
              className="w-full flex items-center justify-between px-5 py-3 text-[var(--ecom-fs-label)] font-bold text-[var(--ecom-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecom-brand-violet)] rounded-[var(--ecom-r-md)]">
              Vue journalière (dépense, CA, ROAS jour par jour)
              {showDaily ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            {showDaily && (
              <div className="px-5 pb-5">
                <DailyDetailTable from={from} to={to} />
              </div>
            )}
          </div>

          {/* Widgets boutique (ex-Tour de pilotage) */}
          {shopApi.data && (
            <>
              <p className="ecom-label pt-1">Attribution &amp; détail boutique</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-1">
                  <SourcesDonut data={shopApi.data.sources} />
                </div>
                <div className="lg:col-span-1">
                  <TopProductsTable data={shopApi.data.top_products} />
                </div>
                <div className="lg:col-span-1">
                  <Funnel data={shopApi.data.funnel} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2">
                  <RecentOrdersTable data={shopApi.data.recent_orders} />
                </div>
                <div className="space-y-3">
                  <GeographyList data={shopApi.data.countries} />
                  <AlertsPanel alerts={shopApi.data.alerts} />
                </div>
              </div>
            </>
          )}
        </>
      ) : !api.error ? (
        <>
          <CardSkeleton height="h-16" />
          <KpiGridSkeleton />
          <CardSkeleton height="h-72" />
        </>
      ) : null}
    </div>
  );
}

// ── Comparaison de périodes (carte blanche B) ────────────────────
function CompareControl() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const on = sp.get("compare") === "1";
  const cfrom = sp.get("cfrom");
  const cto = sp.get("cto");

  const setParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(sp.toString());
    mutate(params);
    const qs = params.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Parameters<typeof router.replace>[0], { scroll: false });
  };

  const compareValue: PeriodFilter = cfrom && cto
    ? { label: sp.get("cpl") ?? "Personnalisé", range: { start: cfrom, end: cto } }
    : { label: "Période précédente", range: null };

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        onClick={() => setParams((p) => { if (on) { p.delete("compare"); p.delete("cfrom"); p.delete("cto"); p.delete("cpl"); } else p.set("compare", "1"); })}
        className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
          on ? "bg-[var(--ecom-violet-light)] border-[var(--ecom-violet-mid)] text-[var(--ecom-brand-violet)]" : "bg-[var(--ecom-surface-1)] border-[var(--ecom-card-border)] text-[var(--ecom-muted)] hover:text-[var(--ecom-navy)]"
        }`}
        title="Superpose la période de comparaison sur le graphe (défaut : période précédente)">
        Comparer
      </button>
      {on && (
        <PeriodFilterDropdown
          value={compareValue}
          onChange={(f) => setParams((p) => {
            if (f.range) { p.set("cfrom", f.range.start); p.set("cto", f.range.end); p.set("cpl", f.label); }
            else { p.delete("cfrom"); p.delete("cto"); p.delete("cpl"); }
          })}
        />
      )}
    </span>
  );
}

// ── Objectif mensuel (carte blanche C) ───────────────────────────
function GoalGauges() {
  const month = currentMonthRange();
  const { data: monthBoard } = useApi<BlendedBoard>(`/api/ecom/gads/blended?from=${month.from}&to=${month.to}`);
  const { data: settingsRes } = useApi<{ settings: EcomSettings }>("/api/ecom/settings");
  const s = settingsRes?.settings;
  const m = monthBoard?.current;
  if (!s || !m) return null;

  const revenueGoal = computeGoalProgress(m.revenue_cents, s.monthly_revenue_goal_cents ?? 0, month.dayOfMonth, month.daysInMonth);
  const profitGoal = m.net_profit_cents != null
    ? computeGoalProgress(m.net_profit_cents, s.monthly_net_profit_goal_cents ?? 0, month.dayOfMonth, month.daysInMonth)
    : null;
  if (!revenueGoal && !profitGoal) return null;

  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-[#7C3AED]" />
        <h3 className="text-[13px] font-bold text-[#1a1535]">Objectif du mois</h3>
        <span className="text-[11px] text-[#8A8A88]">jour {month.dayOfMonth}/{month.daysInMonth} — le trait fin marque où tu devrais en être au prorata</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {revenueGoal && <Gauge label="CA du mois" g={revenueGoal} />}
        {profitGoal && <Gauge label="Net Profit du mois" g={profitGoal} />}
      </div>
    </div>
  );
}

function Gauge({ label, g }: { label: string; g: NonNullable<ReturnType<typeof computeGoalProgress>> }) {
  const pct = Math.max(0, Math.min(1, g.progress));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[12px] mb-1">
        <span className="text-[#5A5A58]">{label}</span>
        <span className="tabular-nums">
          <span className={`font-bold ${g.ahead ? "text-emerald-700" : "text-amber-700"}`}>{formatCurrency(g.realized_cents)}</span>
          <span className="text-[#8A8A88]"> / {formatCurrency(g.goal_cents)} ({Math.round(g.progress * 100)} %)</span>
        </span>
      </div>
      <div className="relative h-2.5 bg-[#F0EEFF] rounded-full overflow-hidden">
        <div className={`h-2.5 rounded-full ${g.ahead ? "bg-emerald-500" : "bg-[#A78BFA]"}`} style={{ width: `${pct * 100}%` }} />
        <div className="absolute top-0 h-2.5 w-0.5 bg-[#1a1535]" style={{ left: `${g.prorata * 100}%` }} title="Prorata du mois écoulé" />
      </div>
    </div>
  );
}

// ── Insights automatiques (carte blanche A) ──────────────────────
const INSIGHT_NATURE: Record<Insight["severity"], "loss" | "data" | "opportunity"> = {
  critical: "loss",
  warning: "data",
  info: "opportunity",
};

function InsightsBlock({ insights }: { insights: Insight[] }) {
  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-[var(--ecom-brand-violet)]" />
        <h3 className="text-[var(--ecom-fs-label)] font-bold text-[var(--ecom-navy)]">À regarder</h3>
        <span className="text-[var(--ecom-fs-caption)] text-[var(--ecom-muted)]">règles automatiques sur ta donnée réelle, priorisées par impact</span>
      </div>
      <div className="grid gap-2">
        {insights.map((i) => (
          <InsightCard
            key={i.id}
            nature={INSIGHT_NATURE[i.severity]}
            message={i.message}
            impact={i.impact_cents > 0 ? formatCurrency(i.impact_cents) : undefined}
            href={i.href}
          />
        ))}
      </div>
    </div>
  );
}

function delta(cur: number | null | undefined, prev: number | null | undefined): number | null {
  if (cur == null || prev == null || prev === 0) return null;
  return Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;
}

function Kpi({ label, value, hint, delta: d, goodWhenUp = false, highlight = false, tone, cta, spark, tooltip }: {
  label: string; value: string; hint?: string; delta?: number | null;
  goodWhenUp?: boolean; highlight?: boolean; tone?: "positive" | "negative"; cta?: string; spark?: number[]; tooltip?: string;
}) {
  const unset = value === "non renseigné";
  const deltaColor = d == null || !goodWhenUp
    ? "text-[var(--ecom-muted)]"
    : (d >= 0 ? "text-[var(--ecom-pos)]" : "text-[var(--ecom-neg)]");
  const valueColor = tone === "positive" ? "text-[var(--ecom-pos)]" : tone === "negative" ? "text-[var(--ecom-neg)]" : "text-[var(--ecom-navy)]";
  return (
    <div
      className={`bg-[var(--ecom-surface-1)] rounded-[var(--ecom-r-md)] p-4 border shadow-[var(--ecom-shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--ecom-t-fast)] ease-[var(--ecom-ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--ecom-shadow-md)] hover:border-[var(--ecom-violet-mid)] ${highlight ? "border-2 border-[var(--ecom-brand-violet)]" : "border-[var(--ecom-card-border)]"}`}
      title={tooltip}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`ecom-label ${tooltip ? "underline decoration-dotted decoration-[var(--ecom-violet-mid)] underline-offset-2 cursor-help" : ""}`}>{label}</span>
        {d != null && (
          <span className={`inline-flex items-center gap-0.5 text-[var(--ecom-fs-caption)] font-semibold ecom-tnum ${deltaColor}`}>
            {d >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {d > 0 ? "+" : ""}{d} %
          </span>
        )}
      </div>
      {unset ? (
        <div className="mt-1.5 text-[var(--ecom-fs-label)] italic text-[var(--ecom-muted)]">non renseigné</div>
      ) : (
        <div className={`text-[var(--ecom-fs-kpi)] font-bold mt-1 ecom-tnum tracking-[var(--ecom-tracking-tight)] leading-none ${valueColor}`}>
          {value}
        </div>
      )}
      {spark && spark.length > 1 && spark.some((v) => v !== 0) && <Sparkline values={spark} className="h-6 w-full mt-2" />}
      {hint && <p className="text-[var(--ecom-fs-caption)] text-[var(--ecom-muted)] mt-1.5">{hint}</p>}
      {cta && (
        <Link href={cta as never} className="text-[var(--ecom-fs-caption)] font-medium text-[var(--ecom-brand-violet)] hover:underline mt-1 inline-block">Renseigner →</Link>
      )}
    </div>
  );
}
