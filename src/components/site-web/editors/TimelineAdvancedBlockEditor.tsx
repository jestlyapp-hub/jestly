"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function TimelineAdvancedBlockEditor({ block }: { block: Extract<Block, { type: "timeline-advanced" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const steps = block.content.steps;

  const updateStep = (i: number, field: string, value: string) => {
    const next = steps.map((s, j) => (j === i ? { ...s, [field]: value } : s));
    update({ steps: next });
  };

  const addStep = () => update({ steps: [...steps, { title: "Nouvelle étape", description: "Description..." }] });
  const removeStep = (i: number) => update({ steps: steps.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Orientation</label>
        <div className="flex gap-1.5">
          {(["vertical", "horizontal"] as const).map((o) => (
            <button key={o} onClick={() => update({ orientation: o })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.orientation === o ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>
              {o === "vertical" ? "Vertical" : "Horizontal"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Étapes ({steps.length})</label>
        {steps.map((step, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeStep(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
              <input type="text" value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
            </div>
            <textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
          </div>
        ))}
        <button onClick={addStep} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter une étape</button>
      </div>
    </div>
  );
}
