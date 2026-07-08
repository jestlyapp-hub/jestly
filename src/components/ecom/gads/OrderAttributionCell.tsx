"use client";

import { useState } from "react";
import { AlertTriangle, Check, Loader2, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";
import { useAnalyticsInvalidation } from "@/lib/hooks/use-analytics-invalidation";
import { CHANNEL_LABELS, CONFIDENCE_LABELS, type Channel, type ManualConfidence } from "@/lib/gads/channels";
import ChannelChip from "@/components/ecom/ChannelChip";
import type { AttributionOrderRow } from "@/lib/gads/attribution-aggregator";

interface Props {
  order: AttributionOrderRow;
  onSaved: () => void;
}

const SELECT_CLS = "px-2 py-1 text-[11px] bg-[#F7F7F5] border border-[#E5E3F0] rounded-md focus:outline-none focus:border-[#7C3AED] text-[#1a1535]";
// Option-action « Revenir à la mesure » (supprime l'override manuel) sur une
// commande trackée — remplace « Laisser fantôme », qui n'a aucun sens ici.
const RETURN_TO_MEASURED = "__measured__";

/**
 * Sélecteur d'attribution manuelle d'une commande.
 *
 * Comportement (passe qualité, BUG N°2) :
 *  - commande trackée : pré-remplie avec la source mesurée, AUCUN champ de
 *    confiance tant que Gabriel ne force pas une attribution DIFFÉRENTE ;
 *  - divergence forcée → avertissement « Shopify a capté X — sûr ? » +
 *    confiance obligatoire ;
 *  - commande fantôme : tout choix de canal = hypothèse → confiance
 *    obligatoire + rappel « parcours non capté ».
 * Après sauvegarde : invalidation de toutes les vues Analytics (BUG N°1).
 */
export default function OrderAttributionCell({ order, onSaved }: Props) {
  const invalidateAnalytics = useAnalyticsInvalidation();
  const baselineChannel: Channel = order.manual?.channel ?? order.measured_channel ?? "ghost";
  const [channel, setChannel] = useState<Channel>(baselineChannel);
  const [confidence, setConfidence] = useState<ManualConfidence | "">(order.manual?.confidence ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelChanged = channel !== baselineChannel;
  const divergesFromMeasured = order.measured_channel != null && channel !== "ghost" && channel !== order.measured_channel;
  const isGhostGuess = order.tracking_status === "ghost" && channel !== "ghost" && (channelChanged || order.manual != null);
  // Confiance demandée UNIQUEMENT pour une attribution manuelle réelle :
  // divergence forcée, hypothèse sur une commande sans mesure, ou manuel existant.
  const needsConfidence = channel !== "ghost" &&
    (order.manual != null || divergesFromMeasured || (order.measured_channel == null && channelChanged));
  const dirty = channelChanged || (needsConfidence && confidence !== (order.manual?.confidence ?? "") && confidence !== "");

  const save = async () => {
    if (needsConfidence && !confidence) { setError("Choisis le niveau de confiance"); return; }
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/ecom/gads/orders/${order.order_id}/attribution`, {
        method: "PUT",
        body: { channel, confidence: channel === "ghost" ? null : confidence || null },
      });
      onSaved();
      await invalidateAnalytics();
      // Feedback immédiat : Gabriel voit que son attribution est bien prise en compte.
      if (channel === "ghost") {
        toast.info("Commande laissée non attribuée — hors des stats par canal.");
      } else {
        toast.success(`Attribué à ${CHANNEL_LABELS[channel]} — compté dans le ROAS Jestly (statut « Résolu Jestly »).`);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/ecom/gads/orders/${order.order_id}/attribution`, { method: "DELETE" });
      setChannel(order.measured_channel ?? "ghost");
      setConfidence("");
      onSaved();
      await invalidateAnalytics();
      toast.info(
        order.measured_channel
          ? `Attribution manuelle retirée — retour à la mesure Shopify (${CHANNEL_LABELS[order.measured_channel]}).`
          : "Attribution manuelle retirée — la commande repasse non attribuée.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const isTracked = order.tracking_status === "tracked";

  return (
    <div className="space-y-1">
      {/* Canal mesuré pré-sélectionné (commande trackée sans override) : chip
          plein + « mesuré », pour que l'état actif soit visuellement évident. */}
      {isTracked && order.manual == null && order.measured_channel && (
        <div className="flex items-center gap-1.5" title="Canal mesuré par Shopify — pré-sélectionné par défaut">
          <ChannelChip channel={order.measured_channel} />
          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium">
            <Check size={10} /> mesuré
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        <select
          value={channel}
          onChange={(e) => {
            const v = e.target.value;
            if (v === RETURN_TO_MEASURED) { void reset(); return; }
            setChannel(v as Channel);
            setError(null);
          }}
          className={SELECT_CLS} disabled={busy}>
          {(Object.keys(CHANNEL_LABELS) as Channel[])
            // « Laisser fantôme » (ghost) masqué sur une commande trackée : elle
            // n'est pas fantôme, la laisser telle serait un contresens.
            .filter((c) => c !== "ghost" || !isTracked)
            .map((c) => (
              <option key={c} value={c}>{c === "ghost" ? "Laisser fantôme" : CHANNEL_LABELS[c]}</option>
            ))}
          {isTracked && order.manual != null && (
            <option value={RETURN_TO_MEASURED}>Revenir à la mesure</option>
          )}
        </select>
        {needsConfidence && (
          <select value={confidence} onChange={(e) => setConfidence(e.target.value as ManualConfidence)} className={SELECT_CLS} disabled={busy}>
            <option value="">Confiance ?</option>
            {(Object.keys(CONFIDENCE_LABELS) as ManualConfidence[]).map((c) => (
              <option key={c} value={c}>{CONFIDENCE_LABELS[c]}</option>
            ))}
          </select>
        )}
        {dirty && (
          <button onClick={() => void save()} disabled={busy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-60">
            {busy && <Loader2 size={10} className="animate-spin" />} OK
          </button>
        )}
        {order.manual && !dirty && (
          <button onClick={() => void reset()} disabled={busy} title="Retirer l'attribution manuelle"
            className="p-1 rounded text-[#B4B4B2] hover:text-[#1a1535] hover:bg-[#FBFBFA]">
            <RotateCcw size={12} />
          </button>
        )}
      </div>
      {isGhostGuess && (
        <p className="text-[10px] text-amber-700 flex items-start gap-1">
          <AlertTriangle size={10} className="shrink-0 mt-[1px]" />
          Parcours non capté — attribution basée sur ton hypothèse
        </p>
      )}
      {!isGhostGuess && divergesFromMeasured && (
        <p className="text-[10px] text-rose-700 flex items-start gap-1">
          <AlertTriangle size={10} className="shrink-0 mt-[1px]" />
          Tu attribues {CHANNEL_LABELS[channel]} mais Shopify a capté {CHANNEL_LABELS[order.measured_channel as Channel]} — sûr ?
        </p>
      )}
      {error && <p className="text-[10px] text-rose-600">{error}</p>}
    </div>
  );
}
