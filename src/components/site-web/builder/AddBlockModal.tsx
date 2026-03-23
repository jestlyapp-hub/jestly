"use client";

import { useState, useRef, useCallback } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { blockRegistry, blockCategories, type BlockCategory } from "@/lib/block-registry";
import BlockThumbnail from "./BlockThumbnail";
import PreviewSandbox from "./PreviewSandbox";
import { getVariantsForBlock } from "@/lib/block-variants";
import type { BlockType } from "@/types";
import { suggestNextBlocks } from "@/lib/block-suggestions";

export default function AddBlockModal({ onClose, pageId }: { onClose: () => void; pageId: string }) {
  const { state, dispatch } = useBuilder();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<BlockCategory | "all">("all");
  const [hoveredType, setHoveredType] = useState<BlockType | null>(null);
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smart suggestions based on current page composition
  const activePage = state.site.pages.find((p) => p.id === pageId);
  const suggestions = activePage ? suggestNextBlocks(activePage.blocks) : [];
  const suggestedEntries = suggestions
    .map((type) => blockRegistry.find((b) => b.type === type))
    .filter(Boolean) as typeof blockRegistry;

  const handleHover = useCallback((type: BlockType | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setHoveredType(type), 120);
  }, []);

  const handleAdd = (type: BlockType, variantKey?: string) => {
    dispatch({ type: "ADD_BLOCK", pageId, blockType: type, variantKey });
    onClose();
  };

  const previewType = selectedType || hoveredType;
  const variants = previewType ? getVariantsForBlock(previewType) : [];

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
      <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E6E6E4] w-full max-w-[960px] h-[600px] flex overflow-hidden">

        {/* LEFT — Categories + Search */}
        <div className="w-[200px] flex-shrink-0 border-r border-[#E6E6E4] flex flex-col">
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
                className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg pl-8 pr-3 py-2 text-[12px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 px-2 pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all mb-0.5 ${
                activeCategory === "all" ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#666] hover:bg-[#F7F7F5]"
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
                  data-guide={`block-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all mb-0.5 ${
                    activeCategory === cat.id ? "bg-[#EEF2FF] text-[#4F46E5]" : "text-[#666] hover:bg-[#F7F7F5]"
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
          <div className="px-5 py-3.5 border-b border-[#E6E6E4] flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-[#191919]">Ajouter un bloc</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Smart suggestions */}
            {!search && activeCategory === "all" && suggestedEntries.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="text-[11px] font-semibold text-[#4F46E5] uppercase tracking-wider">Suggestions</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {suggestedEntries.map((entry) => (
                    <button
                      key={`sug-${entry.type}`}
                      onClick={() => {
                        const v = getVariantsForBlock(entry.type);
                        if (v.length > 0) { setSelectedType(entry.type); } else { handleAdd(entry.type); }
                      }}
                      onMouseEnter={() => handleHover(entry.type)}
                      onMouseLeave={() => handleHover(null)}
                      className="group flex flex-col p-2.5 rounded-xl border border-[#4F46E5]/20 bg-[#EEF2FF]/30 hover:border-[#4F46E5] hover:bg-[#EEF2FF]/60 transition-all text-left"
                    >
                      <div className="w-full h-10 bg-white/60 rounded-lg p-1.5 mb-1.5 flex items-center justify-center overflow-hidden">
                        <div className="w-full"><BlockThumbnail type={entry.type} /></div>
                      </div>
                      <div className="text-[11px] font-semibold text-[#191919]">{entry.name}</div>
                      <div className="text-[9px] text-[#999] line-clamp-1">{entry.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-full text-[13px] text-[#BBB]">
                Aucun bloc trouvé
              </div>
            ) : (
              <div data-guide="block-catalog" className="grid grid-cols-3 gap-2.5">
                {filtered.map((entry) => (
                  <button
                    key={entry.type}
                    onClick={() => {
                      const v = getVariantsForBlock(entry.type);
                      if (v.length > 0) { setSelectedType(entry.type); } else { handleAdd(entry.type); }
                    }}
                    onMouseEnter={() => handleHover(entry.type)}
                    onMouseLeave={() => handleHover(null)}
                    className={`group flex flex-col p-3 rounded-xl border transition-all text-left ${
                      hoveredType === entry.type
                        ? "border-[#4F46E5] bg-[#EEF2FF]/40 shadow-sm"
                        : "border-[#E6E6E4] hover:border-[#4F46E5]/40"
                    }`}
                  >
                    {/* Miniature */}
                    <div className="w-full h-14 bg-[#F7F7F5] rounded-lg p-2 mb-2 flex items-center justify-center overflow-hidden">
                      <div className="w-full">
                        <BlockThumbnail type={entry.type} />
                      </div>
                    </div>
                    <div className="text-[12px] font-semibold text-[#191919] mb-0.5">{entry.name}</div>
                    <div className="text-[10px] text-[#999] leading-snug line-clamp-2">{entry.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Variants or Live Preview */}
        <div className="w-[300px] flex-shrink-0 border-l border-[#E6E6E4] bg-[#F7F7F5] flex flex-col">
          {selectedType && variants.length > 0 ? (
            <>
              <div className="px-4 py-3.5 border-b border-[#E6E6E4] bg-white flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#191919]">Choisir un style</span>
                <button onClick={() => setSelectedType(null)} className="text-[#999] hover:text-[#666]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Default (no variant) */}
                <button
                  onClick={() => handleAdd(selectedType)}
                  className="w-full p-3 rounded-lg border border-[#E6E6E4] bg-white hover:border-[#4F46E5]/40 transition-all text-left"
                >
                  <div className="text-[12px] font-semibold text-[#191919] mb-0.5">Par défaut</div>
                  <div className="text-[10px] text-[#999]">Style standard</div>
                </button>
                {/* Variants */}
                {variants.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => handleAdd(selectedType, v.key)}
                    className="w-full p-3 rounded-lg border border-[#E6E6E4] bg-white hover:border-[#4F46E5]/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {v.style.backgroundColor && (
                        <div className="w-4 h-4 rounded border border-black/10 flex-shrink-0" style={{ background: v.style.backgroundColor }} />
                      )}
                      <div className="text-[12px] font-semibold text-[#191919]">{v.name}</div>
                    </div>
                    <div className="text-[10px] text-[#999]">{v.description}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-3.5 border-b border-[#E6E6E4] bg-white">
                <span className="text-[12px] font-semibold text-[#999] uppercase tracking-wider">Aperçu</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <PreviewSandbox type={previewType} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
