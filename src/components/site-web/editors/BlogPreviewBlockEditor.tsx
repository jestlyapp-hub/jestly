"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function BlogPreviewBlockEditor({ block }: { block: Extract<Block, { type: "blog-preview" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const posts = block.content.posts;

  const updatePost = (i: number, field: string, value: string) => {
    const next = posts.map((p, j) => (j === i ? { ...p, [field]: value } : p));
    update({ posts: next });
  };

  const addPost = () => update({ posts: [...posts, { title: "Nouvel article", excerpt: "Résumé...", date: new Date().toISOString().slice(0, 10) }] });
  const removePost = (i: number) => update({ posts: posts.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre de section</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
        <div className="flex gap-1.5">
          {([2, 3] as const).map((n) => (
            <button key={n} onClick={() => update({ columns: n })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.columns === n ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>{n}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Articles ({posts.length})</label>
        {posts.map((post, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removePost(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={post.title} onChange={(e) => updatePost(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
            <textarea value={post.excerpt} onChange={(e) => updatePost(i, "excerpt", e.target.value)} rows={2} placeholder="Résumé" className={inputClass} />
            <ImageUploader value={post.imageUrl ?? ""} onChange={(url) => updatePost(i, "imageUrl", url)} label="Image" />
            <input type="date" value={post.date} onChange={(e) => updatePost(i, "date", e.target.value)} className={`${inputClass} w-36`} />
          </div>
        ))}
        <button onClick={addPost} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un article</button>
      </div>
    </div>
  );
}
