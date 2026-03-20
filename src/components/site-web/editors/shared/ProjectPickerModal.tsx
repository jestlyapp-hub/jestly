"use client";

import { useState, useMemo } from "react";

interface PickerProject {
  id: string;
  name: string;
  projectType: string;
  color: string;
  status: string;
  coverUrl?: string;
  clientName: string | null;
  itemImages: string[];
  isPortfolio: boolean;
  portfolio: { displayTitle?: string; coverUrl?: string; category?: string; visibility: string };
}

interface ProjectPickerModalProps {
  projects: PickerProject[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  in_progress: "En cours",
  review: "En revue",
  completed: "Terminé",
  archived: "Archivé",
};

const typeLabels: Record<string, string> = {
  thumbnail: "Miniature",
  video: "Vidéo",
  branding: "Branding",
  development: "Dev",
  design: "Design",
  content: "Contenu",
  custom: "Autre",
};

export default function ProjectPickerModal({ projects, selectedIds, onSelect, onClose }: ProjectPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  const filtered = useMemo(() => {
    if (!search) return projects;
    const lq = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lq) ||
        p.clientName?.toLowerCase().includes(lq) ||
        p.projectType.toLowerCase().includes(lq)
    );
  }, [projects, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    // Preserve order: keep existing order + append new
    const ordered = [
      ...selectedIds.filter((id) => selected.has(id)),
      ...Array.from(selected).filter((id) => !selectedIds.includes(id)),
    ];
    onSelect(ordered);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#E6E6E4]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#191919]">Lier des projets</h3>
            <button onClick={onClose} className="text-[#8A8A88] hover:text-[#191919] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20"
            autoFocus
          />
          <p className="text-[11px] text-[#8A8A88] mt-2">
            Liez vos projets Jestly pour alimenter automatiquement ce bloc portfolio.
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#8A8A88]">
              {search ? "Aucun projet trouvé" : "Aucun projet disponible"}
            </div>
          ) : (
            filtered.map((p) => {
              const isSelected = selected.has(p.id);
              const thumb = p.portfolio.coverUrl || p.coverUrl || p.itemImages[0];
              const hasProfile = !!(p.portfolio.displayTitle || p.portfolio.coverUrl);

              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? "bg-[#EEF2FF] border border-[#4F46E5]/20"
                      : "hover:bg-[#F7F7F5] border border-transparent"
                  }`}
                >
                  {/* Thumbnail */}
                  {thumb ? (
                    <img src={thumb} alt="" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold"
                      style={{ backgroundColor: p.color || "#8A8A88" }}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium text-[#191919] truncate">{p.name}</span>
                      {hasProfile && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium flex-shrink-0">
                          Configuré
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#8A8A88]">{typeLabels[p.projectType] || p.projectType}</span>
                      <span className="text-[11px] text-[#8A8A88]">·</span>
                      <span className="text-[11px] text-[#8A8A88]">{statusLabels[p.status] || p.status}</span>
                      {p.clientName && (
                        <>
                          <span className="text-[11px] text-[#8A8A88]">·</span>
                          <span className="text-[11px] text-[#8A8A88] truncate">{p.clientName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? "bg-[#4F46E5] border-[#4F46E5]" : "border-[#D1D1D0]"
                  }`}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E6E6E4] flex items-center justify-between">
          <span className="text-[12px] text-[#8A8A88]">
            {selected.size} projet{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-[12px] text-[#5A5A58] hover:text-[#191919] transition-colors">
              Annuler
            </button>
            <button
              onClick={confirm}
              className="px-4 py-1.5 text-[12px] font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
