"use client";

import { useState } from "react";
import { useBuilder } from "@/lib/site-builder-context";
import { designPresets, backgroundPresets } from "@/lib/site-designs";
import { TEMPLATES } from "@/lib/site-templates";
import type { SiteTheme, SiteDesign, SitePage, Block, BackgroundPreset, BackgroundConfig } from "@/types";

const sectionLabel = "text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 block";
const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

/** Sanitize a color value for <input type="color"> — must be #rrggbb */
function toHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return fallback;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-medium text-[#BBB] mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={toHexColor(value, "#ffffff")}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="flex-1 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 transition-all"
        />
      </div>
    </div>
  );
}

function SegmentedControl<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
            value === opt.value
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

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "'Inter Tight', 'Inter', sans-serif", label: "Inter Tight" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Sora', sans-serif", label: "Sora" },
];

const cardStyleOptions: { value: SiteDesign["cardStyle"]; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "bordered", label: "Bordure" },
  { value: "elevated", label: "Elevee" },
  { value: "glass", label: "Glass" },
];

const buttonVariantOptions: { value: SiteDesign["buttonVariant"]; label: string }[] = [
  { value: "solid", label: "Solide" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
  { value: "gradient", label: "Gradient" },
];

const navStyleOptions: { value: SiteDesign["navStyle"]; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "solid", label: "Solide" },
  { value: "blur", label: "Flou" },
];

const footerStyleOptions: { value: SiteDesign["footerStyle"]; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "columns", label: "Colonnes" },
  { value: "centered", label: "Centre" },
];

const buttonRadiusOptions: { value: NonNullable<SiteTheme["buttonRadius"]>; label: string }[] = [
  { value: "none", label: "Carre" },
  { value: "sm", label: "Petit" },
  { value: "md", label: "Moyen" },
  { value: "full", label: "Pilule" },
];

const containerOptions: { value: NonNullable<SiteTheme["containerWidth"]>; label: string }[] = [
  { value: "narrow", label: "Etroit" },
  { value: "default", label: "Defaut" },
  { value: "wide", label: "Large" },
];

const sectionGapOptions: { value: NonNullable<SiteTheme["sectionGap"]>; label: string; desc: string }[] = [
  { value: "none", label: "0", desc: "0px" },
  { value: "compact", label: "S", desc: "24px" },
  { value: "normal", label: "M", desc: "48px" },
  { value: "large", label: "L", desc: "72px" },
  { value: "hero", label: "XL", desc: "120px" },
];

export default function ThemeEditorPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useBuilder();
  const theme = state.site.theme;
  const design = state.site.design;
  const [confirmTemplate, setConfirmTemplate] = useState<string | null>(null);

  const updateTheme = (partial: Partial<SiteTheme>) => {
    dispatch({ type: "UPDATE_SITE_THEME", theme: partial });
  };

  const updateDesign = (partial: Partial<SiteDesign>) => {
    dispatch({ type: "UPDATE_DESIGN", design: partial });
  };

  const hasBlocks = state.site.pages.some((p) => p.blocks.length > 0);

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Convert template pages to SitePage format
    const pages: SitePage[] = template.pages.map((tp) => ({
      id: crypto.randomUUID(),
      name: tp.title,
      slug: tp.is_home ? "/" : `/${tp.slug}`,
      status: "draft" as const,
      blocks: tp.blocks.map((tb) => ({
        id: crypto.randomUUID(),
        type: tb.type,
        content: tb.content,
        style: tb.style,
        settings: tb.settings,
        visible: tb.visible,
      } as unknown as Block)),
    }));

    dispatch({
      type: "APPLY_FULL_TEMPLATE",
      theme: template.theme,
      design: template.design,
      nav: template.nav,
      footer: template.footer,
      pages,
    });
    setConfirmTemplate(null);
  };

  const handlePresetClick = (templateId: string) => {
    if (hasBlocks) {
      setConfirmTemplate(templateId);
    } else {
      applyTemplate(templateId);
    }
  };

  const currentDesignKey = design?.designKey || "custom";

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-[#E6E6E4] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#E6E6E4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="text-[12px] font-semibold text-[#1A1A1A]">Design system</span>
        </div>
        <button onClick={onClose} className="text-[#999] hover:text-[#666] p-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* ── Confirmation Dialog ── */}
        {confirmTemplate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
            <p className="text-[12px] font-medium text-amber-800">La page contient deja des blocs. Appliquer ce theme va remplacer tout le contenu.</p>
            <div className="flex gap-2">
              <button onClick={() => applyTemplate(confirmTemplate)} className="flex-1 text-[11px] font-semibold py-1.5 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors">Remplacer</button>
              <button onClick={() => { const t = TEMPLATES.find((t) => t.id === confirmTemplate); if (t) { dispatch({ type: "APPLY_DESIGN", theme: t.theme, design: t.design, nav: t.nav, footer: t.footer }); setConfirmTemplate(null); } }} className="flex-1 text-[11px] font-semibold py-1.5 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors">Style seul</button>
              <button onClick={() => setConfirmTemplate(null)} className="text-[11px] font-medium py-1.5 px-2 rounded-md text-[#666] hover:bg-[#F7F7F5] transition-colors">Annuler</button>
            </div>
          </div>
        )}

        {/* ── Design Presets ── */}
        <div>
          <span className={sectionLabel}>Thème complet</span>
          <p className="text-[10px] text-[#888] mb-2">Applique le style + crée la landing avec les blocs premium.</p>
          <div className="space-y-2">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handlePresetClick(template.id)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  currentDesignKey === template.id
                    ? "border-[#4F46E5] bg-[#EEF2FF] ring-1 ring-[#4F46E5]/20"
                    : "border-[#E6E6E4] hover:border-[#4F46E5]/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${template.gradient}`}
                  >
                    <span className="text-white text-[11px] font-bold">{template.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#1A1A1A]">{template.name}</div>
                    <div className="text-[10px] text-[#888] truncate">{template.audience}</div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full border border-black/10" style={{ background: template.theme.backgroundColor }} />
                    <div className="w-3 h-3 rounded-full border border-black/10" style={{ background: template.theme.surfaceColor }} />
                    <div className="w-3 h-3 rounded-full border border-black/10" style={{ background: template.theme.primaryColor }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Background Preset ── */}
        <div>
          <span className={sectionLabel}>Fond de page</span>
          <div className="grid grid-cols-4 gap-1.5">
            {backgroundPresets.map((bp) => {
              const activeBgType = design?.background?.type || design?.backgroundPreset || "none";
              return (
                <button
                  key={bp.key}
                  onClick={() => {
                    const current = design?.background || { type: design?.backgroundPreset || "none" as BackgroundPreset };
                    updateDesign({
                      backgroundPreset: bp.key as BackgroundPreset,
                      background: { ...current, type: bp.key as BackgroundPreset },
                    });
                  }}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md border text-[9px] font-medium transition-all ${
                    activeBgType === bp.key
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded border border-black/10"
                    style={(() => {
                      const bgColor = theme.backgroundColor || "#fff";
                      if (!bp.css && bp.key !== "solid") return { backgroundColor: bgColor };
                      if (bp.key === "solid") return { backgroundColor: theme.primaryColor + "20", border: `1px solid ${theme.primaryColor}40` };
                      if (bp.key === "glow") return { backgroundImage: `radial-gradient(ellipse at center, ${theme.primaryColor}40, transparent)`, backgroundColor: bgColor };
                      if (bp.key === "mesh") return { backgroundImage: `radial-gradient(at 30% 30%, ${theme.primaryColor}30, transparent), radial-gradient(at 70% 70%, ${theme.secondaryColor || theme.primaryColor}20, transparent)`, backgroundColor: bgColor };
                      if (bp.key === "grid-tech") return { backgroundImage: `repeating-linear-gradient(0deg, #666 0px, transparent 1px, transparent 6px), repeating-linear-gradient(90deg, #666 0px, transparent 1px, transparent 6px)`, backgroundSize: "6px 6px", backgroundColor: bgColor };
                      if (bp.key === "noise") return { backgroundColor: "#333" };
                      if (bp.key === "dots") return { backgroundImage: `radial-gradient(circle, #888 1px, transparent 1px)`, backgroundSize: "4px 4px", backgroundColor: bgColor };
                      if (bp.key === "gradient-radial") return { backgroundImage: `radial-gradient(ellipse at center, #333, #111)` };
                      return { backgroundColor: bgColor };
                    })()}
                  />
                  {bp.name}
                </button>
              );
            })}
          </div>

          {/* Background params */}
          {(() => {
            const bgType = design?.background?.type || design?.backgroundPreset || "none";
            if (bgType === "none") return null;
            const bgConfig = design?.background || { type: bgType as BackgroundPreset };
            const updateBg = (patch: Partial<BackgroundConfig>) => {
              updateDesign({ background: { ...bgConfig, ...patch } });
            };
            const showOpacity = ["grid-tech", "dots", "noise"].includes(bgType);
            const showSize = ["grid-tech", "dots"].includes(bgType);
            const showBlur = bgType === "glow";
            const showColors = ["glow", "mesh", "solid"].includes(bgType);
            if (!showOpacity && !showSize && !showBlur && !showColors) return null;
            return (
              <div className="mt-3 space-y-2 pt-2 border-t border-[#E6E6E4]">
                <span className="text-[9px] font-medium text-[#BBB] uppercase tracking-wider block">Paramètres du fond</span>
                {showColors && (
                  <div className="grid grid-cols-2 gap-2">
                    <ColorField label="Couleur 1" value={bgConfig.primaryColor || theme.primaryColor} onChange={(v) => updateBg({ primaryColor: v })} />
                    {bgType === "mesh" && <ColorField label="Couleur 2" value={bgConfig.secondaryColor || theme.secondaryColor || ""} onChange={(v) => updateBg({ secondaryColor: v })} />}
                  </div>
                )}
                {showOpacity && (
                  <div>
                    <label className="block text-[10px] font-medium text-[#BBB] mb-1">Opacite ({Math.round((bgConfig.opacity ?? 0.5) * 100)}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={bgConfig.opacity ?? 0.5}
                      onChange={(e) => updateBg({ opacity: parseFloat(e.target.value) })}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                    />
                  </div>
                )}
                {showSize && (
                  <div>
                    <label className="block text-[10px] font-medium text-[#BBB] mb-1">Taille ({bgConfig.size ?? (bgType === "dots" ? 20 : 40)}px)</label>
                    <input
                      type="range"
                      min="8"
                      max="80"
                      step="2"
                      value={bgConfig.size ?? (bgType === "dots" ? 20 : 40)}
                      onChange={(e) => updateBg({ size: parseInt(e.target.value) })}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                    />
                  </div>
                )}
                {showBlur && (
                  <div>
                    <label className="block text-[10px] font-medium text-[#BBB] mb-1">Etendue ({bgConfig.blur ?? 60}%)</label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={bgConfig.blur ?? 60}
                      onChange={(e) => updateBg({ blur: parseInt(e.target.value) })}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]"
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── Design Properties ── */}
        <div>
          <span className={sectionLabel}>Style des elements</span>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Cartes</label>
              <SegmentedControl options={cardStyleOptions} value={design?.cardStyle || "bordered"} onChange={(v) => updateDesign({ cardStyle: v })} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Boutons</label>
              <SegmentedControl options={buttonVariantOptions} value={design?.buttonVariant || "solid"} onChange={(v) => updateDesign({ buttonVariant: v })} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Navigation</label>
              <SegmentedControl options={navStyleOptions} value={design?.navStyle || "solid"} onChange={(v) => updateDesign({ navStyle: v })} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Footer</label>
              <SegmentedControl options={footerStyleOptions} value={design?.footerStyle || "minimal"} onChange={(v) => updateDesign({ footerStyle: v })} />
            </div>
          </div>
        </div>

        {/* ── Colors ── */}
        <div>
          <span className={sectionLabel}>Couleurs</span>
          <div className="space-y-2.5">
            <ColorField label="Accent principal" value={theme.primaryColor} onChange={(v) => updateTheme({ primaryColor: v })} />
            <ColorField label="Accent secondaire" value={theme.secondaryColor || ""} onChange={(v) => updateTheme({ secondaryColor: v })} />
            <ColorField label="Fond de page" value={theme.backgroundColor || ""} onChange={(v) => updateTheme({ backgroundColor: v })} />
            <ColorField label="Surface (cartes)" value={theme.surfaceColor || ""} onChange={(v) => updateTheme({ surfaceColor: v })} />
            <ColorField label="Texte principal" value={theme.textColor || ""} onChange={(v) => updateTheme({ textColor: v })} />
            <ColorField label="Texte secondaire" value={theme.mutedTextColor || ""} onChange={(v) => updateTheme({ mutedTextColor: v })} />
            <ColorField label="Bordures" value={theme.borderColor || ""} onChange={(v) => updateTheme({ borderColor: v })} />
          </div>
        </div>

        {/* ── Button Theme Defaults ── */}
        <div>
          <span className={sectionLabel}>Boutons (theme)</span>
          <p className="text-[9px] text-[#888] mb-2">Couleurs par defaut des CTA. Chaque bloc peut overrider.</p>
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <ColorField label="Fond bouton" value={theme.buttonBg || ""} onChange={(v) => updateTheme({ buttonBg: v || undefined })} />
              <ColorField label="Texte bouton" value={theme.buttonText || ""} onChange={(v) => updateTheme({ buttonText: v || undefined })} />
            </div>
            <ColorField label="Bordure bouton" value={theme.buttonBorder || ""} onChange={(v) => updateTheme({ buttonBorder: v || undefined })} />
            <div className="pt-1.5 border-t border-[#E6E6E4]">
              <span className="text-[9px] font-medium text-[#BBB] uppercase tracking-wider mb-1.5 block">Hover</span>
              <div className="grid grid-cols-2 gap-2">
                <ColorField label="Fond hover" value={theme.buttonHoverBg || ""} onChange={(v) => updateTheme({ buttonHoverBg: v || undefined })} />
                <ColorField label="Texte hover" value={theme.buttonHoverText || ""} onChange={(v) => updateTheme({ buttonHoverText: v || undefined })} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <ColorField label="Bordure hover" value={theme.buttonHoverBorder || ""} onChange={(v) => updateTheme({ buttonHoverBorder: v || undefined })} />
                <div>
                  <label className="block text-[10px] font-medium text-[#BBB] mb-1">Scale hover</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="1.15"
                    value={theme.buttonHoverScale ?? ""}
                    onChange={(e) => updateTheme({ buttonHoverScale: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="1.00"
                    className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Typography ── */}
        <div>
          <span className={sectionLabel}>Typographie</span>
          <div className="space-y-2.5">
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Police du corps</label>
              <select value={theme.fontFamily} onChange={(e) => updateTheme({ fontFamily: e.target.value })} className={inputClass}>
                {fontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Police des titres</label>
              <select value={theme.headingFont || theme.fontFamily} onChange={(e) => updateTheme({ headingFont: e.target.value })} className={inputClass}>
                <option value="">Meme que le corps</option>
                {fontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Global Style ── */}
        <div>
          <span className={sectionLabel}>Style global</span>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Boutons (radius)</label>
              <SegmentedControl options={buttonRadiusOptions} value={theme.buttonRadius || "md"} onChange={(v) => updateTheme({ buttonRadius: v })} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Largeur contenu</label>
              <SegmentedControl options={containerOptions} value={theme.containerWidth || "default"} onChange={(v) => updateTheme({ containerWidth: v })} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Espacement sections</label>
              <div className="flex gap-1">
                {sectionGapOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateTheme({ sectionGap: opt.value })}
                    title={opt.desc}
                    className={`flex-1 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                      (theme.sectionGap || "none") === opt.value
                        ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                        : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-[#BBB] mt-1">Gap vertical entre les sections ({sectionGapOptions.find(o => o.value === (theme.sectionGap || "none"))?.desc || "0px"})</p>
            </div>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div>
          <span className={sectionLabel}>Aperçu</span>
          <div
            className="rounded-lg border overflow-hidden p-4"
            style={{
              backgroundColor: theme.backgroundColor || "#fff",
              color: theme.textColor || "#191919",
              borderColor: theme.borderColor || "#E6E6E4",
              fontFamily: theme.fontFamily,
            }}
          >
            <h3 className="font-bold text-sm mb-1" style={{ fontFamily: theme.headingFont || theme.fontFamily }}>
              Titre d&apos;exemple
            </h3>
            <p className="text-[11px] mb-3" style={{ color: theme.mutedTextColor || "#5A5A58" }}>
              Aperçu du rendu avec votre design system.
            </p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 text-[11px] font-semibold transition-all"
                style={{
                  backgroundColor: theme.buttonBg || theme.primaryColor,
                  color: theme.buttonText || "#fff",
                  border: theme.buttonBorder ? `1px solid ${theme.buttonBorder}` : "none",
                  borderRadius: theme.buttonRadius === "full" ? "999px" : theme.buttonRadius === "sm" ? "4px" : theme.buttonRadius === "none" ? "0" : "8px",
                }}
              >
                Bouton principal
              </button>
              <button
                className="px-3 py-1.5 text-[11px] font-medium border"
                style={{
                  borderColor: theme.borderColor || "#E6E6E4",
                  color: theme.textColor || "#191919",
                  borderRadius: theme.buttonRadius === "full" ? "999px" : theme.buttonRadius === "sm" ? "4px" : theme.buttonRadius === "none" ? "0" : "8px",
                }}
              >
                Secondaire
              </button>
            </div>
            <div
              className="mt-3 p-2 rounded text-[10px]"
              style={{ backgroundColor: theme.surfaceColor || "#F7F7F5", color: theme.mutedTextColor || "#5A5A58" }}
            >
              Surface / carte
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
