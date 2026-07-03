"use client";

/**
 * Google Ads — Vue 3 : Attribution / qualité de la donnée.
 * Montre à quel point les chiffres sont fiables : répartition tracked / ghost /
 * unmatched du CA (la « zone d'ombre »), comparaison ROAS déclaré Google vs
 * ROAS croisé Shopify, et ROAS données brutes vs avec overrides manuels.
 *
 * C'est ici que vit le VRAI indicateur de décision budgétaire Ads :
 * le ROAS attribué Google (CA des commandes rattachables à Google ÷ dépense).
 */
import { useState } from "react";
import { BadgeCheck, Info } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatRoas } from "@/lib/ads/formatters";
import type { GadsAttribution } from "@/lib/gads/aggregator";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import ManualOverridesPanel from "@/components/ecom/gads/ManualOverridesPanel";
import { TRACKING_LABELS, periodToRange, type Period } from "@/components/ecom/gads/format";

export default function GadsAttributionPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const { from, to } = periodToRange(period);

  const api = useApi<GadsAttribution>(`/api/ecom/gads/attribution?range=${period}`);
  const data = api.data;

  const ghostShare = data?.breakdown.find((b) => b.status === "ghost")?.revenue_share ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#191919]">Attribution &amp; qualité de la donnée</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Jusqu&apos;où peux-tu faire confiance à tes chiffres ? Répartition du CA par traçabilité et comparaison des ROAS.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <GadsTabs />
          <PeriodSelector value={period} onChange={(v) => setPeriod(v as Period)} />
        </div>
      </div>

      {api.error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-[12px] text-rose-800">{api.error}</div>
      )}

      {data && (
        <>
          {/* Phrase de synthèse — la zone d'ombre en une ligne */}
          {ghostShare != null && ghostShare > 0 && (
            <div className="bg-[#F0EEFF] border border-[#DDD6FE] rounded-lg px-4 py-3 text-[12px] text-[#191919]">
              <span className="font-semibold">{Math.round(ghostShare * 100)} % de ton CA n&apos;est pas attribuable</span>{" "}
              (parcours vide — consentement refusé ou tracking bloqué). Ton ROAS Google réel est donc
              probablement <span className="font-semibold">meilleur que l&apos;affiché</span>.
            </div>
          )}

          {/* Répartition du CA par traçabilité */}
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[14px] font-bold text-[#191919] mb-1">Où va ton chiffre d&apos;affaires ?</h3>
            <p className="text-[11px] text-[#8A8A88] mb-4">
              Zone d&apos;ombre (non attribuable) : {formatCurrency(data.shadow_revenue_cents)}
              {data.shadow_share != null && <> — {Math.round(data.shadow_share * 100)} % du CA de la période</>}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {data.breakdown.map((b) => {
                const meta = TRACKING_LABELS[b.status];
                if (b.status === "unknown" && b.orders === 0) return null;
                return (
                  <div key={b.status} className="border border-[#EFEFEF] rounded-lg p-3" title={meta.description}>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#5A5A58]">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                      <span className="text-[#B4B4B2]">· {b.orders} cmd{b.orders > 1 ? "s" : ""}</span>
                    </div>
                    <div className="text-[18px] font-bold text-[#191919] mt-1 tabular-nums">{formatCurrency(b.revenue_cents)}</div>
                    <div className="text-[10px] text-[#8A8A88]">
                      {b.revenue_share != null ? `${Math.round(b.revenue_share * 100)} % du CA` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparaison des ROAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <RoasCard
              label="ROAS attribué Google"
              value={formatRoas(data.roas_google_attributed)}
              hint={`${formatCurrency(data.google_attributed_revenue_cents)} de CA rattachable à Google (utm, referrer, gclid) · ${data.google_attributed_orders} commande${data.google_attributed_orders > 1 ? "s" : ""}`}
              highlight
              badge="Indicateur de décision budgétaire Ads"
            />
            <RoasCard
              label="ROAS déclaré par Google"
              value={formatRoas(data.roas_declared)}
              hint="Valeur de conversion du CSV ÷ coût. Chiffre de Google, modèle d'attribution Google."
            />
            <RoasCard
              label="ROAS global (toutes sources)"
              value={formatRoas(data.roas_crossed)}
              hint="CA Shopify total ÷ dépense. Santé de la boutique — ne juge pas les campagnes Ads."
            />
          </div>

          {/* Données brutes vs overrides */}
          <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
            <h3 className="text-[14px] font-bold text-[#191919] mb-3">Impact de tes corrections manuelles</h3>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-[11px] font-medium text-[#5A5A58]">ROAS données brutes</div>
                <div className="text-[20px] font-bold text-[#191919] tabular-nums">{formatRoas(data.roas_crossed)}</div>
              </div>
              <div className="text-[#B4B4B2] text-[18px]">→</div>
              <div>
                <div className="text-[11px] font-medium text-[#5A5A58]">
                  ROAS avec overrides
                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-[#F0EEFF] text-[#7C3AED] text-[10px] font-semibold uppercase">
                    {data.manual_orders} override{data.manual_orders > 1 ? "s" : ""} actif{data.manual_orders > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-[20px] font-bold text-[#191919] tabular-nums">{formatRoas(data.roas_with_manual)}</div>
              </div>
              <p className="text-[11px] text-[#8A8A88] flex items-start gap-1 max-w-sm ml-auto">
                <Info size={11} className="shrink-0 mt-[1px]" />
                Les overrides sont des estimations manuelles ({formatCurrency(data.manual_revenue_cents)} ajoutés),
                pas de la donnée mesurée. L&apos;écart entre les deux chiffres, c&apos;est l&apos;impact de tes corrections.
              </p>
            </div>
          </div>

          {/* Saisie manuelle */}
          <ManualOverridesPanel from={from} to={to} onChanged={() => void api.mutate()} />
        </>
      )}

      {!data && !api.error && (
        <div className="bg-white border border-[#E6E6E4] rounded-xl p-10 text-center text-[12px] text-[#8A8A88]">
          Chargement…
        </div>
      )}
    </div>
  );
}

function RoasCard({ label, value, hint, highlight = false, badge }: {
  label: string; value: string; hint: string; highlight?: boolean; badge?: string;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-white border-[#7C3AED] border-2" : "bg-white border-[#E6E6E4]"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-[#5A5A58]">{label}</span>
        {badge && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F0EEFF] text-[#7C3AED] text-[10px] font-semibold">
            <BadgeCheck size={11} /> {badge}
          </span>
        )}
      </div>
      <div className="text-[24px] font-bold text-[#191919] mt-1 tabular-nums">{value}</div>
      <p className="text-[10px] text-[#8A8A88] mt-1">{hint}</p>
    </div>
  );
}
