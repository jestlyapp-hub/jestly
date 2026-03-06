"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function PortfolioMasonryBlockEditor({ block }: { block: Extract<Block, { type: "portfolio-masonry" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const items = block.content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    update({ items: updated });
  };

  const addItem = () => {
    update({ items: [...items, { imageUrl: "", title: "", category: "", description: "" }] });
  };

  const removeItem = (index: number) => {
    update({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre du portfolio"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea
          className={inputClass}
          rows={2}
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Sous-titre"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Colonnes</label>
        <select
          className={inputClass}
          value={block.content.columns ?? 3}
          onChange={(e) => update({ columns: Number(e.target.value) as 2 | 3 })}
        >
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Items</label>
        {items.map((item, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Item {index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={item.imageUrl}
              onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
              placeholder="URL de l'image"
            />
            <input
              className={inputClass}
              value={item.title}
              onChange={(e) => updateItem(index, "title", e.target.value)}
              placeholder="Titre"
            />
            <input
              className={inputClass}
              value={item.category}
              onChange={(e) => updateItem(index, "category", e.target.value)}
              placeholder="Categorie"
            />
            <textarea
              className={inputClass}
              rows={2}
              value={item.description ?? ""}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              placeholder="Description (optionnel)"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter un item
        </button>
      </div>
    </div>
  );
}
