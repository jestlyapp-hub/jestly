"use client";

/**
 * Google Ads — Vue 1 : Pilotage.
 * KPIs de période (dépense CSV, CA Shopify, ROAS SUM/SUM), courbe dépense vs
 * revenue, statut de rentabilité, alerte dates manquantes.
 *
 * Garde-fou : le ROAS affiché ici est GLOBAL (toutes sources). Il mesure la
 * santé de la boutique et ne doit jamais juger une décision de budget Ads —
 * c'est le rôle du ROAS attribué Google (vue Attribution).
 */
import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import type { GadsOverview, GadsTimelinePoint } from "@/lib/gads/aggregator";
import SpendRevenueChart from "@/components/ecom/ads/SpendRevenueChart";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import ImportCsvButton, { type ImportRecap } from "@/components/ecom/gads/ImportCsvButton";
import ApiSyncButton from "@/components/ecom/gads/ApiSyncButton";
import ImportRecapBanner from "@/components/ecom/gads/ImportRecapBanner";
import MissingDatesBanner from "@/components/ecom/gads/MissingDatesBanner";
import { STATUS_LABELS, TRACKING_LABELS, formatDateFr, type Period } from "@/components/ecom/gads/format";

export default function GadsPilotagePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [recap, setRecap] = useState<ImportRecap | null>(null);

  const overviewApi = useApi<GadsOverview & { computed_at: string }>(`/api/ecom/gads/overview?range=${period}`);
  const timelineApi = useApi<{ points: GadsTimelinePoint[] }>(`/api/ecom/gads/timeline?range=${period}`);
  const overview = overviewApi.data;

  const onImported = (r: ImportRecap) => {
    setRecap(r);
    void overviewApi.mutate();
    void timelineApi.mutate();
  };

  const chartPoints = (timelineApi.data?.points ?? []).map((p) => ({
    date: p.date,
    spend_cents: p.cost_cents,
    revenue_cents: p.shopify_revenue_cents,
    orders: p.shopify_orders,
    roas: p.rolling_roas,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#191919]">Google Ads</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Dépense importée par CSV, croisée avec le CA Shopify réel
            {overview?.covered_range && (
              <> · données Ads du {formatDateFr(overview.covered_range.from)} au {formatDateFr(overview.covered_range.to)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <GadsTabs />
          <PeriodSelector value={period} onChange={(v) => setPeriod(v as Period)} />
          <ApiSyncButton onSynced={onImported} />
          <ImportCsvButton onImported={onImported} />
        </div>
      </div>

      {recap && <ImportRecapBanner recap={recap} onDismiss={() => setRecap(null)} />}
      {overview && <MissingDatesBanner missingDates={overview.missing_dates} />}

      {overviewApi.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-[12px] text-rose-800">
          {overviewApi.error}
        </div>
      )}

      {overview && overview.covered_range == null ? (
        <div className="bg-white border border-[#E6E6E4] rounded-xl p-10 text-center">
          <h2 className="text-[15px] font-bold text-[#191919]">Aucune donnée Google Ads pour l&apos;instant</h2>
          <p className="text-[12px] text-[#8A8A88] mt-1 mb-4 max-w-md mx-auto">
            Exporte depuis Google Ads la vue Campagnes segmentée par jour (CSV), puis importe le fichier ici.
            Les réimports écrasent proprement les chiffres existants — le CSV le plus récent fait foi.
          </p>
          <div className="flex justify-center">
            <ImportCsvButton onImported={onImported} />
          </div>
        </div>
      ) : overview ? (
        <>
          {/* KPIs période */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Dépense Google Ads" value={formatCurrency(overview.spend_cents)}
              hint={`${formatNumberFr(overview.clicks)} clics · ${formatNumberFr(overview.impressions)} impressions`} />
            <KpiCard label="CA Shopify (toutes sources)" value={formatCurrency(overview.shopify_revenue_cents)}
              hint={`${formatNumberFr(overview.shopify_orders)} commandes sur la période`} />
            <div className="bg-white border border-[#E6E6E4] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#5A5A58]">ROAS global (toutes sources)</span>
                <StatusBadge status={overview.status} />
              </div>
              <div className="text-[22px] font-bold text-[#191919] mt-1 tabular-nums">{formatRoas(overview.real_roas)}</div>
              <p className="text-[10px] text-[#8A8A88] mt-1 flex items-start gap-1">
                <Info size={11} className="shrink-0 mt-[1px]" />
                <span>
                  Santé de la boutique, pas juge de campagne Ads — pour décider d&apos;un budget, utilise le{" "}
                  <Link href="/ecom/gads/attribution" className="underline text-[#7C3AED]">ROAS attribué Google</Link>.
                </span>
              </p>
            </div>
            <KpiCard label="ROAS déclaré par Google" value={formatRoas(overview.reported_roas)}
              hint={`Valeur de conv. ${formatCurrency(overview.conversion_value_cents)} · à confronter au CA réel`} />
          </div>

          {/* Traçabilité des commandes */}
          <div className="bg-white border border-[#E6E6E4] rounded-xl px-4 py-3 flex flex-wrap items-center gap-4 text-[12px]">
            <span className="font-semibold text-[#191919]">Traçabilité des commandes :</span>
            {(["tracked", "ghost", "unmatched", "unknown"] as const).map((k) => {
              const count = overview[`${k}_orders` as const];
              const meta = TRACKING_LABELS[k];
              if (k === "unknown" && count === 0) return null;
              return (
                <span key={k} className="inline-flex items-center gap-1.5 text-[#5A5A58]" title={meta.description}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  <span className="tabular-nums font-medium text-[#191919]">{count}</span>
                  <span className="text-[#8A8A88]">{meta.label.toLowerCase()}</span>
                </span>
              );
            })}
            <Link href="/ecom/gads/attribution" className="ml-auto text-[11px] text-[#7C3AED] hover:underline">
              Voir la qualité de la donnée →
            </Link>
          </div>

          {/* Courbe dépense vs CA */}
          <SpendRevenueChart
            points={chartPoints}
            title="Dépense Google Ads vs CA Shopify"
            subtitle="Évolution journalière (toutes sources), ROAS global lissé sur 7 jours glissants"
            revenueName="CA Shopify"
          />
        </>
      ) : (
        <div className="bg-white border border-[#E6E6E4] rounded-xl p-10 text-center text-[12px] text-[#8A8A88]">
          Chargement…
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-4">
      <span className="text-[11px] font-medium text-[#5A5A58]">{label}</span>
      <div className="text-[22px] font-bold text-[#191919] mt-1 tabular-nums">{value}</div>
      {hint && <p className="text-[10px] text-[#8A8A88] mt-1">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: keyof typeof STATUS_LABELS }) {
  const meta = STATUS_LABELS[status];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${meta.className}`}>
      {meta.label}
    </span>
  );
}
