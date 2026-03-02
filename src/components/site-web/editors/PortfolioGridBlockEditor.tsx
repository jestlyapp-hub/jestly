"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function PortfolioGridBlockEditor({ block }: { block: Extract<Block, { type: "portfolio-grid" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateItem = (index: number, field: string, value: string) => {
    const items = [...block.content.items];
    items[index] = { ...items[index], [field]: value };
    update({ items });
  };

  const addItem = () => {
    update({ items: [...block.content.items, { title: "Nouveau projet", imageUrl: "", category: "Design" }] });
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
        <select value={block.content.columns} onChange={(e) => update({ columns: parseInt(e.target.value) })} className={inputClass}>
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
          <option value={4}>4 colonnes</option>
        </select>
      </div>
      {block.content.items.map((item, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E8F0] space-y-2">
          <div className="text-[10px] font-semibold text-[#999] uppercase">Projet {i + 1}</div>
          <input type="text" value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
          <input type="text" value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)} placeholder="Catégorie" className={inputClass} />
        </div>
      ))}
      <button onClick={addItem} className="text-[12px] font-medium text-[#6a18f1] hover:underline">+ Ajouter un projet</button>
    </div>
  );
}
