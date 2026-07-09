"use client";

/**
 * Détail d'une campagne Google Ads. En-tête (statut, période, budget + archive
 * Jestly), KPIs période, graphe dépense/CA/ROAS glissant, et produits de la
 * campagne (diffusés vs sans diffusion) avec VRAIS noms + images Shopify.
 * Remonte en tête les candidats à exclure (dépense sans conversion) et à
 * réactiver (vendaient bien, ne diffusent plus).
 */
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCcw, Link2 } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { formatCurrency, formatNumberFr, formatRoas, formatPercent } from "@/lib/ads/formatters";
import { useAnalyticsRange } from "@/components/ecom/gads/AnalyticsPeriodFilter";
import { TableSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { KpiCard } from "@/components/ecom/premium/KpiCard";
import { CampaignStatusChip, ProfitabilityDot, channelTypeLabel } from "@/components/ecom/campaigns/campaign-ui";
import CampaignDetailChart from "@/components/ecom/campaigns/CampaignDetailChart";
import BudgetTimeline from "@/components/ecom/campaigns/BudgetTimeline";
import AttachSalesPanel from "@/components/ecom/campaigns/AttachSalesPanel";
import type { CampaignDetail, CampaignProductRowOut } from "@/lib/gads/campaign-detail";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { from, to } = useAnalyticsRange();
  usePageTitle("Détail campagne");
  const [attachOpen, setAttachOpen] = useState(false);

  const api = useApi<CampaignDetail>(`/api/ecom/campaigns/${id}?from=${from}&to=${to}`);
  const d = api.data;

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
          {/* En-tête */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CampaignStatusChip status={d.status_display} />
                  <span className="text-[11px] text-[#8A8A88]">{channelTypeLabel(d.channel_type)}</span>
                </div>
                <h1 className="text-[20px] font-bold text-[var(--ecom-navy)]">{d.name}</h1>
                <p className="text-[12px] text-[#8A8A88] mt-0.5">
                  {d.start_date ? `Depuis le ${frDate(d.start_date)}` : "Date de début inconnue"}
                  {d.end_date ? ` · terminée le ${frDate(d.end_date)}` : ""}
                  {d.bidding_strategy ? ` · enchères ${biddingLabel(d.bidding_strategy)}` : ""}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => setAttachOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                  title="Affecter des ventes Google Ads sans campagne à celle-ci — alimente son ROAS Jestly">
                  <Link2 size={13} /> Rattacher des ventes
                </button>
                <div className="text-right">
                  <div className="text-[11px] text-[#8A8A88] uppercase tracking-wide">Budget quotidien actuel</div>
                  <div className="text-[22px] font-bold text-[var(--ecom-navy)] tabular-nums">
                    {d.current_budget_cents != null ? formatCurrency(d.current_budget_cents) : "—"}
                  </div>
                  <BudgetTimeline history={d.budget_history} since={d.budget_archive_since} />
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Dépense" value={formatCurrency(d.spend_cents)} />
            <KpiCard label="CA Shopify attribué" value={d.jestly_revenue_cents > 0 ? formatCurrency(d.jestly_revenue_cents) : "—"}
              hint={`${formatNumberFr(d.jestly_orders)} vente${d.jestly_orders > 1 ? "s" : ""}`} />
            <KpiCard label="ROAS Jestly" value={formatRoas(d.roas_jestly)} highlight
              tooltip="CA Shopify réel attribué à cette campagne ÷ dépense" />
            <KpiCard label="ROAS Google" value={formatRoas(d.roas_google)}
              tooltip="Valeur de conversion déclarée par Google ÷ dépense" />
            <KpiCard label="CPA" value={d.cpa_cents != null ? formatCurrency(d.cpa_cents) : "—"} />
            <KpiCard label="Conversions Google" value={formatNumberFr(Math.round(d.google_conversions))}
              hint={d.ctr != null ? `CTR ${formatPercent(d.ctr)}` : undefined} />
          </div>

          <div className="flex items-center gap-3 text-[12px]">
            <ProfitabilityDot profitable={d.profitable} small={d.sample_small} />
            {d.be_roas != null && <span className="text-[#8A8A88]">Seuil de rentabilité (BE-ROAS) : <span className="font-semibold text-[var(--ecom-navy)]">{formatRoas(d.be_roas)}</span></span>}
            {d.sample_small && d.jestly_orders > 0 && (
              <span className="inline-flex px-1.5 py-0.5 rounded bg-[#F7F7F5] border border-[var(--ecom-card-border)] text-[#8A8A88] text-[10px] font-medium">échantillon faible (&lt; 5 ventes)</span>
            )}
          </div>

          {/* Graphe */}
          <CampaignDetailChart points={d.timeline} />

          {/* Produits */}
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
              </tr>
            ))}
            {rows.length === 0 && emptyLabel && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-[#8A8A88]">{emptyLabel}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function frDate(iso: string): string {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
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
