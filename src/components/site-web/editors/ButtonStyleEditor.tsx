"use client";

import type { ButtonStyle } from "@/types";

interface ButtonStyleEditorProps {
  value?: ButtonStyle;
  onChange: (style: ButtonStyle) => void;
}

const smallInputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-2.5 py-1.5 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const sectionLabel = "text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2 block";

const shadowOptions: { value: string; label: string }[] = [
  { value: "none", label: "—" },
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

export default function ButtonStyleEditor({ value, onChange }: ButtonStyleEditorProps) {
  const btn: ButtonStyle = value ?? {};

  const update = (patch: Partial<ButtonStyle>) => onChange({ ...btn, ...patch });

  return (
    <div className="space-y-3">
      <span className={sectionLabel}>Bouton</span>

      {/* Colors row */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-[#BBB] mb-1">Fond</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={btn.bg || "#4F46E5"}
              onChange={(e) => update({ bg: e.target.value })}
              className="w-6 h-6 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              value={btn.bg || ""}
              onChange={(e) => update({ bg: e.target.value })}
              placeholder="#4F46E5"
              className={smallInputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#BBB] mb-1">Texte</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={btn.text || "#ffffff"}
              onChange={(e) => update({ text: e.target.value })}
              className="w-6 h-6 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              value={btn.text || ""}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="#ffffff"
              className={smallInputClass}
            />
          </div>
        </div>
      </div>

      {/* Border + radius */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-[#BBB] mb-1">Bordure</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={btn.border || "#00000000"}
              onChange={(e) => update({ border: e.target.value })}
              className="w-6 h-6 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
            />
            <input
              type="text"
              value={btn.border || ""}
              onChange={(e) => update({ border: e.target.value })}
              placeholder="transparent"
              className={smallInputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-[#BBB] mb-1">Radius</label>
          <input
            type="number"
            value={btn.radius ?? ""}
            onChange={(e) => update({ radius: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="8"
            className={smallInputClass}
          />
        </div>
      </div>

      {/* Hover section */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <span className="text-[10px] font-semibold text-[#BBB] uppercase tracking-wider mb-2 block">Hover</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Fond hover</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={btn.hoverBg || "#4338CA"}
                onChange={(e) => update({ hoverBg: e.target.value })}
                className="w-6 h-6 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={btn.hoverBg || ""}
                onChange={(e) => update({ hoverBg: e.target.value })}
                placeholder="#4338CA"
                className={smallInputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Texte hover</label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={btn.hoverText || "#ffffff"}
                onChange={(e) => update({ hoverText: e.target.value })}
                className="w-6 h-6 rounded border border-[#E6E6E4] cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={btn.hoverText || ""}
                onChange={(e) => update({ hoverText: e.target.value })}
                placeholder="#ffffff"
                className={smallInputClass}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Scale</label>
            <input
              type="number"
              step="0.01"
              min="1"
              max="1.1"
              value={btn.hoverScale ?? ""}
              onChange={(e) => update({ hoverScale: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="1.00"
              className={smallInputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Transition</label>
            <input
              type="number"
              step="50"
              min="0"
              max="600"
              value={btn.transitionMs ?? ""}
              onChange={(e) => update({ transitionMs: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="200"
              className={smallInputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-[#BBB] mb-1">Ombre</label>
            <div className="flex gap-0.5">
              {shadowOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => update({ hoverShadow: s.value as ButtonStyle["hoverShadow"] })}
                  className={`flex-1 py-1 rounded text-[9px] font-medium transition-colors ${
                    (btn.hoverShadow || "none") === s.value
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
