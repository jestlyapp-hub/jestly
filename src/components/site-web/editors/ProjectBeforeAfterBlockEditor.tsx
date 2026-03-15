"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProjectBeforeAfterBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "project-before-after" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({
      type: "UPDATE_BLOCK_CONTENT",
      blockId: block.id,
      content,
    });

  const updateItem = (index: number, field: string, value: unknown) => {
    const items = [...block.content.items];
    items[index] = { ...items[index], [field]: value };
    update({ items });
  };

  const addItem = () => {
    update({
      items: [
        ...block.content.items,
        {
          beforeLabel: "Avant",
          afterLabel: "Apres",
          beforeImageUrl: "",
          afterImageUrl: "",
          resultText: "",
          metricBadge: "",
          description: "",
          category: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    update({
      items: block.content.items.filter(
        (_: unknown, i: number) => i !== index,
      ),
    });
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Titre
        </label>
        <input
          type="text"
          value={block.content.title}
          onChange={(e) => update({ title: e.target.value })}
          className={inputClass}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Sous-titre
        </label>
        <textarea
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          rows={2}
          className={inputClass}
        />
      </div>

      {/* Linked project hint */}
      <div className="p-2.5 rounded-lg border border-dashed border-[#E6E6E4] bg-[#FBFBFA]">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          <span className="text-[11px] text-[#8A8A88]">Lier a un projet Jestly (bientot disponible)</span>
        </div>
      </div>

      {/* Items */}
      <label className="block text-[12px] font-medium text-[#5A5A58]">
        Transformations
      </label>
      {block.content.items.map(
        (
          item: {
            beforeLabel: string;
            afterLabel: string;
            beforeImageUrl?: string;
            afterImageUrl?: string;
            resultText: string;
            metricBadge?: string;
            description: string;
            category?: string;
          },
          i: number,
        ) => (
          <div
            key={i}
            className="p-3 rounded-lg border border-[#E6E6E4] space-y-2.5 bg-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#5A5A58]">
                Transformation {i + 1}
              </span>
              {block.content.items.length > 1 && (
                <button
                  onClick={() => removeItem(i)}
                  className="text-[11px] text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              )}
            </div>

            {/* Category */}
            <input
              type="text"
              value={item.category ?? ""}
              onChange={(e) => updateItem(i, "category", e.target.value)}
              placeholder="Categorie (ex: Branding, Web, Video)"
              className={inputClass}
            />

            {/* Before section */}
            <div
              className="p-2.5 rounded-lg"
              style={{
                backgroundColor: "#F7F7F5",
                border: "1px solid #E6E6E4",
              }}
            >
              <span className="block text-[10px] font-semibold text-[#999] uppercase tracking-wider mb-2">
                Avant
              </span>
              <ImageUploader
                value={item.beforeImageUrl}
                onChange={(url) => updateItem(i, "beforeImageUrl", url)}
                label="Image avant"
                previewAspect="4 / 3"
              />
              <div className="mt-2">
                <input
                  type="text"
                  value={item.beforeLabel}
                  onChange={(e) =>
                    updateItem(i, "beforeLabel", e.target.value)
                  }
                  placeholder="Label avant"
                  className={inputClass}
                />
              </div>
            </div>

            {/* After section */}
            <div
              className="p-2.5 rounded-lg"
              style={{
                backgroundColor: "#EEF2FF",
                border: "1px solid #C7D2FE",
              }}
            >
              <span className="block text-[10px] font-semibold text-[#4F46E5] uppercase tracking-wider mb-2">
                Apres
              </span>
              <ImageUploader
                value={item.afterImageUrl}
                onChange={(url) => updateItem(i, "afterImageUrl", url)}
                label="Image apres"
                previewAspect="4 / 3"
              />
              <div className="mt-2">
                <input
                  type="text"
                  value={item.afterLabel}
                  onChange={(e) =>
                    updateItem(i, "afterLabel", e.target.value)
                  }
                  placeholder="Label apres"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Result */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-[#999] mb-1">
                  Badge metrique
                </label>
                <input
                  type="text"
                  value={item.metricBadge ?? ""}
                  onChange={(e) =>
                    updateItem(i, "metricBadge", e.target.value)
                  }
                  placeholder="ex: +250%"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[#999] mb-1">
                  Resultat
                </label>
                <input
                  type="text"
                  value={item.resultText}
                  onChange={(e) =>
                    updateItem(i, "resultText", e.target.value)
                  }
                  placeholder="ex: +250% de leads"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Description */}
            <textarea
              value={item.description}
              onChange={(e) =>
                updateItem(i, "description", e.target.value)
              }
              placeholder="Description de la transformation"
              rows={2}
              className={inputClass}
            />
          </div>
        ),
      )}

      <button
        onClick={addItem}
        className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[12px] font-medium text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
      >
        + Ajouter une transformation
      </button>
    </div>
  );
}
