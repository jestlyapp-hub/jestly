"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockStyle, BlockType, BackgroundPreset, BackgroundConfig, BackgroundPosition } from "@/types";
import { backgroundPresets } from "@/lib/site-designs";
import ButtonStyleEditor from "./ButtonStyleEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const smallInputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

/** Sanitize a color value for <input type="color"> — must be #rrggbb */
function toHexColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return fallback;
}
const sectionLabel = "text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 block";

const shadowOptions: { value: NonNullable<BlockStyle["shadow"]>; label: string }[] = [
  { value: "none", label: "Aucune" },
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

const textAlignOptions: { value: NonNullable<BlockStyle["textAlign"]>; icon: React.ReactNode }[] = [
  {
    value: "left",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>,
  },
  {
    value: "center",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>,
  },
  {
    value: "right",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" /></svg>,
  },
];

const fontWeightOptions = [
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi-bold" },
  { value: "700", label: "Bold" },
];

const borderRadiusPresets = [
  { value: 0, label: "0" },
  { value: 4, label: "4" },
  { value: 8, label: "8" },
  { value: 12, label: "12" },
  { value: 16, label: "16" },
  { value: 24, label: "24" },
];

// Blocks that contain a button / CTA
const blocksWithButton: BlockType[] = [
  "hero", "pack-premium", "centered-cta", "custom-form",
  "calendar-booking", "newsletter",
  "pricing-table", "cta-premium", "contact-form", "service-cards",
  "video-text-split", "comparison-table",
  "lead-magnet", "availability-banner",
];

export default function BlockStyleEditor({ block }: { block: Block }) {
  const { dispatch } = useBuilder();

  const update = (style: Partial<BlockStyle>) => {
    dispatch({ type: "UPDATE_BLOCK_STYLE", blockId: block.id, style });
  };

  const hasButton = blocksWithButton.includes(block.type);

  return (
    <div className="space-y-5">
      {/* ─── COLORS ─── */}
      <div>
        <span className={sectionLabel}>Couleurs</span>
        <div className="space-y-2.5">
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Fond</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={toHexColor(block.style.backgroundColor, "#ffffff")}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={block.style.backgroundColor || ""}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
                className={smallInputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Texte</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={toHexColor(block.style.textColor, "#1a1a1a")}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-7 h-7 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={block.style.textColor || ""}
                onChange={(e) => update({ textColor: e.target.value })}
                placeholder="#1a1a1a"
                className={smallInputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── TYPOGRAPHY ─── */}
      <div>
        <span className={sectionLabel}>Typographie</span>
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Taille (px)</label>
              <input
                type="number"
                value={block.style.fontSize ?? ""}
                onChange={(e) => update({ fontSize: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Auto"
                className={smallInputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Interligne</label>
              <input
                type="number"
                step="0.1"
                value={block.style.lineHeight ?? ""}
                onChange={(e) => update({ lineHeight: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Auto"
                className={smallInputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Graisse</label>
            <div className="grid grid-cols-4 gap-1">
              {fontWeightOptions.map((fw) => (
                <button
                  key={fw.value}
                  onClick={() => update({ fontWeight: fw.value })}
                  className={`py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                    (block.style.fontWeight || "400") === fw.value
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                  }`}
                >
                  {fw.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Alignement</label>
            <div className="flex gap-1">
              {textAlignOptions.map((ta) => (
                <button
                  key={ta.value}
                  onClick={() => update({ textAlign: ta.value })}
                  className={`flex-1 py-2 rounded-md border flex items-center justify-center transition-all ${
                    (block.style.textAlign || "left") === ta.value
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#E6E6E4] text-[#999] hover:border-[#4F46E5]/30"
                  }`}
                >
                  {ta.icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SPACING ─── */}
      <div>
        <span className={sectionLabel}>Espacement</span>
        <div className="space-y-2.5">
          {/* Padding visual box */}
          <div className="border border-[#E6E6E4] rounded-lg p-2 bg-[#FBFBFA]">
            <div className="text-[9px] text-[#BBB] text-center mb-1 uppercase tracking-wider">Padding</div>
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                value={block.style.paddingTop ?? 0}
                onChange={(e) => update({ paddingTop: parseInt(e.target.value) || 0 })}
                className="w-14 text-center bg-white border border-[#E6E6E4] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/40"
              />
              <div className="flex items-center gap-1 w-full">
                <input
                  type="number"
                  value={block.style.paddingLeft ?? 0}
                  onChange={(e) => update({ paddingLeft: parseInt(e.target.value) || 0 })}
                  className="w-14 text-center bg-white border border-[#E6E6E4] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/40"
                />
                <div className="flex-1 h-8 border border-dashed border-[#D0D5E0] rounded bg-white" />
                <input
                  type="number"
                  value={block.style.paddingRight ?? 0}
                  onChange={(e) => update({ paddingRight: parseInt(e.target.value) || 0 })}
                  className="w-14 text-center bg-white border border-[#E6E6E4] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/40"
                />
              </div>
              <input
                type="number"
                value={block.style.paddingBottom ?? 0}
                onChange={(e) => update({ paddingBottom: parseInt(e.target.value) || 0 })}
                className="w-14 text-center bg-white border border-[#E6E6E4] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── BORDER & SHADOW ─── */}
      <div>
        <span className={sectionLabel}>Bordure & ombre</span>
        <div className="space-y-2.5">
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Border radius</label>
            <div className="flex gap-1">
              {borderRadiusPresets.map((br) => (
                <button
                  key={br.value}
                  onClick={() => update({ borderRadius: br.value })}
                  className={`flex-1 py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                    (block.style.borderRadius ?? 0) === br.value
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                  }`}
                >
                  {br.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Ombre</label>
            <div className="grid grid-cols-4 gap-1">
              {shadowOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => update({ shadow: s.value })}
                  className={`py-1.5 rounded-md border text-[10px] font-medium transition-all ${
                    (block.style.shadow || "none") === s.value
                      ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                      : "border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── BACKGROUND GRADIENT ─── */}
      <div>
        <span className={sectionLabel}>Dégradé</span>
        <input
          type="text"
          value={block.style.backgroundGradient || ""}
          onChange={(e) => update({ backgroundGradient: e.target.value })}
          placeholder="linear-gradient(135deg, #fff, #f0f)"
          className={inputClass}
        />
        <p className="text-[10px] text-[#BBB] mt-1">CSS gradient (remplace la couleur de fond)</p>
      </div>

      {/* ─── BLOCK BACKGROUND V2 ─── */}
      <div>
        <span className={sectionLabel}>Fond du bloc</span>

        {/* ── Type selector: base modes ── */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {([
            { type: undefined as BackgroundPreset | undefined, label: "Heriter", preview: <div className="w-6 h-6 rounded-md border-2 border-dashed border-[#ccc] flex items-center justify-center text-[9px] text-[#aaa]">H</div> },
            { type: "none" as BackgroundPreset, label: "Aucun", preview: <div className="w-6 h-6 rounded-md border border-[#ddd] bg-white" /> },
            { type: "solid" as BackgroundPreset, label: "Uni", preview: <div className="w-6 h-6 rounded-md" style={{ backgroundColor: block.style.background?.type === "solid" ? block.style.background.primaryColor || "#1a1a2e" : "#1a1a2e" }} /> },
          ]).map(({ type, label, preview }) => (
            <button
              key={label}
              onClick={() => type === undefined ? update({ background: undefined }) : update({ background: { ...block.style.background, type } as BackgroundConfig })}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-semibold transition-all ${
                (type === undefined && !block.style.background) || block.style.background?.type === type
                  ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                  : "border-[#E6E6E4] text-[#888] hover:border-[#4F46E5]/30"
              }`}
            >
              {preview}
              {label}
            </button>
          ))}
        </div>

        {/* ── Effect modes ── */}
        <div className="grid grid-cols-3 gap-1.5 mb-1.5">
          {(["glow", "mesh", "gradient-radial", "grid-tech", "dots", "noise"] as BackgroundPreset[]).map((bgType) => {
            const labels: Record<string, string> = { glow: "Glow", mesh: "Mesh", "gradient-radial": "Radial", "grid-tech": "Grille", dots: "Dots", noise: "Noise" };
            const previews: Record<string, string> = {
              glow: "radial-gradient(ellipse at 50% 30%, rgba(79,70,229,0.3), transparent 70%)",
              mesh: "radial-gradient(at 30% 30%, rgba(79,70,229,0.15), transparent 50%), radial-gradient(at 70% 70%, rgba(99,102,241,0.1), transparent 50%)",
              "gradient-radial": "radial-gradient(ellipse at center, #1a1a2e, #0a0a0f)",
              "grid-tech": "linear-gradient(rgba(100,100,120,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,120,0.2) 1px, transparent 1px)",
              dots: "radial-gradient(circle, rgba(100,100,120,0.5) 1.2px, transparent 1.2px)",
              noise: "#333",
            };
            return (
              <button
                key={bgType}
                onClick={() => update({ background: { ...block.style.background, type: bgType } as BackgroundConfig })}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-semibold transition-all ${
                  block.style.background?.type === bgType
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                    : "border-[#E6E6E4] text-[#888] hover:border-[#4F46E5]/30"
                }`}
              >
                <div className="w-6 h-6 rounded-md border border-black/10" style={{
                  background: previews[bgType],
                  backgroundSize: bgType === "grid-tech" ? "8px 8px" : bgType === "dots" ? "6px 6px" : undefined,
                  backgroundColor: ["grid-tech", "dots", "noise"].includes(bgType) ? "#1a1a2e" : undefined,
                }} />
                {labels[bgType]}
              </button>
            );
          })}
        </div>

        {/* ── Premium modes ── */}
        <p className="text-[9px] font-semibold text-[#BBB] uppercase tracking-wider mt-3 mb-1.5">Premium</p>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {(["particles-float", "particles-constellation", "particles-aura", "luxe-waves", "halo-spotlight"] as BackgroundPreset[]).map((bgType) => {
            const labels: Record<string, string> = {
              "particles-float": "Particules", "particles-constellation": "Constellation",
              "particles-aura": "Aura", "luxe-waves": "Luxe Waves", "halo-spotlight": "Halo",
            };
            const icons: Record<string, string> = {
              "particles-float": "\u2726", "particles-constellation": "\u2B21",
              "particles-aura": "\u25C9", "luxe-waves": "\u224B", "halo-spotlight": "\u25CE",
            };
            return (
              <button
                key={bgType}
                onClick={() => update({ background: { ...block.style.background, type: bgType, opacity: block.style.background?.opacity ?? 0.6 } as BackgroundConfig })}
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-[9px] font-semibold transition-all ${
                  block.style.background?.type === bgType
                    ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                    : "border-[#E6E6E4] text-[#888] hover:border-[#4F46E5]/30"
                }`}
              >
                <div className="w-6 h-6 rounded-md border border-black/10 bg-[#0a0a1a] flex items-center justify-center text-[11px] text-indigo-300">{icons[bgType]}</div>
                {labels[bgType]}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════
            MODE-AWARE CONTROLS V2
           ══════════════════════════════════════════ */}
        {block.style.background && block.style.background.type !== "none" && (() => {
          const bgConfig = block.style.background;
          const updateBg = (patch: Partial<BackgroundConfig>) => update({ background: { ...bgConfig, ...patch } });
          const bgType = bgConfig.type;

          const isParticle = ["particles-float", "particles-constellation", "particles-aura"].includes(bgType);
          const isGradient = ["glow", "mesh", "gradient-radial", "luxe-waves", "halo-spotlight"].includes(bgType);
          const isPattern = ["grid-tech", "dots", "noise"].includes(bgType);

          // Control visibility matrix
          const showColor = bgType !== "noise" && bgType !== "gradient-radial" && bgType !== "none";
          const showSecondaryColor = ["mesh", "luxe-waves", "particles-constellation", "particles-aura"].includes(bgType);
          const showStrength = bgType !== "solid" && bgType !== "gradient-radial";
          const showPosition = ["glow", "gradient-radial", "halo-spotlight", "particles-aura"].includes(bgType);
          const showSpacing = ["grid-tech", "dots"].includes(bgType);
          const showLineWidth = bgType === "grid-tech";
          const showDotSize = bgType === "dots";
          const showNoiseScale = bgType === "noise";
          const showBlur = ["glow", "halo-spotlight"].includes(bgType);
          const showSpread = ["glow", "halo-spotlight"].includes(bgType);
          const showDensity = isParticle;
          const showSpeed = isParticle;
          const showParticleSize = isParticle;

          if (bgType === "solid" && !showColor) return null;

          // ── Presets per mode ──
          const presets: { label: string; config: Partial<BackgroundConfig> }[] = (() => {
            switch (bgType) {
              case "grid-tech": return [
                { label: "Subtil", config: { opacity: 0.3, size: 48, lineWidth: 0.5 } },
                { label: "Editorial", config: { opacity: 0.5, size: 60, lineWidth: 1 } },
                { label: "Tech", config: { opacity: 0.7, size: 28, lineWidth: 1.5 } },
              ];
              case "dots": return [
                { label: "Subtil", config: { opacity: 0.3, size: 24, dotSize: 0.8 } },
                { label: "Premium", config: { opacity: 0.5, size: 16, dotSize: 1.2 } },
                { label: "Dense", config: { opacity: 0.7, size: 12, dotSize: 1.8 } },
              ];
              case "noise": return [
                { label: "Subtil", config: { opacity: 0.2, size: 256 } },
                { label: "Texture", config: { opacity: 0.5, size: 200 } },
                { label: "Grain", config: { opacity: 0.8, size: 150 } },
              ];
              case "glow": return [
                { label: "Subtil", config: { opacity: 0.3, blur: 80, size: 60, position: undefined } },
                { label: "Hero", config: { opacity: 0.6, blur: 50, size: 90, position: "top" as BackgroundPosition } },
                { label: "Spotlight", config: { opacity: 0.8, blur: 40, size: 100, position: "center" as BackgroundPosition } },
              ];
              case "halo-spotlight": return [
                { label: "Doux", config: { opacity: 0.4, blur: 100, size: 40, position: undefined } },
                { label: "Hero", config: { opacity: 0.7, blur: 60, size: 70, position: "top" as BackgroundPosition } },
                { label: "Dramatique", config: { opacity: 0.9, blur: 30, size: 90, position: "center" as BackgroundPosition } },
              ];
              case "mesh": return [
                { label: "Subtil", config: { opacity: 0.3 } },
                { label: "Premium", config: { opacity: 0.6 } },
                { label: "Intense", config: { opacity: 0.9 } },
              ];
              case "luxe-waves": return [
                { label: "Calme", config: { opacity: 0.3 } },
                { label: "Premium", config: { opacity: 0.5 } },
                { label: "Expressif", config: { opacity: 0.8 } },
              ];
              case "gradient-radial": return [
                { label: "Centre", config: { position: "center" as BackgroundPosition } },
                { label: "Haut", config: { position: "top" as BackgroundPosition } },
                { label: "Bas", config: { position: "bottom" as BackgroundPosition } },
              ];
              case "particles-float": return [
                { label: "Subtil", config: { opacity: 0.3, density: 0.5, speed: 0.4, particleSize: 1.5 } },
                { label: "Premium", config: { opacity: 0.5, density: 1, speed: 0.7, particleSize: 2 } },
                { label: "Intense", config: { opacity: 0.7, density: 1.5, speed: 1, particleSize: 2.5 } },
              ];
              case "particles-constellation": return [
                { label: "Subtil", config: { opacity: 0.3, density: 0.5, speed: 0.3, particleSize: 1.5 } },
                { label: "Premium", config: { opacity: 0.5, density: 1, speed: 0.6, particleSize: 2 } },
                { label: "Reseau", config: { opacity: 0.7, density: 1.8, speed: 0.5, particleSize: 1.5 } },
              ];
              case "particles-aura": return [
                { label: "Calme", config: { opacity: 0.3, density: 0.5, speed: 0.3, particleSize: 2 } },
                { label: "Hero", config: { opacity: 0.6, density: 1, speed: 0.7, particleSize: 2.5, position: "center" as BackgroundPosition } },
                { label: "Cinema", config: { opacity: 0.8, density: 1.5, speed: 0.5, particleSize: 3 } },
              ];
              default: return [];
            }
          })();

          const sliderClass = "w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#4F46E5]";
          const controlLabel = "block text-[10px] font-medium text-[#BBB] mb-1";

          // Position options
          const positionOptions: { value: BackgroundPosition | undefined; label: string }[] = [
            { value: undefined, label: "Centre" },
            { value: "top", label: "Haut" },
            { value: "bottom", label: "Bas" },
            { value: "left", label: "Gauche" },
            { value: "right", label: "Droite" },
            { value: "top-left", label: "Haut-G" },
            { value: "top-right", label: "Haut-D" },
            { value: "bottom-left", label: "Bas-G" },
            { value: "bottom-right", label: "Bas-D" },
          ];

          return (
            <div className="mt-2 border-t border-[#F0F0EE] pt-2.5 space-y-3">

              {/* ── Presets ── */}
              {presets.length > 0 && (
                <div>
                  <label className={controlLabel}>Style rapide</label>
                  <div className="flex gap-1.5">
                    {presets.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => updateBg(p.config)}
                        className="flex-1 text-[10px] font-medium py-1.5 rounded-md border border-[#E6E6E4] text-[#666] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] hover:bg-[#EEF2FF]/50 transition-all"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Colors ── */}
              {showColor && (
                <div>
                  <label className={controlLabel}>Couleur</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={toHexColor(bgConfig.primaryColor, "#4F46E5")} onChange={(e) => updateBg({ primaryColor: e.target.value })} className="w-7 h-7 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0" />
                    <input type="text" value={bgConfig.primaryColor || ""} onChange={(e) => updateBg({ primaryColor: e.target.value })} placeholder="#4F46E5" className={smallInputClass} />
                  </div>
                </div>
              )}
              {showSecondaryColor && (
                <div>
                  <label className={controlLabel}>Couleur secondaire</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={toHexColor(bgConfig.secondaryColor, "#6366F1")} onChange={(e) => updateBg({ secondaryColor: e.target.value })} className="w-7 h-7 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0" />
                    <input type="text" value={bgConfig.secondaryColor || ""} onChange={(e) => updateBg({ secondaryColor: e.target.value })} placeholder="#6366F1" className={smallInputClass} />
                  </div>
                </div>
              )}

              {/* ── Strength / Opacity ── */}
              {showStrength && (
                <div>
                  <label className={controlLabel}>Intensite ({Math.round((bgConfig.opacity ?? 0.5) * 100)}%)</label>
                  <input type="range" min="0.05" max="1" step="0.05" value={bgConfig.opacity ?? 0.5} onChange={(e) => updateBg({ opacity: parseFloat(e.target.value) })} className={sliderClass} />
                </div>
              )}

              {/* ── Position / Focal ── */}
              {showPosition && (
                <div>
                  <label className={controlLabel}>Point focal</label>
                  <div className="grid grid-cols-3 gap-1">
                    {positionOptions.slice(0, 3).map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => updateBg({ position: opt.value })}
                        className={`text-[9px] font-medium py-1 rounded border transition-all ${
                          (bgConfig.position ?? undefined) === opt.value || (!bgConfig.position && !opt.value)
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] text-[#888] hover:border-[#4F46E5]/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {positionOptions.slice(3, 6).map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => updateBg({ position: opt.value })}
                        className={`text-[9px] font-medium py-1 rounded border transition-all ${
                          bgConfig.position === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] text-[#888] hover:border-[#4F46E5]/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {positionOptions.slice(6).map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => updateBg({ position: opt.value })}
                        className={`text-[9px] font-medium py-1 rounded border transition-all ${
                          bgConfig.position === opt.value
                            ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                            : "border-[#E6E6E4] text-[#888] hover:border-[#4F46E5]/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Pattern controls ── */}
              {isPattern && (
                <div className="space-y-2.5">
                  {showSpacing && (
                    <div>
                      <label className={controlLabel}>Espacement ({bgConfig.size ?? (bgType === "dots" ? 20 : 40)}px)</label>
                      <input type="range" min="8" max="80" step="2" value={bgConfig.size ?? (bgType === "dots" ? 20 : 40)} onChange={(e) => updateBg({ size: parseInt(e.target.value) })} className={sliderClass} />
                    </div>
                  )}
                  {showLineWidth && (
                    <div>
                      <label className={controlLabel}>Epaisseur ({bgConfig.lineWidth ?? 1}px)</label>
                      <input type="range" min="0.5" max="3" step="0.25" value={bgConfig.lineWidth ?? 1} onChange={(e) => updateBg({ lineWidth: parseFloat(e.target.value) })} className={sliderClass} />
                    </div>
                  )}
                  {showDotSize && (
                    <div>
                      <label className={controlLabel}>Taille des points ({bgConfig.dotSize ?? 1.2}px)</label>
                      <input type="range" min="0.5" max="4" step="0.2" value={bgConfig.dotSize ?? 1.2} onChange={(e) => updateBg({ dotSize: parseFloat(e.target.value) })} className={sliderClass} />
                    </div>
                  )}
                  {showNoiseScale && (
                    <div>
                      <label className={controlLabel}>Echelle ({bgConfig.size ?? 256}px)</label>
                      <input type="range" min="64" max="512" step="16" value={bgConfig.size ?? 256} onChange={(e) => updateBg({ size: parseInt(e.target.value) })} className={sliderClass} />
                    </div>
                  )}
                </div>
              )}

              {/* ── Gradient / Glow controls ── */}
              {isGradient && (showBlur || showSpread) && (
                <div className="space-y-2.5">
                  {showSpread && (
                    <div>
                      <label className={controlLabel}>Etendue ({bgConfig.size ?? (bgType === "halo-spotlight" ? 50 : 80)}%)</label>
                      <input type="range" min="20" max="120" step="5" value={bgConfig.size ?? (bgType === "halo-spotlight" ? 50 : 80)} onChange={(e) => updateBg({ size: parseInt(e.target.value) })} className={sliderClass} />
                    </div>
                  )}
                  {showBlur && (
                    <div>
                      <label className={controlLabel}>Flou ({bgConfig.blur ?? (bgType === "halo-spotlight" ? 80 : 60)})</label>
                      <input type="range" min="10" max="150" step="5" value={bgConfig.blur ?? (bgType === "halo-spotlight" ? 80 : 60)} onChange={(e) => updateBg({ blur: parseInt(e.target.value) })} className={sliderClass} />
                    </div>
                  )}
                </div>
              )}

              {/* ── Particle controls ── */}
              {isParticle && (
                <div className="space-y-2.5">
                  <div>
                    <label className={controlLabel}>Densite ({Math.round((bgConfig.density ?? 1) * 100)}%)</label>
                    <input type="range" min="0.2" max="2" step="0.1" value={bgConfig.density ?? 1} onChange={(e) => updateBg({ density: Math.min(2, parseFloat(e.target.value)) })} className={sliderClass} />
                  </div>
                  <div>
                    <label className={controlLabel}>Vitesse ({Math.round((bgConfig.speed ?? 1) * 100)}%)</label>
                    <input type="range" min="0.1" max="2" step="0.1" value={bgConfig.speed ?? 1} onChange={(e) => updateBg({ speed: Math.min(2, parseFloat(e.target.value)) })} className={sliderClass} />
                  </div>
                  <div>
                    <label className={controlLabel}>Taille particules ({bgConfig.particleSize ?? 2}px)</label>
                    <input type="range" min="0.5" max="5" step="0.5" value={bgConfig.particleSize ?? 2} onChange={(e) => updateBg({ particleSize: Math.min(5, parseFloat(e.target.value)) })} className={sliderClass} />
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ─── BUTTON STYLE (conditional) ─── */}
      {hasButton && (
        <div className="pt-2 border-t border-[#E6E6E4]">
          <ButtonStyleEditor
            value={block.style.buttonStyle}
            onChange={(buttonStyle) => update({ buttonStyle })}
          />
        </div>
      )}
    </div>
  );
}
