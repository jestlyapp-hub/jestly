"use client";

/**
 * Détail temporel jour par jour (ex-onglet « Détail temporel », désormais
 * section « Vue journalière » du Dashboard). Le ROAS journalier est indicatif —
 * le décisionnel reste la période. Les trous de données Ads sont marqués,
 * jamais interpolés. Le ✎ ajoute une commande manuelle (table séparée).
 */
import { useState } from "react";
import { AlertTriangle, Pencil } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatCurrency, formatNumberFr, formatRoas } from "@/lib/ads/formatters";
import type { GadsTimelinePoint } from "@/lib/gads/aggregator";
import MissingDatesBanner from "./MissingDatesBanner";
import OverrideForm, { type ManualOverride } from "./OverrideForm";
import { TableSkeleton, ErrorBanner } from "./LoadState";
import { formatDateFr } from "./format";

export default function DailyDetailTable({ from, to }: { from: string; to: string }) {
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const timelineApi = useApi<{ points: GadsTimelinePoint[] }>(`/api/ecom/gads/timeline?from=${from}&to=${to}`);
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

  if (timelineApi.error) return <ErrorBanner message={timelineApi.error} onRetry={() => void timelineApi.mutate()} />;
  if (timelineApi.loading) return <TableSkeleton rows={10} />;

  return (
    <div className="space-y-3">
      <MissingDatesBanner missingDates={gaps} />
      <div className="bg-white border border-[#E5E3F0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E3F0] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
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
                  MER 7 j
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {points.map((p) => {
                const dayOverrides = overridesByDate.get(p.date) ?? [];
                const manualTotal = dayOverrides.reduce((s, o) => s + o.revenue_cents, 0);
                const editing = editingDate === p.date;
                return (
                  <RowGroup key={p.date} point={p} manualTotal={manualTotal} editing={editing}
                    onEdit={() => setEditingDate(editing ? null : p.date)}
                    onSaved={onOverrideSaved} onCancel={() => setEditingDate(null)} />
                );
              })}
              {points.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-[#8A8A88]">
                    Aucune donnée sur la période — importe un CSV ou lance la sync API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-[#8A8A88]">
        Les chiffres Google viennent de la dernière sync (API ou CSV) — la source la plus récente fait foi.
        Le ✎ ajoute une commande manuelle (table séparée, note obligatoire), visible dans le ROAS avec overrides.
      </p>
    </div>
  );
}

function RowGroup({ point: p, manualTotal, editing, onEdit, onSaved, onCancel }: {
  point: GadsTimelinePoint;
  manualTotal: number;
  editing: boolean;
  onEdit: () => void;
  onSaved: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <tr className={`border-b border-[#EFEFEF] ${p.is_gap ? "bg-rose-50/60" : "hover:bg-[#FBFBFA]"}`}>
        <td className="px-4 py-2 whitespace-nowrap">
          <span className="text-[#1a1535] font-medium">{formatDateFr(p.date, "EEE d MMM")}</span>
          {p.is_gap && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-rose-700 font-medium">
              <AlertTriangle size={10} /> Aucune donnée Ads
            </span>
          )}
        </td>
        <td className={`px-4 py-2 text-right tabular-nums ${p.is_gap ? "text-rose-400" : "text-[#1a1535]"}`}>
          {p.is_gap ? "—" : formatCurrency(p.cost_cents)}
        </td>
        <td className="px-4 py-2 text-right tabular-nums text-[#5A5A58]">{p.is_gap ? "—" : formatNumberFr(p.clicks)}</td>
        <td className="px-4 py-2 text-right tabular-nums text-[#5A5A58]">{p.is_gap ? "—" : p.conversions.toLocaleString("fr-FR")}</td>
        <td className="px-4 py-2 text-right tabular-nums text-[#1a1535] font-medium">
          {formatCurrency(p.shopify_revenue_cents)}
          {manualTotal > 0 && (
            <span className="ml-1 text-[10px] text-[#7C3AED]" title="Overrides manuels sur ce jour (comptés à part)">
              +{formatCurrency(manualTotal)} manuel
            </span>
          )}
        </td>
        <td className="px-4 py-2 text-right tabular-nums text-[#5A5A58]">{p.shopify_orders}</td>
        <td className="px-4 py-2 text-right tabular-nums text-[#8A8A88] italic">{formatRoas(p.day_roas)}</td>
        <td className="px-4 py-2 text-right tabular-nums font-semibold text-[#1a1535]">{formatRoas(p.rolling_roas)}</td>
        <td className="px-2 py-2 text-right">
          <button onClick={onEdit} title="Ajouter une commande manuelle sur ce jour"
            className={`p-1 rounded hover:bg-[#F0EEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${editing ? "text-[#7C3AED]" : "text-[#B4B4B2] hover:text-[#7C3AED]"}`}>
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
