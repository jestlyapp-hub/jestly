"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle");

  const handleUndo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  const handlePublish = useCallback(async () => {
    setPublishStatus("publishing");
    try {
      // For now, open the public site preview (API publish requires auth)
      const slug = state.site.domain?.subdomain;
      if (slug) {
        window.open(`/s/${slug}`, "_blank");
      }
      setPublishStatus("published");
      setTimeout(() => setPublishStatus("idle"), 3000);
    } catch {
      setPublishStatus("error");
      setTimeout(() => setPublishStatus("idle"), 3000);
    }
  }, [state.site.domain]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      // Ctrl+Z / Cmd+Z → Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y / Cmd+Shift+Z → Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      // Delete / Backspace → Remove selected block
      if ((e.key === "Delete" || e.key === "Backspace") && state.activeBlockId) {
        e.preventDefault();
        dispatch({ type: "REMOVE_BLOCK", blockId: state.activeBlockId });
      }
      // Ctrl+D / Cmd+D → Duplicate selected block
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && state.activeBlockId) {
        e.preventDefault();
        dispatch({ type: "DUPLICATE_BLOCK", blockId: state.activeBlockId });
      }
      // Escape → Deselect block or exit preview
      if (e.key === "Escape") {
        if (state.previewMode) {
          dispatch({ type: "TOGGLE_PREVIEW_MODE" });
        } else if (state.activeBlockId) {
          dispatch({ type: "SET_ACTIVE_BLOCK", blockId: null });
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo, state.activeBlockId, state.previewMode, dispatch]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className="h-11 flex-shrink-0 bg-white border-b border-[#E6E6E4] flex items-center justify-between px-3 select-none">
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
      <div className="flex items-center gap-0.5 bg-[#F7F7F5] rounded-lg p-0.5">
        {breakpoints.map((bp) => (
          <button
            key={bp.id}
            onClick={() => dispatch({ type: "SET_BREAKPOINT", breakpoint: bp.id })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              state.breakpoint === bp.id
                ? "bg-white text-[#4F46E5] shadow-sm"
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
          className={`p-1.5 rounded-md transition-all ${canUndo ? "text-[#666] hover:bg-[#F7F7F5] hover:text-[#1A1A1A]" : "text-[#D0D5E0] cursor-not-allowed"}`}
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
          className={`p-1.5 rounded-md transition-all ${canRedo ? "text-[#666] hover:bg-[#F7F7F5] hover:text-[#1A1A1A]" : "text-[#D0D5E0] cursor-not-allowed"}`}
          title="Rétablir (Ctrl+Y)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[#E6E6E4] mx-1" />

        {/* Preview toggle */}
        <button
          onClick={() => dispatch({ type: "TOGGLE_PREVIEW_MODE" })}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            state.previewMode
              ? "bg-[#1A1A1A] text-white"
              : "text-[#666] hover:bg-[#F7F7F5]"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {state.previewMode ? "Quitter" : "Aperçu"}
        </button>

        {/* Publish button */}
        <button
          onClick={handlePublish}
          disabled={publishStatus === "publishing"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold transition-colors shadow-sm ${
            publishStatus === "published"
              ? "bg-green-500"
              : publishStatus === "error"
              ? "bg-red-500"
              : "bg-[#4F46E5] hover:bg-[#4338CA]"
          } ${publishStatus === "publishing" ? "opacity-70 cursor-wait" : ""}`}
        >
          {publishStatus === "publishing" ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              Publication...
            </>
          ) : publishStatus === "published" ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Publié !
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Publier
            </>
          )}
        </button>
      </div>
    </div>
  );
}
