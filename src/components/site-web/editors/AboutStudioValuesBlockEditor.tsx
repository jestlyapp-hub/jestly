"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function AboutStudioValuesBlockEditor({ block }: { block: Extract<Block, { type: "about-studio-values" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateValue = (index: number, field: string, value: string) => {
    const values = [...block.content.values];
    values[index] = { ...values[index], [field]: value };
    update({ values });
  };

  const addValue = () => {
    update({ values: [...block.content.values, { title: "Nouvelle valeur", description: "Description", icon: "" }] });
  };

  const removeValue = (index: number) => {
    const values = block.content.values.filter((_, i) => i !== index);
    update({ values });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <input type="text" value={block.content.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Note équipe</label>
        <textarea value={block.content.teamNote ?? ""} onChange={(e) => update({ teamNote: e.target.value })} rows={2} placeholder="Note sur l'équipe..." className={inputClass} />
      </div>
      {block.content.values.map((v, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-[#999] uppercase">Valeur {i + 1}</div>
            <button onClick={() => removeValue(i)} className="text-[11px] text-red-400 hover:text-red-600">Supprimer</button>
          </div>
          <input type="text" value={v.icon ?? ""} onChange={(e) => updateValue(i, "icon", e.target.value)} placeholder="Icône (emoji ou nom)" className={inputClass} />
          <input type="text" value={v.title} onChange={(e) => updateValue(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
          <textarea value={v.description} onChange={(e) => updateValue(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
        </div>
      ))}
      <button onClick={addValue} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter une valeur</button>
    </div>
  );
}
