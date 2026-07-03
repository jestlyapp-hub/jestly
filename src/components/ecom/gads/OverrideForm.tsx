"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";

export interface ManualOverride {
  id: string;
  date: string;
  campaign_name: string | null;
  revenue_cents: number;
  orders_count: number;
  is_manual: boolean;
  note: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  /** Override existant → mode édition ; absent → création. */
  initial?: ManualOverride;
  /** Date pré-remplie et verrouillée (correction depuis la timeline). */
  lockedDate?: string;
  onSaved: (override: ManualOverride) => void;
  onCancel?: () => void;
}

/**
 * Saisie d'une commande manuelle attribuée à Google Ads.
 * Note obligatoire : chaque correction doit être justifiée pour rester
 * distinguable des données mesurées (garde-fou anti-biais).
 */
export default function OverrideForm({ initial, lockedDate, onSaved, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? lockedDate ?? new Date().toISOString().slice(0, 10));
  const [revenueEuros, setRevenueEuros] = useState(initial ? String(initial.revenue_cents / 100) : "");
  const [ordersCount, setOrdersCount] = useState(initial ? String(initial.orders_count) : "1");
  const [campaign, setCampaign] = useState(initial?.campaign_name ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const revenue = parseFloat(revenueEuros.replace(",", "."));
    if (!Number.isFinite(revenue)) { setError("Montant invalide"); return; }
    if (note.trim().length < 3) { setError("Note obligatoire (3 caractères minimum) : justifie la correction"); return; }
    setBusy(true);
    setError(null);
    try {
      const body = {
        date,
        revenue_cents: Math.round(revenue * 100),
        orders_count: parseInt(ordersCount || "1", 10),
        campaign_name: campaign.trim() || null,
        note: note.trim(),
      };
      const res = initial
        ? await apiFetch<{ override: ManualOverride }>(`/api/ecom/gads/manual/${initial.id}`, { method: "PATCH", body })
        : await apiFetch<{ override: ManualOverride }>("/api/ecom/gads/manual", { method: "POST", body });
      onSaved(res.override);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "w-full px-2.5 py-1.5 text-[12px] bg-[#F7F7F5] border border-[#E6E6E4] rounded-md focus:outline-none focus:border-[#7C3AED] text-[#191919]";

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <label className="block">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Date</span>
          <input type="date" value={date} disabled={Boolean(lockedDate)} onChange={(e) => setDate(e.target.value)}
            className={`${inputCls} disabled:opacity-60`} />
        </label>
        <label className="block">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Montant (€)</span>
          <input type="text" inputMode="decimal" placeholder="59,90" value={revenueEuros}
            onChange={(e) => setRevenueEuros(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Nb commandes</span>
          <input type="number" min={0} value={ordersCount} onChange={(e) => setOrdersCount(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">Campagne (optionnel)</span>
          <input type="text" placeholder="Nom de campagne" value={campaign} onChange={(e) => setCampaign(e.target.value)} className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="block text-[11px] font-medium text-[#5A5A58] mb-1">
          Note <span className="text-rose-600">*</span> — pourquoi cette correction ?
        </span>
        <input type="text" placeholder="Ex. commande téléphone suite au clic sur l'annonce Marques propres"
          value={note} onChange={(e) => setNote(e.target.value)} className={inputCls} />
      </label>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button onClick={() => void submit()} disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-60">
          {busy && <Loader2 size={12} className="animate-spin" />}
          {initial ? "Enregistrer" : "Ajouter la commande"}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="px-3 py-1.5 rounded-md text-[12px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA] border border-[#E6E6E4]">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}
