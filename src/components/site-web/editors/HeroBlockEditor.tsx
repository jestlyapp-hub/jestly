"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, Link } from "@/types";
import LinkPicker from "./LinkPicker";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function HeroBlockEditor({ block }: { block: Extract<Block, { type: "hero" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Sous-titre</label>
        <textarea value={block.content.subtitle} onChange={(e) => update({ subtitle: e.target.value })} rows={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} className={inputClass} />
      </div>
      <LinkPicker
        label="Lien du bouton"
        value={block.content.link}
        onChange={(link: Link) => update({ link })}
      />
    </div>
  );
}
