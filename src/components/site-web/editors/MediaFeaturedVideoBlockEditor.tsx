"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function MediaFeaturedVideoBlockEditor({ block }: { block: Extract<Block, { type: "media-featured-video" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const secondaryVideos = block.content.secondaryVideos ?? [];

  const updateSecondary = (i: number, key: string, value: unknown) => {
    const next = secondaryVideos.map((v, j) => (j === i ? { ...v, [key]: value } : v));
    update({ secondaryVideos: next });
  };

  const addSecondary = () => update({ secondaryVideos: [...secondaryVideos, { title: "Vidéo", thumbnailUrl: "" }] });
  const removeSecondary = (i: number) => update({ secondaryVideos: secondaryVideos.filter((_, j) => j !== i) });

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
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">URL de la vidéo</label>
        <input type="text" value={block.content.videoUrl ?? ""} onChange={(e) => update({ videoUrl: e.target.value })} className={inputClass} />
      </div>
      <ImageUploader value={block.content.thumbnailUrl ?? ""} onChange={(url) => update({ thumbnailUrl: url })} label="Vignette" />

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Vidéos secondaires ({secondaryVideos.length})</label>
        {secondaryVideos.map((v, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeSecondary(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={v.title} onChange={(e) => updateSecondary(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
            <ImageUploader value={v.thumbnailUrl ?? ""} onChange={(url) => updateSecondary(i, "thumbnailUrl", url)} label="Vignette" />
          </div>
        ))}
        <button onClick={addSecondary} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter une vidéo</button>
      </div>
    </div>
  );
}
