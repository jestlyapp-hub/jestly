"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function WhyMeBlockEditor({ block }: { block: Extract<Block, { type: "why-me" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateReason = (index: number, field: string, value: string) => {
    const reasons = [...block.content.reasons];
    reasons[index] = { ...reasons[index], [field]: value };
    update({ reasons });
  };

  const addReason = () => {
    update({ reasons: [...block.content.reasons, { title: "Nouvelle raison", description: "Description" }] });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre de la section</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      {block.content.reasons.map((r, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E8F0] space-y-2">
          <div className="text-[10px] font-semibold text-[#999] uppercase">Raison {i + 1}</div>
          <input type="text" value={r.title} onChange={(e) => updateReason(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
          <textarea value={r.description} onChange={(e) => updateReason(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
        </div>
      ))}
      <button onClick={addReason} className="text-[12px] font-medium text-[#6a18f1] hover:underline">+ Ajouter une raison</button>
    </div>
  );
}
