"use client";

/**
 * Vue journalière jour par jour (ex-« Détail temporel »). Colonnes configurables
 * et persistées, tri par n'importe quelle colonne, ligne de total/moyenne en bas
 * (ratios en SUM/SUM). Le ROAS journalier reste INDICATIF — le décisionnel est la
 * période. Les trous de données Ads sont marqués, jamais interpolés. Le ✎ ajoute
 * une commande manuelle (table séparée). DA Jestly.
 */
import { useMemo, useState } from "react";
import { AlertTriangle, Pencil, Columns3 } from "lucide-react";
import { useApi } from "@/lib/hooks/use-api";
import { formatMetric, type MetricUnit } from "@/lib/gads/metric-catalog";
import type { GadsTimelinePoint } from "@/lib/gads/aggregator";
import { useEcomPref } from "@/components/ecom/EcomPrefsProvider";
import MissingDatesBanner from "./MissingDatesBanner";
import OverrideForm, { type ManualOverride } from "./OverrideForm";
import { TableSkeleton, ErrorBanner } from "./LoadState";
import { formatDateFr } from "./format";

interface Col {
  id: string;
  label: string;
  unit: MetricUnit;
  indicative?: boolean;
  value: (p: GadsTimelinePoint) => number | null;
  /** Total de colonne : somme, ou ratio SUM(num)/SUM(den), ou aucun. */
  total: "sum" | { num: (p: GadsTimelinePoint) => number; den: (p: GadsTimelinePoint) => number } | "none";
}

const COLS: Col[] = [
  { id: "spend", label: "Dépense", unit: "currency", value: (p) => p.cost_cents, total: "sum" },
  { id: "clicks", label: "Clics", unit: "number", value: (p) => p.clicks, total: "sum" },
  { id: "impressions", label: "Impressions", unit: "number", value: (p) => p.impressions, total: "sum" },
  { id: "conversions", label: "Conv. Google", unit: "number", value: (p) => p.conversions, total: "sum" },
  { id: "revenue", label: "CA Shopify", unit: "currency", value: (p) => p.shopify_revenue_cents, total: "sum" },
  { id: "orders", label: "Cmds", unit: "number", value: (p) => p.shopify_orders, total: "sum" },
  { id: "ctr", label: "CTR", unit: "percent", value: (p) => (p.impressions > 0 ? p.clicks / p.impressions : null), total: { num: (p) => p.clicks, den: (p) => p.impressions } },
  { id: "cpc", label: "CPC", unit: "currency", value: (p) => (p.clicks > 0 ? Math.round(p.cost_cents / p.clicks) : null), total: { num: (p) => p.cost_cents, den: (p) => p.clicks } },
  { id: "roas_google", label: "ROAS Google", unit: "ratio_x", value: (p) => (p.cost_cents > 0 ? p.conversion_value_cents / p.cost_cents : null), total: { num: (p) => p.conversion_value_cents, den: (p) => p.cost_cents } },
  { id: "day_roas", label: "ROAS jour", unit: "ratio_x", indicative: true, value: (p) => p.day_roas, total: { num: (p) => p.shopify_revenue_cents, den: (p) => p.cost_cents } },
  { id: "mer7", label: "MER 7 j", unit: "ratio_x", value: (p) => p.rolling_roas, total: "none" },
];
const COL_BY_ID = Object.fromEntries(COLS.map((c) => [c.id, c]));
const DEFAULT_COLS = ["spend", "clicks", "conversions", "revenue", "orders", "day_roas", "mer7"];

export default function DailyDetailTable({ from, to }: { from: string; to: string }) {
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [visible, setVisible] = useEcomPref<string[]>("daily_cols", DEFAULT_COLS);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDesc, setSortDesc] = useState(false);

  const timelineApi = useApi<{ points: GadsTimelinePoint[] }>(`/api/ecom/gads/timeline?from=${from}&to=${to}`);
  const manualApi = useApi<{ overrides: ManualOverride[] }>(`/api/ecom/gads/manual?from=${from}&to=${to}`);

  const points = useMemo(() => timelineApi.data?.points ?? [], [timelineApi.data]);
  const gaps = points.filter((p) => p.is_gap).map((p) => p.date);
  const shownCols = visible.map((id) => COL_BY_ID[id]).filter(Boolean) as Col[];

  const overridesByDate = new Map<string, ManualOverride[]>();
  for (const o of manualApi.data?.overrides ?? []) {
    overridesByDate.set(o.date, [...(overridesByDate.get(o.date) ?? []), o]);
  }

  const sorted = useMemo(() => {
    const list = [...points];
    if (sortBy === "date") {
      list.sort((a, b) => (sortDesc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
    } else {
      const col = COL_BY_ID[sortBy];
      if (col) list.sort((a, b) => {
        const va = col.value(a), vb = col.value(b);
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        return sortDesc ? vb - va : va - vb;
      });
    }
    return list;
  }, [points, sortBy, sortDesc]);

  const totals = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const col of shownCols) {
      if (col.total === "sum") {
        out[col.id] = points.reduce((s, p) => s + (col.value(p) ?? 0), 0);
      } else if (col.total === "none") {
        out[col.id] = null;
      } else {
        // Ratio agrégé en SUM(num)/SUM(den) — jamais une moyenne de ratios.
        const t = col.total;
        const num = points.reduce((s, p) => s + t.num(p), 0);
        const den = points.reduce((s, p) => s + t.den(p), 0);
        out[col.id] = den > 0 ? num / den : null;
      }
    }
    return out;
  }, [points, shownCols]);

  const onOverrideSaved = () => { setEditingDate(null); void manualApi.mutate(); };
  const onSort = (id: string) => {
    if (sortBy === id) setSortDesc(!sortDesc);
    else { setSortBy(id); setSortDesc(id !== "date"); }
  };
  const toggleCol = (id: string) => {
    setVisible(visible.includes(id) ? visible.filter((x) => x !== id) : [...visible, id]);
  };

  if (timelineApi.error) return <ErrorBanner message={timelineApi.error} onRetry={() => void timelineApi.mutate()} />;
  if (timelineApi.loading) return <TableSkeleton rows={10} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <MissingDatesBanner missingDates={gaps} />
        <div className="relative ml-auto">
          <button onClick={() => setPickerOpen(!pickerOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white text-[var(--ecom-navy)] border border-[var(--ecom-card-border)] hover:bg-[var(--ecom-surface-sunken)]">
            <Columns3 size={13} /> Colonnes ({shownCols.length})
          </button>
          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute right-0 mt-1 z-20 bg-white border border-[var(--ecom-card-border)] rounded-lg shadow-lg p-2 w-52">
                {COLS.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 px-2 py-1 text-[12px] text-[var(--ecom-navy)] hover:bg-[var(--ecom-surface-sunken)] rounded cursor-pointer">
                    <input type="checkbox" checked={visible.includes(c.id)} onChange={() => toggleCol(c.id)} className="accent-[#7C3AED]" />
                    {c.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-[#E5E3F0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#E5E3F0] bg-[#FBFBFA] text-left text-[11px] text-[#5A5A58]">
                <th className="px-4 py-2.5 font-medium cursor-pointer select-none hover:text-[#1a1535] sticky left-0 bg-[#FBFBFA]" onClick={() => onSort("date")}>
                  Date{sortBy === "date" && <span className="text-[#7C3AED]"> {sortDesc ? "↓" : "↑"}</span>}
                </th>
                {shownCols.map((c) => (
                  <th key={c.id} className="px-4 py-2.5 font-medium text-right whitespace-nowrap cursor-pointer select-none hover:text-[#1a1535]"
                    onClick={() => onSort(c.id)} title={c.indicative ? "ROAS du jour isolé : indicatif, jamais décisionnel" : undefined}>
                    {c.label}{c.indicative && <span className="text-[#B4B4B2]"> (indic.)</span>}{sortBy === c.id && <span className="text-[#7C3AED]"> {sortDesc ? "↓" : "↑"}</span>}
                  </th>
                ))}
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => {
                const dayOverrides = overridesByDate.get(p.date) ?? [];
                const manualTotal = dayOverrides.reduce((s, o) => s + o.revenue_cents, 0);
                const editing = editingDate === p.date;
                return (
                  <RowGroup key={p.date} point={p} cols={shownCols} manualTotal={manualTotal} editing={editing}
                    onEdit={() => setEditingDate(editing ? null : p.date)} onSaved={onOverrideSaved} onCancel={() => setEditingDate(null)} />
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={shownCols.length + 2} className="px-4 py-10 text-center text-[#8A8A88]">
                  Aucune donnée sur la période — importe un CSV ou lance la sync API.
                </td></tr>
              )}
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-[#E5E3F0] bg-[#FBFBFA] font-semibold text-[#1a1535]">
                  <td className="px-4 py-2.5 sticky left-0 bg-[#FBFBFA]">Total / moyenne</td>
                  {shownCols.map((c) => (
                    <td key={c.id} className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">
                      {totals[c.id] != null ? formatMetric(totals[c.id]!, c.unit) : "—"}
                    </td>
                  ))}
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <p className="text-[11px] text-[#8A8A88]">
        Les chiffres Google viennent de la dernière sync (API ou CSV) — la source la plus récente fait foi. Ratios totaux en SUM/SUM.
        Le ✎ ajoute une commande manuelle (table séparée, note obligatoire).
      </p>
    </div>
  );
}

function RowGroup({ point: p, cols, manualTotal, editing, onEdit, onSaved, onCancel }: {
  point: GadsTimelinePoint; cols: Col[]; manualTotal: number; editing: boolean;
  onEdit: () => void; onSaved: () => void; onCancel: () => void;
}) {
  return (
    <>
      <tr className={`border-b border-[#EFEFEF] ${p.is_gap ? "bg-rose-50/60" : "hover:bg-[#FBFBFA]"}`}>
        <td className="px-4 py-2 whitespace-nowrap sticky left-0 bg-inherit">
          <span className="text-[#1a1535] font-medium">{formatDateFr(p.date, "EEE d MMM")}</span>
          {p.is_gap && (
            <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-rose-700 font-medium">
              <AlertTriangle size={10} /> Aucune donnée Ads
            </span>
          )}
        </td>
        {cols.map((c) => {
          const v = c.value(p);
          const isSpendGap = p.is_gap && (c.id === "spend" || c.id === "clicks" || c.id === "impressions" || c.id === "conversions");
          return (
            <td key={c.id} className={`px-4 py-2 text-right tabular-nums ${c.indicative ? "text-[#8A8A88] italic" : isSpendGap ? "text-rose-400" : "text-[#1a1535]"}`}>
              {isSpendGap ? "—" : v == null ? "—" : formatMetric(v, c.unit)}
              {c.id === "revenue" && manualTotal > 0 && (
                <span className="ml-1 text-[10px] text-[#7C3AED]" title="Overrides manuels sur ce jour (comptés à part)">+{formatMetric(manualTotal, "currency")} manuel</span>
              )}
            </td>
          );
        })}
        <td className="px-2 py-2 text-right">
          <button onClick={onEdit} title="Ajouter une commande manuelle sur ce jour"
            className={`p-1 rounded hover:bg-[#F0EEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${editing ? "text-[#7C3AED]" : "text-[#B4B4B2] hover:text-[#7C3AED]"}`}>
            <Pencil size={13} />
          </button>
        </td>
      </tr>
      {editing && (
        <tr className="border-b border-[#EFEFEF] bg-[#FBFBFA]">
          <td colSpan={cols.length + 2} className="px-4 py-3">
            <OverrideForm lockedDate={p.date} onSaved={onSaved} onCancel={onCancel} />
          </td>
        </tr>
      )}
    </>
  );
}
