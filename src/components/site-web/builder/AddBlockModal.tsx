"use client";

import { useState, useRef, useCallback } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { blockRegistry, blockCategories, type BlockCategory } from "@/lib/block-registry";
import BlockThumbnail from "./BlockThumbnail";
import PreviewSandbox from "./PreviewSandbox";
import type { BlockType } from "@/types";

export default function AddBlockModal({ onClose, pageId }: { onClose: () => void; pageId: string }) {
  const { dispatch } = useBuilder();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<BlockCategory | "all">("all");
  const [hoveredType, setHoveredType] = useState<BlockType | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHover = useCallback((type: BlockType | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setHoveredType(type), 120);
  }, []);

  const handleAdd = (type: BlockType) => {
    dispatch({ type: "ADD_BLOCK", pageId, blockType: type });
    onClose();
  };

  const filtered = blockRegistry.filter((b) => {
    const matchCategory = activeCategory === "all" || b.category === activeCategory;
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E6E8F0] w-full max-w-[960px] h-[600px] flex overflow-hidden">

        {/* LEFT — Categories + Search */}
        <div className="w-[200px] flex-shrink-0 border-r border-[#E6E8F0] flex flex-col">
          <div className="p-3">
            <div className="relative">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg pl-8 pr-3 py-2 text-[12px] text-[#1A1A1A] placeholder-[#BBB] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 px-2 pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all mb-0.5 ${
                activeCategory === "all" ? "bg-[#F0EBFF] text-[#6a18f1]" : "text-[#666] hover:bg-[#F8F9FC]"
              }`}
            >
              Tous les blocs
              <span className="ml-1 text-[10px] opacity-50">{blockRegistry.length}</span>
            </button>
            {blockCategories.map((cat) => {
              const count = blockRegistry.filter((b) => b.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all mb-0.5 ${
                    activeCategory === cat.id ? "bg-[#F0EBFF] text-[#6a18f1]" : "text-[#666] hover:bg-[#F8F9FC]"
                  }`}
                >
                  {cat.label}
                  <span className="ml-1 text-[10px] opacity-50">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER — Block grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 border-b border-[#E6E8F0] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Ajouter un bloc</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F8F9FC] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[13px] text-[#BBB]">
                Aucun bloc trouvé
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {filtered.map((entry) => (
                  <button
                    key={entry.type}
                    onClick={() => handleAdd(entry.type)}
                    onMouseEnter={() => handleHover(entry.type)}
                    onMouseLeave={() => handleHover(null)}
                    className={`group flex flex-col p-3 rounded-xl border transition-all text-left ${
                      hoveredType === entry.type
                        ? "border-[#6a18f1] bg-[#F0EBFF]/40 shadow-sm"
                        : "border-[#E6E8F0] hover:border-[#6a18f1]/40"
                    }`}
                  >
                    {/* Miniature */}
                    <div className="w-full h-14 bg-[#F8F9FC] rounded-lg p-2 mb-2 flex items-center justify-center overflow-hidden">
                      <div className="w-full">
                        <BlockThumbnail type={entry.type} />
                      </div>
                    </div>
                    <div className="text-[12px] font-semibold text-[#1A1A1A] mb-0.5">{entry.name}</div>
                    <div className="text-[10px] text-[#999] leading-snug line-clamp-2">{entry.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="w-[300px] flex-shrink-0 border-l border-[#E6E8F0] bg-[#F8F9FC] flex flex-col">
          <div className="px-4 py-3.5 border-b border-[#E6E8F0] bg-white">
            <span className="text-[12px] font-semibold text-[#999] uppercase tracking-wider">Aperçu</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <PreviewSandbox type={hoveredType} />
          </div>
        </div>
      </div>
    </div>
  );
}
