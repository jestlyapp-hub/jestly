"use client";

import { useCallback } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block, PortfolioCard } from "@/types";
import ImageUploader from "./ImageUploader";
import PortfolioSourceEditor from "./shared/PortfolioSourceEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProjectMasonryWallBlockEditor({ block }: { block: Extract<Block, { type: "project-masonry-wall" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const source = block.content.source || "manual";
  const linkedProjectIds = block.content.linkedProjectIds || [];

  const updateItem = (index: number, field: string, value: unknown) => {
    const items = [...block.content.items];
    items[index] = { ...items[index], [field]: value };
    update({ items });
  };

  const addItem = () => {
    update({ items: [...block.content.items, { imageUrl: "", title: "Nouveau projet", category: "Design" }] });
  };

  const removeItem = (index: number) => {
    const items = block.content.items.filter((_: unknown, i: number) => i !== index);
    update({ items });
  };

  const handleResolvedChange = useCallback((cards: PortfolioCard[]) => {
    update({ resolvedProjects: cards });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title ?? ""} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Colonnes</label>
        <input type="number" min={2} max={4} value={block.content.columns ?? 3} onChange={(e) => update({ columns: parseInt(e.target.value) })} className={inputClass} />
      </div>

      {/* Source selector */}
      <PortfolioSourceEditor
        source={source}
        linkedProjectIds={linkedProjectIds}
        onSourceChange={(s) => update({ source: s })}
        onLinkedIdsChange={(ids) => update({ linkedProjectIds: ids })}
        onResolvedChange={handleResolvedChange}
      />

      {/* Manual items — only shown in manual mode */}
      {source === "manual" && (
        <>
          {block.content.items.map((item: { imageUrl?: string; title: string; category: string }, i: number) => (
            <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-[#999] uppercase">Projet {i + 1}</div>
                {block.content.items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-[10px] text-[#999] hover:text-red-500">&times;</button>
                )}
              </div>
              <ImageUploader value={item.imageUrl} onChange={(url) => updateItem(i, "imageUrl", url)} label="Image" />
              <input type="text" value={item.title} onChange={(e) => updateItem(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
              <input type="text" value={item.category} onChange={(e) => updateItem(i, "category", e.target.value)} placeholder="Catégorie" className={inputClass} />
            </div>
          ))}
          <button onClick={addItem} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un projet</button>
        </>
      )}
    </div>
  );
}
