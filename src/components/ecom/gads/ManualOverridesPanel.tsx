"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { formatCurrency } from "@/lib/ads/formatters";
import { formatDateFr } from "./format";
import OverrideForm, { type ManualOverride } from "./OverrideForm";

interface Props {
  from: string;
  to: string;
  /** Notifié après tout ajout/édition/suppression (pour rafraîchir les KPIs). */
  onChanged: () => void;
}

/**
 * Zone de saisie manuelle des commandes Google Ads (Vue 3).
 * Les overrides restent dans leur table séparée et sont toujours affichés
 * comme des estimations manuelles, jamais fondus dans les données mesurées.
 */
export default function ManualOverridesPanel({ from, to, onChanged }: Props) {
  const { data, mutate } = useApi<{ overrides: ManualOverride[] }>(
    `/api/ecom/gads/manual?from=${from}&to=${to}`,
  );
  const overrides = data?.overrides ?? [];
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = async () => {
    await mutate();
    onChanged();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/ecom/gads/manual/${id}`, { method: "DELETE" });
    await refresh();
  };

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[14px] font-bold text-[#191919]">Commandes ajoutées à la main</h3>
          <p className="text-[11px] text-[#8A8A88]">
            Estimations manuelles, pas de la donnée mesurée — comptées uniquement dans le « ROAS avec overrides ».
          </p>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[#191919] border border-[#E6E6E4] hover:bg-[#FBFBFA]">
            <Plus size={13} strokeWidth={1.8} /> Ajouter
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-3 p-3 bg-[#FBFBFA] border border-[#EFEFEF] rounded-lg">
          <OverrideForm
            onSaved={() => { setAdding(false); void refresh(); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {overrides.length === 0 && !adding ? (
        <p className="mt-3 text-[12px] text-[#8A8A88]">Aucune correction manuelle sur la période.</p>
      ) : (
        <ul className="mt-3 divide-y divide-[#EFEFEF]">
          {overrides.map((o) => (
            <li key={o.id} className="py-2.5">
              {editingId === o.id ? (
                <OverrideForm
                  initial={o}
                  onSaved={() => { setEditingId(null); void refresh(); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="text-[#5A5A58] w-16 shrink-0">{formatDateFr(o.date)}</span>
                  <span className="font-semibold text-[#191919] tabular-nums">{formatCurrency(o.revenue_cents)}</span>
                  <span className="text-[#8A8A88]">
                    {o.orders_count} cmd{o.orders_count > 1 ? "s" : ""}
                    {o.campaign_name && <> · {o.campaign_name}</>}
                  </span>
                  <span className="flex-1 text-[#5A5A58] italic truncate" title={o.note}>« {o.note} »</span>
                  <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F0EEFF] text-[#7C3AED] text-[10px] font-semibold uppercase">
                    Manuel
                  </span>
                  <button onClick={() => setEditingId(o.id)} className="text-[#8A8A88] hover:text-[#191919]" aria-label="Modifier">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => void remove(o.id)} className="text-[#8A8A88] hover:text-rose-600" aria-label="Supprimer">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
