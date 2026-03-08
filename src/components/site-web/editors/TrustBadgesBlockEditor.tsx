"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function TrustBadgesBlockEditor({ block }: { block: Extract<Block, { type: "trust-badges" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const badges = block.content.badges;

  const updateBadge = (i: number, key: string, value: unknown) => {
    const next = badges.map((b, j) => (j === i ? { ...b, [key]: value } : b));
    update({ badges: next });
  };

  const addBadge = () => update({ badges: [...badges, { icon: "shield", title: "Badge", description: "Description" }] });
  const removeBadge = (i: number) => update({ badges: badges.filter((_, j) => j !== i) });

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Badges ({badges.length})</label>
        {badges.map((b, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeBadge(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <input type="text" value={b.icon} onChange={(e) => updateBadge(i, "icon", e.target.value)} placeholder="Icône" className={inputClass} />
            <input type="text" value={b.title} onChange={(e) => updateBadge(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
            <textarea value={b.description} onChange={(e) => updateBadge(i, "description", e.target.value)} rows={2} placeholder="Description" className={inputClass} />
          </div>
        ))}
        <button onClick={addBadge} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter un badge</button>
      </div>
    </div>
  );
}
