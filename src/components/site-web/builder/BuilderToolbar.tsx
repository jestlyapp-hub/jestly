"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBuilder, serializeSiteForSave, type Breakpoint } from "@/lib/site-builder-context";
import { useSite } from "@/lib/hooks/use-site";
import { validateSite, type ValidationError } from "@/lib/builder-validation";

type RightPanel = "inspector" | "theme" | "nav";

const breakpoints: { id: Breakpoint; label: string; icon: React.ReactNode }[] = [
  {
    id: "desktop",
    label: "Desktop",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: "tablet",
    label: "Tablette",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
];

export default function BuilderToolbar({ activePanel, onPanelChange }: { activePanel: RightPanel; onPanelChange: (p: RightPanel) => void }) {
  const { state, dispatch, saveStatus, acquireSaveLock } = useBuilder();
  const { siteId } = useSite();
  const [publishStatus, setPublishStatus] = useState<"idle" | "publishing" | "published" | "error">("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const validationErrors = useMemo(() => validateSite(state.site), [state.site]);
  const blockingErrors = validationErrors.filter((e) => e.severity === "error");
  const hasBlockingErrors = blockingErrors.length > 0;

  const handleUndo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const handleRedo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  const handlePublish = useCallback(async () => {
    if (!siteId) return;
    if (hasBlockingErrors) {
      setShowErrors(true);
      return;
    }
    setPublishStatus("publishing");
    let unlock: (() => void) | null = null;
    try {
      // Lock autosave to prevent concurrent writes during publish
      unlock = await acquireSaveLock();

      const snapshot = serializeSiteForSave(state.site);
      const saveRes = await fetch(`/api/sites/${siteId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (!saveRes.ok) {
        const errBody = await saveRes.json().catch(() => ({}));
        console.error("[publish] save error:", saveRes.status, JSON.stringify(errBody));
        throw new Error(errBody.error || `Erreur sauvegarde (${saveRes.status}) — step: ${errBody.step || "unknown"}`);
      }

      const pubRes = await fetch(`/api/sites/${siteId}/publish`, { method: "POST" });
      const pubData = await pubRes.json().catch(() => ({}));
      if (!pubRes.ok) throw new Error(pubData.error || `Erreur ${pubRes.status}`);

      dispatch({ type: "MARK_CLEAN" });
      setPublishStatus("published");

      const subdomain = pubData.subdomain || state.site.domain?.subdomain;
      if (subdomain) window.open(`/s/${subdomain}`, "_blank");

      setTimeout(() => setPublishStatus("idle"), 3000);
    } catch (err) {
      console.error("[publish] error:", err);
      setPublishStatus("error");
      setPublishError(err instanceof Error ? err.message : "Erreur de publication");
      setTimeout(() => { setPublishStatus("idle"); setPublishError(null); }, 6000);
    } finally {
      unlock?.();
    }
  }, [siteId, state.site, dispatch, acquireSaveLock]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); handleRedo(); }
      if ((e.key === "Delete" || e.key === "Backspace") && state.activeBlockId) { e.preventDefault(); dispatch({ type: "REMOVE_BLOCK", blockId: state.activeBlockId }); }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && state.activeBlockId) { e.preventDefault(); dispatch({ type: "DUPLICATE_BLOCK", blockId: state.activeBlockId }); }
      if (e.key === "Escape") {
        if (state.previewMode) dispatch({ type: "TOGGLE_PREVIEW_MODE" });
        else if (state.activeBlockId) dispatch({ type: "SET_ACTIVE_BLOCK", blockId: null });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo, state.activeBlockId, state.previewMode, dispatch]);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className="h-12 flex-shrink-0 bg-white border-b border-[#E6E6E4] flex items-center justify-between px-3 select-none">
      {/* Left — Site name + save status */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-[#4F46E5]">{(state.site.settings.name || "S")[0].toUpperCase()}</span>
          </div>
          <span className="text-[13px] font-semibold text-[#1A1A1A] truncate max-w-[120px]">
            {state.site.settings.name || "Mon site"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-[11px] text-[#8A8A88]">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sauvegarde...
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Enregistré
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1 text-[11px] text-red-500">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Erreur
            </span>
          )}
          {saveStatus === "idle" && state.isDirty && (
            <span className="flex items-center gap-1 text-[11px] text-amber-500">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Non sauvegardé
            </span>
          )}
        </div>
      </div>

      {/* Center — Tool buttons + Breakpoints */}
      <div className="flex items-center gap-2">
        {/* Panel toggles */}
        <div className="flex items-center gap-0.5 bg-[#F7F7F5] rounded-lg p-0.5">
          <button
            onClick={() => onPanelChange("theme")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              activePanel === "theme" ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#999] hover:text-[#666]"
            }`}
            title="Thème"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <span className="hidden xl:inline">Thème</span>
          </button>
          <button
            onClick={() => onPanelChange("nav")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
              activePanel === "nav" ? "bg-white text-[#4F46E5] shadow-sm" : "text-[#999] hover:text-[#666]"
            }`}
            title="Navigation"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="hidden xl:inline">Nav</span>
          </button>
        </div>

        <div className="w-px h-5 bg-[#E6E6E4]" />

        {/* Responsive breakpoints */}
        <div className="flex items-center gap-0.5 bg-[#F7F7F5] rounded-lg p-0.5">
          {breakpoints.map((bp) => (
            <button
              key={bp.id}
              onClick={() => dispatch({ type: "SET_BREAKPOINT", breakpoint: bp.id })}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
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
      </div>

      {/* Right — Undo/Redo + Preview + Publish */}
      <div className="flex items-center gap-1.5">
        <button onClick={handleUndo} disabled={!canUndo} className={`p-1.5 rounded-md transition-all ${canUndo ? "text-[#666] hover:bg-[#F7F7F5]" : "text-[#D0D5E0] cursor-not-allowed"}`} title="Annuler (Ctrl+Z)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
        </button>
        <button onClick={handleRedo} disabled={!canRedo} className={`p-1.5 rounded-md transition-all ${canRedo ? "text-[#666] hover:bg-[#F7F7F5]" : "text-[#D0D5E0] cursor-not-allowed"}`} title="Rétablir (Ctrl+Y)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" /></svg>
        </button>

        <div className="w-px h-5 bg-[#E6E6E4] mx-0.5" />

        <button
          onClick={() => dispatch({ type: "TOGGLE_PREVIEW_MODE" })}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            state.previewMode ? "bg-[#1A1A1A] text-white" : "text-[#666] hover:bg-[#F7F7F5]"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {state.previewMode ? "Quitter" : "Aperçu"}
        </button>

        <div className="relative">
          <button
            onClick={handlePublish}
            disabled={publishStatus === "publishing"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold transition-colors shadow-sm ${
              publishStatus === "published" ? "bg-green-500"
              : publishStatus === "error" ? "bg-red-500"
              : hasBlockingErrors ? "bg-red-500 hover:bg-red-600"
              : "bg-[#4F46E5] hover:bg-[#4338CA]"
            } ${publishStatus === "publishing" ? "opacity-70 cursor-wait" : ""}`}
          >
            {publishStatus === "publishing" ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publication...
              </>
            ) : publishStatus === "published" ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Publié !
              </>
            ) : hasBlockingErrors ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                {blockingErrors.length} erreur{blockingErrors.length > 1 ? "s" : ""}
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Publier
              </>
            )}
          </button>

          {/* Publish error tooltip */}
          {publishStatus === "error" && publishError && (
            <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-red-50 border border-red-200 rounded-xl shadow-lg px-3 py-2">
              <div className="text-[11px] font-semibold text-red-700 mb-0.5">Échec de la publication</div>
              <div className="text-[10px] text-red-600">{publishError}</div>
            </div>
          )}

          {/* Error dropdown */}
          {showErrors && hasBlockingErrors && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowErrors(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white border border-red-200 rounded-xl shadow-xl overflow-hidden">
                <div className="px-3 py-2 bg-red-50 border-b border-red-100 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-red-700">Publication impossible</span>
                  <button onClick={() => setShowErrors(false)} className="text-[11px] text-red-400 hover:text-red-600">Fermer</button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {blockingErrors.map((err, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        dispatch({ type: "SET_ACTIVE_BLOCK", blockId: err.blockId });
                        setShowErrors(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-red-50/50 transition-colors border-b border-red-50 last:border-0"
                    >
                      <div className="text-[11px] font-medium text-[#1A1A1A]">{err.blockType}</div>
                      <div className="text-[10px] text-red-600">{err.message}</div>
                      <div className="text-[9px] text-[#999]">Page : {err.pageName}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
