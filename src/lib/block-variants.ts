import type { BlockType, BlockStyle } from "@/types";

export interface BlockVariant {
  key: string;
  name: string;
  description: string;
  style: Partial<BlockStyle>;
  contentOverrides?: Record<string, unknown>;
}

export interface BlockVariantGroup {
  blockType: BlockType;
  variants: BlockVariant[];
}

/* ── Hero Variants ── */
const heroVariants: BlockVariant[] = [
  {
    key: "hero-minimal",
    name: "Minimal",
    description: "Titre centré, fond clair, sobre",
    style: { paddingTop: 80, paddingBottom: 80, textAlign: "center", containerWidth: "boxed" },
  },
  {
    key: "hero-bold",
    name: "Bold",
    description: "Grand titre, fond sombre, impact",
    style: { paddingTop: 100, paddingBottom: 100, textAlign: "center", containerWidth: "boxed" },
  },
  {
    key: "hero-tech",
    name: "Tech",
    description: "Accent gradient, style moderne",
    style: { paddingTop: 80, paddingBottom: 80, textAlign: "left", containerWidth: "boxed" },
  },
  {
    key: "hero-creator",
    name: "Créateur",
    description: "Style créatif, typographie forte",
    style: { paddingTop: 80, paddingBottom: 80, textAlign: "center", containerWidth: "narrow", fontSize: 48, fontWeight: "700" },
  },
];

/* ── Feature / Services Variants ── */
const featureVariants: BlockVariant[] = [
  {
    key: "features-3cards",
    name: "3 cartes",
    description: "Grille 3 colonnes classique",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
    contentOverrides: { columns: 3 },
  },
  {
    key: "features-6grid",
    name: "6 cartes grille",
    description: "Grille dense 3x2",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
    contentOverrides: { columns: 3 },
  },
  {
    key: "features-icon-list",
    name: "Liste à icônes",
    description: "Liste verticale avec icônes",
    style: { paddingTop: 40, paddingBottom: 40, containerWidth: "narrow" },
    contentOverrides: { columns: 1 },
  },
];

/* ── Portfolio Variants ── */
const portfolioVariants: BlockVariant[] = [
  {
    key: "portfolio-3col",
    name: "3 colonnes",
    description: "Grille classique 3 colonnes",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
    contentOverrides: { columns: 3 },
  },
  {
    key: "portfolio-masonry",
    name: "Masonry",
    description: "Disposition en masonry",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
    contentOverrides: { columns: 3 },
  },
  {
    key: "portfolio-featured",
    name: "Featured + grille",
    description: "Projet mis en avant + grille",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
    contentOverrides: { columns: 2 },
  },
];

/* ── Pricing Variants ── */
const pricingVariants: BlockVariant[] = [
  {
    key: "pricing-3plans",
    name: "3 plans",
    description: "Comparaison 3 offres classique",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
  },
  {
    key: "pricing-single",
    name: "Offre unique",
    description: "Un seul plan mis en avant",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "narrow" },
  },
  {
    key: "pricing-dark",
    name: "Plans dark",
    description: "Style sombre premium",
    style: { paddingTop: 80, paddingBottom: 80, containerWidth: "boxed" },
  },
];

/* ── CTA Variants ── */
const ctaVariants: BlockVariant[] = [
  {
    key: "cta-centered",
    name: "Centré",
    description: "Appel à l'action centré",
    style: { paddingTop: 60, paddingBottom: 60, textAlign: "center", containerWidth: "narrow" },
  },
  {
    key: "cta-banner",
    name: "Bannière",
    description: "Bande accent pleine largeur",
    style: { paddingTop: 40, paddingBottom: 40, textAlign: "center", containerWidth: "full" },
  },
  {
    key: "cta-dark",
    name: "Dark",
    description: "Fond sombre, CTA impactant",
    style: { paddingTop: 60, paddingBottom: 60, textAlign: "center", containerWidth: "boxed" },
  },
];

/* ── Testimonials Variants ── */
const testimonialsVariants: BlockVariant[] = [
  {
    key: "testimonials-cards",
    name: "Cartes",
    description: "Témoignages en cartes grille",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
  },
  {
    key: "testimonials-carousel",
    name: "Carrousel",
    description: "Défilement automatique",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" },
  },
  {
    key: "testimonials-dark",
    name: "Dark",
    description: "Fond sombre, style premium",
    style: { paddingTop: 80, paddingBottom: 80, containerWidth: "boxed" },
  },
];

/* ── FAQ Variants ── */
const faqVariants: BlockVariant[] = [
  {
    key: "faq-simple",
    name: "Simple",
    description: "Accordéon minimaliste",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "narrow" },
  },
  {
    key: "faq-dark",
    name: "Dark",
    description: "Style sombre premium",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "narrow" },
  },
];

/* ── Contact Variants ── */
const contactVariants: BlockVariant[] = [
  {
    key: "contact-simple",
    name: "Simple",
    description: "Formulaire classique",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "narrow" },
  },
  {
    key: "contact-dark",
    name: "Dark",
    description: "Fond sombre",
    style: { paddingTop: 60, paddingBottom: 60, containerWidth: "narrow" },
  },
];

/* ── Variant registry ── */
const variantRegistry: BlockVariantGroup[] = [
  { blockType: "hero", variants: heroVariants },
  { blockType: "feature-grid", variants: featureVariants },
  { blockType: "portfolio-grid", variants: portfolioVariants },
  { blockType: "pricing-table", variants: pricingVariants },
  { blockType: "pricing-table-real", variants: pricingVariants },
  { blockType: "centered-cta", variants: ctaVariants },
  { blockType: "cta-premium", variants: ctaVariants },
  { blockType: "testimonials-carousel", variants: testimonialsVariants },
  { blockType: "testimonials", variants: testimonialsVariants },
  { blockType: "faq-advanced", variants: faqVariants },
  { blockType: "faq-accordion", variants: faqVariants },
  { blockType: "contact-form", variants: contactVariants },
];

export function getVariantsForBlock(blockType: BlockType): BlockVariant[] {
  return variantRegistry.find((g) => g.blockType === blockType)?.variants ?? [];
}

export function getVariant(blockType: BlockType, variantKey: string): BlockVariant | undefined {
  return getVariantsForBlock(blockType).find((v) => v.key === variantKey);
}

export function hasVariants(blockType: BlockType): boolean {
  return getVariantsForBlock(blockType).length > 0;
}
