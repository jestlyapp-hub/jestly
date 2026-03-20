"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductModeEditor from "./shared/ProductModeEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function ComparisonTableBlockEditor({ block }: { block: Extract<Block, { type: "comparison-table" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const { plans, rows } = block.content;

  const updatePlan = (i: number, field: string, value: unknown) => {
    const next = plans.map((p, j) => (j === i ? { ...p, [field]: value } : p));
    update({ plans: next });
  };

  const addPlan = () => {
    const newRows = rows.map((r) => ({ ...r, values: [...r.values, false as boolean | string] }));
    update({ plans: [...plans, { name: "Plan", isHighlighted: false, ctaLabel: "Choisir" }], rows: newRows });
  };

  const removePlan = (i: number) => {
    const newPlans = plans.filter((_, j) => j !== i);
    const newRows = rows.map((r) => ({ ...r, values: r.values.filter((_, j) => j !== i) }));
    update({ plans: newPlans, rows: newRows });
  };

  const updateRowFeature = (i: number, value: string) => {
    const next = rows.map((r, j) => (j === i ? { ...r, feature: value } : r));
    update({ rows: next });
  };

  const updateRowValue = (ri: number, pi: number, value: boolean | string) => {
    const next = rows.map((r, j) => {
      if (j !== ri) return r;
      const newValues = [...r.values];
      newValues[pi] = value;
      return { ...r, values: newValues };
    });
    update({ rows: next });
  };

  const addRow = () => update({ rows: [...rows, { feature: "Fonctionnalité", values: plans.map(() => false as boolean | string) }] });
  const removeRow = (i: number) => update({ rows: rows.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <ProductModeEditor
        mode={block.content.mode || "manual"}
        onModeChange={(mode) => update({ mode })}
        productIds={block.content.productIds || []}
        onProductIdsChange={(productIds) => update({ productIds })}
      />
      <div className="border-t border-[#E6E6E4] my-3" />
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      {/* Plans */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-[#999]">Plans ({plans.length})</label>
        {plans.map((plan, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-2.5 space-y-1.5 relative">
            <button onClick={() => removePlan(i)} className="absolute top-1.5 right-1.5 text-[#999] hover:text-red-500 text-[14px] leading-none">&times;</button>
            <input type="text" value={plan.name} onChange={(e) => updatePlan(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
            <div className="flex items-center gap-2">
              <input type="text" value={plan.ctaLabel} onChange={(e) => updatePlan(i, "ctaLabel", e.target.value)} placeholder="CTA" className={`${inputClass} flex-1`} />
              <button onClick={() => updatePlan(i, "isHighlighted", !plan.isHighlighted)} className={`${toggleClass} ${plan.isHighlighted ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
                <div className={`${toggleDotClass} ${plan.isHighlighted ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        ))}
        <button onClick={addPlan} className="w-full py-1.5 rounded-lg border border-dashed border-[#E6E6E4] text-[11px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Plan</button>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-[#999]">Fonctionnalités ({rows.length})</label>
        {rows.map((row, ri) => (
          <div key={ri} className="rounded-lg border border-[#E6E6E4] p-2.5 space-y-1.5 relative">
            <button onClick={() => removeRow(ri)} className="absolute top-1.5 right-1.5 text-[#999] hover:text-red-500 text-[14px] leading-none">&times;</button>
            <input type="text" value={row.feature} onChange={(e) => updateRowFeature(ri, e.target.value)} className={inputClass} />
            <div className="flex gap-2">
              {row.values.map((val, pi) => (
                <div key={pi} className="flex-1 flex items-center gap-1">
                  <span className="text-[9px] text-[#999] truncate">{plans[pi]?.name}</span>
                  {typeof val === "boolean" ? (
                    <button onClick={() => updateRowValue(ri, pi, !val)} className={`w-5 h-5 rounded border flex items-center justify-center ${val ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#E6E6E4]"}`}>
                      {val && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </button>
                  ) : (
                    <input type="text" value={val} onChange={(e) => updateRowValue(ri, pi, e.target.value)} className="bg-[#F7F7F5] border border-[#E6E6E4] rounded px-1.5 py-0.5 text-[11px] w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={addRow} className="w-full py-1.5 rounded-lg border border-dashed border-[#E6E6E4] text-[11px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Fonctionnalité</button>
      </div>
    </div>
  );
}
