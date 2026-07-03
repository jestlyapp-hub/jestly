"use client";

/**
 * Google Ads — Vue 2 : Détail temporel jour par jour.
 * Le ROAS du jour est affiché mais marqué « indicatif » : le décisionnel reste
 * le ROAS de période (SUM/SUM). Les trous de données Ads sont marqués en rouge,
 * jamais interpolés.
 *
 * Édition : les chiffres Google viennent du CSV (le réimport fait foi) ; la
 * correction manuelle passe par un override (table séparée, note obligatoire)
 * pour ne jamais se fondre dans les données mesurées.
 */
import { useState } from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import type { GadsTimelinePoint } from "@/lib/gads/aggregator";
import PeriodSelector from "@/components/ecom/ads/PeriodSelector";
import GadsTabs from "@/components/ecom/gads/GadsTabs";
import MissingDatesBanner from "@/components/ecom/gads/MissingDatesBanner";
import OverrideForm, { type ManualOverride } from "@/components/ecom/gads/OverrideForm";
import { formatDateFr, periodToRange, type Period } from "@/components/ecom/gads/format";

export default function GadsTimelinePage() {
  const [period, setPeriod] = useState<Period>("30d");
  const { from, to } = periodToRange(period);
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const timelineApi = useApi<{ points: GadsTimelinePoint[] }>(`/api/ecom/gads/timeline?range=${period}`);
  const manualApi = useApi<{ overrides: ManualOverride[] }>(`/api/ecom/gads/manual?from=${from}&to=${to}`);

  const points = timelineApi.data?.points ?? [];
  const gaps = points.filter((p) => p.is_gap).map((p) => p.date);

  const overridesByDate = new Map<string, ManualOverride[]>();
  for (const o of manualApi.data?.overrides ?? []) {
    overridesByDate.set(o.date, [...(overridesByDate.get(o.date) ?? []), o]);
  }

  const onOverrideSaved = () => {
    setEditingDate(null);
    void manualApi.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#191919]">Détail temporel</h1>
          <p className="text-[12px] text-[#8A8A88]">
            Jour par jour — le ROAS journalier est indicatif, la décision se prend sur la période
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <GadsTabs />
          <PeriodSelector value={period} onChange={(v) => setPeriod(v as Period)} />
        </div>
      </div>

      <MissingDatesBanner missingDates={gaps} />

      <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E6E6E4] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium text-right">Dépense</th>
                <th className="px-4 py-2.5 font-medium text-right">Clics</th>
                <th className="px-4 py-2.5 font-medium text-right">Conv. Google</th>
                <th className="px-4 py-2.5 font-medium text-right">CA Shopify</th>
                <th className="px-4 py-2.5 font-medium text-right">Cmds</th>
                <th className="px-4 py-2.5 font-medium text-right" title="ROAS du jour isolé : indicatif uniquement, jamais décisionnel">
                  ROAS jour <span className="text-[#B4B4B2]">(indicatif)</span>
                </th>
                <th className="px-4 py-2.5 font-medium text-right" title="SUM(revenue) / SUM(spend) des 7 jours se terminant ce jour-là">
                  ROAS 7 j
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {points.map((p) => {
                const dayOverrides = overridesByDate.get(p.date) ?? [];
                return (
                  <RowGroup key={p.date} point={p} overrides={dayOverrides}
                    editing={editingDate === p.date}
                    onEdit={() => setEditingDate(editingDate === p.date ? null : p.date)}
                    onSaved={onOverrideSaved}
                    onCancel={() => setEditingDate(null)} />
                );
              })}
              {points.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[#8A8A88]">
                    {timelineApi.loading ? "Chargement…" : "Aucune donnée sur la période — importe un CSV depuis l'onglet Pilotage."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-[#8A8A88]">
        Les chiffres Google (dépense, clics, conversions) viennent du dernier CSV importé — pour les corriger,
        réimporte un export à jour. Le bouton ✎ ajoute une commande manuelle (table séparée, note obligatoire),
        visible dans « ROAS avec overrides » de la vue Attribution.
      </p>
    </div>
  );
}

function RowGroup({ point: p, overrides, editing, onEdit, onSaved, onCancel }: {
  point: GadsTimelinePoint;
  overrides: ManualOverride[];
  editing: boolean;
  onEdit: () => void;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const manualTotal = overrides.reduce((s, o) => s + o.revenue_cents, 0);
  return (
    <>
      <tr className={`border-b border-[#EFEFEF] ${p.is_gap ? "bg-rose-50/60" : "hover:bg-[#FBFBFA]"}`}>
        <td className="px-4 py-2 whitespace-nowrap">
          <span className="text-[#191919] font-medium">{formatDateFr(p.date, "EEE d MMM")}</span>
          {p.is_gap && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-rose-700 font-medium">
              <AlertTriangle size={10} /> Aucune donnée Ads
            </span>
          )}
        </td>
        <td className={`px-4 py-2 text-right tabular-nums ${p.is_gap ? "text-rose-400" : "text-[#191919]"}`}>
          {p.is_gap ? "—" : formatCurrency(p.cost_cents)}
        </td>
        <td className="px-4 py-2 text-right tabular-nums text-[#5A5A58]">{p.is_gap ? "—" : formatNumberFr(p.clicks)}</td>
        <td className="px-4 py-2 text-right tabular-nums text-[#5A5A58]">{p.is_gap ? "—" : p.conversions.toLocaleString("fr-FR")}</td>
        <td className="px-4 py-2 text-right tabular-nums text-[#191919] font-medium">
          {formatCurrency(p.shopify_revenue_cents)}
          {manualTotal > 0 && (
            <span className="ml-1 text-[10px] text-[#7C3AED]" title="Overrides manuels sur ce jour (comptés à part)">
              +{formatCurrency(manualTotal)} manuel
            </span>
          )}
        </td>
        <td className="px-4 py-2 text-right tabular-nums text-[#5A5A58]">{p.shopify_orders}</td>
        <td className="px-4 py-2 text-right tabular-nums text-[#8A8A88] italic">{formatRoas(p.day_roas)}</td>
        <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#191919]">{formatRoas(p.rolling_roas)}</td>
        <td className="px-2 py-2 text-right">
          <button onClick={onEdit} title="Ajouter une commande manuelle sur ce jour"
            className={`p-1 rounded hover:bg-[#F0EEFF] ${editing ? "text-[#7C3AED]" : "text-[#B4B4B2] hover:text-[#7C3AED]"}`}>
            <Pencil size={13} />
          </button>
        </td>
      </tr>
      {editing && (
        <tr className="border-b border-[#EFEFEF] bg-[#FBFBFA]">
          <td colSpan={9} className="px-4 py-3">
            <OverrideForm lockedDate={p.date} onSaved={onSaved} onCancel={onCancel} />
          </td>
        </tr>
      )}
    </>
  );
}
