"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function NumbersImpactBlockEditor({ block }: { block: Extract<Block, { type: "numbers-impact" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const stats = block.content.stats ?? [];

  const updateStat = (index: number, field: string, value: string) => {
    const updated = stats.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    update({ stats: updated });
  };

  const addStat = () => {
    update({ stats: [...stats, { value: "", label: "", context: "" }] });
  };

  const removeStat = (index: number) => {
    update({ stats: stats.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section (optionnel)"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <input
          className={inputClass}
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Sous-titre (optionnel)"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Statistiques</label>
        {stats.map((stat, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Stat {index + 1}</span>
              <button
                type="button"
                onClick={() => removeStat(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={stat.value}
              onChange={(e) => updateStat(index, "value", e.target.value)}
              placeholder="Valeur (ex: 150+)"
            />
            <input
              className={inputClass}
              value={stat.label}
              onChange={(e) => updateStat(index, "label", e.target.value)}
              placeholder="Label (ex: Clients satisfaits)"
            />
            <input
              className={inputClass}
              value={stat.context ?? ""}
              onChange={(e) => updateStat(index, "context", e.target.value)}
              placeholder="Contexte (optionnel)"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addStat}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter une statistique
        </button>
      </div>
    </div>
  );
}
