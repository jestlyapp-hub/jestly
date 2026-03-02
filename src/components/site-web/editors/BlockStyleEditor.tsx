"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockStyle } from "@/types";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";
const smallInputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";
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

export default function BlockStyleEditor({ block }: { block: Block }) {
  const { dispatch } = useBuilder();

  const update = (style: Partial<BlockStyle>) => {
    dispatch({ type: "UPDATE_BLOCK_STYLE", blockId: block.id, style });
  };

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
                value={block.style.backgroundColor || "#ffffff"}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="w-7 h-7 rounded border border-[#E6E8F0] cursor-pointer flex-shrink-0"
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
                value={block.style.textColor || "#1a1a1a"}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-7 h-7 rounded border border-[#E6E8F0] cursor-pointer flex-shrink-0"
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
                      ? "border-[#6a18f1] bg-[#F0EBFF] text-[#6a18f1]"
                      : "border-[#E6E8F0] text-[#666] hover:border-[#6a18f1]/30"
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
                      ? "border-[#6a18f1] bg-[#F0EBFF] text-[#6a18f1]"
                      : "border-[#E6E8F0] text-[#999] hover:border-[#6a18f1]/30"
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
          <div className="border border-[#E6E8F0] rounded-lg p-2 bg-[#FAFBFD]">
            <div className="text-[9px] text-[#BBB] text-center mb-1 uppercase tracking-wider">Padding</div>
            <div className="flex flex-col items-center gap-1">
              <input
                type="number"
                value={block.style.paddingTop ?? 40}
                onChange={(e) => update({ paddingTop: parseInt(e.target.value) || 0 })}
                className="w-14 text-center bg-white border border-[#E6E8F0] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/40"
              />
              <div className="flex items-center gap-1 w-full">
                <input
                  type="number"
                  value={block.style.paddingLeft ?? 0}
                  onChange={(e) => update({ paddingLeft: parseInt(e.target.value) || 0 })}
                  className="w-14 text-center bg-white border border-[#E6E8F0] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/40"
                />
                <div className="flex-1 h-8 border border-dashed border-[#D0D5E0] rounded bg-white" />
                <input
                  type="number"
                  value={block.style.paddingRight ?? 0}
                  onChange={(e) => update({ paddingRight: parseInt(e.target.value) || 0 })}
                  className="w-14 text-center bg-white border border-[#E6E8F0] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/40"
                />
              </div>
              <input
                type="number"
                value={block.style.paddingBottom ?? 40}
                onChange={(e) => update({ paddingBottom: parseInt(e.target.value) || 0 })}
                className="w-14 text-center bg-white border border-[#E6E8F0] rounded px-1 py-0.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/40"
              />
            </div>
          </div>
          {/* Margin */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Margin haut</label>
              <input
                type="number"
                value={block.style.marginTop ?? 0}
                onChange={(e) => update({ marginTop: parseInt(e.target.value) || 0 })}
                className={smallInputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-[#BBB] mb-1">Margin bas</label>
              <input
                type="number"
                value={block.style.marginBottom ?? 0}
                onChange={(e) => update({ marginBottom: parseInt(e.target.value) || 0 })}
                className={smallInputClass}
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
                      ? "border-[#6a18f1] bg-[#F0EBFF] text-[#6a18f1]"
                      : "border-[#E6E8F0] text-[#666] hover:border-[#6a18f1]/30"
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
                      ? "border-[#6a18f1] bg-[#F0EBFF] text-[#6a18f1]"
                      : "border-[#E6E8F0] text-[#666] hover:border-[#6a18f1]/30"
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
    </div>
  );
}
