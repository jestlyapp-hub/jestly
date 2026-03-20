"use client";

import { useState, useCallback, useEffect } from "react";
import { usePortfolioProjects } from "@/lib/hooks/use-portfolio-projects";
import ProjectPickerModal from "./ProjectPickerModal";
import PortfolioProfileDrawer from "./PortfolioProfileDrawer";
import type { PortfolioCard } from "@/types";

interface PortfolioSourceEditorProps {
  source: "manual" | "linked_projects";
  linkedProjectIds: string[];
  onSourceChange: (source: "manual" | "linked_projects") => void;
  onLinkedIdsChange: (ids: string[]) => void;
  onResolvedChange: (cards: PortfolioCard[]) => void;
}

export default function PortfolioSourceEditor({
  source,
  linkedProjectIds,
  onSourceChange,
  onLinkedIdsChange,
  onResolvedChange,
}: PortfolioSourceEditorProps) {
  const { projects, isLoading, resolveCards, refetch } = usePortfolioProjects();
  const [showPicker, setShowPicker] = useState(false);
  const [configProjectId, setConfigProjectId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Resolve cards when linked IDs or projects change
  useEffect(() => {
    if (source === "linked_projects" && linkedProjectIds.length > 0 && projects.length > 0) {
      const resolved = resolveCards(linkedProjectIds);
      onResolvedChange(resolved);
    }
  }, [source, linkedProjectIds, projects, resolveCards, onResolvedChange]);

  const handleSelect = useCallback(
    (ids: string[]) => {
      onLinkedIdsChange(ids);
    },
    [onLinkedIdsChange]
  );

  const removeProject = (id: string) => {
    onLinkedIdsChange(linkedProjectIds.filter((pid) => pid !== id));
  };

  // Drag reorder
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newIds = [...linkedProjectIds];
    const [removed] = newIds.splice(dragIndex, 1);
    newIds.splice(index, 0, removed);
    onLinkedIdsChange(newIds);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  const configProject = configProjectId ? projects.find((p) => p.id === configProjectId) : null;

  return (
    <div className="space-y-3">
      {/* Source toggle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Source du contenu</label>
        <div className="flex rounded-lg border border-[#E6E6E4] overflow-hidden">
          <button
            onClick={() => onSourceChange("manual")}
            className={`flex-1 py-2 text-[12px] font-medium transition-all ${
              source === "manual"
                ? "bg-[#191919] text-white"
                : "bg-[#F7F7F5] text-[#5A5A58] hover:bg-[#EFEFEF]"
            }`}
          >
            Manuel
          </button>
          <button
            onClick={() => onSourceChange("linked_projects")}
            className={`flex-1 py-2 text-[12px] font-medium transition-all ${
              source === "linked_projects"
                ? "bg-[#191919] text-white"
                : "bg-[#F7F7F5] text-[#5A5A58] hover:bg-[#EFEFEF]"
            }`}
          >
            Projets Jestly
          </button>
        </div>
        {source === "linked_projects" && (
          <p className="text-[10px] text-[#8A8A88] mt-1">
            Chaque projet peut être personnalisé pour son affichage public.
          </p>
        )}
      </div>

      {/* Linked projects section */}
      {source === "linked_projects" && (
        <div className="space-y-2">
          {/* Loading state */}
          {isLoading && (
            <div className="py-4 text-center">
              <div className="w-5 h-5 border-2 border-[#E6E6E4] border-t-[#4F46E5] rounded-full animate-spin mx-auto" />
              <p className="text-[11px] text-[#8A8A88] mt-2">Chargement des projets...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && linkedProjectIds.length === 0 && (
            <div className="py-6 text-center border border-dashed border-[#E6E6E4] rounded-lg bg-[#FBFBFA]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-2 opacity-40">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="m8 21 4-4 4 4" />
              </svg>
              <p className="text-[12px] text-[#8A8A88]">Ajoutez vos projets Jestly pour</p>
              <p className="text-[12px] text-[#8A8A88]">alimenter cette section portfolio.</p>
            </div>
          )}

          {/* Linked projects list */}
          {linkedProjectIds.map((pid, index) => {
            const proj = projects.find((p) => p.id === pid);
            if (!proj) {
              return (
                <div key={pid} className="p-2.5 rounded-lg border border-amber-200 bg-amber-50 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span className="text-[11px] text-amber-700 flex-1">Projet supprimé ou introuvable</span>
                  <button onClick={() => removeProject(pid)} className="text-[11px] text-amber-600 hover:text-red-600">&times;</button>
                </div>
              );
            }

            const resolved = resolveCards([pid])[0];
            const hasProfile = !!(proj.portfolio.displayTitle || proj.portfolio.coverUrl || proj.portfolio.category);
            const thumb = resolved?.imageUrl;

            return (
              <div
                key={pid}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-2 rounded-lg border border-[#E6E6E4] bg-white flex items-center gap-2.5 transition-all group ${
                  dragIndex === index ? "opacity-50 border-[#4F46E5]/30" : "hover:border-[#D1D1D0]"
                }`}
              >
                {/* Drag handle */}
                <div className="cursor-grab text-[#D1D1D0] hover:text-[#8A8A88] flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
                </div>

                {/* Thumbnail */}
                {thumb ? (
                  <img src={thumb} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: proj.color || "#8A8A88" }}
                  >
                    {proj.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium text-[#191919] truncate">
                      {resolved?.title || proj.name}
                    </span>
                    {!hasProfile && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium flex-shrink-0">
                        À configurer
                      </span>
                    )}
                  </div>
                  {resolved?.category && (
                    <span className="text-[10px] text-[#8A8A88]">{resolved.category}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => setConfigProjectId(pid)}
                    className="p-1 rounded hover:bg-[#F7F7F5] text-[#8A8A88] hover:text-[#4F46E5] transition-colors"
                    title="Configurer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  </button>
                  <button
                    onClick={() => removeProject(pid)}
                    className="p-1 rounded hover:bg-red-50 text-[#8A8A88] hover:text-red-500 transition-colors"
                    title="Retirer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add button */}
          {!isLoading && (
            <button
              onClick={() => setShowPicker(true)}
              className="w-full py-2.5 rounded-lg border border-dashed border-[#D1D1D0] text-[12px] font-medium text-[#4F46E5] hover:bg-[#EEF2FF] hover:border-[#4F46E5]/30 transition-all"
            >
              + Lier un projet
            </button>
          )}
        </div>
      )}

      {/* Picker modal */}
      {showPicker && (
        <ProjectPickerModal
          projects={projects}
          selectedIds={linkedProjectIds}
          onSelect={handleSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* Config drawer */}
      {configProject && (
        <PortfolioProfileDrawer
          project={configProject}
          onClose={() => setConfigProjectId(null)}
          onSaved={() => {
            setConfigProjectId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
