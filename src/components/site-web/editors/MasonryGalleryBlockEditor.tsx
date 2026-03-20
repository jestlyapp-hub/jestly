"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function MasonryGalleryBlockEditor({ block }: { block: Extract<Block, { type: "masonry-gallery" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const items = block.content.items;

  const updateItem = (i: number, field: string, value: string) => {
    const next = items.map((item, j) => (j === i ? { ...item, [field]: value } : item));
    update({ items: next });
  };

  const addItem = () => update({ items: [...items, { imageUrl: "", title: "" }] });
  const removeItem = (i: number) => update({ items: items.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
        <div className="flex gap-1.5">
          {([2, 3, 4] as const).map((n) => (
            <button key={n} onClick={() => update({ columns: n })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.columns === n ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Lightbox (plein écran)</span>
        <button onClick={() => update({ lightbox: !block.content.lightbox })} className={`${toggleClass} ${block.content.lightbox ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.lightbox ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Nombre max d&apos;images</label>
        <input
          type="number"
          min={1}
          max={24}
          value={block.content.maxImages ?? 12}
          onChange={(e) => update({ maxImages: Math.max(1, Math.min(24, parseInt(e.target.value) || 12)) })}
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Images ({items.length})</label>
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeItem(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <ImageUploader value={item.imageUrl} onChange={(url) => updateItem(i, "imageUrl", url)} label="Image" />
            <input type="text" value={item.title ?? ""} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder="Titre (optionnel)" className={inputClass} />
          </div>
        ))}
        <button onClick={addItem} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter une image</button>
      </div>
    </div>
  );
}
