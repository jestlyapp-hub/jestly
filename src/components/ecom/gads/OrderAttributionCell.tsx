"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";
import { CHANNEL_LABELS, CONFIDENCE_LABELS, type Channel, type ManualConfidence } from "@/lib/gads/channels";
import type { AttributionOrderRow } from "@/lib/gads/attribution-aggregator";

interface Props {
  order: AttributionOrderRow;
  onSaved: () => void;
}

const SELECT_CLS = "px-2 py-1 text-[11px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#7C3AED] text-[#191919]";

/**
 * Sélecteur d'attribution manuelle d'une commande, avec les deux rappels :
 * - commande fantôme → « parcours non capté, attribution basée sur ton hypothèse »
 * - divergence avec la donnée captée → « Shopify a capté X — sûr ? »
 * Le niveau de confiance est obligatoire dès qu'un canal est choisi.
 */
export default function OrderAttributionCell({ order, onSaved }: Props) {
  const initialChannel: Channel = order.manual?.channel ?? order.measured_channel ?? "ghost";
  const [channel, setChannel] = useState<Channel>(initialChannel);
  const [confidence, setConfidence] = useState<ManualConfidence | "">(order.manual?.confidence ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsConfidence = channel !== "ghost";
  const baselineConfidence = order.manual?.confidence ?? "";
  const dirty = channel !== initialChannel || (needsConfidence && confidence !== baselineConfidence && confidence !== "");
  const divergesFromMeasured = order.measured_channel != null && channel !== "ghost" && channel !== order.measured_channel;
  const isGhostGuess = order.tracking_status === "ghost" && channel !== "ghost";

  const save = async () => {
    if (needsConfidence && !confidence) { setError("Choisis le niveau de confiance"); return; }
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/ecom/gads/orders/${order.order_id}/attribution`, {
        method: "PUT",
        body: { channel, confidence: channel === "ghost" ? null : confidence },
      });
      onSaved();
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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 flex-wrap">
        <select value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className={SELECT_CLS} disabled={busy}>
          {(Object.keys(CHANNEL_LABELS) as Channel[]).map((c) => (
            <option key={c} value={c}>{c === "ghost" ? "Laisser fantôme" : CHANNEL_LABELS[c]}</option>
          ))}
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
            className="p-1 rounded text-[#B4B4B2] hover:text-[#191919] hover:bg-[#FBFBFA]">
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
