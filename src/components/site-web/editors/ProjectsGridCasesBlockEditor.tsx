"use client";

import { useCallback } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block, PortfolioCard } from "@/types";
import ImageUploader from "./ImageUploader";
import PortfolioSourceEditor from "./shared/PortfolioSourceEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProjectsGridCasesBlockEditor({ block }: { block: Extract<Block, { type: "projects-grid-cases" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const source = block.content.source || "manual";
  const linkedProjectIds = block.content.linkedProjectIds || [];

  const updateProject = (index: number, field: string, value: unknown) => {
    const projects = [...block.content.projects];
    projects[index] = { ...projects[index], [field]: value };
    update({ projects });
  };

  const addProject = () => {
    update({ projects: [...block.content.projects, { imageUrl: "", title: "Nouveau projet", category: "Design", result: "" }] });
  };

  const removeProject = (index: number) => {
    const projects = block.content.projects.filter((_: unknown, i: number) => i !== index);
    update({ projects });
  };

  const handleResolvedChange = useCallback((cards: PortfolioCard[]) => {
    update({ resolvedProjects: cards });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea value={block.content.subtitle ?? ""} onChange={(e) => update({ subtitle: e.target.value })} rows={2} className={inputClass} />
      </div>

      {/* Source selector */}
      <PortfolioSourceEditor
        source={source}
        linkedProjectIds={linkedProjectIds}
        onSourceChange={(s) => update({ source: s })}
        onLinkedIdsChange={(ids) => update({ linkedProjectIds: ids })}
        onResolvedChange={handleResolvedChange}
      />

      {/* Manual projects — only shown in manual mode */}
      {source === "manual" && (
        <>
          {block.content.projects.map((project: { imageUrl?: string; title: string; category: string; result: string }, i: number) => (
            <div key={i} className="p-2 rounded-lg border border-[#E6E6E4] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-[#999] uppercase">Projet {i + 1}</div>
                {block.content.projects.length > 1 && (
                  <button onClick={() => removeProject(i)} className="text-[10px] text-[#999] hover:text-red-500">&times;</button>
                )}
              </div>
              <ImageUploader value={project.imageUrl} onChange={(url) => updateProject(i, "imageUrl", url)} label="Image" />
              <input type="text" value={project.title} onChange={(e) => updateProject(i, "title", e.target.value)} placeholder="Titre" className={inputClass} />
              <input type="text" value={project.category} onChange={(e) => updateProject(i, "category", e.target.value)} placeholder="Catégorie" className={inputClass} />
              <input type="text" value={project.result} onChange={(e) => updateProject(i, "result", e.target.value)} placeholder="Résultat" className={inputClass} />
            </div>
          ))}
          <button onClick={addProject} className="text-[12px] font-medium text-[#4F46E5] hover:underline">+ Ajouter un projet</button>
        </>
      )}
    </div>
  );
}
