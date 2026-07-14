"use client";

/**
 * Vue « Toutes les boutiques » (portefeuille) — mode agrégé du Dashboard ECOM.
 * Chaque boutique charge SON board (fetch explicite avec integration_id, jamais
 * de mélange), puis : KPIs consolidés (CA, dépense, Net Profit, MER blended),
 * tableau comparatif par boutique (couleur + statut + tendance), et alertes
 * portefeuille (dépense Ads sans CA rattaché → tracking à vérifier).
 *
 * Isolation stricte : aucune donnée cross-boutique fondue au point de perdre la
 * lecture par boutique. Donnée absente = « non disponible », jamais inventée.
 */
import { useCallback, useEffect, useState, useMemo } from "react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import { StatusBadge } from "@/components/ecom/premium/StatusBadge";
import { CardSkeleton } from "@/components/ecom/gads/LoadState";
import { computeCampaignTrend } from "@/lib/gads/campaign-analysis";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { BlendedBoard } from "@/lib/costs/blended";
import type { EcomShopLite } from "@/components/ecom/EcomPrefsProvider";

const PALETTE = ["#7C3AED", "#EC4899", "#0EA5E9", "#F59E0B", "#10B981", "#6366F1"];

interface ShopRow {
  id: string;
  name: string;
  color: string;
  revenue_cents: number;
  spend_cents: number;
  mer: number | null;
  net_profit_cents: number | null;
  status: BlendedBoard["current"]["status"];
  costs_configured: boolean;
  attributable_share: number | null;
  trendPct: number | null;
  trendDir: "up" | "down" | "flat";
}

const shopName = (s: EcomShopLite) => s.metadata?.shop_name ?? s.shop_domain;

export default function PortfolioView({ shops, from, to }: { shops: EcomShopLite[]; from: string; to: string }) {
  const [boards, setBoards] = useState<Record<string, BlendedBoard | null>>({});
  const report = useCallback((id: string, board: BlendedBoard | null) => {
    setBoards((prev) => (prev[id] === board ? prev : { ...prev, [id]: board }));
  }, []);

  const rows: ShopRow[] = useMemo(() => shops.map((s, i) => {
    const b = boards[s.id];
    const c = b?.current;
    const trend = b ? computeCampaignTrend(b.timeline.map((p) => ({
      date: p.date, spend_cents: p.spend_cents, jestly_revenue_cents: p.revenue_cents, rolling_roas: p.rolling_mer,
    }))) : null;
    return {
      id: s.id,
      name: shopName(s),
      color: PALETTE[i % PALETTE.length],
      revenue_cents: c?.revenue_cents ?? 0,
      spend_cents: c?.spend_cents ?? 0,
      mer: c?.mer ?? null,
      net_profit_cents: c?.net_profit_cents ?? null,
      status: c?.status ?? "insufficient_data",
      costs_configured: c?.costs_configured ?? false,
      attributable_share: b?.quality?.attributable_revenue_share ?? null,
      trendPct: trend?.available ? trend.pct : null,
      trendDir: trend?.direction ?? "flat",
    };
  }), [shops, boards]);

  const loadedCount = shops.filter((s) => boards[s.id] !== undefined).length;
  const allLoaded = loadedCount === shops.length;

  // Agrégats consolidés (somme des boutiques). Net Profit partiel si une boutique
  // n'a pas ses coûts renseignés (on ne fond pas un « non disponible » en 0).
  const totalRevenue = rows.reduce((s, r) => s + r.revenue_cents, 0);
  const totalSpend = rows.reduce((s, r) => s + r.spend_cents, 0);
  const npRows = rows.filter((r) => r.net_profit_cents != null);
  const totalNetProfit = npRows.reduce((s, r) => s + (r.net_profit_cents ?? 0), 0);
  const netProfitPartial = npRows.length < rows.length;
  const blendedMer = totalSpend > 0 ? totalRevenue / totalSpend : null;

  // Alertes portefeuille : dépense Ads mais CA très peu rattaché (tracking).
  const trackingAlerts = rows.filter((r) => r.spend_cents >= 1000 && r.attributable_share != null && r.attributable_share < 0.1);

  return (
    <div className="space-y-4">
      {/* Loaders invisibles : un fetch par boutique, scopé integration_id. */}
      {shops.map((s) => <ShopBoardLoader key={s.id} shopId={s.id} from={from} to={to} onData={report} />)}

      <div>
        <h1 className="text-[20px] font-bold text-[#1a1535]">Portefeuille · {shops.length} boutiques</h1>
        <p className="text-[12px] text-[#8A8A88]">Vue consolidée et comparaison — chaque boutique reste lue séparément, jamais fondue.</p>
      </div>

      {!allLoaded && loadedCount === 0 ? (
        <CardSkeleton height="h-40" />
      ) : (
        <>
          {/* KPIs consolidés */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ConsolidatedKpi label="CA total" value={formatCurrency(totalRevenue)} />
            <ConsolidatedKpi label="Dépense Ads totale" value={formatCurrency(totalSpend)} />
            <ConsolidatedKpi
              label="Net Profit total"
              value={npRows.length > 0 ? formatCurrency(totalNetProfit) : "non disponible"}
              tone={npRows.length > 0 ? (totalNetProfit >= 0 ? "positive" : "negative") : undefined}
              hint={netProfitPartial ? "partiel — certaines boutiques sans coûts" : undefined}
            />
            <ConsolidatedKpi label="MER blended" value={formatRoas(blendedMer)} tooltip="CA total ÷ dépense Ads totale (toutes boutiques)" />
          </div>

          {/* Alertes tracking */}
          {trackingAlerts.length > 0 && (
            <div className="space-y-2">
              {trackingAlerts.map((r) => (
                <div key={r.id} className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-[var(--ecom-r-md)] px-4 py-2.5 text-[12px] text-amber-900">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold">{r.name}</span> : {formatCurrency(r.spend_cents)} de dépense Ads mais seulement {Math.round((r.attributable_share ?? 0) * 100)}% du CA rattaché à un canal.
                    Vérifie le tracking (pixel posé ? utm/gclid ?) ou rattache des ventes à la main — sinon le ROAS Jestly reste sous-évalué.
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tableau comparatif */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--ecom-card-border)] bg-[var(--ecom-surface-sunken)] text-left text-[11px] text-[#5A5A58]">
                    <th className="px-4 py-2.5 font-medium">Boutique</th>
                    <th className="px-3 py-2.5 font-medium text-right">CA</th>
                    <th className="px-3 py-2.5 font-medium text-right">Dépense Ads</th>
                    <th className="px-3 py-2.5 font-medium text-right" title="CA ÷ dépense Ads (blended)">MER</th>
                    <th className="px-3 py-2.5 font-medium text-right">Net Profit</th>
                    <th className="px-3 py-2.5 font-medium text-right">Tendance</th>
                    <th className="px-3 py-2.5 font-medium text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rows].sort((a, b) => b.revenue_cents - a.revenue_cents).map((r) => (
                    <tr key={r.id} className="border-b border-[#EFEFEF] hover:bg-[var(--ecom-surface-sunken)]">
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                          <span className="font-medium text-[var(--ecom-navy)]">{r.name}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{formatCurrency(r.revenue_cents)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{r.spend_cents > 0 ? formatCurrency(r.spend_cents) : "—"}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[var(--ecom-navy)]">{formatRoas(r.mer)}</td>
                      <td className={`px-3 py-2.5 text-right tabular-nums ${r.net_profit_cents == null ? "text-[#B4B4B2]" : r.net_profit_cents >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {r.net_profit_cents == null ? "—" : formatCurrency(r.net_profit_cents)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <TrendCell dir={r.trendDir} pct={r.trendPct} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <StatusBadge
                          tone={r.status === "profitable" ? "positive" : r.status === "unprofitable" ? "negative" : "neutral"}
                          label={r.status === "profitable" ? "Rentable" : r.status === "unprofitable" ? "En perte" : "À calibrer"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {rows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-[var(--ecom-card-border)] bg-[var(--ecom-surface-sunken)] font-semibold text-[var(--ecom-navy)]">
                      <td className="px-4 py-2.5">Total portefeuille</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(totalRevenue)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatCurrency(totalSpend)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatRoas(blendedMer)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{npRows.length > 0 ? formatCurrency(totalNetProfit) : "—"}</td>
                      <td className="px-3 py-2.5"></td>
                      <td className="px-3 py-2.5"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
          <p className="text-[11px] text-[#8A8A88]">
            MER = CA ÷ dépense Ads (blended, insensible aux ventes fantômes). Net Profit « — » = coûts non renseignés pour cette boutique.
            Ouvre une boutique (sélecteur) pour son détail : ROAS Jestly, campagnes, produits.
          </p>
        </>
      )}
    </div>
  );
}

/** Charge le board d'une boutique (scopé integration_id) et le remonte au parent. */
function ShopBoardLoader({ shopId, from, to, onData }: { shopId: string; from: string; to: string; onData: (id: string, board: BlendedBoard | null) => void }) {
  const { data } = useApi<BlendedBoard>(`/api/ecom/gads/blended?from=${from}&to=${to}&integration_id=${shopId}`);
  useEffect(() => { if (data !== undefined) onData(shopId, data ?? null); }, [data, shopId, onData]);
  return null;
}

function ConsolidatedKpi({ label, value, tone, hint, tooltip }: { label: string; value: string; tone?: "positive" | "negative"; hint?: string; tooltip?: string }) {
  const color = tone === "positive" ? "text-[var(--ecom-pos)]" : tone === "negative" ? "text-[var(--ecom-neg)]" : "text-[var(--ecom-navy)]";
  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-4">
      <div className="ecom-label" title={tooltip}>{label}</div>
      <div className={`mt-1 text-[22px] font-bold ecom-tnum leading-none ${color}`}>{value}</div>
      {hint && <div className="text-[10px] text-[#8A8A88] mt-1">{hint}</div>}
    </div>
  );
}

function TrendCell({ dir, pct }: { dir: "up" | "down" | "flat"; pct: number | null }) {
  if (pct == null) return <span className="text-[#B4B4B2]">—</span>;
  const color = dir === "up" ? "var(--ecom-pos)" : dir === "down" ? "var(--ecom-neg)" : "var(--ecom-muted)";
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1 tabular-nums font-medium" style={{ color }}>
      <Icon size={13} />{pct >= 0 ? "+" : ""}{Math.round(pct * 100)}%
    </span>
  );
}
