"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function VideoTextSplitBlockEditor({ block }: { block: Extract<Block, { type: "video-text-split" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">URL video</label>
        <input type="text" value={block.content.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="YouTube, Vimeo ou MP4" className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Position de la video</label>
        <div className="flex gap-1.5">
          {(["left", "right"] as const).map((pos) => (
            <button key={pos} onClick={() => update({ videoPosition: pos })} className={`px-3 py-1.5 rounded-lg text-[12px] font-medium ${block.content.videoPosition === pos ? "bg-[#4F46E5] text-white" : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"}`}>
              {pos === "left" ? "Gauche" : "Droite"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea value={block.content.description} onChange={(e) => update({ description: e.target.value })} rows={3} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton (optionnel)</label>
        <input type="text" value={block.content.ctaLabel ?? ""} onChange={(e) => update({ ctaLabel: e.target.value })} placeholder="En savoir plus" className={inputClass} />
      </div>
      {block.content.ctaLabel && (
        <LinkEditor label="Lien du bouton" value={block.content.blockLink} onChange={(blockLink: BlockLink) => update({ blockLink })} />
      )}
    </div>
  );
}
