"use client";

/**
 * ECOM — Centre de santé des données (refonte, carte blanche D).
 * « Est-ce que ma machine tourne ? » : état des syncs, sessions pixel 24 h,
 * commandes étiquetées par le cart attribute, matching, taux de réponse survey.
 */
import { Activity, Radio, Link2, MessageSquare } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { CardSkeleton, ErrorBanner } from "@/components/ecom/gads/LoadState";
import { formatDateFr } from "@/components/ecom/gads/format";

interface Health {
  syncs: {
    shopify_last: string | null;
    shopify_cadence: string;
    gads_last: string | null;
    gads_latest_date: string | null;
    gads_product_last: string | null;
    gads_cadence: string;
  };
  pixel: { shops: Array<{ label: string; is_active: boolean; sessions_24h: number; last_session_at: string | null }> };
  matching: { orders_30d: number; tagged_orders_30d: number; cart_attribute_30d: number; time_proximity_30d: number };
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
  const api = useApi<Health>("/api/ecom/gads/health");
  const h = api.data;

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-[20px] font-bold text-[#1a1535]">Santé des données</h1>
        <p className="text-[12px] text-[#8A8A88]">Syncs, pixel, matching et survey — l&apos;état de la machine en un écran</p>
      </div>

      {api.error && <ErrorBanner message={api.error} onRetry={() => void api.mutate()} />}
      {!h && !api.error && <><CardSkeleton height="h-32" /><CardSkeleton height="h-32" /></>}

      {h && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Syncs */}
          <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-[#7C3AED]" />
              <h3 className="text-[13px] font-bold text-[#1a1535]">Syncs</h3>
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
          <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Radio size={14} className="text-sky-600" />
              <h3 className="text-[13px] font-bold text-[#1a1535]">Pixel first-party (24 h)</h3>
            </div>
            <ul className="space-y-2 text-[12px]">
              {h.pixel.shops.map((s) => (
                <Row key={s.label}
                  dot={s.is_active ? (s.sessions_24h > 0 ? "bg-emerald-500" : "bg-amber-500") : "bg-[#B4B4B2]"}
                  label={s.label}
                  value={`${s.sessions_24h} session${s.sessions_24h > 1 ? "s" : ""} · dernière ${ago(s.last_session_at)}`} />
              ))}
              {h.pixel.shops.length === 0 && <li className="text-[#8A8A88]">Aucune boutique pixel enregistrée.</li>}
            </ul>
          </div>

          {/* Matching */}
          <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={14} className="text-emerald-600" />
              <h3 className="text-[13px] font-bold text-[#1a1535]">Matching commandes (30 j)</h3>
            </div>
            <ul className="space-y-2 text-[12px]">
              <Row dot="bg-[#7C3AED]" label="Commandes avec cart attribute pixel"
                value={`${h.matching.tagged_orders_30d} / ${h.matching.orders_30d}`} />
              <Row dot="bg-sky-500" label="Résolues par attribut de panier (0,95)"
                value={String(h.matching.cart_attribute_30d)} />
              <Row dot="bg-amber-500" label="Résolues par proximité temporelle (0,35)"
                value={String(h.matching.time_proximity_30d)} />
            </ul>
          </div>

          {/* Survey */}
          <div className="bg-white border border-[#E5E3F0] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-amber-600" />
              <h3 className="text-[13px] font-bold text-[#1a1535]">Survey post-achat (30 j)</h3>
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
      <span className="tabular-nums font-medium text-[#1a1535] text-right">{value}</span>
    </li>
  );
}
