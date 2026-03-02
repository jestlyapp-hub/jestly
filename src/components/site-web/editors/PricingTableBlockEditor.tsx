"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function PricingTableBlockEditor({ block }: { block: Extract<Block, { type: "pricing-table" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const plans = block.content.plans;

  const updatePlan = (index: number, field: string, value: unknown) => {
    const next = plans.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    update({ plans: next });
  };

  const addPlan = () => update({ plans: [...plans, { name: "Plan", price: 0, period: "monthly" as const, description: "", features: [], isPopular: false, ctaLabel: "Choisir" }] });
  const removePlan = (i: number) => update({ plans: plans.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder="Nos tarifs" className={inputClass} />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
          <div className="flex gap-1.5">
            {([2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => update({ columns: n })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.columns === n ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>{n}</button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#999]">Toggle mensuel/annuel</span>
            <button onClick={() => update({ showToggle: !block.content.showToggle })} className={`${toggleClass} ${block.content.showToggle ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
              <div className={`${toggleDotClass} ${block.content.showToggle ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Plans ({plans.length})</label>
        {plans.map((plan, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removePlan(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={plan.name} onChange={(e) => updatePlan(i, "name", e.target.value)} placeholder="Nom du plan" className={inputClass} />
            <div className="flex gap-2">
              <input type="number" value={plan.price} onChange={(e) => updatePlan(i, "price", Number(e.target.value))} className={`${inputClass} w-24`} />
              <select value={plan.period} onChange={(e) => updatePlan(i, "period", e.target.value)} className={inputClass}>
                <option value="monthly">Mois</option>
                <option value="yearly">An</option>
              </select>
            </div>
            <input type="text" value={plan.description} onChange={(e) => updatePlan(i, "description", e.target.value)} placeholder="Description" className={inputClass} />
            <input type="text" value={plan.ctaLabel} onChange={(e) => updatePlan(i, "ctaLabel", e.target.value)} placeholder="Texte bouton" className={inputClass} />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#999]">Populaire</span>
              <button onClick={() => updatePlan(i, "isPopular", !plan.isPopular)} className={`${toggleClass} ${plan.isPopular ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
                <div className={`${toggleDotClass} ${plan.isPopular ? "translate-x-[18px]" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="block text-[10px] text-[#999] mb-1">Features (une par ligne)</label>
              <textarea
                value={plan.features.join("\n")}
                onChange={(e) => updatePlan(i, "features", e.target.value.split("\n"))}
                rows={3}
                className={inputClass}
                placeholder="Feature 1&#10;Feature 2"
              />
            </div>
          </div>
        ))}
        <button onClick={addPlan} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un plan</button>
      </div>
    </div>
  );
}
