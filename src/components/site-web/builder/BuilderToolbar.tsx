"use client";

import { useEffect, useCallback } from "react";
import { useBuilder, type Breakpoint } from "@/lib/site-builder-context";

const breakpoints: { id: Breakpoint; label: string; icon: React.ReactNode }[] = [
  {
    id: "desktop",
    label: "Desktop",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: "tablet",
    label: "Tablette",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
];

export default function BuilderToolbar() {
  const { state, dispatch } = useBuilder();

  const handleUndo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className="h-11 flex-shrink-0 bg-white border-b border-[#E6E8F0] flex items-center justify-between px-3 select-none">
      {/* Left — Page name + dirty indicator */}
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#1A1A1A]">
          {state.site.pages.find((p) => p.id === state.activePageId)?.name || "Page"}
        </span>
        {state.isDirty && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Modifications non sauvegardées" />
        )}
      </div>

      {/* Center — Breakpoints */}
      <div className="flex items-center gap-0.5 bg-[#F8F9FC] rounded-lg p-0.5">
        {breakpoints.map((bp) => (
          <button
            key={bp.id}
            onClick={() => dispatch({ type: "SET_BREAKPOINT", breakpoint: bp.id })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              state.breakpoint === bp.id
                ? "bg-white text-[#6a18f1] shadow-sm"
                : "text-[#999] hover:text-[#666]"
            }`}
            title={bp.label}
          >
            {bp.icon}
            <span className="hidden lg:inline">{bp.label}</span>
          </button>
        ))}
      </div>

      {/* Right — Undo/Redo + Preview + Publish */}
      <div className="flex items-center gap-1.5">
        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`p-1.5 rounded-md transition-all ${canUndo ? "text-[#666] hover:bg-[#F8F9FC] hover:text-[#1A1A1A]" : "text-[#D0D5E0] cursor-not-allowed"}`}
          title="Annuler (Ctrl+Z)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        {/* Redo */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`p-1.5 rounded-md transition-all ${canRedo ? "text-[#666] hover:bg-[#F8F9FC] hover:text-[#1A1A1A]" : "text-[#D0D5E0] cursor-not-allowed"}`}
          title="Rétablir (Ctrl+Y)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[#E6E8F0] mx-1" />

        {/* Preview toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_PREVIEW_MODE" })}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            state.previewMode
              ? "bg-[#1A1A1A] text-white"
              : "text-[#666] hover:bg-[#F8F9FC]"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {state.previewMode ? "Quitter" : "Aperçu"}
        </button>

        {/* Publish button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6a18f1] text-white text-[11px] font-semibold hover:bg-[#5a10d1] transition-colors shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Publier
        </button>
      </div>
    </div>
  );
}
