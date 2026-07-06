"use client";
import { usePageTitle } from "@/lib/hooks/use-page-title";

/**
 * Analytics — Attribution Board (Partie B).
 * Toggle first-click / last-click (n'affecte que le pixel : Shopify ne
 * fournit que le first-touch), hiérarchie stricte des sources par commande
 * (pixel → natif → manuel → déclaré client → ghost), triple ROAS Google,
 * répartition par canal en barres, bloc survey.
 */
import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import type { AttributionBoard, BoardOrderRow, ResolvedSource, SourceOrigin } from "@/lib/gads/attribution-board";
import { CHANNEL_LABELS, type Channel } from "@/lib/gads/channels";
import { PPS_ANSWER_LABELS, type PpsAnswer } from "@/lib/pixel/pps";
import ManualOverridesPanel from "@/components/ecom/gads/ManualOverridesPanel";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { CardSkeleton, TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { TRACKING_LABELS, formatDateFr } from "@/components/ecom/gads/format";

type Model = "first" | "last";
type Filter = "all" | "google_ads" | "seo" | "pinterest" | "direct" | "other" | "ghost";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "pinterest", label: "Pinterest" },
  { value: "direct", label: "Direct" },
  { value: "other", label: "Autre" },
  { value: "ghost", label: "Ghost" },
];

const ORIGIN_META: Record<SourceOrigin, { label: string; cls: string }> = {
  pixel: { label: "Pixel Jestly", cls: "bg-sky-50 border-sky-200 text-sky-700" },
  native: { label: "Shopify natif", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
  manual: { label: "Manuel", cls: "bg-[#EDE9FE] border-[#DDD6FE] text-[#7C3AED]" },
  survey: { label: "Déclaré client", cls: "bg-amber-50 border-amber-300 text-amber-800" },
  ghost: { label: "Ghost", cls: "bg-[#F7F7F5] border-[#E5E3F0] text-[#8A8A88]" },
};

const CHANNEL_BAR: Record<string, string> = {
  google_ads: "bg-[#7C3AED]", seo: "bg-emerald-500", pinterest: "bg-rose-400",
  direct: "bg-sky-400", other: "bg-[#A78BFA]", ghost: "bg-[#D4D4D2]",
};

const channelLabel = (c: string | null): string =>
  c == null || c === "ghost" ? "Ghost (non résolu)" : c === "direct" ? "Direct" : CHANNEL_LABELS[c as Channel] ?? c;

export default function AttributionBoardPage() {
  usePageTitle("Attribution ECOM");
  const { from, to } = useAnalyticsRange();
  const [model, setModel] = useState<Model>("last");
  const [filter, setFilter] = useState<Filter>("all");

  const api = useApi<AttributionBoard>(`/api/ecom/gads/attribution?from=${from}&to=${to}`);
  const board = api.data;

  const resolvedOf = (o: BoardOrderRow): ResolvedSource => (model === "first" ? o.resolved_first : o.resolved_last);

  // Répartition par canal — recalculée en live selon le modèle (toggle).
  const repartition = useMemo(() => {
    const buckets = new Map<string, { orders: number; revenue: number; origins: Partial<Record<SourceOrigin, number>> }>();
    let total = 0;
    for (const o of board?.orders ?? []) {
      total += o.total_cents;
      const r = resolvedOf(o);
      const key = r.channel ?? "ghost";
      const b = buckets.get(key) ?? { orders: 0, revenue: 0, origins: {} };
      b.orders += 1;
      b.revenue += o.total_cents;
      b.origins[r.origin] = (b.origins[r.origin] ?? 0) + 1;
      buckets.set(key, b);
    }
    return { total, rows: [...buckets.entries()].sort((a, b) => b[1].revenue - a[1].revenue) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board?.orders, model]);

  const visibleOrders = (board?.orders ?? []).filter((o) => {
    if (filter === "all") return true;
    const r = resolvedOf(o);
    return filter === "ghost" ? r.channel == null : r.channel === filter;
  });

  const counters = useMemo(() => {
    const c = { native: 0, manual: 0, pixel: 0, survey: 0, ghost: 0 };
    for (const o of visibleOrders) c[resolvedOf(o).origin] += 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleOrders, model]);

  const g = board?.google_stats ?? null;
  const ghostRow = repartition.rows.find(([k]) => k === "ghost")?.[1];
  const ghostShare = ghostRow && repartition.total > 0 ? ghostRow.revenue / repartition.total : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1535]">Attribution Board</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Source retenue par commande — hiérarchie pixel → natif → manuel → déclaré client → ghost, jamais fondus
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E5E3F0] rounded-md p-0.5"
            title="First-click / last-click — n'affecte que les commandes résolues par le pixel (Shopify natif ne capte que le first-touch)">
            {(["first", "last"] as Model[]).map((m) => (
              <button key={m} onClick={() => setModel(m)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  model === m ? "bg-white text-[#1a1535] shadow-sm" : "text-[#5A5A58] hover:text-[#1a1535]"
                }`}>
                {m === "first" ? "First-click" : "Last-click"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}

      {!board && !api.error && (
        <>
          <CardSkeleton height="h-24" />
          <CardSkeleton height="h-32" />
          <TableSkeleton rows={6} />
        </>
      )}

      {ghostShare != null && ghostShare > 0 && (
        <div className="bg-[#EDE9FE] border border-[#DDD6FE] rounded-lg px-4 py-3 text-[12px] text-[#1a1535]">
          <span className="font-semibold">{Math.round(ghostShare * 100)} % de ton CA reste non résolu (ghost)</span>{" "}
          après pixel, natif, manuel et survey. Ton ROAS Google réel est probablement meilleur que l&apos;affiché.
        </div>
      )}

      {/* Triple ROAS Google — existant, intégré sans le casser */}
      {g && (
        <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-[#1a1535]">Triple ROAS Google Ads</h3>
            {g.sample_small && (
              <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">
                Échantillon faible
              </span>
            )}
          </div>
          {g.spend_cents == null ? (
            <p className="text-[12px] text-[#8A8A88]">Dépense non renseignée sur la période.</p>
          ) : (
            <div className="flex flex-wrap items-baseline gap-6">
              <RoasBlock label="Mesuré Shopify" value={g.roas_measured} cls="text-[#1a1535]" />
              <Ecart from={g.roas_measured} to={g.roas_with_pixel} />
              <RoasBlock label="Avec pixel Jestly" value={g.roas_with_pixel} cls="text-sky-700"
                hint="Référence du Blended Board" />
              <Ecart from={g.roas_measured} to={g.roas_with_manual} />
              <RoasBlock label="Avec manuelles" value={g.roas_with_manual} cls="text-[#7C3AED]" />
              <span className="ml-auto text-[11px] text-[#8A8A88]">
                Dépense {formatCurrency(g.spend_cents)} · {g.orders_effective} vente{g.orders_effective > 1 ? "s" : ""} effectives
              </span>
            </div>
          )}
        </div>
      )}

      {/* Répartition par canal (modèle sélectionné) */}
      <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
        <h3 className="text-[14px] font-bold text-[#1a1535] mb-3">
          CA par canal — {model === "first" ? "first-click" : "last-click"}
        </h3>
        <div className="space-y-2">
          {repartition.rows.map(([key, b]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-[12px] text-[#1a1535] font-medium">{channelLabel(key === "ghost" ? null : key)}</span>
              <div className="flex-1 h-5 bg-[#F7F7F5] rounded overflow-hidden">
                <div className={`h-5 ${CHANNEL_BAR[key] ?? "bg-[#A78BFA]"}`}
                  style={{ width: `${repartition.total > 0 ? Math.max(2, (b.revenue / repartition.total) * 100) : 0}%` }} />
              </div>
              <span className="w-44 shrink-0 text-right text-[12px] tabular-nums text-[#1a1535]">
                {formatCurrency(b.revenue)} · {b.orders} cmd{b.orders > 1 ? "s" : ""}
                {b.orders < 5 && <span className="text-[10px] text-amber-700" title="Échantillon faible"> ⚠</span>}
              </span>
            </div>
          ))}
          {repartition.rows.length === 0 && (
            <p className="text-[12px] text-[#8A8A88]">{api.loading ? "Chargement…" : "Aucune commande sur la période."}</p>
          )}
        </div>
      </div>

      {/* Survey (Partie C) */}
      {board && (
        <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
          <h3 className="text-[14px] font-bold text-[#1a1535] mb-1">Survey post-achat — « déclaré client »</h3>
          {Object.keys(board.survey.responses).length === 0 ? (
            <p className="text-[12px] text-[#8A8A88]">
              Aucune réponse pour l&apos;instant — installe le snippet survey sur la page de statut de commande
              (voir docs/SNIPPET-SURVEY-PPS.md). Les réponses ne servent qu&apos;aux commandes que ni le pixel,
              ni Shopify, ni toi n&apos;avez résolues.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1.5 flex-1 min-w-[220px]">
                {(Object.entries(board.survey.responses) as Array<[PpsAnswer, number]>).map(([answer, count]) => (
                  <div key={answer} className="flex items-center gap-2 text-[12px]">
                    <span className="w-32 text-[#5A5A58]">{PPS_ANSWER_LABELS[answer]}</span>
                    <div className="flex-1 h-3 bg-[#F7F7F5] rounded overflow-hidden">
                      <div className="h-3 bg-amber-400" style={{ width: `${(count / Math.max(1, board.orders.length)) * 100}%` }} />
                    </div>
                    <span className="tabular-nums text-[#1a1535] font-medium w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
              <div className="text-[12px] text-[#5A5A58] space-y-1">
                <div>Taux de réponse : <span className="font-semibold text-[#1a1535] tabular-nums">
                  {board.survey.response_rate != null ? `${Math.round(board.survey.response_rate * 100)} %` : "—"}</span></div>
                <div>Récupéré par survey : <span className="font-semibold text-amber-700 tabular-nums">
                  {formatCurrency(board.survey.recovered_revenue_cents)}</span> ({board.survey.recovered_orders} cmd)</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtre + commandes */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium text-[#5A5A58]">Canal :</span>
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
        <span className="text-[11px] text-[#8A8A88]">
          {visibleOrders.length} vente{visibleOrders.length > 1 ? "s" : ""} : {counters.native} mesurée{counters.native > 1 ? "s" : ""},{" "}
          {counters.manual} manuelle{counters.manual > 1 ? "s" : ""}, {counters.pixel} pixel
          {counters.survey > 0 && <>, {counters.survey} déclarée{counters.survey > 1 ? "s" : ""}</>}
          {counters.ghost > 0 && <>, {counters.ghost} ghost</>}
        </span>
      </div>

      <div className="bg-white border border-[#E5E3F0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E3F0] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                <th className="px-4 py-2.5 font-medium">Commande</th>
                <th className="px-4 py-2.5 font-medium text-right">Montant</th>
                <th className="px-4 py-2.5 font-medium">Traçabilité réelle</th>
                <th className="px-4 py-2.5 font-medium">Source retenue ({model === "first" ? "first" : "last"}-click)</th>
                <th className="px-4 py-2.5 font-medium text-right">Confiance</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((o) => {
                const r = resolvedOf(o);
                const origin = ORIGIN_META[r.origin];
                const tracking = TRACKING_LABELS[o.tracking_status ?? "unknown"];
                return (
                  <tr key={o.order_id} className="border-b border-[#EFEFEF] hover:bg-[#FBFBFA]">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-medium text-[#1a1535]">{o.name ?? "—"}</span>
                      <span className="ml-2 text-[10px] text-[#8A8A88]">{formatDateFr(o.created_at.slice(0, 10))}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-[#1a1535]">{formatCurrency(o.total_cents)}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[#5A5A58]" title={tracking.description}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tracking.dot}`} />
                        {tracking.label.replace(/s$/, "")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-[#1a1535]">{channelLabel(r.channel)}</span>
                      <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded border text-[10px] font-semibold ${origin.cls}`}>
                        {origin.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[#5A5A58]">
                      {r.confidence != null ? `${Math.round(r.confidence * 100)} %` : "—"}
                    </td>
                  </tr>
                );
              })}
              {visibleOrders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-[#8A8A88]">
                  {api.loading ? "Chargement…" : "Aucune commande sur ce canal."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-[#8A8A88] flex items-start gap-1">
        <Info size={11} className="shrink-0 mt-[1px]" />
        Le toggle first/last-click n&apos;affecte que les commandes résolues par le pixel Jestly — Shopify ne capte
        que le first-touch, et le déclaré client n&apos;a pas de notion de clic.
      </p>

      {/* Corrections manuelles gads (CA) — conservé de l'ancienne vue */}
      <ManualOverridesPanel from={from} to={to} onChanged={() => void api.mutate()} />
    </div>
  );
}

function RoasBlock({ label, value, cls, hint }: { label: string; value: number | null; cls: string; hint?: string }) {
  return (
    <div>
      <div className="text-[10px] text-[#8A8A88]">{label}{hint && <span className="text-[#A78BFA]"> · {hint}</span>}</div>
      <div className={`text-[22px] font-bold tabular-nums ${cls}`}>{formatRoas(value)}</div>
    </div>
  );
}

function Ecart({ from, to }: { from: number | null; to: number | null }) {
  if (from == null || to == null || from === 0) return <span className="text-[#B4B4B2]">→</span>;
  const pct = Math.round(((to - from) / from) * 1000) / 10;
  return (
    <span className={`text-[11px] font-semibold tabular-nums ${pct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
      {pct > 0 ? "+" : ""}{pct} % →
    </span>
  );
}
