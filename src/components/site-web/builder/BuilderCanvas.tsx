"use client";

import { useState, useCallback, useRef } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { getBlockEntry } from "@/lib/block-registry";
import BlockPreview from "@/components/site-web/blocks/BlockPreview";
import AddBlockModal from "@/components/site-web/builder/AddBlockModal";

const breakpointWidths = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function BuilderCanvas() {
  const { state, dispatch } = useBuilder();
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ from: number; to: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activePage = state.site.pages.find((p) => p.id === state.activePageId);
  const isPreview = state.previewMode;

  // Drag-and-drop: visual reorder on dragOver, commit only on dragEnd (single undo entry)
  const handleDragStart = (idx: number) => setDragState({ from: idx, to: idx });
  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragState === null) return;
    setDragState((prev) => prev ? { ...prev, to: idx } : null);
  }, [dragState]);
  const handleDragEnd = useCallback(() => {
    if (dragState && activePage && dragState.from !== dragState.to) {
      dispatch({ type: "REORDER_BLOCKS", pageId: activePage.id, fromIndex: dragState.from, toIndex: dragState.to });
    }
    setDragState(null);
  }, [dragState, activePage, dispatch]);

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-[14px] text-[#BBB] bg-[#F7F7F5]">
        Sélectionnez une page
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F1F5]" ref={canvasRef}>
      <div
        className="mx-auto transition-all duration-300"
        style={{ maxWidth: breakpointWidths[state.breakpoint] }}
      >
        <div className={`${isPreview ? "" : "py-4 px-4"}`}>
          <div className={`${isPreview ? "" : "bg-white rounded-xl shadow-sm border border-[#E6E6E4] overflow-hidden"}`}>
            {activePage.blocks.length === 0 && !isPreview && (
              <div className="py-20 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <p className="text-[13px] text-[#BBB] mb-3">Cette page est vide</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-[12px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-4 py-2 rounded-lg hover:bg-[#E5DEFF] transition-colors"
                >
                  Ajouter un premier bloc
                </button>
              </div>
            )}

            {activePage.blocks.map((block, idx) => {
              const isSelected = state.activeBlockId === block.id && !isPreview;
              const isHovered = hoveredBlockId === block.id && !isPreview && !isSelected;
              const entry = getBlockEntry(block.type);

              return (
                <div
                  key={block.id}
                  draggable={!isPreview}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isPreview && dispatch({ type: "SET_ACTIVE_BLOCK", blockId: block.id })}
                  onMouseEnter={() => !isPreview && setHoveredBlockId(block.id)}
                  onMouseLeave={() => setHoveredBlockId(null)}
                  className={`relative transition-all ${!isPreview ? "cursor-pointer" : ""} ${
                    !block.visible && !isPreview ? "opacity-30" : ""
                  } ${dragState?.from === idx ? "opacity-50" : ""} ${dragState?.to === idx && dragState.from !== idx ? "border-t-2 border-[#4F46E5]" : ""}`}
                  style={{
                    outline: isSelected
                      ? "2px solid #4F46E5"
                      : isHovered
                      ? "1px solid rgba(79,70,229,0.3)"
                      : "none",
                    outlineOffset: isSelected ? "-1px" : "0",
                    boxShadow: isSelected ? "0 0 0 4px rgba(79,70,229,0.08)" : "none",
                  }}
                >
                  {/* Block type label on hover/select */}
                  {(isSelected || isHovered) && (
                    <div className="absolute -top-5 left-2 z-20 flex items-center gap-1">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-[#4F46E5] text-white" : "bg-white text-[#999] border border-[#E6E6E4] shadow-sm"
                      }`}>
                        {entry?.name || block.type}
                      </span>
                    </div>
                  )}

                  {/* Floating actions on selected */}
                  {isSelected && (
                    <div className="absolute -top-5 right-2 z-20 flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: "DUPLICATE_BLOCK", blockId: block.id }); }}
                        className="bg-white border border-[#E6E6E4] rounded p-1 text-[#666] hover:text-[#4F46E5] shadow-sm"
                        title="Dupliquer"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_BLOCK_VISIBILITY", blockId: block.id }); }}
                        className="bg-white border border-[#E6E6E4] rounded p-1 text-[#666] hover:text-[#4F46E5] shadow-sm"
                        title={block.visible ? "Masquer" : "Afficher"}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_BLOCK", blockId: block.id }); }}
                        className="bg-white border border-[#E6E6E4] rounded p-1 text-[#666] hover:text-red-500 shadow-sm"
                        title="Supprimer"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <BlockPreview block={block} />
                </div>
              );
            })}
          </div>

          {/* Add block button */}
          {!isPreview && activePage.blocks.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full mt-3 py-3 border-2 border-dashed border-[#E6E6E4] rounded-xl text-[12px] font-medium text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-all flex items-center justify-center gap-1.5 bg-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Ajouter un bloc
            </button>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddBlockModal onClose={() => setShowAddModal(false)} pageId={activePage.id} />
      )}
    </div>
  );
}
