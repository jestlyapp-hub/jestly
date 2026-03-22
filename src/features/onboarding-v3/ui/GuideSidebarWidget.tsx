"use client";

import { useGuide } from "../engine/guide-engine";
import { CHAPTERS } from "../model/guide.chapters";
import { GraduationCap, Check, ChevronRight } from "lucide-react";

/**
 * Bouton "Guide Jestly" dans la sidebar.
 * Seul point d'entrée pour lancer/reprendre le guide interactif.
 */
export default function GuideSidebarWidget() {
  const { start, isActive, isDone, progress, state } = useGuide();

  // Ne pas afficher si le guide est déjà actif (l'overlay gère tout)
  if (isActive) return null;

  const completedCount = state.completedChapters.length;
  const totalCount = CHAPTERS.length;
  const hasStarted = completedCount > 0 || state.chapterId;

  // Guide terminé : petit badge discret
  if (isDone) {
    return (
      <div className="mx-3 mb-2">
        <button
          type="button"
          onClick={start}
          className="w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-all duration-150 cursor-pointer"
        >
          <span className="text-emerald-500">
            <Check size={18} strokeWidth={1.7} />
          </span>
          <span>Guide terminé</span>
          <span className="ml-auto text-[10px] text-[#ACACAA]">Revoir</span>
        </button>
      </div>
    );
  }

  // Bouton "Guide Jestly" intégré au style sidebar
  return (
    <div className="mx-3 mb-2">
      <button
        type="button"
        onClick={start}
        className="w-full flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] hover:text-[#191919] transition-all duration-150 cursor-pointer group/guide"
      >
        <span className="text-[#ACACAA] group-hover/guide:text-[#7A7A78] transition-colors duration-150">
          <GraduationCap size={18} strokeWidth={1.7} />
        </span>
        <span className="flex-1 text-left">
          {hasStarted ? "Reprendre le guide" : "Guide Jestly"}
        </span>
        {hasStarted && (
          <span className="text-[10px] text-[#ACACAA]">
            {completedCount}/{totalCount}
          </span>
        )}
        <ChevronRight size={14} className="text-[#D6D3D1] group-hover/guide:text-[#ACACAA] transition-colors flex-shrink-0" />
      </button>
    </div>
  );
}
