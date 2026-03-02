"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function NewsletterBlockEditor({ block }: { block: Extract<Block, { type: "newsletter" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea value={block.content.description} onChange={(e) => update({ description: e.target.value })} rows={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Placeholder</label>
        <input type="text" value={block.content.placeholder} onChange={(e) => update({ placeholder: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.buttonLabel} onChange={(e) => update({ buttonLabel: e.target.value })} className={inputClass} />
      </div>
    </div>
  );
}
