import type { BlockStyle } from "@/types";

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  category: "section" | "card" | "cta" | "hero";
  style: Partial<BlockStyle>;
}

export const stylePresets: StylePreset[] = [
  // Section presets
  {
    id: "clean-white",
    name: "Blanc pur",
    description: "Section blanche minimale",
    category: "section",
    style: {
      backgroundColor: "#ffffff",
      textColor: "var(--site-text, #191919)",
      paddingTop: 60,
      paddingBottom: 60,
      containerWidth: "boxed",
    },
  },
  {
    id: "soft-surface",
    name: "Surface douce",
    description: "Fond subtil chaud",
    category: "section",
    style: {
      backgroundColor: "var(--site-surface, #F7F7F5)",
      textColor: "var(--site-text, #191919)",
      paddingTop: 60,
      paddingBottom: 60,
      containerWidth: "boxed",
    },
  },
  {
    id: "dark-premium",
    name: "Dark premium",
    description: "Fond sombre elegant",
    category: "section",
    style: {
      backgroundColor: "#0A0A0F",
      textColor: "#ffffff",
      paddingTop: 80,
      paddingBottom: 80,
      containerWidth: "boxed",
    },
  },
  {
    id: "accent-tint",
    name: "Teinte accent",
    description: "Fond accent leger",
    category: "section",
    style: {
      backgroundColor: "var(--site-primary-light, #EEF2FF)",
      textColor: "var(--site-text, #191919)",
      paddingTop: 60,
      paddingBottom: 60,
      containerWidth: "boxed",
    },
  },
  // Hero presets
  {
    id: "hero-spacious",
    name: "Hero spacieux",
    description: "Grand hero blanc",
    category: "hero",
    style: {
      backgroundColor: "#ffffff",
      textColor: "var(--site-text, #191919)",
      paddingTop: 120,
      paddingBottom: 120,
      containerWidth: "boxed",
      textAlign: "center",
    },
  },
  {
    id: "hero-dark",
    name: "Hero sombre",
    description: "Hero dark premium",
    category: "hero",
    style: {
      backgroundColor: "#0A0A0F",
      textColor: "#ffffff",
      paddingTop: 120,
      paddingBottom: 120,
      containerWidth: "boxed",
      textAlign: "center",
    },
  },
  // CTA presets
  {
    id: "cta-accent",
    name: "CTA accent",
    description: "Bandeau accent fort",
    category: "cta",
    style: {
      backgroundColor: "var(--site-primary, #4F46E5)",
      textColor: "#ffffff",
      paddingTop: 48,
      paddingBottom: 48,
      containerWidth: "boxed",
      textAlign: "center",
    },
  },
  {
    id: "cta-dark-glow",
    name: "CTA dark glow",
    description: "Appel sombre premium",
    category: "cta",
    style: {
      backgroundColor: "#0A0A0F",
      textColor: "#ffffff",
      paddingTop: 60,
      paddingBottom: 60,
      containerWidth: "boxed",
      textAlign: "center",
    },
  },
  // Card presets
  {
    id: "card-elevated",
    name: "Cartes elevees",
    description: "Cartes avec elevation au hover",
    category: "card",
    style: {
      backgroundColor: "#ffffff",
      textColor: "var(--site-text, #191919)",
      paddingTop: 60,
      paddingBottom: 60,
      containerWidth: "boxed",
      hoverEffect: "lift",
    },
  },
  {
    id: "card-glow",
    name: "Cartes glow",
    description: "Cartes avec bordure lumineuse",
    category: "card",
    style: {
      backgroundColor: "var(--site-surface, #F7F7F5)",
      textColor: "var(--site-text, #191919)",
      paddingTop: 60,
      paddingBottom: 60,
      containerWidth: "boxed",
      hoverEffect: "border-glow",
    },
  },
];
