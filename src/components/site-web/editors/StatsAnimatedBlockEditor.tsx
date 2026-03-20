"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function StatsAnimatedBlockEditor({ block }: { block: Extract<Block, { type: "stats-animated" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });
  const stats = block.content.stats;

  const updateStat = (i: number, field: string, value: unknown) => {
    const next = stats.map((s, j) => (j === i ? { ...s, [field]: value } : s));
    update({ stats: next });
  };

  const addStat = () => update({ stats: [...stats, { value: 0, suffix: "", label: "Label" }] });
  const removeStat = (i: number) => update({ stats: stats.filter((_, j) => j !== i) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Animer au scroll</span>
        <button onClick={() => update({ animateOnScroll: !block.content.animateOnScroll })} className={`${toggleClass} ${block.content.animateOnScroll ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}>
          <div className={`${toggleDotClass} ${block.content.animateOnScroll ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-[11px] font-medium text-[#999]">Statistiques ({stats.length})</label>
        {stats.map((s, i) => (
          <div key={i} className="rounded-lg border border-[#E6E6E4] p-3 space-y-2 relative">
            <button onClick={() => removeStat(i)} className="absolute top-2 right-2 text-[#999] hover:text-red-500 text-[16px] leading-none">&times;</button>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[10px] text-[#999] mb-0.5">Valeur</label>
                <input type="number" value={s.value} onChange={(e) => updateStat(i, "value", Number(e.target.value))} className={inputClass} />
              </div>
              <div className="w-20">
                <label className="block text-[10px] text-[#999] mb-0.5">Suffixe</label>
                <input type="text" value={s.suffix} onChange={(e) => updateStat(i, "suffix", e.target.value)} placeholder="%, +, k" className={inputClass} />
              </div>
            </div>
            <input type="text" value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label" className={inputClass} />
          </div>
        ))}
        <button onClick={addStat} className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">+ Ajouter une stat</button>
      </div>
    </div>
  );
}
