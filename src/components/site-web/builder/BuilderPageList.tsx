"use client";

import { useState, useCallback } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { getBlockEntry } from "@/lib/block-registry";

export default function BuilderPageList() {
  const { state, dispatch } = useBuilder();
  const { site, activePageId, activeBlockId } = state;
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const activePage = site.pages.find((p) => p.id === activePageId);

  const handleAddPage = () => {
    const id = `PAGE-NEW-${Date.now()}`;
    dispatch({
      type: "ADD_PAGE",
      page: { id, name: "Nouvelle page", slug: `/page-${site.pages.length + 1}`, status: "draft", blocks: [] },
    });
  };

  const handleMoveBlock = useCallback((from: number, to: number) => {
    if (!activePage || from === to) return;
    dispatch({ type: "REORDER_BLOCKS", pageId: activePage.id, fromIndex: from, toIndex: to });
  }, [activePage, dispatch]);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    handleMoveBlock(dragIdx, idx);
    setDragIdx(idx);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="w-[250px] flex-shrink-0 bg-white border-r border-[#E6E8F0] flex flex-col select-none">
      {/* Pages */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Pages</span>
        <button
          onClick={handleAddPage}
          className="w-5 h-5 rounded bg-[#F0EBFF] text-[#6a18f1] flex items-center justify-center hover:bg-[#E5DEFF] transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
      <div className="px-2 pb-2 max-h-[180px] overflow-y-auto">
        {site.pages.map((page) => (
          <button
            key={page.id}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-all mb-px ${
              activePageId === page.id
                ? "bg-[#F0EBFF] text-[#6a18f1] font-medium"
                : "text-[#666] hover:bg-[#F8F9FC]"
            }`}
            onClick={() => dispatch({ type: "SET_ACTIVE_PAGE", pageId: page.id })}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-60">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="truncate">{page.name}</span>
            <span className="ml-auto text-[10px] opacity-40">{page.blocks.length}</span>
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="h-px bg-[#E6E8F0] mx-3" />

      {/* Block tree */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">Blocs</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {!activePage || activePage.blocks.length === 0 ? (
          <div className="text-center py-6 text-[11px] text-[#BBB]">Aucun bloc</div>
        ) : (
          activePage.blocks.map((block, idx) => {
            const entry = getBlockEntry(block.type);
            const isActive = activeBlockId === block.id;
            return (
              <div
                key={block.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => dispatch({ type: "SET_ACTIVE_BLOCK", blockId: block.id })}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-all mb-px cursor-pointer ${
                  isActive ? "bg-[#F0EBFF] text-[#6a18f1] font-medium" : "text-[#666] hover:bg-[#F8F9FC]"
                } ${!block.visible ? "opacity-40" : ""} ${dragIdx === idx ? "opacity-60" : ""}`}
              >
                {/* Drag handle */}
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 opacity-30 group-hover:opacity-60 cursor-grab">
                  <circle cx="7" cy="5" r="2" /><circle cx="17" cy="5" r="2" />
                  <circle cx="7" cy="12" r="2" /><circle cx="17" cy="12" r="2" />
                  <circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" />
                </svg>
                <span className="truncate flex-1">{entry?.name || block.type}</span>
                {/* Actions on hover */}
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: "DUPLICATE_BLOCK", blockId: block.id }); }}
                    className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-[#6a18f1]"
                    title="Dupliquer"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: "TOGGLE_BLOCK_VISIBILITY", blockId: block.id }); }}
                    className="w-4 h-4 rounded flex items-center justify-center text-[#999] hover:text-[#6a18f1]"
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
          })
        )}
      </div>
    </div>
  );
}
