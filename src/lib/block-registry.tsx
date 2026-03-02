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
  { type: "pricing-table", name: "Tarifs", description: "Tableau de prix multi-plans avec toggle", category: "conversion" },
  { type: "feature-grid", name: "Features", description: "Grille de fonctionnalités avec icônes", category: "content" },
  { type: "testimonials-carousel", name: "Avis carousel", description: "Carrousel d'avis clients avec étoiles", category: "social" },
  { type: "faq-advanced", name: "FAQ avancée", description: "FAQ avec icônes et ouverture contrôlée", category: "content" },
  { type: "timeline-advanced", name: "Timeline pro", description: "Processus horizontal ou vertical animé", category: "content" },
  { type: "cta-premium", name: "CTA Premium", description: "Bandeau conversion pleine largeur", category: "conversion" },
  { type: "logo-cloud", name: "Logos clients", description: "Grille de logos partenaires", category: "social" },
  { type: "stats-animated", name: "Stats animées", description: "Compteurs animés au scroll", category: "content" },
  { type: "masonry-gallery", name: "Galerie masonry", description: "Galerie photos en masonry", category: "media" },
  { type: "comparison-table", name: "Comparaison", description: "Tableau comparatif d'offres", category: "conversion" },
  { type: "contact-form", name: "Contact avancé", description: "Formulaire de contact complet", category: "conversion" },
  { type: "blog-preview", name: "Blog", description: "Aperçu d'articles récents", category: "content" },
  { type: "video-text-split", name: "Vidéo + Texte", description: "Split vidéo et texte en 2 colonnes", category: "media" },
  { type: "before-after", name: "Avant / Après", description: "Slider comparatif avant/après", category: "media" },
  { type: "service-cards", name: "Service cards", description: "Cartes services avec icône, prix et CTA", category: "conversion" },
  { type: "lead-magnet", name: "Lead Magnet", description: "Téléchargement en échange d'un email", category: "conversion" },
  { type: "availability-banner", name: "Disponibilité", description: "Bannière de statut de disponibilité", category: "layout" },
  { type: "product-hero-checkout", name: "Hero Produit", description: "Hero produit avec bénéfices et CTA Commander", category: "conversion" },
  { type: "product-cards-grid", name: "Grille Produits", description: "Grille de produits avec filtres et CTA", category: "conversion" },
  { type: "inline-checkout", name: "Checkout Inline", description: "Formulaire checkout embarqué dans la page", category: "conversion" },
  { type: "bundle-builder", name: "Créateur de Pack", description: "Composer un pack de N produits avec prix dynamique", category: "conversion" },
  { type: "pricing-table-real", name: "Table Prix (Produits)", description: "Table de prix reliée à de vrais produits", category: "conversion" },
];

export function getDefaultContent<T extends BlockType>(type: T): BlockContentMap[T] {
  return { ...defaultContent[type] };
}

export function getBlockEntry(type: BlockType): BlockRegistryEntry | undefined {
  return blockRegistry.find((b) => b.type === type);
}
