"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

type BeforeAfterProBlock = Extract<Block, { type: "before-after-pro" }>;

interface BeforeAfterItem {
  beforeImageUrl: string;
  afterImageUrl: string;
  label: string;
}

export default function BeforeAfterProBlockEditor({ block }: { block: BeforeAfterProBlock }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    title?: string;
    subtitle?: string;
    items: BeforeAfterItem[];
    layout: "slider" | "side-by-side";
  };

  const items = c.items ?? [];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={c.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea
          className={inputClass + " resize-none"}
          rows={2}
          value={c.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Description courte"
        />
      </div>

      {/* Layout */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Disposition</label>
        <select
          className={inputClass}
          value={c.layout ?? "slider"}
          onChange={(e) => update({ layout: e.target.value })}
        >
          <option value="slider">Slider</option>
          <option value="side-by-side">Cote a cote</option>
        </select>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium text-[#5A5A58]">Comparaisons</label>
          <button
            type="button"
            className="text-[12px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
            onClick={() =>
              update({
                items: [...items, { label: "", beforeImageUrl: "", afterImageUrl: "" }],
              })
            }
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#5A5A58]">
                  Comparaison {i + 1}
                </span>
                <button
                  type="button"
                  className="text-[12px] text-red-500 hover:text-red-700"
                  onClick={() => {
                    const next = items.filter((_, j) => j !== i);
                    update({ items: next });
                  }}
                >
                  Supprimer
                </button>
              </div>

              <input
                className={inputClass}
                value={item.label}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], label: e.target.value };
                  update({ items: next });
                }}
                placeholder="Label (ex: Retouche portrait)"
              />
              <ImageUploader
                value={item.beforeImageUrl}
                onChange={(url) => {
                  const next = [...items];
                  next[i] = { ...next[i], beforeImageUrl: url };
                  update({ items: next });
                }}
                label="Image avant"
                previewAspect="16 / 9"
              />
              <ImageUploader
                value={item.afterImageUrl}
                onChange={(url) => {
                  const next = [...items];
                  next[i] = { ...next[i], afterImageUrl: url };
                  update({ items: next });
                }}
                label="Image apres"
                previewAspect="16 / 9"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
