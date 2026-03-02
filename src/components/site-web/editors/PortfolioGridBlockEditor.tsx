"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, Link } from "@/types";
import LinkPicker from "./LinkPicker";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function PortfolioGridBlockEditor({ block }: { block: Extract<Block, { type: "portfolio-grid" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateItem = (index: number, field: string, value: unknown) => {
    const items = [...block.content.items];
    items[index] = { ...items[index], [field]: value };
    update({ items });
  };

  const addItem = () => {
    update({ items: [...block.content.items, { title: "Nouveau projet", imageUrl: "", category: "Design" }] });
  };

  const removeItem = (index: number) => {
    const items = block.content.items.filter((_, i) => i !== index);
    update({ items });
  };

  const categories = block.content.categories ?? [];

  const addCategory = () => {
    update({ categories: [...categories, "Nouvelle catégorie"] });
  };

  const updateCategory = (i: number, value: string) => {
    const next = [...categories];
    next[i] = value;
    update({ categories: next });
  };

  const removeCategory = (i: number) => {
    update({ categories: categories.filter((_: string, j: number) => j !== i) });
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

      {/* Toggles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Afficher le filtre</span>
          <button onClick={() => update({ showFilter: !block.content.showFilter })} className={`${toggleClass} ${block.content.showFilter ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
            <div className={`${toggleDotClass} ${block.content.showFilter ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Lien détail projet</span>
          <button onClick={() => update({ showDetailLink: !block.content.showDetailLink })} className={`${toggleClass} ${block.content.showDetailLink ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
            <div className={`${toggleDotClass} ${block.content.showDetailLink ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Barre de recherche</span>
          <button onClick={() => update({ showSearch: !block.content.showSearch })} className={`${toggleClass} ${block.content.showSearch ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
            <div className={`${toggleDotClass} ${block.content.showSearch ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="border-t border-[#E6E6E4] pt-3">
        <label className="block text-[11px] font-medium text-[#999] mb-2">Catégories ({categories.length})</label>
        {categories.map((cat: string, i: number) => (
          <div key={i} className="flex gap-1.5 mb-1.5">
            <input type="text" value={cat} onChange={(e) => updateCategory(i, e.target.value)} className={`${inputClass} flex-1`} />
            <button onClick={() => removeCategory(i)} className="text-[#999] hover:text-red-500 text-sm px-1">&times;</button>
          </div>
        ))}
        <button onClick={addCategory} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter une catégorie</button>
      </div>

      {/* Items */}
      {block.content.items.map((item, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-semibold text-[#999] uppercase">Projet {i + 1}</div>
            {block.content.items.length > 1 && (
              <button onClick={() => removeItem(i)} className="text-[10px] text-[#999] hover:text-red-500">&times;</button>
            )}
          </div>
          <input type="text" value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
          <input type="text" value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)} placeholder="Catégorie" className={inputClass} />
          <input type="text" value={item.slug ?? ""} onChange={(e) => updateItem(i, "slug", e.target.value)} placeholder="Slug (ex: mon-projet)" className={inputClass} />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#666]">En vedette</span>
            <button onClick={() => updateItem(i, "featured", !item.featured)} className={`${toggleClass} ${item.featured ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
              <div className={`${toggleDotClass} ${item.featured ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </button>
          </div>
          <LinkPicker
            label="Lien"
            value={item.link}
            onChange={(link: Link) => updateItem(i, "link", link)}
          />
        </div>
      ))}
      <button onClick={addItem} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un projet</button>
    </div>
  );
}
