"use client";

/**
 * Panneau « Rattacher des ventes » du détail campagne. Liste les commandes
 * résolues Google Ads mais rattachées à AUCUNE campagne, et permet de les
 * affecter en lot à CETTE campagne (rattachement manuel = couche campagne de
 * l'attribution manuelle). Feedback immédiat : invalidation du cache Analytics
 * + rafraîchissement du détail. Honnêteté : confiance conservée, rattachement
 * marqué « manuel ».
 */
import { useState } from "react";
import { X, Check, Loader2, Link2 } from "lucide-react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { useAnalyticsInvalidation } from "@/lib/hooks/use-analytics-invalidation";
import { formatCurrency } from "@/lib/ads/formatters";
import type { ManualConfidence } from "@/lib/gads/channels";

interface AttachableOrder {
  order_id: string;
  name: string | null;
  created_at: string;
  total_cents: number;
  products: string[];
  origin: "measured" | "pixel" | "manual";
}

const CONF: { value: ManualConfidence; label: string }[] = [
  { value: "sure", label: "Sûr" },
  { value: "assumed", label: "Supposé" },
  { value: "guessed", label: "Deviné" },
];

const ORIGIN_LABEL: Record<AttachableOrder["origin"], string> = {
  measured: "mesuré Google",
  pixel: "pixel",
  manual: "manuel (canal)",
};

export default function AttachSalesPanel({
  campaignId, campaignName, from, to, onClose, onAttached,
}: {
  campaignId: string; campaignName: string; from: string; to: string; onClose: () => void; onAttached: () => void;
}) {
  const invalidate = useAnalyticsInvalidation();
  const api = useApi<{ orders: AttachableOrder[]; count: number }>(`/api/ecom/campaigns/unattributed?from=${from}&to=${to}`);
  const [confidence, setConfidence] = useState<ManualConfidence>("assumed");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const attach = async (orderId: string) => {
    setBusyId(orderId);
    try {
      await apiFetch(`/api/ecom/gads/orders/${orderId}/attribution`, {
        method: "PUT",
        body: { channel: "google_ads", confidence, campaign_id: campaignId },
      });
      setDone((s) => new Set(s).add(orderId));
      await invalidate();
      onAttached();
      toast.success(`Ajoutée au ROAS Jestly de « ${campaignName} ».`, { title: "Vente rattachée" });
    } catch (e) {
      toast.error((e as Error).message, { title: "Échec du rattachement" });
    } finally {
      setBusyId(null);
    }
  };

  const orders = (api.data?.orders ?? []).filter((o) => !done.has(o.order_id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[var(--ecom-surface-0)] h-full overflow-y-auto shadow-2xl border-l border-[var(--ecom-card-border)]">
        <div className="sticky top-0 bg-[var(--ecom-surface-1)] border-b border-[var(--ecom-card-border)] px-5 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[15px] font-bold text-[var(--ecom-navy)]">Rattacher des ventes</h2>
            <p className="text-[11px] text-[#8A8A88]">à « {campaignName} »</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[var(--ecom-surface-sunken)] text-[#5A5A58]" aria-label="Fermer"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-[12px] text-[#5A5A58]">
            Ces commandes sont résolues <span className="font-medium text-[var(--ecom-navy)]">Google Ads</span> mais rattachées à aucune campagne
            (ni <code className="text-[10px]">utm_campaign</code> exploitable, ni gclid décodé). Affecte-les à cette campagne pour alimenter son <span className="font-medium">ROAS Jestly</span>.
          </p>

          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-[#8A8A88]">Confiance :</span>
            <div className="inline-flex items-center bg-[#F7F7F5] border border-[var(--ecom-card-border)] rounded-md p-0.5">
              {CONF.map((c) => (
                <button key={c.value} onClick={() => setConfidence(c.value)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                    confidence === c.value ? "bg-white text-[var(--ecom-navy)] shadow-sm" : "text-[#5A5A58] hover:text-[var(--ecom-navy)]"
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {api.loading && <div className="text-[12px] text-[#8A8A88]">Chargement des commandes…</div>}
          {api.error && <div className="text-[12px] text-rose-600">{api.error}</div>}

          {!api.loading && orders.length === 0 && (
            <div className="text-center py-10 text-[13px] text-[#8A8A88]">
              {done.size > 0 ? "Toutes les ventes candidates ont été rattachées 🎉" : "Aucune vente Google Ads sans campagne sur la période."}
            </div>
          )}

          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.order_id} className="flex items-center gap-3 bg-white border border-[var(--ecom-card-border)] rounded-lg px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-[var(--ecom-navy)]">{o.name ?? "Commande"}</span>
                    <span className="text-[13px] tabular-nums text-[var(--ecom-navy)]">{formatCurrency(o.total_cents)}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]">{ORIGIN_LABEL[o.origin]}</span>
                  </div>
                  <div className="text-[11px] text-[#8A8A88] truncate">
                    {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {o.products.join(", ") || "—"}
                  </div>
                </div>
                <button onClick={() => void attach(o.order_id)} disabled={busyId === o.order_id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-60 shrink-0">
                  {busyId === o.order_id ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                  Rattacher
                </button>
              </div>
            ))}
          </div>

          {done.size > 0 && (
            <div className="flex items-center gap-1.5 text-[12px] text-emerald-700">
              <Check size={13} /> {done.size} vente{done.size > 1 ? "s" : ""} rattachée{done.size > 1 ? "s" : ""} à cette campagne.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
