"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function SocialProofMarqueeBlockEditor({ block }: { block: Extract<Block, { type: "social-proof-marquee" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const items = block.content.items;

  const updateItem = (i: number, key: string, value: unknown) => {
    const next = items.map((item, j) => (j === i ? { ...item, [key]: value } : item));
    update({ items: next });
  };

  const addItem = () => update({ items: [...items, { text: "Témoignage...", name: "Nom", result: "" }] });
  const removeItem = (i: number) => update({ items: items.filter((_, j) => j !== i) });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Vitesse</label>
        <input type="number" value={block.content.speed ?? 30} onChange={(e) => update({ speed: Number(e.target.value) })} className={inputClass} />
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Éléments ({items.length})</label>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeItem(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <textarea value={item.text} onChange={(e) => updateItem(i, "text", e.target.value)} rows={2} placeholder="Texte" className={inputClass} />
            <input type="text" value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="Nom" className={inputClass} />
            <input type="text" value={item.result ?? ""} onChange={(e) => updateItem(i, "result", e.target.value)} placeholder="Résultat" className={inputClass} />
          </div>
        ))}
        <button onClick={addItem} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un élément</button>
      </div>
    </div>
  );
}
