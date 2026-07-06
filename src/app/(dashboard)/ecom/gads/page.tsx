"use client";

/**
 * Analytics — Vue d'ensemble : Blended Stats Board (Phase 1B).
 *
 * Les métriques de vérité : MER (insensible aux ventes fantômes), BE-ROAS
 * (seuil de rentabilité par commande, coûts variables uniquement) et Net
 * Profit. Le statut rentable/en perte compare MER au BE-ROAS — plus de seuil
 * arbitraire. Mode dégradé tant que les coûts ne sont pas renseignés :
 * MER/AOV/NC-ROAS restent affichés, BE-ROAS et Net Profit disent
 * « non renseigné » avec CTA — jamais une valeur inventée.
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import type { BlendedBoard } from "@/lib/costs/blended";
import type { BlendedStats } from "@/lib/costs/engine";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import ImportCsvButton, { type ImportRecap } from "@/components/ecom/gads/ImportCsvButton";
import ApiSyncButton from "@/components/ecom/gads/ApiSyncButton";
import ImportRecapBanner from "@/components/ecom/gads/ImportRecapBanner";
import MissingDatesBanner from "@/components/ecom/gads/MissingDatesBanner";
import DataQualityBanner from "@/components/ecom/gads/DataQualityBanner";
import BlendedChart from "@/components/ecom/gads/BlendedChart";
import ShopSelector from "@/components/ecom/gads/ShopSelector";
import AnalyticsPeriodFilter, { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { KpiGridSkeleton, CardSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";

export default function BlendedBoardPage() {
  const { from, to } = useAnalyticsRange();
  const [recap, setRecap] = useState<ImportRecap | null>(null);

  const api = useApi<BlendedBoard>(`/api/ecom/gads/blended?from=${from}&to=${to}`);
  const board = api.data;
  const cur = board?.current;

  const onImported = (r: ImportRecap) => {
    setRecap(r);
    void api.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1535]">Vue d&apos;ensemble</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Rentabilité réelle : revenue Shopify croisé avec la dépense Ads et tes coûts
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <ShopSelector />
          <GadsTabs />
          <AnalyticsPeriodFilter />
          <ApiSyncButton onSynced={onImported} />
          <ImportCsvButton onImported={onImported} variant="secondary" />
        </div>
      </div>

      {recap && <ImportRecapBanner recap={recap} onDismiss={() => setRecap(null)} />}
      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}

      {cur && !cur.costs_configured && (
        <div className="flex flex-wrap items-center gap-3 bg-[#EDE9FE] border border-[#DDD6FE] rounded-lg px-4 py-3 text-[12px] text-[#1a1535]">
          <Wallet size={15} className="text-[#7C3AED]" />
          <span>
            <span className="font-semibold">Renseigne tes coûts pour débloquer la rentabilité réelle</span>{" "}
            — BE-ROAS et Net Profit ont besoin de tes COGS et frais par commande.
          </span>
          <Link href="/ecom/gads/costs"
            className="ml-auto px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9]">
            Réglages coûts →
          </Link>
        </div>
      )}

      {board && <MissingDatesBanner missingDates={board.missing_dates} />}
      {board && <DataQualityBanner quality={board.quality} />}

      {cur && board && (
        <>
          <StatusHero stats={cur} />

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <Kpi label="Revenue" value={formatCurrency(cur.revenue_cents)}
              delta={delta(cur.revenue_cents, board.previous.revenue_cents)} goodWhenUp
              spark={board.timeline.map((p) => p.revenue_cents)}
              hint={`${formatNumberFr(cur.orders_count)} commandes`} />
            <Kpi label="Blended Ad Spend" value={formatCurrency(cur.spend_cents)}
              delta={delta(cur.spend_cents, board.previous.spend_cents)}
              spark={board.timeline.map((p) => p.spend_cents)}
              hint="Google Ads (CSV/API)" />
            <Kpi label="MER" value={formatRoas(cur.mer)}
              delta={delta(cur.mer, board.previous.mer)} goodWhenUp
              tooltip="MER = SUM(Revenue Shopify) ÷ SUM(Blended Ad Spend) sur la période"
              hint="Revenue ÷ dépense — insensible aux ventes fantômes" />
            <Kpi label="AOV" value={cur.aov_cents != null ? formatCurrency(cur.aov_cents) : "—"}
              delta={delta(cur.aov_cents, board.previous.aov_cents)} goodWhenUp
              tooltip="AOV = Revenue ÷ nombre de commandes"
              hint="Panier moyen" />
            <Kpi label="NC-ROAS" value={formatRoas(cur.nc_roas)}
              delta={delta(cur.nc_roas, board.previous.nc_roas)} goodWhenUp
              tooltip="NC-ROAS = CA des nouveaux clients (1re commande du customer_id) ÷ dépense"
              hint={`CA nouveaux clients ${formatCurrency(cur.nc_revenue_cents)}`} />
            <Kpi label="NCPA" value={cur.ncpa_cents != null ? formatCurrency(cur.ncpa_cents) : "—"}
              delta={delta(cur.ncpa_cents, board.previous.ncpa_cents)}
              tooltip="NCPA = dépense ÷ nombre de nouveaux clients"
              hint={`${cur.new_customers} nouveau${cur.new_customers > 1 ? "x" : ""} client${cur.new_customers > 1 ? "s" : ""}`} />
            <Kpi label="BE-ROAS" highlight
              tooltip="BE-ROAS = AOV ÷ (AOV − coût variable moyen par commande). Coût variable = COGS + expédition + frais de paiement + emballage. Les dépenses récurrentes n'y entrent pas."
              value={!cur.costs_configured ? "non renseigné" : !cur.be_roas_reachable ? "∅" : formatRoas(cur.be_roas)}
              hint={!cur.costs_configured
                ? "Renseigne tes coûts"
                : !cur.be_roas_reachable
                  ? "Marge unitaire ≤ 0 : aucun ROAS ne rentabilise"
                  : `Coût variable moyen ${cur.variable_cost_per_order_cents != null ? formatCurrency(cur.variable_cost_per_order_cents) : "—"} / commande`}
              cta={!cur.costs_configured ? "/ecom/gads/costs" : undefined} />
            <Kpi label="Net Profit" highlight
              tooltip="Net Profit = Revenue − COGS − dépense Ads − expédition − frais de paiement − emballage − dépenses récurrentes (prorata)"
              value={cur.net_profit_cents != null ? formatCurrency(cur.net_profit_cents) : "non renseigné"}
              spark={cur.costs_configured ? board.timeline.map((p) => p.net_profit_cents ?? 0) : undefined}
              delta={delta(cur.net_profit_cents, board.previous.net_profit_cents)} goodWhenUp
              tone={cur.net_profit_cents != null ? (cur.net_profit_cents >= 0 ? "positive" : "negative") : undefined}
              hint={cur.net_profit_cents != null
                ? `dont ${formatCurrency(cur.expenses_prorated_cents)} de dépenses récurrentes`
                : "Renseigne tes coûts"}
              cta={cur.net_profit_cents == null ? "/ecom/gads/costs" : undefined} />
            <Kpi label="Net Margin"
              value={cur.net_margin != null ? `${(cur.net_margin * 100).toFixed(1)} %` : "non renseigné"}
              delta={delta(cur.net_margin, board.previous.net_margin)} goodWhenUp
              tooltip="Net Margin = Net Profit ÷ Revenue"
              hint="Net Profit ÷ Revenue" />
            <Kpi label="Couverture COGS"
              value={cur.cogs.total_units > 0 ? `${Math.round(cur.cogs.coverage * 100)} %` : "—"}
              hint={`${cur.cogs.covered_units}/${cur.cogs.total_units} unités avec coût renseigné`}
              cta={cur.cogs.coverage < 1 && cur.cogs.total_units > 0 ? "/ecom/gads/costs" : undefined} />
          </div>

          <BlendedChart points={board.timeline} costsConfigured={cur.costs_configured} />
        </>
      )}

      {!board && !api.error && (
        <>
          <CardSkeleton height="h-16" />
          <KpiGridSkeleton />
          <CardSkeleton height="h-72" />
        </>
      )}
    </div>
  );
}

// ── Statut de vérité : MER vs BE-ROAS ────────────────────────────
function StatusHero({ stats: s }: { stats: BlendedStats }) {
  if (s.status === "insufficient_data") {
    return (
      <div className="bg-white border border-[#E5E3F0] rounded-xl p-5 flex items-center gap-4">
        <span className="text-[15px] font-bold text-[#5A5A58]">Rentabilité non calculable</span>
        <span className="text-[12px] text-[#8A8A88]">
          {s.orders_count === 0 ? "Aucune commande sur la période." : "Coûts non renseignés — le statut s'active dès la première saisie."}
        </span>
      </div>
    );
  }
  const profitable = s.status === "profitable";
  return (
    <div className={`rounded-xl p-5 border-2 ${profitable ? "bg-emerald-50 border-emerald-300" : "bg-rose-50 border-rose-300"}`}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className={`text-[18px] font-bold ${profitable ? "text-emerald-800" : "text-rose-800"}`}>
          {profitable ? "✓ Rentable" : "✗ En perte"}
        </span>
        {s.mer != null && s.be_roas != null && (
          <span className="text-[13px] text-[#1a1535]">
            MER <span className="font-bold tabular-nums">{formatRoas(s.mer)}</span> vs seuil de rentabilité{" "}
            <span className="font-bold tabular-nums">{formatRoas(s.be_roas)}</span>
            {s.mer_vs_be_roas != null && (
              <span className={`ml-2 font-semibold tabular-nums ${profitable ? "text-emerald-700" : "text-rose-700"}`}>
                ({s.mer_vs_be_roas > 0 ? "+" : ""}{s.mer_vs_be_roas.toFixed(2)})
              </span>
            )}
          </span>
        )}
        {!s.be_roas_reachable && (
          <span className="text-[12px] text-rose-800">
            Marge unitaire négative : le coût variable moyen dépasse le panier moyen — aucun budget publicitaire ne peut rentabiliser.
          </span>
        )}
        {s.net_profit_cents != null && (
          <span className="ml-auto text-[13px] text-[#1a1535]">
            Net Profit : <span className={`font-bold tabular-nums ${s.net_profit_cents >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatCurrency(s.net_profit_cents)}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// ── KPI card ─────────────────────────────────────────────────────
function delta(cur: number | null | undefined, prev: number | null | undefined): number | null {
  if (cur == null || prev == null || prev === 0) return null;
  return Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;
}

function Kpi({ label, value, hint, delta: d, goodWhenUp = false, highlight = false, tone, cta, spark, tooltip }: {
  label: string; value: string; hint?: string; delta?: number | null;
  goodWhenUp?: boolean; highlight?: boolean; tone?: "positive" | "negative"; cta?: string; spark?: number[]; tooltip?: string;
}) {
  const deltaColor = d == null || !goodWhenUp
    ? "text-[#8A8A88]"
    : (d >= 0 ? "text-emerald-600" : "text-rose-600");
  const valueColor = tone === "positive" ? "text-emerald-700" : tone === "negative" ? "text-rose-700" : "text-[#1a1535]";
  return (
    <div className={`bg-white rounded-xl p-4 border ${highlight ? "border-[#7C3AED] border-2" : "border-[#E5E3F0]"}`} title={tooltip}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-medium text-[#5A5A58] ${tooltip ? "underline decoration-dotted decoration-[#C4B5FD] underline-offset-2 cursor-help" : ""}`}>{label}</span>
        {d != null && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${deltaColor}`}>
            {d >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {d > 0 ? "+" : ""}{d} %
          </span>
        )}
      </div>
      <div className={`text-[21px] font-bold mt-1 tabular-nums ${valueColor} ${value === "non renseigné" ? "text-[14px] text-[#8A8A88] italic" : ""}`}>
        {value}
      </div>
      {spark && spark.length > 1 && spark.some((v) => v !== 0) && <MicroSparkline values={spark} />}
      {hint && <p className="text-[10px] text-[#8A8A88] mt-1">{hint}</p>}
      {cta && (
        <Link href={cta} className="text-[10px] text-[#7C3AED] hover:underline">Renseigner →</Link>
      )}
    </div>
  );
}

/** Micro-sparkline des KPI cards — gère les valeurs négatives (Net Profit). */
function MicroSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const w = 100, h = 16;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * (h - 2) - 1}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-4 mt-1" preserveAspectRatio="none" aria-hidden>
      <polyline points={pts} fill="none" stroke="#A78BFA" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
