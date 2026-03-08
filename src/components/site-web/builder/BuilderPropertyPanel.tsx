"use client";

import { useState, useMemo } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { getBlockEntry } from "@/lib/block-registry";
import BlockEditor from "@/components/site-web/editors/BlockEditor";
import BlockStyleEditor from "@/components/site-web/editors/BlockStyleEditor";
import { getVariantsForBlock, hasVariants } from "@/lib/block-variants";
import { getBlockErrors } from "@/lib/builder-validation";
import { stylePresets } from "@/lib/style-presets";
import type { BlockAnimation, BlockStyle, HoverEffect, SpacingPreset } from "@/types";

type InspectorTab = "content" | "style" | "settings";

const tabs: { id: InspectorTab; label: string }[] = [
  { id: "content", label: "Contenu" },
  { id: "style", label: "Style" },
  { id: "settings", label: "Réglages" },
];

const animationOptions: { value: BlockAnimation; label: string; description: string }[] = [
  { value: "none", label: "Aucune", description: "Pas d'animation" },
  { value: "fade-up", label: "Fondu haut", description: "Monte en fondant" },
  { value: "fade-down", label: "Fondu bas", description: "Descend en fondant" },
  { value: "fade-in", label: "Fondu", description: "Apparition douce" },
  { value: "fade-left", label: "Depuis gauche", description: "Glisse de la gauche" },
  { value: "fade-right", label: "Depuis droite", description: "Glisse de la droite" },
  { value: "scale-in", label: "Zoom", description: "Zoom progressif" },
  { value: "blur-reveal", label: "Flou", description: "Defloute en apparaissant" },
];

const containerWidthOptions = [
  { value: "full" as const, label: "Pleine" },
  { value: "boxed" as const, label: "Boxed" },
  { value: "narrow" as const, label: "Étroit" },
];

const paddingPresets = [
  { value: 0, label: "0" },
  { value: 20, label: "S" },
  { value: 40, label: "M" },
  { value: 60, label: "L" },
  { value: 80, label: "XL" },
  { value: 100, label: "XXL" },
];

const bgPresets = [
  { value: "", label: "Auto", color: "transparent" },
  { value: "transparent", label: "Transparent", color: "transparent" },
  { value: "var(--site-bg, #ffffff)", label: "Page", color: "#fff" },
  { value: "var(--site-surface, #F7F7F5)", label: "Surface", color: "#F7F7F5" },
  { value: "#ffffff", label: "Blanc", color: "#fff" },
  { value: "#0A0A0F", label: "Dark", color: "#0A0A0F" },
];

const textTonePresets = [
  { value: "", label: "Auto" },
  { value: "var(--site-text, #191919)", label: "Sombre" },
  { value: "#ffffff", label: "Clair" },
  { value: "var(--site-muted, #5A5A58)", label: "Muted" },
];

const hoverEffectOptions: { value: HoverEffect; label: string }[] = [
  { value: "none", label: "Aucun" },
  { value: "lift", label: "Elevation" },
  { value: "zoom", label: "Zoom" },
  { value: "glow", label: "Glow" },
  { value: "soft-overlay", label: "Lumiere" },
  { value: "border-glow", label: "Bordure" },
];

const CARD_BLOCK_TYPES = new Set([
  "portfolio-grid", "portfolio-masonry", "services-list", "services-premium",
  "services-3card-premium", "services-icon-grid", "service-cards",
  "pricing-table", "pricing-modern", "pricing-3tier-saas",
  "testimonials", "testimonials-carousel", "testimonials-dark", "testimonials-3dark",
  "projects-grid-cases", "projects-horizontal", "project-masonry-wall",
  "products-3card-shop", "product-cards-grid", "product-bundle-compare",
  "team-mini-grid", "feature-grid", "tech-stack", "comparison-table",
  "why-me", "logo-cloud", "trust-badges",
]);

const spacingPresetOptions: { value: SpacingPreset; label: string; desc: string }[] = [
  { value: "compact", label: "Compact", desc: "20px" },
  { value: "normal", label: "Normal", desc: "48px" },
  { value: "large", label: "Large", desc: "80px" },
  { value: "hero", label: "Hero", desc: "100px" },
];

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const sectionLabel = "text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 block";

function SegmentedPresets({ options, value, onChange }: { options: { value: string | number; label: string }[]; value: string | number | undefined; onChange: (v: string | number) => void }) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
            String(value ?? "") === String(opt.value)
              ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
              : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function BuilderPropertyPanel() {
  const { state, dispatch } = useBuilder();
  const [activeTab, setActiveTab] = useState<InspectorTab>("content");

  const activeBlock = state.site.pages
    .flatMap((p) => p.blocks)
    .find((b) => b.id === state.activeBlockId);

  const variants = useMemo(
    () => activeBlock ? getVariantsForBlock(activeBlock.type) : [],
    [activeBlock?.type],
  );

  const blockErrors = useMemo(
    () => activeBlock ? getBlockErrors(state.site, activeBlock.id) : [],
    [state.site, activeBlock?.id],
  );

  if (!activeBlock) {
    return (
      <div className="w-[320px] flex-shrink-0 bg-white border-l border-[#E6E6E4] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-10 h-10 rounded-xl bg-[#F7F7F5] flex items-center justify-center mx-auto mb-3">
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

  const updateStyle = (style: Partial<BlockStyle>) => {
    dispatch({ type: "UPDATE_BLOCK_STYLE", blockId: activeBlock.id, style });
  };

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-[#E6E6E4] flex flex-col overflow-hidden">
      {/* Header — block info */}
      <div className="px-4 py-2.5 border-b border-[#E6E6E4] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-sm bg-[#4F46E5]" />
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
      <div className="flex border-b border-[#E6E6E4]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-[11px] font-medium transition-all relative ${
              activeTab === tab.id ? "text-[#4F46E5]" : "text-[#999] hover:text-[#666]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#4F46E5] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* Block validation errors */}
        {blockErrors.length > 0 && (
          <div className="mx-3 mt-3 mb-0">
            {blockErrors.map((err, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 px-3 py-2 rounded-lg mb-1.5 ${
                  err.severity === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-amber-50 border border-amber-200"
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={err.severity === "error" ? "#dc2626" : "#d97706"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span className={`text-[11px] font-medium ${err.severity === "error" ? "text-red-700" : "text-amber-700"}`}>
                  {err.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── CONTENT TAB ── */}
        {activeTab === "content" && (
          <div className="px-4 py-4">
            <BlockEditor block={activeBlock} />
          </div>
        )}

        {/* ── STYLE TAB (PREMIUM) ── */}
        {activeTab === "style" && (
          <div className="px-4 py-4 space-y-5">
            {/* Style presets — quick apply */}
            <details className="group">
              <summary className="text-[11px] font-semibold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] select-none flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90"><polyline points="9 18 15 12 9 6" /></svg>
                Presets de style
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {stylePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => updateStyle(preset.style)}
                    className="px-2 py-2 rounded-lg border border-[#E6E6E4] hover:border-[#4F46E5]/40 transition-all text-left"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div
                        className="w-3 h-3 rounded border border-black/10 flex-shrink-0"
                        style={{ background: preset.style.backgroundColor || "#fff" }}
                      />
                      <span className="text-[10px] font-semibold text-[#1A1A1A]">{preset.name}</span>
                    </div>
                    <span className="text-[9px] text-[#999]">{preset.description}</span>
                  </button>
                ))}
              </div>
            </details>

            {/* Padding presets */}
            <div>
              <span className={sectionLabel}>Espacement haut</span>
              <SegmentedPresets
                options={paddingPresets}
                value={activeBlock.style.paddingTop ?? 40}
                onChange={(v) => updateStyle({ paddingTop: v as number })}
              />
            </div>
            <div>
              <span className={sectionLabel}>Espacement bas</span>
              <SegmentedPresets
                options={paddingPresets}
                value={activeBlock.style.paddingBottom ?? 40}
                onChange={(v) => updateStyle({ paddingBottom: v as number })}
              />
            </div>

            {/* Container width */}
            <div>
              <span className={sectionLabel}>Largeur du conteneur</span>
              <SegmentedPresets
                options={containerWidthOptions}
                value={activeBlock.style.containerWidth || "full"}
                onChange={(v) => updateStyle({ containerWidth: v as BlockStyle["containerWidth"] })}
              />
            </div>

            {/* Alignment */}
            <div>
              <span className={sectionLabel}>Alignement texte</span>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    onClick={() => updateStyle({ textAlign: align })}
                    className={`flex-1 py-2 rounded-md border flex items-center justify-center transition-all ${
                      (activeBlock.style.textAlign || "left") === align
                        ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                        : "border-[#E6E6E4] text-[#999] hover:border-[#4F46E5]/30"
                    }`}
                  >
                    <span className="text-[10px] font-medium capitalize">{align === "left" ? "Gauche" : align === "center" ? "Centre" : "Droite"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background preset */}
            <div>
              <span className={sectionLabel}>Fond</span>
              <div className="grid grid-cols-3 gap-1.5">
                {bgPresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => updateStyle({ backgroundColor: preset.value })}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                      (activeBlock.style.backgroundColor || "") === preset.value
                        ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                        : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded border border-[#E6E6E4] flex-shrink-0"
                      style={{ background: preset.color === "transparent" ? "repeating-conic-gradient(#ddd 0 25%, transparent 0 50%) 0/8px 8px" : preset.color }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text tone */}
            <div>
              <span className={sectionLabel}>Ton du texte</span>
              <SegmentedPresets
                options={textTonePresets}
                value={activeBlock.style.textColor || ""}
                onChange={(v) => updateStyle({ textColor: String(v) })}
              />
            </div>

            {/* Spacing preset */}
            <div>
              <span className={sectionLabel}>Espacement rapide</span>
              <div className="flex gap-1">
                {spacingPresetOptions.map((sp) => (
                  <button
                    key={sp.value}
                    onClick={() => {
                      const values = { compact: { paddingTop: 20, paddingBottom: 20 }, normal: { paddingTop: 48, paddingBottom: 48 }, large: { paddingTop: 80, paddingBottom: 80 }, hero: { paddingTop: 100, paddingBottom: 100 } }[sp.value];
                      updateStyle({ ...values, spacingPreset: sp.value });
                    }}
                    className={`flex-1 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                      activeBlock.style.spacingPreset === sp.value
                        ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                        : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                    }`}
                    title={sp.desc}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover effect — only for card-based blocks */}
            {CARD_BLOCK_TYPES.has(activeBlock.type) && (
              <div>
                <span className={sectionLabel}>Effet au survol</span>
                <div className="grid grid-cols-3 gap-1">
                  {hoverEffectOptions.map((h) => (
                    <button
                      key={h.value}
                      onClick={() => updateStyle({ hoverEffect: h.value })}
                      className={`py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                        (activeBlock.style.hoverEffect || "none") === h.value
                          ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                          : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full style editor (collapsed by default) */}
            <details className="border-t border-[#E6E6E4] pt-3">
              <summary className="text-[11px] font-semibold text-[#999] uppercase tracking-wider cursor-pointer hover:text-[#666] select-none">
                Style avancé
              </summary>
              <div className="pt-3">
                <BlockStyleEditor block={activeBlock} />
              </div>
            </details>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === "settings" && (
          <div className="px-4 py-4 space-y-4">
            {/* Variant selector */}
            {variants.length > 0 && (
              <div>
                <span className={sectionLabel}>Variante</span>
                <div className="space-y-1">
                  {variants.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => {
                        dispatch({ type: "UPDATE_BLOCK_SETTINGS", blockId: activeBlock.id, settings: { variantKey: v.key } });
                        dispatch({ type: "UPDATE_BLOCK_STYLE", blockId: activeBlock.id, style: v.style });
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
                        activeBlock.settings?.variantKey === v.key
                          ? "border-[#4F46E5] bg-[#EEF2FF]/50"
                          : "border-[#E6E6E4] hover:border-[#4F46E5]/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-[#1A1A1A]">{v.name}</div>
                        <div className="text-[10px] text-[#999]">{v.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Animation */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Animation au scroll</label>
              <div className="grid grid-cols-2 gap-1.5">
                {animationOptions.map((anim) => (
                  <button
                    key={anim.value}
                    onClick={() => dispatch({ type: "UPDATE_BLOCK_SETTINGS", blockId: activeBlock.id, settings: { animation: anim.value } })}
                    className={`px-2 py-2 rounded-lg border transition-all text-left ${
                      (activeBlock.settings?.animation || "none") === anim.value
                        ? "border-[#4F46E5] bg-[#EEF2FF]/50"
                        : "border-[#E6E6E4] hover:border-[#4F46E5]/30"
                    }`}
                  >
                    <div className="text-[11px] font-medium text-[#1A1A1A]">{anim.label}</div>
                    <div className="text-[9px] text-[#999]">{anim.description}</div>
                  </button>
                ))}
              </div>

              {/* Duration & Delay — only if animation is set */}
              {activeBlock.settings?.animation && activeBlock.settings.animation !== "none" && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="flex items-center justify-between text-[10px] text-[#999] mb-1">
                      <span>Duree</span>
                      <span className="font-mono">{(activeBlock.settings.animationDuration ?? 0.5).toFixed(1)}s</span>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.5"
                      step="0.1"
                      value={activeBlock.settings.animationDuration ?? 0.5}
                      onChange={(e) => dispatch({ type: "UPDATE_BLOCK_SETTINGS", blockId: activeBlock.id, settings: { animationDuration: parseFloat(e.target.value) } })}
                      className="w-full h-1.5 rounded-full bg-[#E6E6E4] accent-[#4F46E5] cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-[10px] text-[#999] mb-1">
                      <span>Delai</span>
                      <span className="font-mono">{(activeBlock.settings.animationDelay ?? 0).toFixed(1)}s</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={activeBlock.settings.animationDelay ?? 0}
                      onChange={(e) => dispatch({ type: "UPDATE_BLOCK_SETTINGS", blockId: activeBlock.id, settings: { animationDelay: parseFloat(e.target.value) } })}
                      className="w-full h-1.5 rounded-full bg-[#E6E6E4] accent-[#4F46E5] cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Visibility toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Visibilité</label>
              <button
                onClick={() => dispatch({ type: "TOGGLE_BLOCK_VISIBILITY", blockId: activeBlock.id })}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition-all ${
                  activeBlock.visible
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#E6E6E4] bg-gray-50 text-[#999]"
                }`}
              >
                <div className={`w-8 h-4 rounded-full transition-all relative ${activeBlock.visible ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${activeBlock.visible ? "left-4" : "left-0.5"}`} />
                </div>
                <span className="text-[12px] font-medium">{activeBlock.visible ? "Visible" : "Masqué"}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#E6E6E4] space-y-1.5">
              <span className={sectionLabel}>Actions</span>
              <button
                onClick={() => dispatch({ type: "DUPLICATE_BLOCK", blockId: activeBlock.id })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E6E6E4] text-[12px] text-[#666] hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Dupliquer ce bloc
              </button>
              <button
                onClick={() => {
                  updateStyle({ paddingTop: 40, paddingBottom: 40, backgroundColor: undefined, textColor: undefined, backgroundGradient: undefined, containerWidth: undefined, textAlign: undefined });
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E6E6E4] text-[12px] text-[#666] hover:border-amber-300 hover:text-amber-600 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Réinitialiser le style
              </button>
              <button
                onClick={() => dispatch({ type: "REMOVE_BLOCK", blockId: activeBlock.id })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-red-100 text-[12px] text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Supprimer ce bloc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
