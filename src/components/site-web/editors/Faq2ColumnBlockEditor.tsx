"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function Faq2ColumnBlockEditor({ block }: { block: Extract<Block, { type: "faq-2column" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...block.content.items];
    items[index] = { ...items[index], [field]: value };
    update({ items });
  };

  const addItem = () => {
    update({ items: [...block.content.items, { question: "Nouvelle question ?", answer: "Réponse..." }] });
  };

  const removeItem = (index: number) => {
    const items = block.content.items.filter((_, i) => i !== index);
    update({ items });
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
      {block.content.items.map((item, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-[#999] uppercase">Question {i + 1}</div>
            <button onClick={() => removeItem(i)} className="text-[11px] text-red-400 hover:text-red-600">Supprimer</button>
          </div>
          <input type="text" value={item.question} onChange={(e) => updateItem(i, "question", e.target.value)} placeholder="Question" className={inputClass} />
          <textarea value={item.answer} onChange={(e) => updateItem(i, "answer", e.target.value)} rows={2} placeholder="Réponse" className={inputClass} />
        </div>
      ))}
      <button onClick={addItem} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter une question</button>
    </div>
  );
}
