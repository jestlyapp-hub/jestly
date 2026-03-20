"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProjectTimelineBlockEditor({ block }: { block: Extract<Block, { type: "project-timeline" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateStep = (index: number, field: string, value: unknown) => {
    const steps = [...block.content.steps];
    steps[index] = { ...steps[index], [field]: value };
    update({ steps });
  };

  const addStep = () => {
    update({ steps: [...block.content.steps, { title: "Nouvelle étape", description: "", tag: "" }] });
  };

  const removeStep = (index: number) => {
    const steps = block.content.steps.filter((_: unknown, i: number) => i !== index);
    update({ steps });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea value={block.content.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} rows={2} className={inputClass} />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Résumé du résultat</label>
        <input type="text" value={block.content.resultSummary ?? ""} onChange={(e) => update({ resultSummary: e.target.value })} placeholder="Ex: +150% de conversion" className={inputClass} />
      </div>

      {/* Linked project hint */}
      <div className="p-2.5 rounded-lg border border-dashed border-[#E6E6E4] bg-[#FBFBFA]">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          <span className="text-[11px] text-[#8A8A88]">Lier a un projet Jestly (bientot disponible)</span>
        </div>
      </div>

      {/* Steps */}
      {block.content.steps.map((step: { title: string; description: string; tag?: string }, i: number) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-[#999] uppercase">Étape {i + 1}</div>
            {block.content.steps.length > 1 && (
              <button onClick={() => removeStep(i)} className="text-[10px] text-[#999] hover:text-red-500">&times;</button>
            )}
          </div>
          <input type="text" value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
          <input type="text" value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} placeholder="Description" className={inputClass} />
          <input type="text" value={step.tag ?? ""} onChange={(e) => updateStep(i, "tag", e.target.value)} placeholder="Tag (optionnel)" className={inputClass} />
        </div>
      ))}
      <button onClick={addStep} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter une étape</button>
    </div>
  );
}
