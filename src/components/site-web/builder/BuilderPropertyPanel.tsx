"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { getBlockEntry } from "@/lib/block-registry";
import BlockEditor from "@/components/site-web/editors/BlockEditor";
import BlockStyleEditor from "@/components/site-web/editors/BlockStyleEditor";
import type { BlockAnimation } from "@/types";

type InspectorTab = "content" | "style" | "settings" | "interactions";

const tabs: { id: InspectorTab; label: string }[] = [
  { id: "content", label: "Contenu" },
  { id: "style", label: "Style" },
  { id: "settings", label: "Réglages" },
  { id: "interactions", label: "Anim." },
];

const animationOptions: { value: BlockAnimation; label: string; description: string }[] = [
  { value: "none", label: "Aucune", description: "Pas d'animation" },
  { value: "fade-up", label: "Fondu haut", description: "Apparaît en glissant vers le haut" },
  { value: "fade-in", label: "Fondu", description: "Apparaît progressivement" },
  { value: "slide-left", label: "Glissement", description: "Glisse depuis la gauche" },
];

const containerWidthOptions = [
  { value: "full" as const, label: "Pleine largeur" },
  { value: "boxed" as const, label: "Contenu (boxed)" },
  { value: "narrow" as const, label: "Étroit" },
];

export default function BuilderPropertyPanel() {
  const { state, dispatch } = useBuilder();
  const [activeTab, setActiveTab] = useState<InspectorTab>("content");

  const activeBlock = state.site.pages
    .flatMap((p) => p.blocks)
    .find((b) => b.id === state.activeBlockId);

  if (!activeBlock) {
    return (
      <div className="w-[320px] flex-shrink-0 bg-white border-l border-[#E6E8F0] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-10 h-10 rounded-xl bg-[#F8F9FC] flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <p className="text-[13px] text-[#BBB]">Sélectionnez un bloc pour le modifier</p>
        </div>
      </div>
    );
  }

  const entry = getBlockEntry(activeBlock.type);
  const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-[#E6E8F0] flex flex-col overflow-hidden">
      {/* Header — block info */}
      <div className="px-4 py-2.5 border-b border-[#E6E8F0] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-[#F0EBFF] flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-sm bg-[#6a18f1]" />
          </div>
          <span className="text-[12px] font-semibold text-[#1A1A1A] truncate">{entry?.name || activeBlock.type}</span>
        </div>
        <button
          onClick={() => dispatch({ type: "TOGGLE_BLOCK_VISIBILITY", blockId: activeBlock.id })}
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
            activeBlock.visible ? "text-emerald-600 bg-emerald-50" : "text-[#999] bg-gray-100"
          }`}
        >
          {activeBlock.visible ? "Visible" : "Masqué"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E6E8F0]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium transition-all relative ${
              activeTab === tab.id
                ? "text-[#6a18f1]"
                : "text-[#999] hover:text-[#666]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#6a18f1] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "content" && (
          <div className="px-4 py-4">
            <BlockEditor block={activeBlock} />
          </div>
        )}

        {activeTab === "style" && (
          <div className="px-4 py-4">
            <BlockStyleEditor block={activeBlock} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="px-4 py-4 space-y-4">
            {/* Anchor ID */}
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-1">ID d&apos;ancre</label>
              <input
                type="text"
                value={activeBlock.settings?.anchorId || ""}
                onChange={(e) => dispatch({ type: "UPDATE_BLOCK_SETTINGS", blockId: activeBlock.id, settings: { anchorId: e.target.value } })}
                placeholder="ex: section-hero"
                className={inputClass}
              />
              <p className="text-[10px] text-[#BBB] mt-1">Utilisé pour les liens d&apos;ancrage (#id)</p>
            </div>

            {/* Container width */}
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-2">Largeur du conteneur</label>
              <div className="grid grid-cols-3 gap-1.5">
                {containerWidthOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => dispatch({ type: "UPDATE_BLOCK_STYLE", blockId: activeBlock.id, style: { containerWidth: opt.value } })}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-medium transition-all ${
                      (activeBlock.style.containerWidth || "full") === opt.value
                        ? "border-[#6a18f1] bg-[#F0EBFF] text-[#6a18f1]"
                        : "border-[#E6E8F0] text-[#666] hover:border-[#6a18f1]/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility toggle */}
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-2">Visibilité</label>
              <button
                onClick={() => dispatch({ type: "TOGGLE_BLOCK_VISIBILITY", blockId: activeBlock.id })}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition-all ${
                  activeBlock.visible
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#E6E8F0] bg-gray-50 text-[#999]"
                }`}
              >
                <div className={`w-8 h-4 rounded-full transition-all relative ${activeBlock.visible ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${activeBlock.visible ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-[12px] font-medium">{activeBlock.visible ? "Visible" : "Masqué"}</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-2">Animation au scroll</label>
              <div className="space-y-1.5">
                {animationOptions.map((anim) => (
                  <button
                    key={anim.value}
                    onClick={() => dispatch({ type: "UPDATE_BLOCK_SETTINGS", blockId: activeBlock.id, settings: { animation: anim.value } })}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                      (activeBlock.settings?.animation || "none") === anim.value
                        ? "border-[#6a18f1] bg-[#F0EBFF]/50"
                        : "border-[#E6E8F0] hover:border-[#6a18f1]/30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                      (activeBlock.settings?.animation || "none") === anim.value
                        ? "bg-[#6a18f1] text-white"
                        : "bg-[#F8F9FC] text-[#999]"
                    }`}>
                      {anim.value === "none" ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      ) : anim.value === "fade-up" ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                      ) : anim.value === "fade-in" ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="5" /></svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-[#1A1A1A]">{anim.label}</div>
                      <div className="text-[10px] text-[#999]">{anim.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
