"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, Link } from "@/types";
import LinkPicker from "./LinkPicker";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function FullImageBlockEditor({ block }: { block: Extract<Block, { type: "full-image" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <ImageUploader value={block.content.imageUrl} onChange={(url) => update({ imageUrl: url })} label="Image" />
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte alternatif</label>
        <input type="text" value={block.content.alt} onChange={(e) => update({ alt: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte superposé</label>
        <input type="text" value={block.content.overlayText || ""} onChange={(e) => update({ overlayText: e.target.value })} className={inputClass} />
      </div>
      <LinkPicker
        label="Lien au clic"
        value={block.content.link}
        onChange={(link: Link) => update({ link })}
      />
    </div>
  );
}
