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
    key: "solid",
    name: "Uni",
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
    sectionGap: "none",
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
    variant: "brand-heavy",
    links: [
      { id: "c1", label: "Portfolio" },
      { id: "c2", label: "Services" },
      { id: "c3", label: "À propos" },
      { id: "c4", label: "Contact" },
    ],
    showCta: true,
    ctaLabel: "Me contacter",
  },
  footer: {
    links: [
      { label: "Portfolio" },
      { label: "Services" },
      { label: "Contact" },
      { label: "Mentions légales" },
    ],
    showSocials: true,
    copyright: "Tous droits réservés.",
  },
};

/* ── 2. PRODUCT — SaaS / Dev / Business ── */
const productDesign: FullDesignPreset = {
  key: "product",
  name: "Product",
  description: "Design professionnel pour SaaS, devs et business",
  audience: "Développeurs, consultants, agences, startups",
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
    sectionGap: "none",
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
    variant: "capsule",
    links: [
      { id: "p1", label: "Features" },
      { id: "p2", label: "Pricing" },
      { id: "p3", label: "Docs" },
      { id: "p4", label: "Blog" },
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
    sectionGap: "none",
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
    variant: "dark-premium",
    links: [
      { id: "m1", label: "Showreel" },
      { id: "m2", label: "Projets" },
      { id: "m3", label: "Tarifs" },
      { id: "m4", label: "Contact" },
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
    copyright: "Tous droits réservés.",
  },
};

/* ── 4. STUDIO — Minimal Design Portfolio ── */
const studioDesign: FullDesignPreset = {
  key: "studio",
  name: "Studio",
  description: "Design minimaliste premium pour studios et directeurs artistiques",
  audience: "Designers, studios branding, DA, product designers",
  theme: {
    primaryColor: "#C8FF2E",
    secondaryColor: "#A8E600",
    backgroundColor: "#0F0F10",
    surfaceColor: "#1A1A1C",
    textColor: "#F5F5F5",
    mutedTextColor: "#888888",
    borderColor: "#2A2A2C",
    fontFamily: "'Inter Tight', 'Inter', sans-serif",
    headingFont: "'Inter Tight', 'Inter', sans-serif",
    borderRadius: "rounded",
    shadow: "sm",
    mode: "dark",
    containerWidth: "default",
    buttonRadius: "md",
    sectionGap: "none",
  },
  design: {
    designKey: "studio",
    backgroundPreset: "noise",
    heroVariant: "hero-split-glow",
    cardStyle: "bordered",
    buttonVariant: "solid",
    navStyle: "solid",
    footerStyle: "minimal",
  },
  nav: {
    variant: "capsule",
    links: [
      { id: "s1", label: "Projets" },
      { id: "s2", label: "Services" },
      { id: "s3", label: "À propos" },
      { id: "s4", label: "Contact" },
    ],
    showCta: true,
    ctaLabel: "Collaborer",
  },
  footer: {
    links: [
      { label: "Projets" },
      { label: "Services" },
      { label: "Contact" },
      { label: "Mentions légales" },
    ],
    showSocials: true,
    copyright: "Tous droits réservés.",
  },
};

/* ── 5. NEON — Cyberpunk Digital Creator ── */
const neonDesign: FullDesignPreset = {
  key: "neon",
  name: "Neon",
  description: "Design cyberpunk futuriste pour createurs digitaux et gamers",
  audience: "YouTubers, streamers, gaming, AI, artistes digitaux",
  theme: {
    primaryColor: "#7B61FF",
    secondaryColor: "#00F0FF",
    backgroundColor: "#050508",
    surfaceColor: "#0D0D14",
    textColor: "#EEEEF0",
    mutedTextColor: "#7A7A8C",
    borderColor: "#1A1A2E",
    fontFamily: "'Space Grotesk', sans-serif",
    headingFont: "'Space Grotesk', sans-serif",
    borderRadius: "rounded",
    shadow: "lg",
    mode: "dark",
    containerWidth: "wide",
    buttonRadius: "md",
    buttonBg: "#7B61FF",
    buttonText: "#FFFFFF",
    buttonHoverBg: "#9580FF",
    buttonHoverShadow: "lg",
    buttonHoverScale: 1.03,
    sectionGap: "none",
  },
  design: {
    designKey: "neon",
    backgroundPreset: "mesh",
    heroVariant: "hero-centered-mesh",
    cardStyle: "glass",
    buttonVariant: "gradient",
    navStyle: "blur",
    footerStyle: "centered",
  },
  nav: {
    variant: "dark-premium",
    links: [
      { id: "n1", label: "Showreel" },
      { id: "n2", label: "Services" },
      { id: "n3", label: "Portfolio" },
      { id: "n4", label: "Tarifs" },
    ],
    showCta: true,
    ctaLabel: "Let's go",
  },
  footer: {
    links: [
      { label: "Showreel" },
      { label: "Portfolio" },
      { label: "Contact" },
    ],
    showSocials: true,
    copyright: "All rights reserved.",
  },
};

/* ── 6. EDITORIAL — Modern Editorial Portfolio ── */
const editorialDesign: FullDesignPreset = {
  key: "editorial",
  name: "Editorial",
  description: "Design editorial haut de gamme pour photographes et artistes visuels",
  audience: "Photographes, écrivains, artistes visuels, studios créatifs",
  theme: {
    primaryColor: "#D48B5C",
    secondaryColor: "#A5A58D",
    backgroundColor: "#FAF7F2",
    surfaceColor: "#F0EDE6",
    textColor: "#111111",
    mutedTextColor: "#6B6B6B",
    borderColor: "#DDD8D0",
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Playfair Display', serif",
    borderRadius: "rounded",
    shadow: "sm",
    mode: "light",
    containerWidth: "default",
    buttonRadius: "sm",
    sectionGap: "none",
  },
  design: {
    designKey: "editorial",
    backgroundPreset: "noise",
    heroVariant: "hero-split-glow",
    cardStyle: "flat",
    buttonVariant: "solid",
    navStyle: "solid",
    footerStyle: "columns",
  },
  nav: {
    variant: "brand-heavy",
    links: [
      { id: "e1", label: "Portfolio" },
      { id: "e2", label: "Journal" },
      { id: "e3", label: "À propos" },
      { id: "e4", label: "Contact" },
    ],
    showCta: true,
    ctaLabel: "Prendre rendez-vous",
  },
  footer: {
    links: [
      { label: "Portfolio" },
      { label: "Journal" },
      { label: "Contact" },
      { label: "Mentions légales" },
    ],
    showSocials: true,
    copyright: "Tous droits réservés.",
  },
};

/* ── Registry ── */
export const designPresets: FullDesignPreset[] = [
  creatorDesign,
  productDesign,
  cinemaDesign,
  studioDesign,
  neonDesign,
  editorialDesign,
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
