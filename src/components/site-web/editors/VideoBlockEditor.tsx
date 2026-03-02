"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function VideoBlockEditor({ block }: { block: Extract<Block, { type: "video" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">URL de la vidéo</label>
        <input type="text" value={block.content.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="https://youtube.com/..." className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Légende</label>
        <input type="text" value={block.content.caption || ""} onChange={(e) => update({ caption: e.target.value })} className={inputClass} />
      </div>
    </div>
  );
}
