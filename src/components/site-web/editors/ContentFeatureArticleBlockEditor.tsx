"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ContentFeatureArticleBlockEditor({ block }: { block: Extract<Block, { type: "content-feature-article" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Extrait</label>
        <textarea value={block.content.excerpt} onChange={(e) => update({ excerpt: e.target.value })} rows={3} className={inputClass} />
      </div>
      <ImageUploader value={block.content.imageUrl} onChange={(url) => update({ imageUrl: url })} label="Image" />
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Catégorie</label>
        <input type="text" value={block.content.category ?? ""} onChange={(e) => update({ category: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Date</label>
        <input type="text" value={block.content.date ?? ""} onChange={(e) => update({ date: e.target.value })} className={inputClass} />
      </div>
    </div>
  );
}
