import type { SiteTheme, SiteDesign, BackgroundPreset, DesignKey, NavConfig, FooterConfig } from "@/types";

/* ═══════════════════════════════════════════════════════════
   BACKGROUND PRESETS — CSS appliqué sur le body du site
   ═══════════════════════════════════════════════════════════ */

export interface BackgroundPresetDef {
  key: BackgroundPreset;
  name: string;
  css: string;           // CSS background/::before layers
  needsBefore: boolean;  // requires a ::before pseudo-element
}

export const backgroundPresets: BackgroundPresetDef[] = [
  {
    key: "none",
    name: "Aucun",
    css: "",
    needsBefore: false,
  },
  {
    key: "glow",
    name: "Glow",
    css: `radial-gradient(ellipse 80% 60% at 50% -20%, var(--site-primary, #4F46E5)22, transparent 70%)`,
    needsBefore: false,
  },
  {
    key: "mesh",
    name: "Mesh gradient",
    css: [
      `radial-gradient(at 20% 20%, var(--site-primary, #4F46E5)15 0%, transparent 50%)`,
      `radial-gradient(at 80% 80%, var(--site-secondary, var(--site-primary, #6366F1))12 0%, transparent 50%)`,
      `radial-gradient(at 50% 50%, var(--site-bg, #0A0A0F) 0%, transparent 100%)`,
    ].join(", "),
    needsBefore: false,
  },
  {
    key: "grid-tech",
    name: "Grid tech",
    css: [
      `linear-gradient(var(--site-border, #1a1a2e)08 1px, transparent 1px)`,
      `linear-gradient(90deg, var(--site-border, #1a1a2e)08 1px, transparent 1px)`,
    ].join(", "),
    needsBefore: true,
  },
  {
    key: "noise",
    name: "Noise",
    css: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    needsBefore: true,
  },
  {
    key: "dots",
    name: "Dots",
    css: `radial-gradient(circle, var(--site-border, #27272A)40 1px, transparent 1px)`,
    needsBefore: true,
  },
  {
    key: "gradient-radial",
    name: "Radial gradient",
    css: `radial-gradient(ellipse at center, var(--site-surface, #141420) 0%, var(--site-bg, #0A0A0F) 70%)`,
    needsBefore: false,
  },
];

export function getBackgroundPreset(key: BackgroundPreset): BackgroundPresetDef | undefined {
  return backgroundPresets.find((p) => p.key === key);
}

/**
 * Generate CSS for background preset (used in public renderer).
 * Returns inline style + optional <style> tag content for ::before.
 */
export function getBackgroundCSS(key: BackgroundPreset): { style: React.CSSProperties; beforeCSS?: string } {
  const preset = getBackgroundPreset(key);
  if (!preset || !preset.css) return { style: {} };

  if (!preset.needsBefore) {
    return { style: { backgroundImage: preset.css } };
  }

  // ::before overlay
  const gridSize = key === "grid-tech" ? "background-size: 40px 40px;" :
                   key === "dots" ? "background-size: 20px 20px;" : "";
  const beforeCSS = `.site-bg-preset::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: ${preset.css};
    ${gridSize}
    opacity: 0.5;
  }`;

  return { style: { position: "relative" as const }, beforeCSS };
}


/* ═══════════════════════════════════════════════════════════
   COMPLETE DESIGN PRESETS — chaque design = theme + design + nav + footer
   ═══════════════════════════════════════════════════════════ */

export interface FullDesignPreset {
  key: DesignKey;
  name: string;
  description: string;
  audience: string;
  theme: SiteTheme;
  design: SiteDesign;
  nav: NavConfig;
  footer: FooterConfig;
}

/* ── 1. CREATOR — Portfolio / Créatif ── */
const creatorDesign: FullDesignPreset = {
  key: "creator",
  name: "Creator",
  description: "Design portfolio pour créatifs, artistes et freelances visuels",
  audience: "Photographes, designers, illustrateurs, DA",
  theme: {
    primaryColor: "#F59E0B",
    secondaryColor: "#EF4444",
    backgroundColor: "#0C0A09",
    surfaceColor: "#1C1917",
    textColor: "#FAFAF9",
    mutedTextColor: "#A8A29E",
    borderColor: "#292524",
    fontFamily: "'DM Sans', sans-serif",
    headingFont: "'Playfair Display', serif",
    borderRadius: "rounded",
    shadow: "md",
    mode: "dark",
    containerWidth: "default",
    buttonRadius: "full",
  },
  design: {
    designKey: "creator",
    backgroundPreset: "glow",
    heroVariant: "hero-creator",
    cardStyle: "elevated",
    buttonVariant: "solid",
    navStyle: "transparent",
    footerStyle: "minimal",
  },
  nav: {
    links: [
      { label: "Portfolio" },
      { label: "Services" },
      { label: "A propos" },
      { label: "Contact" },
    ],
    showCta: true,
    ctaLabel: "Me contacter",
  },
  footer: {
    links: [
      { label: "Portfolio" },
      { label: "Services" },
      { label: "Contact" },
      { label: "Mentions legales" },
    ],
    showSocials: true,
    copyright: "Tous droits reserves.",
  },
};

/* ── 2. PRODUCT — SaaS / Dev / Business ── */
const productDesign: FullDesignPreset = {
  key: "product",
  name: "Product",
  description: "Design professionnel pour SaaS, devs et business",
  audience: "Developpeurs, consultants, agences, startups",
  theme: {
    primaryColor: "#6366F1",
    secondaryColor: "#8B5CF6",
    backgroundColor: "#09090B",
    surfaceColor: "#18181B",
    textColor: "#FAFAFA",
    mutedTextColor: "#A1A1AA",
    borderColor: "#27272A",
    fontFamily: "'Space Grotesk', sans-serif",
    headingFont: "'Space Grotesk', sans-serif",
    borderRadius: "rounded",
    shadow: "sm",
    mode: "dark",
    containerWidth: "default",
    buttonRadius: "md",
  },
  design: {
    designKey: "product",
    backgroundPreset: "grid-tech",
    heroVariant: "hero-tech",
    cardStyle: "bordered",
    buttonVariant: "gradient",
    navStyle: "blur",
    footerStyle: "columns",
  },
  nav: {
    links: [
      { label: "Features" },
      { label: "Pricing" },
      { label: "Docs" },
      { label: "Blog" },
    ],
    showCta: true,
    ctaLabel: "Get started",
  },
  footer: {
    links: [
      { label: "Features" },
      { label: "Pricing" },
      { label: "Docs" },
      { label: "Terms" },
      { label: "Privacy" },
    ],
    showSocials: true,
    copyright: "All rights reserved.",
  },
};

/* ── 3. CINEMA — Video / Montage ── */
const cinemaDesign: FullDesignPreset = {
  key: "cinema",
  name: "Cinema",
  description: "Design cinématique pour vidéastes et monteurs",
  audience: "Monteurs vidéo, réalisateurs, motion designers",
  theme: {
    primaryColor: "#22D3EE",
    secondaryColor: "#A78BFA",
    backgroundColor: "#030712",
    surfaceColor: "#111827",
    textColor: "#F9FAFB",
    mutedTextColor: "#9CA3AF",
    borderColor: "#1F2937",
    fontFamily: "'Sora', sans-serif",
    headingFont: "'Outfit', sans-serif",
    borderRadius: "rounded",
    shadow: "lg",
    mode: "dark",
    containerWidth: "wide",
    buttonRadius: "sm",
  },
  design: {
    designKey: "cinema",
    backgroundPreset: "mesh",
    heroVariant: "hero-bold",
    cardStyle: "glass",
    buttonVariant: "outline",
    navStyle: "blur",
    footerStyle: "centered",
  },
  nav: {
    links: [
      { label: "Showreel" },
      { label: "Projets" },
      { label: "Tarifs" },
      { label: "Contact" },
    ],
    showCta: true,
    ctaLabel: "Devis gratuit",
  },
  footer: {
    links: [
      { label: "Showreel" },
      { label: "Projets" },
      { label: "Contact" },
    ],
    showSocials: true,
    copyright: "Tous droits reserves.",
  },
};

/* ── Registry ── */
export const designPresets: FullDesignPreset[] = [
  creatorDesign,
  productDesign,
  cinemaDesign,
];

export function getDesignPreset(key: DesignKey): FullDesignPreset | undefined {
  return designPresets.find((d) => d.key === key);
}

/**
 * CSS class helpers based on design tokens.
 */
export function getCardClass(cardStyle: SiteDesign["cardStyle"]): string {
  switch (cardStyle) {
    case "flat": return "bg-[var(--site-surface,#1C1917)]";
    case "bordered": return "bg-[var(--site-surface,#18181B)] border border-[var(--site-border,#27272A)]";
    case "elevated": return "bg-[var(--site-surface,#1C1917)] shadow-lg";
    case "glass": return "bg-[var(--site-surface,#111827)]/60 backdrop-blur-md border border-[var(--site-border,#1F2937)]/50";
    default: return "";
  }
}

export function getButtonClass(variant: SiteDesign["buttonVariant"]): string {
  switch (variant) {
    case "solid": return "bg-[var(--site-primary)] text-white hover:opacity-90";
    case "outline": return "border border-[var(--site-primary)] text-[var(--site-primary)] hover:bg-[var(--site-primary)] hover:text-white";
    case "ghost": return "text-[var(--site-primary)] hover:bg-[var(--site-primary-light)]";
    case "gradient": return "bg-gradient-to-r from-[var(--site-primary)] to-[var(--site-secondary,var(--site-primary))] text-white hover:opacity-90";
    default: return "";
  }
}

export function getNavClass(navStyle: SiteDesign["navStyle"]): string {
  switch (navStyle) {
    case "transparent": return "bg-transparent";
    case "solid": return "bg-[var(--site-bg,#0A0A0F)] border-b border-[var(--site-border,#27272A)]";
    case "blur": return "bg-[var(--site-bg,#0A0A0F)]/80 backdrop-blur-lg border-b border-[var(--site-border,#27272A)]/50";
    default: return "";
  }
}
