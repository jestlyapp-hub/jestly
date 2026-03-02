"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function TimelineProcessBlockEditor({ block }: { block: Extract<Block, { type: "timeline-process" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateStep = (index: number, field: string, value: string) => {
    const steps = [...block.content.steps];
    steps[index] = { ...steps[index], [field]: value };
    update({ steps });
  };

  const addStep = () => {
    update({ steps: [...block.content.steps, { title: "Nouvelle étape", description: "Description" }] });
  };

  return (
    <div className="space-y-3">
      {block.content.steps.map((step, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E8F0] space-y-2">
          <div className="text-[10px] font-semibold text-[#999] uppercase">Étape {i + 1}</div>
          <input type="text" value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
          <textarea value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
        </div>
      ))}
      <button onClick={addStep} className="text-[12px] font-medium text-[#6a18f1] hover:underline">+ Ajouter une étape</button>
    </div>
  );
}
