import type { BlockType, BlockContentMap } from "@/types";
import { defaultContent } from "@/lib/site-builder-context";

export type BlockCategory = "layout" | "content" | "media" | "conversion" | "social";

export interface BlockRegistryEntry {
  type: BlockType;
  name: string;
  description: string;
  category: BlockCategory;
}

export const blockCategories: { id: BlockCategory; label: string }[] = [
  { id: "layout", label: "Mise en page" },
  { id: "content", label: "Contenu" },
  { id: "media", label: "Médias" },
  { id: "conversion", label: "Conversion" },
  { id: "social", label: "Social" },
];

export const blockRegistry: BlockRegistryEntry[] = [
  { type: "hero", name: "Hero", description: "Section d'en-tête avec titre, sous-titre et CTA", category: "layout" },
  { type: "portfolio-grid", name: "Portfolio", description: "Grille de projets avec catégories", category: "content" },
  { type: "services-list", name: "Services", description: "Liste de prestations avec prix", category: "content" },
  { type: "pack-premium", name: "Pack Premium", description: "Offre mise en avant avec features", category: "conversion" },
  { type: "testimonials", name: "Témoignages", description: "Avis clients avec avatar et rôle", category: "social" },
  { type: "timeline-process", name: "Timeline", description: "Processus en étapes numérotées", category: "content" },
  { type: "faq-accordion", name: "FAQ", description: "Questions/réponses en accordéon", category: "content" },
  { type: "video", name: "Vidéo", description: "Intégration vidéo avec légende", category: "media" },
  { type: "full-image", name: "Image pleine", description: "Image en pleine largeur avec overlay", category: "media" },
  { type: "why-me", name: "Pourquoi moi", description: "Arguments différenciants en grille", category: "content" },
  { type: "centered-cta", name: "CTA centré", description: "Appel à l'action centré avec bouton", category: "conversion" },
  { type: "custom-form", name: "Formulaire", description: "Formulaire personnalisé avec champs", category: "conversion" },
  { type: "calendar-booking", name: "Réservation", description: "Prise de rendez-vous par créneaux", category: "conversion" },
  { type: "stats-counter", name: "Statistiques", description: "Compteurs chiffrés animés", category: "social" },
  { type: "newsletter", name: "Newsletter", description: "Inscription email avec bouton", category: "conversion" },
];

export function getDefaultContent<T extends BlockType>(type: T): BlockContentMap[T] {
  return { ...defaultContent[type] };
}

export function getBlockEntry(type: BlockType): BlockRegistryEntry | undefined {
  return blockRegistry.find((b) => b.type === type);
}
