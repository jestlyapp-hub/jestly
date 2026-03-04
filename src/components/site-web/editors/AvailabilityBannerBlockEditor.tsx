"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink, AvailabilityStatus } from "@/types";
import LinkEditor from "./LinkEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function AvailabilityBannerBlockEditor({ block }: { block: Extract<Block, { type: "availability-banner" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Statut</label>
        <select
          value={block.content.status}
          onChange={(e) => update({ status: e.target.value as AvailabilityStatus })}
          className={inputClass}
        >
          <option value="open">Disponible</option>
          <option value="limited">Limite</option>
          <option value="closed">Complet</option>
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Message</label>
        <input type="text" value={block.content.message} onChange={(e) => update({ message: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du CTA (optionnel)</label>
        <input type="text" value={block.content.ctaLabel ?? ""} onChange={(e) => update({ ctaLabel: e.target.value })} placeholder="Me contacter" className={inputClass} />
      </div>
      <LinkEditor
        label="Lien du CTA"
        value={block.content.blockLink}
        onChange={(blockLink: BlockLink) => update({ blockLink })}
      />
    </div>
  );
}
