"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ServicesSplitValueBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "services-split-value" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const pillars: {
    title: string;
    description: string;
  }[] = block.content.pillars ?? [];

  const updatePillar = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = pillars.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    update({ pillars: updated });
  };

  const addPillar = () => {
    update({
      pillars: [...pillars, { title: "", description: "" }],
    });
  };

  const removePillar = (index: number) => {
    update({ pillars: pillars.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Titre
        </label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Sous-titre
        </label>
        <input
          className={inputClass}
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Sous-titre"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Description
        </label>
        <textarea
          className={inputClass}
          rows={3}
          value={block.content.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Description détaillée"
        />
      </div>

      {/* Pillars array */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2">
          Piliers
        </label>

        {pillars.map((pillar, index) => (
          <div
            key={index}
            className="mb-3 p-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5A5A58]">
                Pilier {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removePillar(index)}
                className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>

            <input
              className={inputClass}
              value={pillar.title}
              onChange={(e) => updatePillar(index, "title", e.target.value)}
              placeholder="Titre du pilier"
            />

            <textarea
              className={inputClass}
              rows={2}
              value={pillar.description}
              onChange={(e) =>
                updatePillar(index, "description", e.target.value)
              }
              placeholder="Description du pilier"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addPillar}
          className="w-full py-2 text-[12px] font-medium text-[#4F46E5] border border-dashed border-[#4F46E5]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
        >
          + Ajouter un pilier
        </button>
      </div>
    </div>
  );
}
