"use client";

import { useState, useCallback, useMemo } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { getBlockEntry } from "@/lib/block-registry";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, BlockType } from "@/types";

/* ── Sortable block item ── */
function SortableBlockItem({
  block,
  isActive,
  dispatch,
}: {
  block: Block;
  isActive: boolean;
  dispatch: ReturnType<typeof useBuilder>["dispatch"];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const entry = getBlockEntry(block.type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => dispatch({ type: "SET_ACTIVE_BLOCK", blockId: block.id })}
      className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-all mb-px cursor-pointer ${
        isActive ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : "text-[#666] hover:bg-[#F7F7F5]"
      } ${!block.visible ? "opacity-40" : ""}`}
    >
      <svg
        {...listeners}
        width="8" height="8" viewBox="0 0 24 24" fill="currentColor"
        className="flex-shrink-0 opacity-30 group-hover:opacity-60 cursor-grab"
      >
        <circle cx="7" cy="5" r="2" /><circle cx="17" cy="5" r="2" />
        <circle cx="7" cy="12" r="2" /><circle cx="17" cy="12" r="2" />
        <circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" />
      </svg>
      <span className="truncate flex-1">{entry?.name || block.type}</span>
      <div className="hidden group-hover:flex items-center gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: "DUPLICATE_BLOCK", blockId: block.id }); }}
          className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-[#4F46E5]"
          title="Dupliquer"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_BLOCK_VISIBILITY", blockId: block.id }); }}
          className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-[#4F46E5]"
          title={block.visible ? "Masquer" : "Afficher"}
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {block.visible ? (
              <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
            ) : (
              <><line x1="1" y1="1" x2="23" y2="23" /><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /></>
            )}
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_BLOCK", blockId: block.id }); }}
          className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-red-500"
          title="Supprimer"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Page item with inline rename ── */
function PageItem({
  page,
  isActive,
  isHome,
  dispatch,
  pageCount,
}: {
  page: { id: string; name: string; slug: string; blocks: Block[] };
  isActive: boolean;
  isHome: boolean;
  dispatch: ReturnType<typeof useBuilder>["dispatch"];
  pageCount: number;
}) {
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(page.name);
  const [showActions, setShowActions] = useState(false);

  const handleRename = () => {
    if (nameValue.trim() && nameValue !== page.name) {
      dispatch({ type: "UPDATE_PAGE", pageId: page.id, updates: { name: nameValue.trim() } });
    }
    setRenaming(false);
  };

  return (
    <div
      className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-all mb-px cursor-pointer ${
        isActive ? "bg-[#EEF2FF] text-[#4F46E5] font-medium" : "text-[#666] hover:bg-[#F7F7F5]"
      }`}
      onClick={() => dispatch({ type: "SET_ACTIVE_PAGE", pageId: page.id })}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-60">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>

      {renaming ? (
        <input
          autoFocus
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 bg-white border border-[#4F46E5]/30 rounded px-1 py-0.5 text-[12px] focus:outline-none min-w-0"
        />
      ) : (
        <span className="truncate flex-1">{page.name}</span>
      )}

      {isHome && !showActions && (
        <span className="text-[8px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-1 py-0.5 rounded ml-auto flex-shrink-0">HOME</span>
      )}

      {!isHome && !showActions && (
        <span className="ml-auto text-[10px] opacity-40 flex-shrink-0">{page.blocks.length}</span>
      )}

      {showActions && !renaming && (
        <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setNameValue(page.name); setRenaming(true); }}
            className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-[#4F46E5]"
            title="Renommer"
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {!isHome && (
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ type: "UPDATE_PAGE", pageId: page.id, updates: { slug: "/" } }); }}
              className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-[#4F46E5]"
              title="Définir comme accueil"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </button>
          )}
          {pageCount > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); dispatch({ type: "REMOVE_PAGE", pageId: page.id }); }}
              className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-red-500"
              title="Supprimer"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Quick-add palette ── */
function BlockPalette({ pageId, dispatch }: { pageId: string; dispatch: ReturnType<typeof useBuilder>["dispatch"] }) {
  const [open, setOpen] = useState(false);

  const quickBlocks = useMemo(() => {
    const picks: BlockType[] = ["hero", "services-list", "portfolio-grid", "testimonials-carousel", "contact-form", "faq-advanced", "centered-cta", "video", "pricing-table-real"];
    return picks.map((type) => {
      const entry = getBlockEntry(type);
      return entry ? { type, name: entry.name } : null;
    }).filter(Boolean) as { type: BlockType; name: string }[];
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-1 py-1.5 text-[11px] text-[#999] hover:text-[#4F46E5] transition-colors flex items-center justify-center gap-1"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Ajout rapide
      </button>
    );
  }

  return (
    <div className="mt-1 border-t border-[#E6E6E4] pt-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-semibold text-[#999] uppercase tracking-wider">Ajout rapide</span>
        <button onClick={() => setOpen(false)} className="text-[#999] hover:text-[#666]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {quickBlocks.map(({ type, name }) => (
          <button
            key={type}
            onClick={() => dispatch({ type: "ADD_BLOCK", pageId, blockType: type })}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] text-[#666] hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-colors"
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-50">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="truncate">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main sidebar ── */
export default function BuilderPageList() {
  const { state, dispatch } = useBuilder();
  const { site, activePageId, activeBlockId } = state;

  const activePage = site.pages.find((p) => p.id === activePageId);

  const blockIds = useMemo(
    () => activePage?.blocks.map((b) => b.id) || [],
    [activePage?.blocks],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
  );

  const handleAddPage = () => {
    const id = `PAGE-NEW-${Date.now()}`;
    dispatch({
      type: "ADD_PAGE",
      page: { id, name: "Nouvelle page", slug: `/page-${site.pages.length + 1}`, status: "draft", blocks: [] },
    });
  };

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
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

  return (
    <div className="w-[250px] flex-shrink-0 bg-white border-r border-[#E6E6E4] flex flex-col select-none">
      {/* Pages */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Pages</span>
        <button
          onClick={handleAddPage}
          className="w-5 h-5 rounded bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center hover:bg-[#E5DEFF] transition-colors"
          title="Ajouter une page"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div className="px-2 pb-2 max-h-[200px] overflow-y-auto">
        {site.pages.map((page) => (
          <PageItem
            key={page.id}
            page={page}
            isActive={activePageId === page.id}
            isHome={page.slug === "/"}
            dispatch={dispatch}
            pageCount={site.pages.length}
          />
        ))}
      </div>

      <div className="h-px bg-[#E6E6E4] mx-3" />

      {/* Block tree */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Blocs</span>
        {activePage && (
          <span className="text-[10px] text-[#BBB]">{activePage.blocks.length}</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!activePage || activePage.blocks.length === 0 ? (
          <div className="text-center py-6 text-[11px] text-[#BBB]">Aucun bloc</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              {activePage.blocks.map((block) => (
                <SortableBlockItem key={block.id} block={block} isActive={activeBlockId === block.id} dispatch={dispatch} />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {activePage && <BlockPalette pageId={activePage.id} dispatch={dispatch} />}
      </div>
    </div>
  );
}
