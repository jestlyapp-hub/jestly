"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function Content3ArticlesBlockEditor({ block }: { block: Extract<Block, { type: "content-3articles" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const articles = block.content.articles;

  const updateArticle = (i: number, key: string, value: unknown) => {
    const next = articles.map((a, j) => (j === i ? { ...a, [key]: value } : a));
    update({ articles: next });
  };

  const addArticle = () => update({ articles: [...articles, { title: "Titre", excerpt: "Extrait...", imageUrl: "", category: "", date: "" }] });
  const removeArticle = (i: number) => update({ articles: articles.filter((_, j) => j !== i) });

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

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Articles ({articles.length})</label>
        {articles.map((a, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeArticle(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={a.title} onChange={(e) => updateArticle(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
            <textarea value={a.excerpt} onChange={(e) => updateArticle(i, "excerpt", e.target.value)} rows={2} placeholder="Extrait" className={inputClass} />
            <ImageUploader value={a.imageUrl} onChange={(url) => updateArticle(i, "imageUrl", url)} label="Image" />
            <input type="text" value={a.category ?? ""} onChange={(e) => updateArticle(i, "category", e.target.value)} placeholder="Catégorie" className={inputClass} />
            <input type="text" value={a.date ?? ""} onChange={(e) => updateArticle(i, "date", e.target.value)} placeholder="Date" className={inputClass} />
          </div>
        ))}
        <button onClick={addArticle} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un article</button>
      </div>
    </div>
  );
}
