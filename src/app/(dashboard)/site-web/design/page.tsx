"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockSite } from "@/lib/mock-data";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

const fonts = ["Inter", "DM Sans", "Poppins", "Outfit", "Space Grotesk", "Plus Jakarta Sans"];

const radiusOptions = [
  { value: "none", label: "Angulaire" },
  { value: "rounded", label: "Arrondis" },
  { value: "pill", label: "Pilule" },
] as const;

const shadowOptions = [
  { value: "none", label: "Aucune" },
  { value: "sm", label: "Légère" },
  { value: "md", label: "Moyenne" },
  { value: "lg", label: "Forte" },
] as const;

const presets = [
  { name: "Clean", primary: "#4F46E5", font: "Inter", radius: "rounded" as const, shadow: "sm" as const },
  { name: "Bold", primary: "#e11d48", font: "Poppins", radius: "pill" as const, shadow: "lg" as const },
  { name: "Minimal", primary: "#1a1a1a", font: "Inter", radius: "none" as const, shadow: "none" as const },
  { name: "Creative", primary: "#7c3aed", font: "Space Grotesk", radius: "rounded" as const, shadow: "md" as const },
];

export default function SiteDesignPage() {
  const [primaryColor, setPrimaryColor] = useState(mockSite.theme.primaryColor);
  const [fontFamily, setFontFamily] = useState(mockSite.theme.fontFamily);
  const [borderRadius, setBorderRadius] = useState(mockSite.theme.borderRadius);
  const [shadow, setShadow] = useState(mockSite.theme.shadow);

  const applyPreset = (preset: typeof presets[number]) => {
    setPrimaryColor(preset.primary);
    setFontFamily(preset.font);
    setBorderRadius(preset.radius);
    setShadow(preset.shadow);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Presets */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Presets rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-4 rounded-xl border border-[#E6E6E4] hover:border-[#4F46E5] transition-all text-center"
              >
                <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: preset.primary }} />
                <div className="text-[13px] font-medium text-[#1A1A1A]">{preset.name}</div>
                <div className="text-[10px] text-[#999]">{preset.font}</div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Couleur primaire */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Couleur primaire</h2>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-[#E6E6E4] cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className={`${inputClass} max-w-[160px]`}
            />
            <div className="h-10 flex-1 rounded-lg" style={{ backgroundColor: primaryColor }} />
          </div>
        </motion.section>

        {/* Typographie */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Typographie</h2>
          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className={inputClass}>
            {fonts.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <div className="mt-3 p-4 bg-[#F7F7F5] rounded-lg" style={{ fontFamily }}>
            <div className="text-xl font-bold text-[#1A1A1A] mb-1">Aperçu de la typographie</div>
            <div className="text-[13px] text-[#666]">Voici un exemple de texte avec la police sélectionnée.</div>
          </div>
        </motion.section>

        {/* Bords arrondis */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Bords arrondis</h2>
          <div className="flex gap-3">
            {radiusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setBorderRadius(opt.value)}
                className={`flex-1 p-4 border-2 transition-all text-center ${
                  borderRadius === opt.value
                    ? "border-[#4F46E5] bg-[#EEF2FF]"
                    : "border-[#E6E6E4]"
                } ${
                  opt.value === "none" ? "rounded-none" : opt.value === "rounded" ? "rounded-xl" : "rounded-full"
                }`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 bg-[#4F46E5]/10 ${
                  opt.value === "none" ? "rounded-none" : opt.value === "rounded" ? "rounded-lg" : "rounded-full"
                }`} />
                <div className="text-[12px] font-medium text-[#1A1A1A]">{opt.label}</div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Ombres */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Ombres</h2>
          <div className="flex gap-3">
            {shadowOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setShadow(opt.value)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all text-center ${
                  shadow === opt.value
                    ? "border-[#4F46E5] bg-[#EEF2FF]"
                    : "border-[#E6E6E4]"
                }`}
              >
                <div className={`w-10 h-10 mx-auto mb-2 bg-white rounded-lg ${
                  opt.value === "none" ? "" : opt.value === "sm" ? "shadow-sm" : opt.value === "md" ? "shadow-md" : "shadow-lg"
                }`} />
                <div className="text-[12px] font-medium text-[#1A1A1A]">{opt.label}</div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Save */}
        <div className="flex justify-end">
          <button className="bg-[#4F46E5] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
            Sauvegarder le design
          </button>
        </div>
      </div>
    </div>
  );
}
