"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function FaqAdvancedBlockEditor({ block }: { block: Extract<Block, { type: "faq-advanced" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const items = block.content.items;

  const updateItem = (i: number, field: string, value: string) => {
    const next = items.map((item, j) => (j === i ? { ...item, [field]: value } : item));
    update({ items: next });
  };

  const addItem = () => update({ items: [...items, { question: "Nouvelle question ?", answer: "Réponse..." }] });
  const removeItem = (i: number) => update({ items: items.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px] text-[#666]">Utiliser la FAQ globale</span>
          <p className="text-[10px] text-[#BBB]">Afficher les questions du workspace</p>
        </div>
        <button onClick={() => update({ useGlobal: !block.content.useGlobal })} className={`${toggleClass} ${block.content.useGlobal ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.useGlobal ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      {block.content.useGlobal && (
        <div className="bg-[#EEF2FF] rounded-lg px-3 py-2 text-[11px] text-[#4F46E5]">
          Les questions sont gérées depuis les paramètres du workspace.
        </div>
      )}

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder="FAQ" className={inputClass} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Ouvrir plusieurs à la fois</span>
        <button onClick={() => update({ allowMultiple: !block.content.allowMultiple })} className={`${toggleClass} ${block.content.allowMultiple ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.allowMultiple ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      {!block.content.useGlobal && (
        <div className="space-y-3">
          <label className="block text-[11px] font-medium text-[#999]">Questions ({items.length})</label>
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
              <button onClick={() => removeItem(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
              <input type="text" value={item.question} onChange={(e) => updateItem(i, "question", e.target.value)} placeholder="Question" className={inputClass} />
              <textarea value={item.answer} onChange={(e) => updateItem(i, "answer", e.target.value)} rows={2} placeholder="Réponse" className={inputClass} />
            </div>
          ))}
          <button onClick={addItem} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter une question</button>
        </div>
      )}
    </div>
  );
}
