"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function BeforeAfterBlockEditor({ block }: { block: Extract<Block, { type: "before-after" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <ImageUploader
        value={block.content.beforeImageUrl}
        onChange={(url) => update({ beforeImageUrl: url })}
        label="Image Avant"
        previewAspect="16 / 9"
      />
      <ImageUploader
        value={block.content.afterImageUrl}
        onChange={(url) => update({ afterImageUrl: url })}
        label="Image Apres"
        previewAspect="16 / 9"
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-[#999] mb-1">Label Avant</label>
          <input type="text" value={block.content.beforeLabel} onChange={(e) => update({ beforeLabel: e.target.value })} className={inputClass} />
        </div>
        <div className="flex-1">
          <label className="block text-[11px] font-medium text-[#999] mb-1">Label Après</label>
          <input type="text" value={block.content.afterLabel} onChange={(e) => update({ afterLabel: e.target.value })} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Position initiale ({block.content.initialPosition}%)</label>
        <input
          type="range"
          min={10}
          max={90}
          value={block.content.initialPosition}
          onChange={(e) => update({ initialPosition: Number(e.target.value) })}
          className="w-full accent-[#4F46E5]"
        />
      </div>
    </div>
  );
}
