import type { BlockType, BlockContentMap } from "@/types";
import { defaultContent } from "@/lib/site-builder-context";

export type BlockCategory = "hero" | "layout" | "content" | "media" | "conversion" | "vente" | "social" | "contact" | "footer" | "portfolio" | "services" | "about" | "process" | "faq" | "cta" | "creative";

export interface BlockRegistryEntry {
  type: BlockType;
  name: string;
  description: string;
  category: BlockCategory;
  /** This block can bind to real products */
  supportsProducts?: boolean;
  /** This block can bind to real projects */
  supportsProjects?: boolean;
  /** This block captures leads via form submission */
  capturesLeads?: boolean;
  /** Block temporarily disabled — shown as "Bientôt" in the builder */
  soon?: boolean;
}

export const blockCategories: { id: BlockCategory; label: string }[] = [
  { id: "hero", label: "Hero / En-tête" },
  { id: "layout", label: "Mise en page" },
  { id: "content", label: "Contenu" },
  { id: "media", label: "Médias" },
  { id: "conversion", label: "Conversion" },
  { id: "vente", label: "Vente produit" },
  { id: "contact", label: "Contact / Formulaires" },
  { id: "social", label: "Social" },
  { id: "footer", label: "Footer" },
  { id: "portfolio", label: "Portfolio / Projets" },
  { id: "services", label: "Services / Offres" },
  { id: "about", label: "À propos / Équipe" },
  { id: "process", label: "Processus / Étapes" },
  { id: "faq", label: "FAQ / Confiance" },
  { id: "cta", label: "CTA / Conversion" },
  { id: "creative", label: "Créatif / Signature" },
];

export const blockRegistry: BlockRegistryEntry[] = [
  { type: "hero", name: "Hero", description: "Section d'en-tête avec titre, sous-titre et CTA", category: "hero" },
  { type: "portfolio-grid", name: "Portfolio", description: "Grille de projets avec catégories", category: "content", supportsProjects: true },
  { type: "services-list", name: "Services", description: "Liste de prestations avec prix", category: "vente", supportsProducts: true },
  { type: "pack-premium", name: "Pack Premium", description: "Offre mise en avant avec features", category: "vente", supportsProducts: true },
  { type: "testimonials", name: "Témoignages", description: "Avis clients avec avatar et rôle", category: "social" },
  { type: "timeline-process", name: "Timeline", description: "Processus en étapes numérotées", category: "content" },
  { type: "faq-accordion", name: "FAQ", description: "Questions/réponses en accordéon", category: "content" },
  { type: "video", name: "Vidéo", description: "Intégration vidéo avec légende", category: "media", soon: true },
  { type: "full-image", name: "Image pleine", description: "Image en pleine largeur avec overlay", category: "media" },
  { type: "why-me", name: "Pourquoi moi", description: "Arguments différenciants en grille", category: "content" },
  { type: "centered-cta", name: "CTA centré", description: "Appel à l'action centré avec bouton", category: "conversion" },
  { type: "custom-form", name: "Formulaire", description: "Formulaire personnalisé avec champs", category: "contact", capturesLeads: true },
  { type: "calendar-booking", name: "Réservation", description: "Prise de rendez-vous par créneaux", category: "conversion" },
  { type: "stats-counter", name: "Statistiques", description: "Compteurs chiffrés animés", category: "social" },
  { type: "newsletter", name: "Newsletter", description: "Inscription email avec bouton", category: "conversion", capturesLeads: true },
  { type: "pricing-table", name: "Tarifs", description: "Tableau de prix multi-plans avec toggle", category: "conversion", supportsProducts: true },
  { type: "feature-grid", name: "Features", description: "Grille de fonctionnalités avec icônes", category: "content" },
  { type: "testimonials-carousel", name: "Avis carousel", description: "Carrousel d'avis clients avec étoiles", category: "social" },
  { type: "faq-advanced", name: "FAQ avancée", description: "FAQ avec icônes et ouverture contrôlée", category: "content" },
  { type: "timeline-advanced", name: "Timeline pro", description: "Processus horizontal ou vertical animé", category: "content" },
  { type: "cta-premium", name: "CTA Premium", description: "Bandeau conversion pleine largeur", category: "conversion" },
  { type: "logo-cloud", name: "Logos clients", description: "Grille de logos partenaires", category: "social" },
  { type: "stats-animated", name: "Stats animées", description: "Compteurs animés au scroll", category: "content" },
  { type: "masonry-gallery", name: "Galerie masonry", description: "Galerie photos en masonry", category: "media" },
  { type: "comparison-table", name: "Comparaison", description: "Tableau comparatif d'offres", category: "conversion", supportsProducts: true },
  { type: "contact-form", name: "Contact avancé", description: "Formulaire de contact complet", category: "contact", capturesLeads: true },
  { type: "blog-preview", name: "Blog", description: "Aperçu d'articles récents", category: "content" },
  { type: "video-text-split", name: "Vidéo + Texte", description: "Split vidéo et texte en 2 colonnes", category: "media", soon: true },
  { type: "before-after", name: "Avant / Après", description: "Slider comparatif avant/après", category: "media" },
  { type: "service-cards", name: "Service cards", description: "Cartes services avec icône, prix et CTA", category: "vente", supportsProducts: true },
  { type: "lead-magnet", name: "Lead Magnet", description: "Téléchargement en échange d'un email", category: "conversion", capturesLeads: true },
  { type: "availability-banner", name: "Disponibilité", description: "Bannière de statut de disponibilité", category: "layout" },
  { type: "product-hero-checkout", name: "Hero Produit", description: "Hero produit avec bénéfices et CTA Commander", category: "vente", supportsProducts: true },
  { type: "product-cards-grid", name: "Grille Produits", description: "Grille de produits avec filtres et CTA", category: "vente", supportsProducts: true },
  { type: "inline-checkout", name: "Checkout Inline", description: "Formulaire checkout embarqué dans la page", category: "vente", supportsProducts: true },
  { type: "bundle-builder", name: "Créateur de Pack", description: "Composer un pack de N produits avec prix dynamique", category: "vente", supportsProducts: true },
  { type: "pricing-table-real", name: "Table Prix (Produits)", description: "Table de prix reliée à de vrais produits", category: "vente", supportsProducts: true },
  { type: "hero-split-glow", name: "Hero Split Glow", description: "Hero premium split avec glow et double CTA", category: "hero" },
  { type: "hero-centered-mesh", name: "Hero Centré Mesh", description: "Hero centré avec background mesh et logos trust", category: "hero" },
  { type: "services-premium", name: "Services Premium", description: "Cartes services dark premium avec icônes et features", category: "content", supportsProducts: true },
  { type: "portfolio-masonry", name: "Portfolio Masonry", description: "Grille portfolio masonry avec overlay hover", category: "content", supportsProjects: true },
  { type: "pricing-modern", name: "Pricing Modern", description: "Tarifs modernes dark avec badges et features", category: "conversion", supportsProducts: true },
  { type: "testimonials-dark", name: "Témoignages Dark", description: "Témoignages premium dark avec avatars et étoiles", category: "social" },
  { type: "cta-banner", name: "CTA Banner", description: "Bannière CTA premium avec gradient et double bouton", category: "conversion" },
  { type: "contact-premium", name: "Contact Premium", description: "Formulaire contact premium dark avec champs stylisés", category: "contact", capturesLeads: true },
  { type: "footer-block", name: "Footer Premium", description: "Footer multi-colonnes premium avec socials", category: "footer" },
  { type: "video-showcase", name: "Vidéo Showcase", description: "Showcase vidéo cinématique avec stats", category: "media", soon: true },
  { type: "tech-stack", name: "Tech Stack", description: "Grille technologies / intégrations par catégorie", category: "content" },
  { type: "before-after-pro", name: "Avant/Après Pro", description: "Comparaison avant/après premium multi-items", category: "media" },
  // ─── 50 new blocks ───
  { type: "hero-split-portfolio", name: "Hero Portfolio Split", description: "Hero freelancer avec texte, image et stats", category: "hero" },
  { type: "hero-minimal-service", name: "Hero Service Minimal", description: "Hero service centré avec preuves et CTA", category: "hero" },
  { type: "hero-dark-saas", name: "Hero SaaS Dark", description: "Hero produit SaaS avec features flottantes", category: "hero" },
  { type: "hero-creator-brand", name: "Hero Personal Brand", description: "Hero créateur avec photo, credentials et social proof", category: "hero" },
  { type: "hero-video-showreel", name: "Hero Showreel Video", description: "Hero immersif pour monteurs et réalisateurs", category: "hero", soon: true },
  { type: "projects-grid-cases", name: "Projets Case Studies", description: "Grille 2x2 de projets avec résultats", category: "portfolio", supportsProjects: true },
  { type: "projects-horizontal", name: "Projets Horizontal", description: "Carrousel horizontal de projets créatifs", category: "portfolio", supportsProjects: true },
  { type: "project-before-after", name: "Projet Avant/Après", description: "Transformations clients avec résultats", category: "portfolio", supportsProjects: true },
  { type: "project-timeline", name: "Étude de Cas Timeline", description: "Parcours projet étape par étape", category: "portfolio", supportsProjects: true },
  { type: "project-masonry-wall", name: "Mur de Projets", description: "Grille masonry portfolio visuel", category: "portfolio", supportsProjects: true },
  { type: "services-3card-premium", name: "Services 3 Cartes", description: "3 offres premium avec features et CTA", category: "services", supportsProducts: true },
  { type: "services-icon-grid", name: "Services Grille Icônes", description: "6 services avec icônes en grille", category: "services", supportsProducts: true },
  { type: "services-split-value", name: "Services Valeur Split", description: "Positionnement premium avec piliers", category: "services" },
  { type: "services-process-offers", name: "Services + Process", description: "Offres avec workflow intégré", category: "services", supportsProducts: true },
  { type: "product-featured-card", name: "Produit Vedette", description: "Carte produit unique avec bénéfices", category: "vente", supportsProducts: true },
  { type: "products-3card-shop", name: "Boutique 3 Produits", description: "3 produits digitaux avec prix et CTA", category: "vente", supportsProducts: true },
  { type: "product-bundle-compare", name: "Comparaison Bundles", description: "3 formules avec features comparées", category: "vente", supportsProducts: true },
  { type: "product-benefits-mockup", name: "Produit + Benefices", description: "Produit digital avec liste d'avantages", category: "vente", supportsProducts: true },
  { type: "pricing-3tier-saas", name: "Tarifs 3 Tiers SaaS", description: "Pricing SaaS classique 3 colonnes", category: "conversion", supportsProducts: true },
  { type: "pricing-custom-quote", name: "Tarif Sur Devis", description: "Offre premium sur devis personnalisé", category: "conversion", supportsProducts: true },
  { type: "pricing-mini-faq", name: "Tarifs + FAQ", description: "Mini pricing avec FAQ rassurante", category: "conversion", supportsProducts: true },
  { type: "testimonials-3dark", name: "Témoignages 3 Cartes", description: "3 témoignages premium en cartes", category: "social" },
  { type: "testimonials-video", name: "Témoignages Vidéo", description: "Témoignages clients en format vidéo", category: "social", soon: true },
  { type: "results-logos-quotes", name: "Logos + Citations", description: "Logos clients et citations sélectionnées", category: "social" },
  { type: "numbers-impact", name: "Chiffres d'Impact", description: "Stats et métriques de performance", category: "social" },
  { type: "results-timeline", name: "Timeline Résultats", description: "Progression de résultats sur 90 jours", category: "social" },
  { type: "about-personal-story", name: "Histoire Personnelle", description: "Bio fondateur avec parcours et mission", category: "about" },
  { type: "about-studio-values", name: "Valeurs du Studio", description: "Valeurs d'entreprise en cartes", category: "about" },
  { type: "team-mini-grid", name: "Équipe Mini", description: "Grille équipe compacte avec rôles", category: "about" },
  { type: "process-4steps", name: "Processus 4 Étapes", description: "Workflow simple en 4 étapes", category: "process" },
  { type: "process-detailed-timeline", name: "Process Timeline Détail", description: "Méthode de travail détaillée", category: "process" },
  { type: "faq-accordion-full", name: "FAQ Complète", description: "FAQ 7 questions avec accordéon", category: "faq" },
  { type: "faq-2column", name: "FAQ 2 Colonnes", description: "FAQ dense sur 2 colonnes", category: "faq" },
  { type: "cta-centered-strong", name: "CTA Centré Fort", description: "Appel à l'action centré impactant", category: "cta" },
  { type: "cta-split-text", name: "CTA Split Texte", description: "CTA avec texte à gauche et boutons à droite", category: "cta" },
  { type: "cta-dark-glow", name: "CTA Dark Glow", description: "CTA premium sombre avec glow", category: "cta" },
  { type: "form-contact-simple", name: "Contact Simple", description: "Formulaire de contact 3 champs", category: "contact", capturesLeads: true },
  { type: "form-quote-request", name: "Demande de Devis", description: "Formulaire devis avancé avec projet", category: "contact", capturesLeads: true },
  { type: "form-newsletter-lead", name: "Newsletter / Lead", description: "Capture email newsletter légère", category: "contact", capturesLeads: true },
  { type: "media-featured-video", name: "Vidéo Vedette", description: "Section vidéo principale avec secondaires", category: "media", soon: true },
  { type: "gallery-3up-strip", name: "Galerie 3 Images", description: "Bande de 3 images avec légendes", category: "media" },
  { type: "gallery-stacked-storyboard", name: "Galerie Storyboard", description: "Séquence d'images narratives empilées", category: "media" },
  { type: "content-feature-article", name: "Article Vedette", description: "Article mis en avant avec image et CTA", category: "content" },
  { type: "content-3articles", name: "3 Articles", description: "Section blog avec 3 articles récents", category: "content" },
  { type: "content-comparison-why", name: "Comparaison Pourquoi Nous", description: "Comparaison avant/nous en 2 colonnes", category: "content" },
  { type: "trust-badges", name: "Badges de Confiance", description: "Garanties et engagements en badges", category: "faq" },
  { type: "social-proof-marquee", name: "Proof Défilant", description: "Bande défilante de témoignages courts", category: "social" },
  { type: "footer-simple-premium", name: "Footer Simple", description: "Footer minimal avec liens et socials", category: "footer" },
  { type: "footer-multi-column", name: "Footer Multi-Colonnes", description: "Footer complet 3-4 colonnes business", category: "footer" },
  { type: "signature-creative-closing", name: "Closing Signature", description: "Section de clôture créative et mémorable", category: "creative" },
];

export function getDefaultContent<T extends BlockType>(type: T): BlockContentMap[T] {
  return { ...defaultContent[type] };
}

export function getBlockEntry(type: BlockType): BlockRegistryEntry | undefined {
  return blockRegistry.find((b) => b.type === type);
}
