"use client";

/**
 * Widgets d'analyse du détail campagne (règles, pas d'IA) : score de rentabilité,
 * tendance du ROAS Jestly, recommandation de budget chiffrée, et comparaison à la
 * moyenne boutique. Tout est déterministe et honnête (projection annoncée comme
 * telle, « non disponible » jamais inventé). DA Jestly.
 */
import { TrendingUp, TrendingDown, Minus, Gauge, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatRoas, formatCurrency } from "@/lib/ads/formatters";
import type { CampaignTrend, CampaignScore, BudgetRecommendation } from "@/lib/gads/campaign-analysis";

// ── Score de rentabilité ──────────────────────────────────────────
export function CampaignScoreBadge({ score }: { score: CampaignScore }) {
  if (!score.available) {
    return (
      <Panel title="Score de rentabilité" icon={<Gauge size={14} className="text-[#8A8A88]" />}>
        <p className="text-[12px] text-[#8A8A88]">Non calculable (coûts non renseignés ou pas de ventes attribuées).</p>
      </Panel>
    );
  }
  const color = score.score >= 75 ? "var(--ecom-pos)" : score.score >= 55 ? "var(--ecom-brand-violet)" : score.score >= 35 ? "var(--ecom-warn)" : "var(--ecom-neg)";
  return (
    <Panel title="Score de rentabilité" icon={<Gauge size={14} style={{ color }} />}>
      <div className="flex items-end gap-2">
        <span className="text-[32px] font-bold ecom-tnum leading-none" style={{ color }}>{score.score}</span>
        <span className="text-[13px] text-[#8A8A88] mb-1">/ 100</span>
        <span className="ml-auto mb-1 text-[12px] font-semibold" style={{ color }}>{score.label}</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[#F0EEFF] overflow-hidden">
        <div className="h-1.5 rounded-full" style={{ width: `${score.score}%`, background: color }} />
      </div>
      <p className="text-[10px] text-[#8A8A88] mt-1.5">Combine ROAS Jestly vs seuil, volume de ventes et régularité.</p>
    </Panel>
  );
}

// ── Tendance ROAS Jestly ──────────────────────────────────────────
export function CampaignTrendBadge({ trend }: { trend: CampaignTrend }) {
  if (!trend.available || trend.pct == null) {
    return (
      <Panel title="Tendance ROAS Jestly" icon={<Minus size={14} className="text-[#8A8A88]" />}>
        <p className="text-[12px] text-[#8A8A88]">Pas assez de jours sur la période pour dégager une tendance.</p>
      </Panel>
    );
  }
  const up = trend.direction === "up";
  const flat = trend.direction === "flat";
  const color = flat ? "var(--ecom-muted)" : up ? "var(--ecom-pos)" : "var(--ecom-neg)";
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const pctLabel = `${trend.pct >= 0 ? "+" : ""}${Math.round(trend.pct * 100)} %`;
  return (
    <Panel title="Tendance ROAS Jestly" icon={<Icon size={14} style={{ color }} />}>
      <div className="flex items-end gap-2">
        <span className="text-[28px] font-bold ecom-tnum leading-none" style={{ color }}>{pctLabel}</span>
        <span className="text-[12px] text-[#8A8A88] mb-1">sur {trend.window_days} j</span>
      </div>
      <p className="text-[11px] text-[#5A5A58] mt-1.5">
        {trend.recent_roas != null && trend.prior_roas != null && (
          <>Récent <span className="font-semibold ecom-tnum text-[var(--ecom-navy)]">{formatRoas(trend.recent_roas)}</span> vs <span className="font-semibold ecom-tnum text-[var(--ecom-navy)]">{formatRoas(trend.prior_roas)}</span> précédemment.</>
        )}
      </p>
    </Panel>
  );
}

// ── Recommandation de budget ──────────────────────────────────────
const REC_META: Record<BudgetRecommendation["direction"], { title: string; color: string; Icon: typeof TrendingUp }> = {
  increase: { title: "Augmenter le budget", color: "var(--ecom-pos)", Icon: TrendingUp },
  decrease: { title: "Réduire / retravailler", color: "var(--ecom-neg)", Icon: TrendingDown },
  hold: { title: "Maintenir le budget", color: "var(--ecom-muted)", Icon: Minus },
  insufficient: { title: "Recommandation indisponible", color: "var(--ecom-muted)", Icon: Minus },
};

export function BudgetRecommendationCard({ recommendation }: { recommendation: BudgetRecommendation }) {
  const meta = REC_META[recommendation.direction];
  const Icon = meta.Icon;
  return (
    <div className="bg-white border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0" style={{ background: "color-mix(in srgb, " + meta.color + " 14%, white)", color: meta.color }}>
          <Icon size={14} />
        </span>
        <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">Recommandation de budget · {meta.title}</h3>
      </div>
      <p className="text-[12px] text-[#5A5A58] leading-snug">{recommendation.message}</p>
      {recommendation.direction === "increase" && recommendation.projected_ca_delta_cents != null && recommendation.suggested_delta_pct != null && (
        <div className="mt-2.5 flex items-center gap-2 rounded-[var(--ecom-r-sm)] bg-[var(--ecom-pos-soft)] px-3 py-2">
          <ArrowUpRight size={14} className="text-[var(--ecom-pos)] shrink-0" />
          <span className="text-[11px] text-[var(--ecom-navy)]">
            À ROAS constant, <span className="font-semibold">+{Math.round(recommendation.suggested_delta_pct * 100)} %</span> de budget ≈{" "}
            <span className="font-semibold ecom-tnum">{formatCurrency(recommendation.projected_ca_delta_cents)}</span> de CA attribué en plus.
          </span>
        </div>
      )}
      <p className="text-[10px] text-[#8A8A88] mt-2">Projection linéaire (ordre de grandeur) : le ROAS peut se dégrader à mesure que le budget augmente.</p>
    </div>
  );
}

// ── Comparaison à la moyenne boutique ─────────────────────────────
export function ShopComparison({ campaignRoas, shopRoas }: { campaignRoas: number | null; shopRoas: number | null }) {
  if (campaignRoas == null || shopRoas == null || shopRoas <= 0) return null;
  const better = campaignRoas >= shopRoas;
  const deltaPct = Math.round(((campaignRoas - shopRoas) / shopRoas) * 100);
  const color = better ? "var(--ecom-pos)" : "var(--ecom-neg)";
  const Icon = better ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="flex items-center gap-2.5 bg-[var(--ecom-surface-sunken)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-sm)] px-4 py-2.5">
      <Icon size={15} style={{ color }} className="shrink-0" />
      <span className="text-[12px] text-[#5A5A58]">
        Cette campagne convertit <span className="font-semibold" style={{ color }}>{better ? "mieux" : "moins bien"}</span> que ta moyenne boutique :
        {" "}ROAS Jestly campagne <span className="font-semibold ecom-tnum text-[var(--ecom-navy)]">{formatRoas(campaignRoas)}</span>
        {" "}vs moyenne <span className="font-semibold ecom-tnum text-[var(--ecom-navy)]">{formatRoas(shopRoas)}</span>
        {" "}(<span className="font-semibold ecom-tnum" style={{ color }}>{deltaPct >= 0 ? "+" : ""}{deltaPct} %</span>).
      </span>
    </div>
  );
}

// ── Coquille commune ──────────────────────────────────────────────
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-[12px] font-bold text-[var(--ecom-navy)] uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}
