"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function StatsCounterBlockEditor({ block }: { block: Extract<Block, { type: "stats-counter" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const updateStat = (index: number, field: string, value: string) => {
    const stats = [...block.content.stats];
    stats[index] = { ...stats[index], [field]: value };
    update({ stats });
  };

  const addStat = () => {
    update({ stats: [...block.content.stats, { value: "0", label: "Nouveau" }] });
  };

  return (
    <div className="space-y-3">
      {block.content.stats.map((stat, i) => (
        <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
          <div className="text-[10px] font-semibold text-[#999] uppercase">Stat {i + 1}</div>
          <input type="text" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Valeur" className={inputClass} />
          <input type="text" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label" className={inputClass} />
        </div>
      ))}
      <button onClick={addStat} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter une stat</button>
    </div>
  );
}
