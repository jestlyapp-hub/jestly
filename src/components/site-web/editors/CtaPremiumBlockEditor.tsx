"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function CtaPremiumBlockEditor({ block }: { block: Extract<Block, { type: "cta-premium" }> }) {
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
        <label className="block text-[11px] font-medium text-[#999] mb-1">Image de fond (URL)</label>
        <input type="text" value={block.content.backgroundImageUrl ?? ""} onChange={(e) => update({ backgroundImageUrl: e.target.value })} placeholder="https://..." className={inputClass} />
      </div>

      <div className="border-t border-[#E6E6E4] pt-3">
        <label className="block text-[11px] font-medium text-[#999] mb-1">Bouton principal</label>
        <input type="text" value={block.content.primaryCtaLabel} onChange={(e) => update({ primaryCtaLabel: e.target.value })} className={inputClass} />
        <div className="mt-2">
          <LinkEditor label="Lien principal" value={block.content.primaryBlockLink} onChange={(link: BlockLink) => update({ primaryBlockLink: link })} />
        </div>
      </div>

      <div className="border-t border-[#E6E6E4] pt-3">
        <label className="block text-[11px] font-medium text-[#999] mb-1">Bouton secondaire (optionnel)</label>
        <input type="text" value={block.content.secondaryCtaLabel ?? ""} onChange={(e) => update({ secondaryCtaLabel: e.target.value })} placeholder="Texte bouton secondaire" className={inputClass} />
        {block.content.secondaryCtaLabel && (
          <div className="mt-2">
            <LinkEditor label="Lien secondaire" value={block.content.secondaryBlockLink} onChange={(link: BlockLink) => update({ secondaryBlockLink: link })} />
          </div>
        )}
      </div>
    </div>
  );
}
