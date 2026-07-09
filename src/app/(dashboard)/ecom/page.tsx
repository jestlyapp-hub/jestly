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
import { ChevronDown, ChevronUp, Target, Wallet, AlertTriangle } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
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
import DashboardChart from "@/components/ecom/dashboard/DashboardChart";
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
import ConfigurableKpiGrid from "@/components/ecom/dashboard/ConfigurableKpiGrid";
import MetricSelector from "@/components/ecom/dashboard/MetricSelector";
import InsightsDrawer from "@/components/ecom/dashboard/InsightsDrawer";
import { useEcomPref } from "@/components/ecom/EcomPrefsProvider";
import { DEFAULT_KPI_IDS } from "@/lib/gads/metric-catalog";
import type { MetricValue } from "@/lib/gads/dashboard-metrics";

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
  // Seul le propriétaire des credentials Google Ads globaux voit « Actualiser
  // depuis l'API » (garde-fou multi-tenant : la route refuse déjà côté serveur).
  const meApi = useApi<{ is_gads_owner?: boolean }>("/api/auth/me");
  const isGadsOwner = meApi.data?.is_gads_owner === true;

  // Métriques configurables (KPI cards) — carte de données + sélection persistée.
  const metricsApi = useApi<{ metrics: Record<string, MetricValue> }>(`/api/ecom/dashboard/metrics?from=${from}&to=${to}`);
  const [kpiIds, setKpiIds] = useEcomPref<string[]>("dashboard_kpis", DEFAULT_KPI_IDS);

  const board = api.data;
  const cur = board?.current;

  // La période de comparaison n'est une baseline exploitable que si elle a une
  // activité réelle. Sinon on masque les deltas (« +804 % » sur ~0 est absurde).
  const canCompare = board ? baselineComparable(board.previous) : true;

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
          <MetricSelector label="Métriques" selected={kpiIds} onChange={setKpiIds} onReset={() => setKpiIds(DEFAULT_KPI_IDS)} />
          <CompareControl />
          {isGadsOwner && <ApiSyncButton onSynced={onImported} />}
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
          <InsightsDrawer insights={insights} />

          {/* Couverture COGS basse : le Net Profit est optimiste — levier n°1 de vérité. */}
          {cur.costs_configured && cur.cogs.total_units > 0 && cur.cogs.coverage < 0.8 && (
            <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-900">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>
                <span className="font-semibold">Couverture COGS à {Math.round(cur.cogs.coverage * 100)} %</span> — ton Net Profit est optimiste :
                {" "}{cur.cogs.covered_units}/{cur.cogs.total_units} unités vendues ont un coût renseigné. Complète-les pour débloquer la vérité des chiffres.
              </span>
              <Link href="/ecom/settings?tab=couts" className="ml-auto px-3 py-1.5 rounded-md text-[12px] font-medium bg-amber-600 text-white hover:bg-amber-700">
                Réglages coûts →
              </Link>
            </div>
          )}

          {!canCompare && (
            <div className="flex items-center gap-2 bg-[var(--ecom-surface-sunken)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-sm)] px-4 py-2.5 text-[var(--ecom-fs-label)] text-[var(--ecom-muted)]">
              <span className="font-semibold text-[var(--ecom-navy)]">Nouvelle activité</span>
              — la période de comparaison n&apos;a quasiment aucune activité (moins de 10 € de dépense ou moins de 3 commandes).
              Les deltas sont masqués car ils ne seraient pas pertinents.
            </div>
          )}

          <ConfigurableKpiGrid metrics={metricsApi.data?.metrics ?? {}} selectedIds={kpiIds} />

          <GoalGauges />

          <DashboardChart points={board.timeline} costsConfigured={cur.costs_configured} />

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

