"use client";

import { useState, useCallback, useMemo } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { getBlockEntry } from "@/lib/block-registry";
import { computeThemeVars } from "@/lib/block-style-engine";
import BlockPreview from "@/components/site-web/blocks/BlockPreview";
import AddBlockModal from "@/components/site-web/builder/AddBlockModal";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "@/types";

const breakpointWidths = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

/* ── Sortable block wrapper ── */
function SortableBlock({
  block,
  isSelected,
  isHovered,
  isPreview,
  onSelect,
  onHover,
  onLeave,
  dispatch,
}: {
  block: Block;
  isSelected: boolean;
  isHovered: boolean;
  isPreview: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
  dispatch: ReturnType<typeof useBuilder>["dispatch"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id, disabled: isPreview });

  const entry = getBlockEntry(block.type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : !block.visible && !isPreview ? 0.3 : 1,
    outline: isSelected
      ? "2px solid #4F46E5"
      : isHovered
      ? "1px solid rgba(79,70,229,0.3)"
      : "none",
    outlineOffset: isSelected ? "-1px" : "0",
    boxShadow: isSelected ? "0 0 0 4px rgba(79,70,229,0.08)" : "none",
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isPreview && onSelect()}
      onMouseEnter={() => !isPreview && onHover()}
      onMouseLeave={onLeave}
      className={`relative transition-shadow ${!isPreview ? "cursor-pointer" : ""}`}
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
}

/* ── Main Canvas ── */
export default function BuilderCanvas() {
  const { state, dispatch } = useBuilder();
  const [showAddModal, setShowAddModal] = useState(false);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activePage = state.site.pages.find((p) => p.id === state.activePageId);
  const isPreview = state.previewMode;

  const blockIds = useMemo(
    () => activePage?.blocks.map((b) => b.id) || [],
    [activePage?.blocks],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveId(null);
      if (!activePage) return;
      const { active, over } = e;
      if (!over || active.id === over.id) return;

      const fromIndex = activePage.blocks.findIndex((b) => b.id === active.id);
      const toIndex = activePage.blocks.findIndex((b) => b.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      dispatch({ type: "REORDER_BLOCKS", pageId: activePage.id, fromIndex, toIndex });
    },
    [activePage, dispatch],
  );

  const activeBlock = activeId ? activePage?.blocks.find((b) => b.id === activeId) : null;

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-[14px] text-[#BBB] bg-[#F7F7F5]">
        Sélectionnez une page
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F1F5]">
      <div
        className="mx-auto transition-all duration-300"
        style={{ maxWidth: breakpointWidths[state.breakpoint] }}
      >
        <div className={`${isPreview ? "" : "py-4 px-4"}`}>
          <div
            className={`${isPreview ? "" : "bg-white rounded-xl shadow-sm border border-[#E6E6E4] overflow-hidden"}`}
            style={{
              ...computeThemeVars(state.site.theme) as React.CSSProperties,
              fontFamily: state.site.theme.fontFamily || undefined,
            }}
          >
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
                {activePage.blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={state.activeBlockId === block.id && !isPreview}
                    isHovered={hoveredBlockId === block.id && !isPreview && state.activeBlockId !== block.id}
                    isPreview={isPreview}
                    onSelect={() => dispatch({ type: "SET_ACTIVE_BLOCK", blockId: block.id })}
                    onHover={() => setHoveredBlockId(block.id)}
                    onLeave={() => setHoveredBlockId(null)}
                    dispatch={dispatch}
                  />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeBlock ? (
                  <div className="opacity-80 shadow-2xl rounded-lg overflow-hidden pointer-events-none">
                    <BlockPreview block={activeBlock} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
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
