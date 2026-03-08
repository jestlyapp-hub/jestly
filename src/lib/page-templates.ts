import type { BlockType, BlockStyle, BlockSettings } from "@/types";

/* ─── Page Template System ─── */

export interface PageTemplateBlock {
  type: BlockType;
  style?: Partial<BlockStyle>;
  settings?: Partial<BlockSettings>;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: "creative" | "business" | "saas" | "ecommerce" | "personal";
  blocks: PageTemplateBlock[];
}

/* ─── Shared styles ─── */
const heroStyle: Partial<BlockStyle> = { paddingTop: 100, paddingBottom: 100, containerWidth: "boxed" };
const sectionStyle: Partial<BlockStyle> = { paddingTop: 60, paddingBottom: 60, containerWidth: "boxed" };
const compactStyle: Partial<BlockStyle> = { paddingTop: 40, paddingBottom: 40, containerWidth: "boxed" };

/* ─── 6 Page Templates ─── */

export const pageTemplates: PageTemplate[] = [
  {
    id: "portfolio-creatif",
    name: "Portfolio creatif",
    description: "Ideal pour photographes, designers et artistes",
    category: "creative",
    blocks: [
      { type: "hero-split-portfolio", style: heroStyle, settings: { animation: "fade-up" } },
      { type: "portfolio-masonry", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "services-3card-premium", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "testimonials-3dark", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "process-4steps", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "cta-centered-strong", style: compactStyle, settings: { animation: "scale-in" } },
      { type: "form-contact-simple", style: sectionStyle },
      { type: "footer-simple-premium", style: compactStyle },
    ],
  },
  {
    id: "agence-studio",
    name: "Agence / Studio",
    description: "Pour agences creatives, studios et collectifs",
    category: "business",
    blocks: [
      { type: "hero-centered-mesh", style: heroStyle, settings: { animation: "blur-reveal" } },
      { type: "logo-cloud", style: compactStyle, settings: { animation: "fade-in" } },
      { type: "services-icon-grid", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "projects-grid-cases", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "about-studio-values", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "testimonials-carousel", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "process-detailed-timeline", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "pricing-3tier-saas", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "faq-accordion-full", style: sectionStyle },
      { type: "cta-dark-glow", style: compactStyle, settings: { animation: "scale-in" } },
      { type: "footer-multi-column", style: compactStyle },
    ],
  },
  {
    id: "freelance-services",
    name: "Freelance services",
    description: "Pour freelances proposant des prestations",
    category: "personal",
    blocks: [
      { type: "hero-minimal-service", style: heroStyle, settings: { animation: "fade-up" } },
      { type: "services-split-value", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "numbers-impact", style: compactStyle, settings: { animation: "fade-in" } },
      { type: "project-before-after", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "testimonials", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "pricing-custom-quote", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "faq-2column", style: sectionStyle },
      { type: "form-quote-request", style: sectionStyle },
      { type: "footer-simple-premium", style: compactStyle },
    ],
  },
  {
    id: "coach-personal-brand",
    name: "Coach / Personal brand",
    description: "Pour coachs, formateurs et personal brands",
    category: "personal",
    blocks: [
      { type: "hero-creator-brand", style: heroStyle, settings: { animation: "fade-up" } },
      { type: "about-personal-story", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "services-process-offers", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "results-timeline", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "testimonials-video", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "trust-badges", style: compactStyle, settings: { animation: "fade-in" } },
      { type: "pricing-mini-faq", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "cta-split-text", style: compactStyle, settings: { animation: "scale-in" } },
      { type: "form-newsletter-lead", style: sectionStyle },
      { type: "footer-simple-premium", style: compactStyle },
    ],
  },
  {
    id: "startup-saas",
    name: "Startup / SaaS",
    description: "Pour produits SaaS et startups tech",
    category: "saas",
    blocks: [
      { type: "hero-dark-saas", style: heroStyle, settings: { animation: "blur-reveal" } },
      { type: "logo-cloud", style: compactStyle, settings: { animation: "fade-in" } },
      { type: "feature-grid", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "stats-animated", style: compactStyle, settings: { animation: "fade-in" } },
      { type: "comparison-table", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "testimonials-3dark", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "pricing-3tier-saas", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "faq-accordion-full", style: sectionStyle },
      { type: "cta-banner", style: compactStyle, settings: { animation: "scale-in" } },
      { type: "footer-multi-column", style: compactStyle },
    ],
  },
  {
    id: "landing-produit",
    name: "Landing page produit",
    description: "Pour vendre un produit digital ou physique",
    category: "ecommerce",
    blocks: [
      { type: "hero-split-glow", style: heroStyle, settings: { animation: "fade-up" } },
      { type: "social-proof-marquee", style: compactStyle, settings: { animation: "fade-in" } },
      { type: "product-benefits-mockup", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "content-comparison-why", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "testimonials-carousel", style: sectionStyle, settings: { animation: "fade-in" } },
      { type: "pricing-table", style: sectionStyle, settings: { animation: "fade-up" } },
      { type: "faq-advanced", style: sectionStyle },
      { type: "cta-centered-strong", style: compactStyle, settings: { animation: "scale-in" } },
      { type: "footer-simple-premium", style: compactStyle },
    ],
  },
];
