"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function FullImageBlockEditor({ block }: { block: Extract<Block, { type: "full-image" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">URL de l&apos;image</label>
        <input type="text" value={block.content.imageUrl} onChange={(e) => update({ imageUrl: e.target.value })} placeholder="https://..." className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte alternatif</label>
        <input type="text" value={block.content.alt} onChange={(e) => update({ alt: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte superposé</label>
        <input type="text" value={block.content.overlayText || ""} onChange={(e) => update({ overlayText: e.target.value })} className={inputClass} />
      </div>
    </div>
  );
}
