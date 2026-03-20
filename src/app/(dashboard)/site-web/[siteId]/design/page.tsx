"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";
import { useParams } from "next/navigation";
import type { SiteTheme } from "@/types";

/* ═══════════════════════════════════════════════════════════════════════
   DESIGN STUDIO V2 — Premium theme customization
   ═══════════════════════════════════════════════════════════════════════ */

const INPUT = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

/* ── Font library ── */
const FONTS = [
  { name: "Inter", category: "Sans-serif" },
  { name: "DM Sans", category: "Sans-serif" },
  { name: "Poppins", category: "Sans-serif" },
  { name: "Outfit", category: "Sans-serif" },
  { name: "Space Grotesk", category: "Sans-serif" },
  { name: "Plus Jakarta Sans", category: "Sans-serif" },
  { name: "Manrope", category: "Sans-serif" },
  { name: "Sora", category: "Sans-serif" },
  { name: "Playfair Display", category: "Serif" },
  { name: "Cormorant Garamond", category: "Serif" },
  { name: "Libre Baskerville", category: "Serif" },
  { name: "JetBrains Mono", category: "Mono" },
];

/* ── Presets ── */
const PRESETS = [
  { name: "Clean", primary: "#4F46E5", secondary: "#6366F1", accent: "#818CF8", bg: "#ffffff", surface: "#F9FAFB", text: "#111827", muted: "#6B7280", border: "#E5E7EB", headingFont: "Inter", bodyFont: "Inter", radius: "rounded" as const, shadow: "sm" as const, density: "balanced" as const, cardRadius: "md" as const, tags: ["Professionnel", "Sobre"] },
  { name: "Bold", primary: "#E11D48", secondary: "#F43F5E", accent: "#FB7185", bg: "#ffffff", surface: "#FFF1F2", text: "#191919", muted: "#71717A", border: "#E4E4E7", headingFont: "Poppins", bodyFont: "Poppins", radius: "pill" as const, shadow: "lg" as const, density: "balanced" as const, cardRadius: "lg" as const, tags: ["Audacieux", "Punchy"] },
  { name: "Minimal", primary: "#191919", secondary: "#404040", accent: "#737373", bg: "#ffffff", surface: "#FAFAFA", text: "#0A0A0A", muted: "#A3A3A3", border: "#E5E5E5", headingFont: "Inter", bodyFont: "Inter", radius: "none" as const, shadow: "none" as const, density: "balanced" as const, cardRadius: "sm" as const, tags: ["Épuré", "Moderne"] },
  { name: "Creative", primary: "#7C3AED", secondary: "#8B5CF6", accent: "#A78BFA", bg: "#ffffff", surface: "#F5F3FF", text: "#1E1B4B", muted: "#6D6996", border: "#DDD6FE", headingFont: "Space Grotesk", bodyFont: "DM Sans", radius: "rounded" as const, shadow: "md" as const, density: "spacious" as const, cardRadius: "lg" as const, tags: ["Créatif", "Fun"] },
  { name: "Editorial", primary: "#B45309", secondary: "#D97706", accent: "#FBBF24", bg: "#FFFBEB", surface: "#FEF3C7", text: "#1C1917", muted: "#78716C", border: "#D6D3D1", headingFont: "Playfair Display", bodyFont: "Libre Baskerville", radius: "none" as const, shadow: "sm" as const, density: "spacious" as const, cardRadius: "sm" as const, tags: ["Luxe", "Editorial"] },
  { name: "Studio", primary: "#0EA5E9", secondary: "#38BDF8", accent: "#7DD3FC", bg: "#ffffff", surface: "#F0F9FF", text: "#0C4A6E", muted: "#64748B", border: "#E2E8F0", headingFont: "Outfit", bodyFont: "Inter", radius: "rounded" as const, shadow: "md" as const, density: "compact" as const, cardRadius: "md" as const, tags: ["Tech", "Startup"] },
];

/* ── Shared helpers ── */
function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.section className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 hover:bg-[#FBFBFA] transition-colors">
        <h2 className="text-[14px] font-semibold text-[#191919]">{title}</h2>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" className={`transition-transform ${open ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-[#F3F3F1]">{children}</div>}
    </motion.section>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#999] mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded-lg border border-[#E6E6E4] cursor-pointer" />
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className={`${INPUT} max-w-[120px] text-[12px]`} />
      </div>
    </div>
  );
}

function OptionRow<T extends string>({ label, options, value, onChange, primaryColor }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; primaryColor: string }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#999] mb-2">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${value === opt.value ? "text-white" : "border-[#E6E6E4] text-[#5A5A58] hover:border-[#D0D0CE]"}`}
            style={value === opt.value ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
          >{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */

export default function SiteDesignPage() {
  const { site, mutate } = useSite();
  const { siteId } = useParams<{ siteId: string }>();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  /* Theme state — initialized from DB */
  const [t, setT] = useState<SiteTheme>({ ...site.theme });

  useEffect(() => { setT({ ...site.theme }); }, [site]);

  const update = <K extends keyof SiteTheme>(key: K, value: SiteTheme[K]) => {
    setT((prev) => ({ ...prev, [key]: value }));
  };

  /* Preset apply */
  const applyPreset = (p: typeof PRESETS[number]) => {
    setT((prev) => ({
      ...prev,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      accentColor: p.accent,
      backgroundColor: p.bg,
      surfaceColor: p.surface,
      textColor: p.text,
      mutedTextColor: p.muted,
      borderColor: p.border,
      headingFont: p.headingFont,
      fontFamily: p.bodyFont,
      borderRadius: p.radius,
      shadow: p.shadow,
      density: p.density,
      cardRadius: p.cardRadius,
    }));
  };

  /* Save */
  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }
      await mutate();
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (e) {
      setSaveState("error");
      setErrorMsg(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }, [siteId, t, mutate]);

  /* Shorthand for current accent */
  const pc = t.primaryColor;
  const rMap = { none: "0", rounded: "8px", pill: "999px" };
  const crMap = { none: "0", sm: "4px", md: "8px", lg: "12px", xl: "20px" };
  const shMap = { none: "none", sm: "0 1px 3px rgba(0,0,0,0.08)", md: "0 4px 12px rgba(0,0,0,0.1)", lg: "0 10px 30px rgba(0,0,0,0.12)" };

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* ═══ LIVE PREVIEW ═══ */}
      <Section title="Aperçu en direct" defaultOpen={true}>
        <div className="rounded-xl border border-[#E6E6E4] overflow-hidden mt-3" style={{ fontFamily: t.fontFamily, backgroundColor: t.backgroundColor || "#fff", color: t.textColor || "#111" }}>
          {/* Nav preview */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: t.borderColor || "#E5E7EB" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: pc }} />
              <span className="text-[13px] font-semibold" style={{ fontFamily: t.headingFont || t.fontFamily, fontWeight: t.headingWeight || "700" }}>Mon site</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px]" style={{ color: t.mutedTextColor || "#6B7280" }}>Accueil</span>
              <span className="text-[11px]" style={{ color: t.mutedTextColor || "#6B7280" }}>Services</span>
              <span className="text-[11px]" style={{ color: t.mutedTextColor || "#6B7280" }}>Portfolio</span>
              <span className="text-[11px] font-semibold text-white px-3 py-1" style={{ backgroundColor: pc, borderRadius: rMap[t.borderRadius], textTransform: t.buttonCase === "uppercase" ? "uppercase" : "none" }}>Contact</span>
            </div>
          </div>
          {/* Hero */}
          <div className="px-6 py-10 text-center" style={{ backgroundColor: t.surfaceColor || "#F9FAFB" }}>
            <h1 className="text-[22px] font-bold mb-2" style={{ fontFamily: t.headingFont || t.fontFamily, fontWeight: t.headingWeight || "700", letterSpacing: t.letterSpacing === "tight" ? "-0.02em" : t.letterSpacing === "wide" ? "0.04em" : "0" }}>
              Bienvenue sur mon site
            </h1>
            <p className="text-[13px] mb-5 max-w-sm mx-auto" style={{ color: t.mutedTextColor || "#6B7280", fontWeight: t.bodyWeight || "400", lineHeight: t.lineHeight === "tight" ? 1.3 : t.lineHeight === "relaxed" ? 1.8 : 1.6 }}>
              Découvrez mes services et projets pour donner vie à vos idées créatives.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button className="text-[12px] font-semibold text-white px-5 py-2" style={{ backgroundColor: pc, borderRadius: rMap[t.borderRadius], boxShadow: shMap[t.shadow], textTransform: t.buttonCase === "uppercase" ? "uppercase" : "none" }}>Découvrir</button>
              <button className="text-[12px] font-semibold px-5 py-2 border" style={{ color: pc, borderColor: pc, borderRadius: rMap[t.borderRadius], backgroundColor: "transparent" }}>En savoir plus</button>
            </div>
          </div>
          {/* Cards row */}
          <div className="grid grid-cols-3 gap-3 px-6 py-6">
            {["Service 1", "Service 2", "Service 3"].map((s) => (
              <div key={s} className="p-4" style={{ backgroundColor: t.surfaceColor || "#F9FAFB", borderRadius: crMap[t.cardRadius || "md"], boxShadow: shMap[t.cardShadow || "none"], border: t.cardBorder !== false ? `1px solid ${t.borderColor || "#E5E7EB"}` : "none" }}>
                <div className="w-8 h-8 rounded-lg mb-3" style={{ backgroundColor: `${pc}18` }} />
                <div className="text-[12px] font-semibold mb-1" style={{ fontFamily: t.headingFont || t.fontFamily }}>{s}</div>
                <div className="text-[10px]" style={{ color: t.mutedTextColor || "#6B7280" }}>Description du service proposé.</div>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="px-6 py-4 border-t" style={{ borderColor: t.borderColor || "#E5E7EB", backgroundColor: t.backgroundColor || "#fff" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: t.mutedTextColor || "#6B7280" }}>© 2026 Mon site</span>
              <div className="flex gap-3">
                {["Mentions légales", "Contact"].map((l) => <span key={l} className="text-[10px]" style={{ color: t.mutedTextColor || "#6B7280" }}>{l}</span>)}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══ PRESETS ═══ */}
      <Section title="Thèmes rapides">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {PRESETS.map((p) => (
            <button key={p.name} onClick={() => applyPreset(p)} className="rounded-xl border border-[#E6E6E4] hover:border-[#D0D0CE] transition-all text-left overflow-hidden group">
              {/* Mini preview */}
              <div className="h-12 flex items-center gap-1 px-3" style={{ backgroundColor: p.surface }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.primary }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.secondary }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.accent }} />
                <div className="ml-auto text-[8px] font-semibold" style={{ fontFamily: p.headingFont, color: p.text }}>Aa</div>
              </div>
              <div className="p-3">
                <div className="text-[13px] font-semibold text-[#191919]">{p.name}</div>
                <div className="flex gap-1 mt-1">{p.tags.map((tag) => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#F7F7F5] text-[#8A8A88]">{tag}</span>)}</div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* ═══ COLORS ═══ */}
      <Section title="Couleurs">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
          <ColorField label="Couleur primaire" value={t.primaryColor} onChange={(v) => update("primaryColor", v)} />
          <ColorField label="Couleur secondaire" value={t.secondaryColor || ""} onChange={(v) => update("secondaryColor", v)} />
          <ColorField label="Accent" value={t.accentColor || ""} onChange={(v) => update("accentColor", v)} />
          <ColorField label="Texte principal" value={t.textColor || ""} onChange={(v) => update("textColor", v)} />
          <ColorField label="Texte secondaire" value={t.mutedTextColor || ""} onChange={(v) => update("mutedTextColor", v)} />
          <ColorField label="Arrière-plan" value={t.backgroundColor || ""} onChange={(v) => update("backgroundColor", v)} />
          <ColorField label="Surface / Cartes" value={t.surfaceColor || ""} onChange={(v) => update("surfaceColor", v)} />
          <ColorField label="Bordures" value={t.borderColor || ""} onChange={(v) => update("borderColor", v)} />
        </div>
        {/* Palette preview */}
        <div className="flex gap-1.5 mt-4">
          {[t.primaryColor, t.secondaryColor, t.accentColor, t.textColor, t.mutedTextColor, t.backgroundColor, t.surfaceColor, t.borderColor].filter(Boolean).map((c, i) => (
            <div key={i} className="w-8 h-8 rounded-lg border border-[#E6E6E4]" style={{ backgroundColor: c }} />
          ))}
        </div>
      </Section>

      {/* ═══ TYPOGRAPHY ═══ */}
      <Section title="Typographie">
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-1.5">Police des titres</label>
              <select value={t.headingFont || t.fontFamily} onChange={(e) => update("headingFont", e.target.value)} className={INPUT}>
                {FONTS.map((f) => <option key={f.name} value={f.name}>{f.name} ({f.category})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#999] mb-1.5">Police du corps</label>
              <select value={t.fontFamily} onChange={(e) => update("fontFamily", e.target.value)} className={INPUT}>
                {FONTS.map((f) => <option key={f.name} value={f.name}>{f.name} ({f.category})</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <OptionRow label="Graisse des titres" options={[{ value: "500", label: "Medium" }, { value: "600", label: "Semi-bold" }, { value: "700", label: "Bold" }, { value: "800", label: "Extra-bold" }, { value: "900", label: "Black" }]} value={(t.headingWeight || "700") as "500"} onChange={(v) => update("headingWeight", v as SiteTheme["headingWeight"])} primaryColor={pc} />
            <OptionRow label="Graisse du corps" options={[{ value: "300", label: "Light" }, { value: "400", label: "Regular" }, { value: "500", label: "Medium" }]} value={(t.bodyWeight || "400") as "300"} onChange={(v) => update("bodyWeight", v as SiteTheme["bodyWeight"])} primaryColor={pc} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <OptionRow label="Interligne" options={[{ value: "tight", label: "Serré" }, { value: "normal", label: "Normal" }, { value: "relaxed", label: "Aéré" }]} value={t.lineHeight || "normal"} onChange={(v) => update("lineHeight", v)} primaryColor={pc} />
            <OptionRow label="Espacement des lettres" options={[{ value: "tight", label: "Serré" }, { value: "normal", label: "Normal" }, { value: "wide", label: "Large" }]} value={t.letterSpacing || "normal"} onChange={(v) => update("letterSpacing", v)} primaryColor={pc} />
          </div>
          {/* Specimen */}
          <div className="p-4 rounded-lg border border-[#E6E6E4]" style={{ backgroundColor: t.surfaceColor || "#F9FAFB" }}>
            <div className="text-[18px] mb-1" style={{ fontFamily: t.headingFont || t.fontFamily, fontWeight: Number(t.headingWeight || "700"), color: t.textColor || "#111", letterSpacing: t.letterSpacing === "tight" ? "-0.02em" : t.letterSpacing === "wide" ? "0.04em" : "0" }}>Titre de section</div>
            <div className="text-[13px]" style={{ fontFamily: t.fontFamily, fontWeight: Number(t.bodyWeight || "400"), color: t.mutedTextColor || "#6B7280", lineHeight: t.lineHeight === "tight" ? 1.3 : t.lineHeight === "relaxed" ? 1.8 : 1.6 }}>Voici un exemple de paragraphe avec la typographie sélectionnée. Le texte doit être lisible et agréable.</div>
          </div>
        </div>
      </Section>

      {/* ═══ BUTTONS ═══ */}
      <Section title="Boutons">
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <OptionRow label="Arrondi des boutons" options={[{ value: "none", label: "Aucun" }, { value: "sm", label: "Léger" }, { value: "md", label: "Moyen" }, { value: "full", label: "Pilule" }]} value={t.buttonRadius || "md"} onChange={(v) => update("buttonRadius", v)} primaryColor={pc} />
            <OptionRow label="Texte des boutons" options={[{ value: "normal", label: "Normal" }, { value: "uppercase", label: "MAJUSCULES" }]} value={t.buttonCase || "normal"} onChange={(v) => update("buttonCase", v)} primaryColor={pc} />
          </div>
          <OptionRow label="Style par défaut" options={[{ value: "filled", label: "Rempli" }, { value: "outline", label: "Contour" }, { value: "ghost", label: "Ghost" }, { value: "soft", label: "Soft" }]} value={t.buttonStyle || "filled"} onChange={(v) => update("buttonStyle", v)} primaryColor={pc} />
          {/* Button preview */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F7F7F5]">
            {(() => {
              const br = { none: "0", sm: "4px", md: "8px", full: "999px" }[t.buttonRadius || "md"];
              const up = t.buttonCase === "uppercase" ? "uppercase" : "none";
              const style = t.buttonStyle || "filled";
              return (
                <>
                  <button className="text-[12px] font-semibold px-5 py-2" style={{ backgroundColor: style === "filled" ? pc : style === "soft" ? `${pc}15` : "transparent", color: style === "filled" ? "#fff" : pc, border: style === "outline" ? `2px solid ${pc}` : style === "ghost" ? "none" : "none", borderRadius: br, textTransform: up as "uppercase" | "none" }}>Primaire</button>
                  <button className="text-[12px] font-semibold px-5 py-2 border" style={{ color: pc, borderColor: `${pc}40`, borderRadius: br, textTransform: up as "uppercase" | "none" }}>Secondaire</button>
                </>
              );
            })()}
          </div>
        </div>
      </Section>

      {/* ═══ CARDS & SURFACES ═══ */}
      <Section title="Cartes & surfaces">
        <div className="space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4">
            <OptionRow label="Arrondi des cartes" options={[{ value: "none", label: "Aucun" }, { value: "sm", label: "Léger" }, { value: "md", label: "Moyen" }, { value: "lg", label: "Grand" }, { value: "xl", label: "Très grand" }]} value={t.cardRadius || "md"} onChange={(v) => update("cardRadius", v)} primaryColor={pc} />
            <OptionRow label="Ombre des cartes" options={[{ value: "none", label: "Aucune" }, { value: "sm", label: "Légère" }, { value: "md", label: "Moyenne" }, { value: "lg", label: "Forte" }]} value={t.cardShadow || "none"} onChange={(v) => update("cardShadow", v)} primaryColor={pc} />
          </div>
          {/* Card preview */}
          <div className="flex gap-3">
            {["Feature", "Témoignage"].map((label) => (
              <div key={label} className="flex-1 p-4" style={{ backgroundColor: t.surfaceColor || "#F9FAFB", borderRadius: crMap[t.cardRadius || "md"], boxShadow: shMap[t.cardShadow || "none"], border: `1px solid ${t.borderColor || "#E5E7EB"}` }}>
                <div className="w-6 h-6 rounded-md mb-2" style={{ backgroundColor: `${pc}18` }} />
                <div className="text-[12px] font-semibold mb-0.5" style={{ fontFamily: t.headingFont || t.fontFamily, color: t.textColor || "#111" }}>{label}</div>
                <div className="text-[10px]" style={{ color: t.mutedTextColor || "#6B7280" }}>Aperçu du style de carte.</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ SHAPE ═══ */}
      <Section title="Bordures & profondeur">
        <div className="space-y-4 mt-3">
          <OptionRow label="Arrondis globaux" options={[{ value: "none", label: "Angulaire" }, { value: "rounded", label: "Arrondis" }, { value: "pill", label: "Pilule" }]} value={t.borderRadius} onChange={(v) => update("borderRadius", v)} primaryColor={pc} />
          <OptionRow label="Ombres globales" options={[{ value: "none", label: "Aucune" }, { value: "sm", label: "Légère" }, { value: "md", label: "Moyenne" }, { value: "lg", label: "Forte" }]} value={t.shadow} onChange={(v) => update("shadow", v)} primaryColor={pc} />
        </div>
      </Section>

      {/* ═══ SPACING ═══ */}
      <Section title="Espacement & densité">
        <div className="space-y-4 mt-3">
          <OptionRow label="Densité globale" options={[{ value: "compact", label: "Compact" }, { value: "balanced", label: "Équilibré" }, { value: "spacious", label: "Aéré" }]} value={t.density || "balanced"} onChange={(v) => update("density", v)} primaryColor={pc} />
          <OptionRow label="Espacement des sections" options={[{ value: "compact", label: "Serré" }, { value: "normal", label: "Normal" }, { value: "large", label: "Grand" }, { value: "hero", label: "Très grand" }]} value={t.sectionGap || "normal"} onChange={(v) => update("sectionGap", v)} primaryColor={pc} />
          <OptionRow label="Largeur du contenu" options={[{ value: "narrow", label: "Étroit" }, { value: "default", label: "Standard" }, { value: "wide", label: "Large" }]} value={t.containerWidth || "default"} onChange={(v) => update("containerWidth", v)} primaryColor={pc} />
        </div>
      </Section>

      {/* ═══ MOTION ═══ */}
      <Section title="Animations & interactions" defaultOpen={false}>
        <div className="space-y-4 mt-3">
          <OptionRow label="Survol des cartes" options={[{ value: "none", label: "Aucun" }, { value: "subtle", label: "Subtil" }, { value: "medium", label: "Moyen" }, { value: "strong", label: "Fort" }]} value={t.hoverLift || "subtle"} onChange={(v) => update("hoverLift", v)} primaryColor={pc} />
          <OptionRow label="Vitesse des transitions" options={[{ value: "fast", label: "Rapide" }, { value: "normal", label: "Normale" }, { value: "slow", label: "Lente" }]} value={t.transitionSpeed || "normal"} onChange={(v) => update("transitionSpeed", v)} primaryColor={pc} />
        </div>
      </Section>

      {/* ═══ SAVE BAR ═══ */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-4">
        {saveState === "saved" && <span className="text-[12px] font-medium text-emerald-600">Design sauvegardé</span>}
        {saveState === "error" && <span className="text-[12px] font-medium text-red-500">{errorMsg || "Erreur"}</span>}
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
          style={{ backgroundColor: pc }}
        >
          {saveState === "saving" && <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
          {saveState === "saving" ? "Sauvegarde..." : "Sauvegarder le design"}
        </button>
      </div>
    </div>
  );
}
