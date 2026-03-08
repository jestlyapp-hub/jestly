"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ContentComparisonWhyBlockEditor({ block }: { block: Extract<Block, { type: "content-comparison-why" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

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

      <div className="rounded-lg border border-[#E6E6E4] p-3 space-y-2">
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Colonne gauche — Titre</label>
        <input type="text" value={block.content.leftColumn.title} onChange={(e) => update({ leftColumn: { ...block.content.leftColumn, title: e.target.value } })} className={inputClass} />
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Éléments (un par ligne)</label>
        <textarea
          value={block.content.leftColumn.items.join("\n")}
          onChange={(e) => update({ leftColumn: { ...block.content.leftColumn, items: e.target.value.split("\n").filter((s) => s.trim()) } })}
          rows={4}
          className={inputClass}
        />
      </div>

      <div className="rounded-lg border border-[#E6E6E4] p-3 space-y-2">
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Colonne droite — Titre</label>
        <input type="text" value={block.content.rightColumn.title} onChange={(e) => update({ rightColumn: { ...block.content.rightColumn, title: e.target.value } })} className={inputClass} />
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Éléments (un par ligne)</label>
        <textarea
          value={block.content.rightColumn.items.join("\n")}
          onChange={(e) => update({ rightColumn: { ...block.content.rightColumn, items: e.target.value.split("\n").filter((s) => s.trim()) } })}
          rows={4}
          className={inputClass}
        />
      </div>
    </div>
  );
}
