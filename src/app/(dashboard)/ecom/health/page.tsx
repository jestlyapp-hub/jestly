"use client";

/**
 * ECOM — Centre de santé des données (refonte, carte blanche D).
 * « Est-ce que ma machine tourne ? » : état des syncs, sessions pixel 24 h,
 * commandes étiquetées par le cart attribute, matching, taux de réponse survey.
 */
import { Activity, Radio, Link2, MessageSquare, Store, Check, X, Package } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { CardSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { formatDateFr } from "@/components/ecom/gads/format";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import type { ShopHealthCard } from "@/lib/gads/shops-health";

interface Health {
  syncs: {
    shopify_last: string | null;
    shopify_cadence: string;
    gads_last: string | null;
    gads_latest_date: string | null;
    gads_product_last: string | null;
    gads_cadence: string;
  };
  pixel: {
    shops: Array<{ label: string; is_active: boolean; sessions_24h: number; last_session_at: string | null; first_session_at: string | null }>;
    active_since: string | null;
  };
  matching: {
    orders_30d: number;
    eligible_orders_30d: number;
    tagged_orders_30d: number;
    pixel_active_since: string | null;
    cart_attribute_30d: number;
    time_proximity_30d: number;
  };
  survey: { responses_30d: number; response_rate: number | null };
}

const ago = (iso: string | null): string => {
  if (!iso) return "jamais";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `il y a ${hours} h`;
  return `le ${formatDateFr(iso.slice(0, 10), "d MMM")}`;
};

const freshness = (iso: string | null, maxHours: number): string =>
  iso && Date.now() - new Date(iso).getTime() < maxHours * 3600 * 1000
    ? "bg-emerald-500"
    : iso ? "bg-amber-500" : "bg-rose-500";

export default function DataHealthPage() {
  usePageTitle("Santé des données ECOM");
  const api = useApi<Health>("/api/ecom/gads/health");
  const shopsApi = useApi<{ shops: ShopHealthCard[] }>("/api/ecom/health/shops");
  const h = api.data;

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-[20px] font-bold text-[var(--ecom-navy)]">Santé des données</h1>
        <p className="text-[12px] text-[#8A8A88]">Syncs, pixel, matching et survey — l&apos;état de la machine en un écran</p>
      </div>

      {/* Fiches santé par boutique (une boutique = une carte) */}
      {shopsApi.data && shopsApi.data.shops.length > 0 && (
        <ShopHealthGrid shops={shopsApi.data.shops} />
      )}

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}
      {!h && !api.error && <><CardSkeleton height="h-32" /><CardSkeleton height="h-32" /></>}

      {h && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Syncs */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-[#7C3AED]" />
              <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">Syncs</h3>
            </div>
            <ul className="space-y-2 text-[12px]">
              <Row dot={freshness(h.syncs.shopify_last, 6)} label="Shopify (commandes, produits, clients)"
                value={`${ago(h.syncs.shopify_last)} · ${h.syncs.shopify_cadence}`} />
              <Row dot={freshness(h.syncs.gads_last, 8)} label="Google Ads — campagnes"
                value={`${ago(h.syncs.gads_last)}${h.syncs.gads_latest_date ? ` · données jusqu'au ${formatDateFr(h.syncs.gads_latest_date)}` : ""}`} />
              <Row dot={freshness(h.syncs.gads_product_last, 8)} label="Google Ads — produits"
                value={`${ago(h.syncs.gads_product_last)} · ${h.syncs.gads_cadence}`} />
            </ul>
          </div>

          {/* Pixel */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio size={14} className="text-sky-600" />
              <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">Pixel first-party (24 h)</h3>
            </div>
            <ul className="space-y-2 text-[12px]">
              {h.pixel.shops.map((s) => (
                <Row key={s.label}
                  dot={s.is_active ? (s.sessions_24h > 0 ? "bg-emerald-500" : "bg-amber-500") : "bg-[#B4B4B2]"}
                  label={s.label}
                  value={`${s.sessions_24h} session${s.sessions_24h > 1 ? "s" : ""} · dernière ${ago(s.last_session_at)}${s.first_session_at ? ` · actif depuis le ${formatDateFr(s.first_session_at.slice(0, 10))}` : ""}`} />
              ))}
              {h.pixel.shops.length === 0 && <li className="text-[#8A8A88]">Aucune boutique pixel enregistrée.</li>}
            </ul>
          </div>

          {/* Matching */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={14} className="text-emerald-600" />
              <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">Matching commandes (30 j)</h3>
            </div>
            <ul className="space-y-2 text-[12px]">
              <Row dot="bg-[#7C3AED]" label="Commandes avec cart attribute pixel"
                value={h.matching.pixel_active_since
                  ? `${h.matching.tagged_orders_30d} / ${h.matching.eligible_orders_30d}`
                  : "—"} />
              <Row dot="bg-sky-500" label="Résolues par attribut de panier (0,95)"
                value={String(h.matching.cart_attribute_30d)} />
              <Row dot="bg-amber-500" label="Résolues par proximité temporelle (0,35)"
                value={String(h.matching.time_proximity_30d)} />
            </ul>
            {h.matching.pixel_active_since ? (
              <p className="text-[11px] text-[#8A8A88] mt-2">
                Pixel actif depuis le {formatDateFr(h.matching.pixel_active_since.slice(0, 10))} — seules les {h.matching.eligible_orders_30d} commande{h.matching.eligible_orders_30d > 1 ? "s" : ""} postérieure{h.matching.eligible_orders_30d > 1 ? "s" : ""} (sur {h.matching.orders_30d} au total sur 30 j) peuvent porter l&apos;attribut.
              </p>
            ) : (
              <p className="text-[11px] text-[#8A8A88] mt-2">
                Aucune session pixel encore captée — le matching s&apos;activera dès la première visite trackée.
              </p>
            )}
          </div>

          {/* Survey */}
          <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-amber-600" />
              <h3 className="text-[13px] font-bold text-[var(--ecom-navy)]">Survey post-achat (30 j)</h3>
            </div>
            <ul className="space-y-2 text-[12px]">
              <Row dot={h.survey.responses_30d > 0 ? "bg-emerald-500" : "bg-[#B4B4B2]"} label="Réponses"
                value={String(h.survey.responses_30d)} />
              <Row dot="bg-[#A78BFA]" label="Taux de réponse"
                value={h.survey.response_rate != null ? `${Math.round(h.survey.response_rate * 100)} %` : "—"} />
            </ul>
            {h.survey.responses_30d === 0 && (
              <p className="text-[11px] text-[#8A8A88] mt-2">
                Aucune réponse — snippet à coller sur la page de statut de commande (docs/SNIPPET-SURVEY-PPS.md).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className="text-[#5A5A58] flex-1">{label}</span>
      <span className="tabular-nums font-medium text-[var(--ecom-navy)] text-right">{value}</span>
    </li>
  );
}

// ── Fiches santé par boutique ─────────────────────────────────────
function ShopHealthGrid({ shops }: { shops: ShopHealthCard[] }) {
  return (
    <div>
      <p className="ecom-label mb-2">Santé par boutique</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {shops.map((s) => (
          <div key={s.integration_id} className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Store size={14} className="text-[var(--ecom-brand-violet)]" />
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold text-[var(--ecom-navy)] truncate">{s.name}</h3>
                <p className="text-[10px] text-[#8A8A88] truncate">{s.shop_domain}</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-[12px]">
              <Flag ok={s.shopify_last_sync != null} label="Shopify connecté"
                detail={s.shopify_last_sync ? `sync ${ago(s.shopify_last_sync)}` : undefined} />
              <Flag ok={s.gads_connected} label="Google Ads" detail={s.gads_connected ? "connecté" : "non connecté"} />
              <Flag ok={s.pixel_active} label="Pixel" detail={s.pixel_active ? "posé" : "à poser"} />
              <Flag ok={s.costs_configured} label="Coûts" detail={s.costs_configured ? "renseignés" : "manquants"} />
              {/* Mapping produits — métrique clé multi-format (§1) */}
              <li className="flex items-center gap-2 pt-1.5 border-t border-[#EFEFEF] mt-1.5">
                <Package size={12} className="text-[#8A8A88] shrink-0" />
                <span className="text-[#5A5A58] flex-1">Mapping produits</span>
                <span className="tabular-nums font-medium text-right" style={{ color: mapColor(s.mapping.rate) }}>
                  {s.mapping.rate == null ? "—" : `${Math.round(s.mapping.rate * 100)}%`}
                  {s.mapping.total_items > 0 && <span className="text-[10px] text-[#8A8A88] font-normal"> ({s.mapping.resolved_items}/{s.mapping.total_items})</span>}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 shrink-0" />
                <span className="text-[#5A5A58] flex-1">Couverture COGS</span>
                <span className="tabular-nums font-medium text-[var(--ecom-navy)] text-right">
                  {s.cogs_coverage == null ? "—" : `${Math.round(s.cogs_coverage * 100)}%`}
                </span>
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flag({ ok, label, detail }: { ok: boolean; label: string; detail?: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full shrink-0 ${ok ? "bg-emerald-500" : "bg-[#E6E6E4]"}`}>
        {ok ? <Check size={9} className="text-white" /> : <X size={9} className="text-[#8A8A88]" />}
      </span>
      <span className="text-[#5A5A58] flex-1">{label}</span>
      {detail && <span className={`text-[11px] ${ok ? "text-[var(--ecom-navy)]" : "text-[#8A8A88]"}`}>{detail}</span>}
    </li>
  );
}

function mapColor(rate: number | null): string {
  if (rate == null) return "#B4B4B2";
  if (rate >= 0.9) return "var(--ecom-pos)";
  if (rate >= 0.6) return "var(--ecom-warn)";
  return "var(--ecom-neg)";
}
