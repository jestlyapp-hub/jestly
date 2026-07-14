"use client";

/**
 * Verdict du détail campagne — répond d'abord à « CETTE campagne est-elle
 * rentable, faut-il lui donner plus ou moins de budget ? ». Le verdict CAMPAGNE
 * (ROAS Jestly vs seuil de rentabilité) est mis en avant : chiffre, badge, écart,
 * mini-cadran d'aiguille (même instrument que le Verdict Hero du Dashboard).
 *
 * Le statut BOUTIQUE (MER vs seuil) est rappelé DISCRÈTEMENT, clairement étiqueté
 * « niveau boutique » — pour lever la confusion (§0) entre « boutique en perte »
 * et « campagne rentable », deux vérités à des niveaux différents.
 */
import { Link2, Store } from "lucide-react";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import { StatusBadge } from "@/components/ecom/premium/StatusBadge";
import { RatioGauge } from "@/components/ecom/premium/RatioGauge";
import { CampaignStatusChip, channelTypeLabel } from "./campaign-ui";
import BudgetTimeline from "./BudgetTimeline";
import type { CampaignDetail } from "@/lib/gads/campaign-detail";

const SHOP_STATUS: Record<CampaignDetail["shop_status"], { label: string; tone: "positive" | "negative" | "neutral" }> = {
  profitable: { label: "Rentable globalement", tone: "positive" },
  unprofitable: { label: "En perte globale", tone: "negative" },
  insufficient_data: { label: "Données boutique insuffisantes", tone: "neutral" },
};

export default function CampaignVerdictHero({ d, onAttach }: { d: CampaignDetail; onAttach: () => void }) {
  const ratio = d.roas_jestly != null && d.be_roas != null && d.be_roas > 0 ? d.roas_jestly / d.be_roas : null;
  const gap = d.roas_jestly != null && d.be_roas != null ? d.roas_jestly - d.be_roas : null;
  const shop = SHOP_STATUS[d.shop_status];

  return (
    <section className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-lg)] shadow-[var(--ecom-shadow-sm)] p-5 md:p-6">
      {/* En-tête méta campagne */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CampaignStatusChip status={d.status_display} />
            <span className="text-[11px] text-[#8A8A88]">{channelTypeLabel(d.channel_type)}</span>
          </div>
          <h1 className="text-[20px] font-bold text-[var(--ecom-navy)] leading-tight">{d.name}</h1>
          <p className="text-[12px] text-[#8A8A88] mt-0.5">
            {d.start_date ? `Depuis le ${frDate(d.start_date)}` : "Date de début inconnue"}
            {d.end_date ? ` · terminée le ${frDate(d.end_date)}` : ""}
            {d.bidding_strategy ? ` · enchères ${biddingLabel(d.bidding_strategy)}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={onAttach}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
            title="Affecter des ventes Google Ads sans campagne à celle-ci — alimente son ROAS Jestly">
            <Link2 size={13} /> Rattacher des ventes
          </button>
          <div className="text-right">
            <div className="text-[11px] text-[#8A8A88] uppercase tracking-wide">Budget quotidien actuel</div>
            <div className="text-[20px] font-bold text-[var(--ecom-navy)] tabular-nums">
              {d.current_budget_cents != null ? formatCurrency(d.current_budget_cents) : "—"}
            </div>
            <BudgetTimeline history={d.budget_history} since={d.budget_archive_since} />
          </div>
        </div>
      </div>

      {/* Verdict campagne (mis en avant) + instrument */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center gap-5 md:gap-8 border-t border-[var(--ecom-card-border)] pt-5">
        <div className="flex-1 min-w-0">
          <p className="ecom-label">Statut de cette campagne · ROAS Jestly</p>
          <div className={`mt-1.5 text-[40px] font-bold leading-none ecom-tnum tracking-[var(--ecom-tracking-tight)] ${
            d.profitable == null ? "text-[var(--ecom-navy)]" : d.profitable ? "text-[var(--ecom-pos)]" : "text-[var(--ecom-neg)]"
          }`}>
            {formatRoas(d.roas_jestly)}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {d.profitable == null ? (
              <StatusBadge tone="neutral" size="lg" label="Rentabilité non calculable" />
            ) : (
              <StatusBadge tone={d.profitable ? "positive" : "negative"} size="lg" label={d.profitable ? "Rentable" : "En perte"} />
            )}
            {d.be_roas != null && (
              <span className="text-[12px] text-[#8A8A88]">
                seuil de rentabilité <span className="font-semibold ecom-tnum text-[var(--ecom-navy)]">{formatRoas(d.be_roas)}</span>
                {gap != null && (
                  <span className="ml-1.5 font-semibold ecom-tnum" style={{ color: gap >= 0 ? "var(--ecom-pos)" : "var(--ecom-neg)" }}>
                    ({gap >= 0 ? "+" : ""}{gap.toFixed(2)}×)
                  </span>
                )}
              </span>
            )}
            {d.sample_small && d.jestly_orders > 0 && (
              <span className="inline-flex px-1.5 py-0.5 rounded bg-[#F7F7F5] border border-[var(--ecom-card-border)] text-[#8A8A88] text-[10px] font-medium" title="Moins de 5 ventes attribuées : ROAS peu significatif">échantillon faible (&lt; 5 ventes)</span>
            )}
          </div>

          {/* Contexte boutique — DISCRET, clairement séparé du verdict campagne */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-[var(--ecom-r-sm)] bg-[var(--ecom-surface-sunken)] border border-[var(--ecom-card-border)] px-3 py-1.5"
            title="Statut au niveau de la BOUTIQUE (MER global vs seuil), pas de cette campagne. Une boutique peut être en perte globale avec des campagnes rentables.">
            <Store size={13} className="text-[#8A8A88] shrink-0" />
            <span className="text-[11px] text-[#5A5A58]">
              Contexte boutique :{" "}
              <span className="font-semibold" style={{ color: shop.tone === "positive" ? "var(--ecom-pos)" : shop.tone === "negative" ? "var(--ecom-neg)" : "var(--ecom-muted)" }}>{shop.label}</span>
              {d.shop_costs_configured && d.shop_mer != null && d.shop_be_roas != null && (
                <> · MER <span className="ecom-tnum">{formatRoas(d.shop_mer)}</span> / seuil <span className="ecom-tnum">{formatRoas(d.shop_be_roas)}</span></>
              )}
            </span>
          </div>
        </div>

        {/* Instrument campagne : ROAS Jestly ÷ seuil */}
        <div className="shrink-0 mx-auto md:mx-0">
          <RatioGauge
            ratio={ratio}
            positive={d.profitable === true}
            sublabel="ROAS / SEUIL"
            waitingLabel="À calibrer"
            className="w-[200px] h-[117px]"
            ariaLabel={ratio != null ? `ROAS Jestly sur seuil : ${ratio.toFixed(2)}` : "Seuil de rentabilité non calibré"}
          />
        </div>
      </div>
    </section>
  );
}

function frDate(iso: string): string {
  try { return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); } catch { return iso; }
}

function biddingLabel(s: string): string {
  switch (s) {
    case "TARGET_SPEND": return "maximiser les clics";
    case "MAXIMIZE_CONVERSIONS": return "maximiser les conversions";
    case "MAXIMIZE_CONVERSION_VALUE": return "maximiser la valeur";
    case "TARGET_ROAS": return "ROAS cible";
    case "TARGET_CPA": return "CPA cible";
    case "MANUAL_CPC": return "CPC manuel";
    default: return s.toLowerCase().replace(/_/g, " ");
  }
}
