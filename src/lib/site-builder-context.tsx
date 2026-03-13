"use client";

import { createContext, useContext, useReducer, useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import type { Site, Block, BlockType, BlockContentMap, BlockSettings, SitePage } from "@/types";
import { getVariant } from "@/lib/block-variants";
import { useSite } from "@/lib/hooks/use-site";

type Breakpoint = "desktop" | "tablet" | "mobile";
type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BuilderState {
  site: Site;
  activePageId: string;
  activeBlockId: string | null;
  isDirty: boolean;
  breakpoint: Breakpoint;
  previewMode: boolean;
  history: Site[];
  historyIndex: number;
  /** History index at last successful save — used to detect if undo/redo returns to saved state */
  savedHistoryIndex: number;
}

type BuilderAction =
  | { type: "INIT_SITE"; site: Site }
  | { type: "MARK_CLEAN" }
  | { type: "SET_ACTIVE_PAGE"; pageId: string }
  | { type: "SET_ACTIVE_BLOCK"; blockId: string | null }
  | { type: "UPDATE_BLOCK_CONTENT"; blockId: string; content: Record<string, unknown> }
  | { type: "UPDATE_BLOCK_STYLE"; blockId: string; style: Partial<Block["style"]> }
  | { type: "UPDATE_BLOCK_SETTINGS"; blockId: string; settings: Partial<BlockSettings> }
  | { type: "TOGGLE_BLOCK_VISIBILITY"; blockId: string }
  | { type: "DUPLICATE_BLOCK"; blockId: string }
  | { type: "REORDER_BLOCKS"; pageId: string; fromIndex: number; toIndex: number }
  | { type: "ADD_BLOCK"; pageId: string; blockType: BlockType; variantKey?: string }
  | { type: "UPDATE_NAV"; nav: Site["nav"] }
  | { type: "UPDATE_FOOTER"; footer: Site["footer"] }
  | { type: "UPDATE_DESIGN"; design: Partial<Site["design"]> }
  | { type: "APPLY_DESIGN"; theme: Site["theme"]; design: Site["design"]; nav?: Site["nav"]; footer?: Site["footer"] }
  | { type: "REMOVE_BLOCK"; blockId: string }
  | { type: "ADD_PAGE"; page: SitePage }
  | { type: "REMOVE_PAGE"; pageId: string }
  | { type: "UPDATE_PAGE"; pageId: string; updates: Partial<SitePage> }
  | { type: "APPLY_TEMPLATE"; pages: SitePage[] }
  | { type: "APPLY_FULL_TEMPLATE"; theme: Site["theme"]; design: Site["design"]; nav: Site["nav"]; footer: Site["footer"]; pages: SitePage[] }
  | { type: "UPDATE_SITE_SETTINGS"; settings: Partial<Site["settings"]> }
  | { type: "UPDATE_SITE_THEME"; theme: Partial<Site["theme"]> }
  | { type: "UPDATE_SITE_SEO"; seo: Partial<Site["seo"]> }
  | { type: "UPDATE_SITE_DOMAIN"; domain: Partial<Site["domain"]> }
  | { type: "SET_BREAKPOINT"; breakpoint: Breakpoint }
  | { type: "TOGGLE_PREVIEW_MODE" }
  | { type: "UNDO" }
  | { type: "REDO" };

const defaultContent: { [K in BlockType]: BlockContentMap[K] } = {
  hero: { title: "Titre principal", subtitle: "Sous-titre de la section", ctaLabel: "En savoir plus", ctaLink: "#", blockLink: { type: "none" as const } },
  "portfolio-grid": { columns: 3, items: [{ title: "Projet 1", imageUrl: "", category: "Design" }], categories: [], showFilter: false, showDetailLink: false, showSearch: false },
  "services-list": { productIds: [], showPrice: true, showCategory: true, ctaMode: "product_page" as const, layout: "list" as const },
  "pack-premium": { productId: "", highlight: true, showFeatures: true, showPrice: true, ctaLabel: "Choisir ce pack" },
  testimonials: { testimonials: [{ name: "Client", role: "CEO", text: "Super travail !" }] },
  "timeline-process": { steps: [{ title: "Étape 1", description: "Description" }] },
  "faq-accordion": { items: [{ question: "Question ?", answer: "Réponse." }] },
  video: { videoUrl: "", caption: "Vidéo de présentation" },
  "full-image": { imageUrl: "", alt: "Image", overlayText: "" },
  "why-me": { title: "Pourquoi me choisir ?", reasons: [{ title: "Raison 1", description: "Description" }] },
  "centered-cta": { title: "Passez à l'action", description: "Description de l'appel à l'action", ctaLabel: "Commencer", ctaLink: "#", blockLink: { type: "none" as const } },
  "custom-form": { fields: [{ label: "Nom", type: "text", required: true }], submitLabel: "Envoyer" },
  "calendar-booking": { title: "Réserver un créneau", description: "Choisissez un horaire", provider: "calendly" as const, embedUrl: "", ctaLabel: "Réserver", openModal: false, slots: ["Lundi 10h", "Mardi 14h"] },
  "stats-counter": { stats: [{ value: "100+", label: "Projets" }] },
  newsletter: { title: "Newsletter", description: "Restez informé", placeholder: "Votre email", buttonLabel: "S'abonner" },
  "pricing-table": { title: "Nos offres", plans: [{ name: "Starter", price: 29, period: "monthly" as const, description: "Pour démarrer", features: ["Feature 1", "Feature 2"], isPopular: false, ctaLabel: "Choisir" }, { name: "Pro", price: 79, period: "monthly" as const, description: "Pour les pros", features: ["Feature 1", "Feature 2", "Feature 3"], isPopular: true, ctaLabel: "Choisir" }], showToggle: false, columns: 2 },
  "feature-grid": { title: "Fonctionnalités", subtitle: "Tout ce dont vous avez besoin", features: [{ icon: "zap", title: "Rapide", description: "Performance optimale" }, { icon: "shield", title: "Sécurisé", description: "Protection maximale" }, { icon: "heart", title: "Simple", description: "Facile à utiliser" }], columns: 3 },
  "testimonials-carousel": { testimonials: [{ name: "Client 1", role: "CEO", text: "Excellent travail !", rating: 5 }], autoplay: true, autoplayInterval: 5000 },
  "faq-advanced": { title: "Questions fréquentes", items: [{ question: "Question ?", answer: "Réponse." }], allowMultiple: false, useGlobal: false },
  "timeline-advanced": { title: "Notre processus", orientation: "vertical" as const, steps: [{ title: "Étape 1", description: "Description" }] },
  "cta-premium": { title: "Prêt à commencer ?", description: "Lancez votre projet dès aujourd'hui.", primaryCtaLabel: "Commencer", primaryBlockLink: { type: "none" as const }, secondaryCtaLabel: "En savoir plus", secondaryBlockLink: { type: "none" as const } },
  "logo-cloud": { title: "Ils nous font confiance", logos: [{ name: "Client 1", imageUrl: "" }], grayscale: true, columns: 4 },
  "stats-animated": { stats: [{ value: 50, suffix: "+", label: "Projets" }, { value: 98, suffix: "%", label: "Satisfaction" }], animateOnScroll: true },
  "masonry-gallery": { items: [{ imageUrl: "", title: "Image 1" }], columns: 3, lightbox: false, maxImages: 12 },
  "comparison-table": { title: "Comparer les offres", plans: [{ name: "Basic", isHighlighted: false, ctaLabel: "Choisir" }, { name: "Premium", isHighlighted: true, ctaLabel: "Choisir" }], rows: [{ feature: "Feature 1", values: [true, true] }, { feature: "Feature 2", values: [false, true] }] },
  "contact-form": { title: "Contactez-nous", description: "Remplissez le formulaire ci-dessous.", fields: [{ label: "Nom", type: "text" as const, required: true }, { label: "Email", type: "email" as const, required: true }, { label: "Message", type: "textarea" as const, required: false }], submitLabel: "Envoyer", successMessage: "Merci ! Nous reviendrons vers vous rapidement.", saveAsLead: false },
  "blog-preview": { title: "Articles récents", posts: [{ title: "Article 1", excerpt: "Résumé de l'article...", date: "2025-03-15" }], columns: 3 },
  "video-text-split": { videoUrl: "", videoPosition: "left" as const, title: "Découvrez notre approche", description: "Description de la vidéo.", ctaLabel: "En savoir plus", blockLink: { type: "none" as const } },
  "before-after": { beforeImageUrl: "", afterImageUrl: "", beforeLabel: "Avant", afterLabel: "Après", initialPosition: 50 },
  "service-cards": { title: "Nos services", mode: "static" as const, services: [{ icon: "palette", name: "Service 1", description: "Description", features: ["Feature 1"], ctaLabel: "Commander" }], productIds: [], columns: 3, showPrice: true, ctaMode: "product_checkout" as const },
  "lead-magnet": { title: "Téléchargez notre guide", description: "Un guide complet pour lancer votre marque.", fileUrl: "", buttonLabel: "Télécharger", successMessage: "Merci ! Vérifiez votre boîte mail." },
  "availability-banner": { status: "open" as const, message: "Actuellement disponible pour de nouveaux projets", blockLink: { type: "none" as const } },
  "product-hero-checkout": { productId: "", benefits: ["Résultat professionnel", "Livraison rapide", "Révisions incluses"], ctaLabel: "Commander", showFeatures: true, layout: "center" as const },
  "product-cards-grid": { productIds: [], columns: 3 as const, showFilter: true, ctaLabel: "Voir le détail" },
  "inline-checkout": { productId: "", layout: "detailed" as const, ctaLabel: "Commander maintenant" },
  "bundle-builder": { productIds: [], title: "Créez votre pack sur-mesure", description: "Sélectionnez les services qui vous intéressent", ctaLabel: "Commander le pack", discountPercent: 10 },
  "pricing-table-real": { productIds: [], columns: 3 as const, showFeatures: true, highlightIndex: 1, ctaLabel: "Choisir" },
  "hero-split-glow": { title: "Creez des experiences memorables", subtitle: "Solution complete pour freelances creatifs. Design, developpement et strategie.", primaryCtaLabel: "Demarrer", primaryBlockLink: { type: "none" as const }, secondaryCtaLabel: "En savoir plus", secondaryBlockLink: { type: "none" as const }, badge: "Nouveau" },
  "hero-centered-mesh": { title: "Construisez le futur", subtitle: "Plateforme tout-en-un pour transformer vos idees en produits exceptionnels.", ctaLabel: "Commencer gratuitement", blockLink: { type: "none" as const }, badge: "Open Beta", trustLogos: [{ name: "Figma" }, { name: "Notion" }, { name: "Linear" }, { name: "Vercel" }] },
  "services-premium": { title: "Nos services", subtitle: "Tout ce dont vous avez besoin pour reussir.", services: [{ icon: "palette", title: "Design", description: "Direction artistique et identite visuelle sur mesure.", features: ["Logo & branding", "UI/UX design", "Motion design"] }, { icon: "code", title: "Developpement", description: "Sites et applications performants et modernes.", features: ["Sites vitrine", "Web apps", "E-commerce"] }, { icon: "zap", title: "Strategie", description: "Conseil et accompagnement pour booster votre croissance.", features: ["Audit", "SEO", "Growth"] }], columns: 3 },
  "portfolio-masonry": { title: "Realisations", subtitle: "Une selection de nos meilleurs projets.", items: [{ imageUrl: "", title: "Projet Alpha", category: "Branding", description: "Refonte complete de l'identite visuelle" }, { imageUrl: "", title: "Projet Beta", category: "Web", description: "Application SaaS moderne" }, { imageUrl: "", title: "Projet Gamma", category: "Video", description: "Showreel et motion design" }, { imageUrl: "", title: "Projet Delta", category: "Design", description: "Direction artistique premium" }], columns: 2 },
  "pricing-modern": { title: "Tarifs transparents", subtitle: "Choisissez la formule qui vous convient.", mode: "manual" as const, productIds: [], plans: [{ name: "Starter", price: "490", period: "par projet", description: "Ideal pour demarrer", features: ["1 page de vente", "Design responsive", "Livraison 7 jours", "1 revision"], isPopular: false, ctaLabel: "Choisir" }, { name: "Pro", price: "990", period: "par projet", description: "Pour les ambitieux", features: ["Jusqu'a 5 pages", "Design premium", "Livraison 5 jours", "3 revisions", "SEO optimise"], isPopular: true, ctaLabel: "Choisir" }, { name: "Premium", price: "1 990", period: "par projet", description: "L'excellence", features: ["Pages illimitees", "Design sur-mesure", "Livraison 3 jours", "Revisions illimitees", "SEO avance", "Support prioritaire"], isPopular: false, ctaLabel: "Choisir" }] },
  "testimonials-dark": { title: "Ce que disent nos clients", testimonials: [{ name: "Sophie Martin", role: "CEO", company: "Studio Bloom", text: "Un travail exceptionnel. Le resultat depasse toutes nos attentes.", rating: 5 }, { name: "Thomas Durand", role: "Fondateur", company: "TechFlow", text: "Professionnel, reactif et creatif. Je recommande a 100%.", rating: 5 }, { name: "Julie Lefebvre", role: "Directrice", company: "Agence Neon", text: "La qualite de travail est remarquable. Un vrai partenaire.", rating: 5 }] },
  "cta-banner": { title: "Pret a transformer votre vision en realite ?", description: "Lancez votre projet des aujourd'hui et rejoignez des centaines de clients satisfaits.", ctaLabel: "Demarrer maintenant", blockLink: { type: "none" as const }, secondaryLabel: "Prendre rendez-vous", secondaryBlockLink: { type: "none" as const } },
  "contact-premium": { title: "Parlons de votre projet", subtitle: "Remplissez le formulaire et nous revenons vers vous sous 24h.", fields: [{ label: "Nom", type: "text" as const, required: true, placeholder: "Votre nom" }, { label: "Email", type: "email" as const, required: true, placeholder: "votre@email.com" }, { label: "Telephone", type: "phone" as const, required: false, placeholder: "+33 6 00 00 00 00" }, { label: "Message", type: "textarea" as const, required: true, placeholder: "Decrivez votre projet..." }], submitLabel: "Envoyer", successMessage: "Merci ! Nous revenons vers vous rapidement.", saveAsLead: true },
  "footer-block": { siteName: "Mon Studio", description: "Design, developpement et strategie pour freelances creatifs.", columns: [{ title: "Services", links: [{ label: "Design" }, { label: "Developpement" }, { label: "Strategie" }] }, { title: "Ressources", links: [{ label: "Blog" }, { label: "Portfolio" }, { label: "FAQ" }] }, { title: "Legal", links: [{ label: "Mentions legales" }, { label: "CGV" }, { label: "Confidentialite" }] }], copyright: "Tous droits reserves.", showSocials: true, socials: { instagram: "#", twitter: "#", linkedin: "#" } },
  "video-showcase": { title: "Showreel 2025", subtitle: "Decouvrez notre univers creatif en 60 secondes.", videoUrl: "", stats: [{ value: "200+", label: "Projets" }, { value: "50+", label: "Clients" }, { value: "98%", label: "Satisfaction" }], ctaLabel: "Voir nos realisations", blockLink: { type: "none" as const } },
  "tech-stack": { title: "Notre stack technique", subtitle: "Les technologies que nous maitrisons.", categories: [{ name: "Frontend", items: [{ name: "React" }, { name: "Next.js" }, { name: "TypeScript" }, { name: "Tailwind" }] }, { name: "Backend", items: [{ name: "Node.js" }, { name: "PostgreSQL" }, { name: "Supabase" }, { name: "Stripe" }] }, { name: "Outils", items: [{ name: "Figma" }, { name: "GitHub" }, { name: "Vercel" }, { name: "Linear" }] }] },
  "before-after-pro": { title: "Avant / Apres", subtitle: "La difference est dans les details.", items: [{ beforeImageUrl: "", afterImageUrl: "", label: "Refonte site web" }, { beforeImageUrl: "", afterImageUrl: "", label: "Identite visuelle" }], layout: "side-by-side" as const },
  // ─── 50 new blocks ───
  "hero-split-portfolio": { badge: "Disponible", title: "Je cree des identites visuelles qui marquent les esprits", subtitle: "Directeur artistique freelance specialise en branding, motion design et direction creative pour les marques ambitieuses.", ctaLabel: "Voir mon portfolio", secondaryCtaLabel: "Demander un devis", stats: [{ value: "120+", label: "Projets livres" }, { value: "8 ans", label: "Experience" }, { value: "98%", label: "Satisfaction" }] },
  "hero-minimal-service": { trustBadge: "Plus de 200 clients satisfaits", title: "Des sites web qui convertissent vos visiteurs en clients", subtitle: "Design premium, developpement rapide et strategie de conversion pour freelances et PME ambitieuses.", ctaLabel: "Demander un devis", secondaryCtaLabel: "Voir nos realisations", proofItems: [{ icon: "zap", text: "Livraison en 7 jours" }, { icon: "shield", text: "Qualite premium garantie" }, { icon: "refresh", text: "Revisions illimitees" }] },
  "hero-dark-saas": { title: "Automatisez votre business en une seule plateforme", subtitle: "Gestion de projet, facturation, CRM et analytics reunis dans un outil elegant et puissant, concu pour les equipes modernes.", ctaLabel: "Essayer gratuitement", secondaryCtaLabel: "Voir la demo", features: [{ title: "Tableaux de bord", description: "Visualisez vos metriques en temps reel" }, { title: "Automatisations", description: "Gagnez 10h par semaine" }, { title: "Integrations", description: "Connecte a vos outils favoris" }] },
  "hero-creator-brand": { title: "Sarah Morel", subtitle: "Coach business et stratege digitale. J'accompagne les entrepreneurs creatifs a structurer leur offre et multiplier leurs revenus.", credentials: ["Certifiee ICF", "500+ clients accompagnes", "Auteure bestseller"], ctaLabel: "Reserver un appel", secondaryCtaLabel: "Decouvrir mes services", socialProof: [{ value: "45K", label: "Abonnes" }, { value: "500+", label: "Clients" }, { value: "4.9/5", label: "Note moyenne" }] },
  "hero-video-showreel": { title: "Showreel 2025", subtitle: "Montage video haut de gamme pour createurs et marques premium. Du concept a la post-production.", ctaLabel: "Me contacter", tags: ["Montage", "Motion Design", "Color Grading", "Post-Production", "Sound Design"] },
  "projects-grid-cases": { title: "Projets recents", subtitle: "Une selection de nos dernieres realisations.", projects: [{ title: "Rebrand Luxe Maison", category: "Branding", result: "+340% de notoriete en 6 mois" }, { title: "App Mobile FitTrack", category: "UI/UX Design", result: "4.8/5 sur l'App Store" }, { title: "Campagne Video NovaTech", category: "Video", result: "2.5M de vues en 30 jours" }, { title: "Refonte E-commerce Bloom", category: "Web Design", result: "+180% de taux de conversion" }] },
  "projects-horizontal": { title: "Realisations", subtitle: "Parcourez nos projets les plus recents.", projects: [{ title: "Brand Identity — Aura Studio", category: "Branding" }, { title: "Landing Page — CryptoVault", category: "Web Design" }, { title: "Motion Reel — Pixel Lab", category: "Video" }, { title: "E-commerce — La Maison Doree", category: "Dev" }, { title: "Dashboard UI — FinFlow", category: "UI/UX" }], ctaLabel: "Voir tous les projets" },
  "project-before-after": { title: "Transformations", subtitle: "Decouvrez l'impact reel de nos interventions", items: [{ beforeLabel: "Ancien site vitrine", afterLabel: "Nouvelle landing premium", beforeImageUrl: "", afterImageUrl: "", resultText: "+250% de leads", metricBadge: "+250%", description: "Refonte complete avec strategie de conversion et design premium.", category: "Web" }, { beforeLabel: "Logo generique", afterLabel: "Identite sur-mesure", beforeImageUrl: "", afterImageUrl: "", resultText: "Reconnaissance x3", metricBadge: "x3", description: "Creation d'une identite visuelle forte et memorable.", category: "Branding" }, { beforeLabel: "Thumbnails basiques", afterLabel: "Thumbnails optimisees", beforeImageUrl: "", afterImageUrl: "", resultText: "+180% de CTR", metricBadge: "+180%", description: "Optimisation visuelle pour maximiser les clics sur YouTube.", category: "Video" }] },
  "project-timeline": { title: "Etude de cas : Refonte Aura Studio", subtitle: "Comment nous avons transforme la presence digitale d'un studio creatif en 6 semaines.", steps: [{ title: "Decouverte", description: "Audit complet de la marque, analyse concurrentielle et definition des objectifs.", tag: "Semaine 1" }, { title: "Strategie", description: "Positionnement, architecture d'information et wireframes valides.", tag: "Semaine 2" }, { title: "Design", description: "Direction artistique, maquettes haute fidelite et prototypage interactif.", tag: "Semaine 3-4" }, { title: "Developpement", description: "Integration pixel-perfect, optimisation performance et tests cross-device.", tag: "Semaine 5" }, { title: "Livraison", description: "Deploiement, formation client et suivi post-lancement.", tag: "Semaine 6" }], resultSummary: "Resultat : +340% de trafic organique et +180% de leads qualifies en 3 mois." },
  "project-masonry-wall": { title: "Portfolio", items: [{ title: "Identite Aura", category: "Branding" }, { title: "App FinTrack", category: "UI/UX" }, { title: "Reel NovaTech", category: "Video" }, { title: "Site Bloom", category: "Web" }, { title: "Campagne Zenith", category: "Marketing" }, { title: "Packaging Maison", category: "Print" }], columns: 3 },
  "services-3card-premium": { title: "Nos services", subtitle: "Des prestations sur-mesure pour propulser votre marque.", services: [{ title: "Montage Video", description: "Montage professionnel pour YouTube, reseaux sociaux et campagnes publicitaires.", features: ["Montage dynamique", "Color grading cinema", "Sound design", "Sous-titres"], ctaLabel: "En savoir plus" }, { title: "Miniatures YouTube", description: "Des thumbnails qui captent l'attention et maximisent votre taux de clic.", features: ["Design sur-mesure", "A/B testing", "Optimisation CTR", "Livraison 24h"], ctaLabel: "Commander" }, { title: "Motion Design", description: "Animations et graphismes animes pour donner vie a votre marque.", features: ["Intros/Outros", "Infographies animees", "Logos animes", "Transitions"], ctaLabel: "Decouvrir" }] },
  "services-icon-grid": { title: "Ce que nous proposons", subtitle: "Un ecosysteme complet de services pour votre croissance.", services: [{ icon: "palette", title: "Direction Artistique", description: "Identite visuelle et charte graphique sur-mesure." }, { icon: "code", title: "Developpement Web", description: "Sites performants et applications modernes." }, { icon: "video", title: "Production Video", description: "Contenu video professionnel et engageant." }, { icon: "megaphone", title: "Strategie Digitale", description: "SEO, ads et content marketing." }, { icon: "camera", title: "Photographie", description: "Shootings produit et corporate." }, { icon: "pen", title: "Redaction", description: "Copywriting et content strategy." }] },
  "services-split-value": { title: "Pourquoi travailler avec nous", subtitle: "Une approche premium, des resultats concrets.", description: "Nous ne sommes pas une agence de plus. Notre methode combine strategie, design et technologie pour creer des experiences digitales qui convertissent.", pillars: [{ title: "Strategie d'abord", description: "Chaque projet commence par une reflexion strategique approfondie." }, { title: "Design premium", description: "Pas de templates. Tout est cree sur-mesure pour votre marque." }, { title: "Resultats mesurables", description: "Chaque decision est guidee par la donnee et la performance." }, { title: "Accompagnement continu", description: "Un suivi post-projet pour optimiser vos resultats." }] },
  "services-process-offers": { title: "Nos prestations", offers: [{ title: "Site Vitrine Premium", description: "Un site a votre image qui convertit vos visiteurs.", steps: ["Brief & decouverte", "Maquettes & validation", "Developpement & tests", "Mise en ligne & formation"] }, { title: "Identite de Marque", description: "Une identite visuelle forte et coherente.", steps: ["Audit & recherche", "Concepts creatifs", "Declinaisons & charte", "Livraison & guidelines"] }, { title: "Strategie Digitale", description: "Un plan d'action pour booster votre visibilite.", steps: ["Analyse du marche", "Plan d'action SEO/Ads", "Mise en oeuvre", "Suivi & optimisation"] }] },
  "product-featured-card": { title: "Pack Branding Complet", description: "Tout ce dont vous avez besoin pour lancer votre marque avec une identite visuelle professionnelle et coherente.", price: "1 490 EUR", benefits: ["Logo principal + variations", "Charte graphique complete", "Templates reseaux sociaux", "Guide de marque PDF", "Fichiers sources inclus"], ctaLabel: "Commander maintenant", trustNote: "Satisfait ou rembourse sous 14 jours." },
  "products-3card-shop": { title: "Nos packs", subtitle: "Des solutions cles en main pour chaque besoin.", products: [{ title: "Pack Templates Canva", price: "49 EUR", description: "30 templates premium pour vos reseaux sociaux.", ctaLabel: "Acheter" }, { title: "Pack Presets Photo", price: "79 EUR", description: "12 presets Lightroom pour un feed Instagram coherent.", ctaLabel: "Acheter" }, { title: "Pack Formation Video", price: "197 EUR", description: "Formation complete : du tournage au montage pro.", ctaLabel: "Acheter" }] },
  "product-bundle-compare": { title: "Choisissez votre formule", subtitle: "Trois niveaux pour s'adapter a votre ambition.", bundles: [{ name: "Essentiel", price: "490 EUR", description: "L'essentiel pour demarrer.", features: ["1 page de vente", "Design responsive", "Livraison 10 jours", "1 revision"], ctaLabel: "Choisir" }, { name: "Professionnel", price: "990 EUR", description: "La formule la plus populaire.", features: ["Jusqu'a 5 pages", "Design premium", "Livraison 7 jours", "3 revisions", "SEO de base"], isPopular: true, ctaLabel: "Choisir" }, { name: "Sur-mesure", price: "2 490 EUR", description: "L'excellence sans compromis.", features: ["Pages illimitees", "Design sur-mesure", "Livraison 5 jours", "Revisions illimitees", "SEO avance", "Support 6 mois"], ctaLabel: "Choisir" }] },
  "product-benefits-mockup": { title: "Guide : Lancer sa marque en 30 jours", subtitle: "Le guide etape par etape utilise par +500 entrepreneurs pour construire une marque memorable.", benefits: ["Methode eprouvee en 7 etapes", "Templates et checklists inclus", "Exemples reels de marques a succes", "Bonus : 30 prompts IA pour votre branding"], ctaLabel: "Telecharger le guide", imageUrl: "" },
  "pricing-3tier-saas": { title: "Tarifs simples et transparents", subtitle: "Pas de frais caches. Changez de formule a tout moment.", plans: [{ name: "Starter", price: "19 EUR", period: "/ mois", description: "Pour les independants.", features: ["5 projets", "1 Go stockage", "Support email", "Templates de base"], ctaLabel: "Commencer" }, { name: "Pro", price: "49 EUR", period: "/ mois", description: "Pour les equipes en croissance.", features: ["Projets illimites", "50 Go stockage", "Support prioritaire", "Templates premium", "Analytics avances", "API access"], isPopular: true, ctaLabel: "Essayer 14 jours" }, { name: "Business", price: "99 EUR", period: "/ mois", description: "Pour les entreprises.", features: ["Tout du plan Pro", "Stockage illimite", "Support dedie", "SSO & SAML", "SLA garanti", "Formation incluse", "Manager de compte"], ctaLabel: "Contacter" }] },
  "pricing-custom-quote": { title: "Un projet sur-mesure ?", subtitle: "Chaque projet est unique. Discutons de vos besoins pour construire la solution ideale.", features: ["Audit et strategie personnalises", "Design et developpement sur-mesure", "Accompagnement de A a Z", "Suivi post-lancement inclus", "Engagement qualite garantie"], ctaLabel: "Demander un devis gratuit", note: "Reponse sous 24h ouvrees. Sans engagement." },
  "pricing-mini-faq": { title: "Nos formules", plans: [{ name: "Starter", price: "490 EUR", features: ["1 page", "Design responsive", "1 revision"], ctaLabel: "Choisir" }, { name: "Pro", price: "990 EUR", features: ["5 pages", "Design premium", "3 revisions", "SEO"], ctaLabel: "Choisir" }, { name: "Premium", price: "1 990 EUR", features: ["Illimite", "Sur-mesure", "Illimitees", "SEO+Support"], ctaLabel: "Choisir" }], faq: [{ question: "Quels sont les delais de livraison ?", answer: "Entre 5 et 15 jours selon la formule choisie." }, { question: "Proposez-vous des facilites de paiement ?", answer: "Oui, paiement en 2 ou 3 fois sans frais." }, { question: "Que comprend le support post-lancement ?", answer: "Corrections, ajustements et conseil pendant 30 jours." }, { question: "Puis-je changer de formule en cours de route ?", answer: "Absolument, nous nous adaptons a l'evolution de votre projet." }] },
  "testimonials-3dark": { title: "Ils nous ont fait confiance", testimonials: [{ name: "Marie Laurent", role: "Fondatrice", company: "Studio Bloom", text: "Un travail exceptionnel du debut a la fin. Le resultat depasse toutes mes attentes. Je recommande les yeux fermes.", rating: 5 }, { name: "Alexandre Chen", role: "CEO", company: "TechVault", text: "Professionnalisme, creativite et reactivite. Trois mots qui resument parfaitement cette collaboration.", rating: 5 }, { name: "Camille Dubois", role: "Directrice Marketing", company: "Neon Agency", text: "Depuis notre collaboration, notre taux de conversion a augmente de 240%. Un vrai game-changer.", rating: 5 }] },
  "testimonials-video": { title: "Temoignages clients", subtitle: "Decouvrez les retours de nos clients en video.", testimonials: [{ name: "Jean-Marc Petit", company: "Agence Horizon", quote: "Grace a leur expertise, nous avons triple notre chiffre d'affaires en un an." }, { name: "Sarah Benali", company: "Studio Eclat", quote: "Le meilleur investissement que j'ai fait pour ma marque." }, { name: "Thomas Riviere", company: "FinTech Pro", quote: "Un accompagnement premium du debut a la fin." }] },
  "results-logos-quotes": { title: "Ils nous font confiance", logos: [{ name: "Notion" }, { name: "Figma" }, { name: "Linear" }, { name: "Vercel" }, { name: "Stripe" }, { name: "Supabase" }], quotes: [{ text: "Un partenaire strategique incontournable pour notre croissance digitale.", name: "Pierre Moreau", role: "CEO, TechFlow" }, { text: "La qualite d'execution et la vision strategique sont remarquables.", name: "Sophie Laurent", role: "CMO, Bloom Studio" }] },
  "numbers-impact": { title: "Nos resultats parlent d'eux-memes", subtitle: "Des chiffres concrets, pas des promesses.", stats: [{ value: "12M+", label: "Vues generees", context: "pour nos clients" }, { value: "350+", label: "Projets livres", context: "depuis 2019" }, { value: "< 24h", label: "Temps de reponse", context: "en moyenne" }, { value: "98%", label: "Taux de satisfaction", context: "sur 5 ans" }, { value: "8 ans", label: "Experience", context: "dans le digital" }] },
  "results-timeline": { title: "L'impact de notre collaboration", subtitle: "Resultats typiques de nos clients dans les 90 premiers jours.", milestones: [{ label: "Jour 1", value: "Lancement", description: "Mise en ligne du nouveau site et des assets de marque." }, { label: "30 jours", value: "+120%", description: "Augmentation du trafic organique grace au SEO." }, { label: "60 jours", value: "+85%", description: "Hausse du taux de conversion sur les pages cles." }, { label: "90 jours", value: "x3", description: "Triplement du nombre de leads qualifies." }] },
  "about-personal-story": { title: "Mon parcours", story: "Apres 8 ans en agence a Paris et Londres, j'ai decide de me lancer en independant pour offrir a mes clients un accompagnement plus personnel et plus strategique. Aujourd'hui, j'aide les entrepreneurs et les marques ambitieuses a construire une presence digitale qui reflete leur excellence.", highlights: ["Direction artistique pour Publicis et BBDO", "Plus de 200 projets livres", "Expertise en branding et web design", "Approche centree resultats"], mission: "Ma mission : transformer votre vision en une experience digitale memorable.", imageUrl: "" },
  "about-studio-values": { title: "Nos valeurs", subtitle: "Ce qui guide chacune de nos decisions.", values: [{ title: "Excellence", description: "Nous ne livrons rien qui ne soit a la hauteur de nos standards.", icon: "star" }, { title: "Reactivite", description: "Reponse sous 24h, livraison dans les delais, toujours.", icon: "zap" }, { title: "Strategie", description: "Le design sans strategie, c'est de l'art. Nous faisons du business.", icon: "target" }, { title: "Transparence", description: "Communication claire, prix fixes, pas de surprises.", icon: "eye" }], teamNote: "Une equipe de 4 experts passionnes au service de votre marque." },
  "team-mini-grid": { title: "L'equipe", subtitle: "Des experts passionnes a votre service.", members: [{ name: "Thomas Morel", role: "Fondateur & DA", bio: "8 ans d'experience en direction artistique et branding." }, { name: "Lea Martin", role: "Developpeuse Senior", bio: "Experte React, Next.js et architectures modernes." }, { name: "Hugo Petit", role: "Motion Designer", bio: "Specialiste After Effects et animations web." }, { name: "Camille Roy", role: "Strategiste Digital", bio: "SEO, growth et conversion pour marques ambitieuses." }] },
  "process-4steps": { title: "Comment ca marche", subtitle: "Un processus simple et efficace en 4 etapes.", steps: [{ title: "Decouverte", description: "On echange sur vos besoins, objectifs et vision.", icon: "search" }, { title: "Proposition", description: "Vous recevez un devis detaille et un calendrier clair.", icon: "file" }, { title: "Production", description: "On cree, vous validez. Revisions incluses.", icon: "pen" }, { title: "Livraison", description: "Livraison des fichiers, formation et suivi.", icon: "check" }] },
  "process-detailed-timeline": { title: "Notre methode de travail", subtitle: "Un processus eprouve pour des resultats previsibles.", steps: [{ title: "Kick-off & Brief", description: "Reunion de lancement pour aligner la vision, les objectifs et les contraintes du projet.", tag: "Jour 1", details: "Appel video de 60 min avec questionnaire prealable." }, { title: "Recherche & Strategie", description: "Analyse du marche, benchmark concurrentiel et definition du positionnement.", tag: "Semaine 1", details: "Livrable : document strategique + moodboard." }, { title: "Design & Prototypage", description: "Creation des maquettes haute fidelite et prototypage interactif.", tag: "Semaine 2-3", details: "2 tours de revision inclus." }, { title: "Developpement", description: "Integration pixel-perfect, optimisation et tests de performance.", tag: "Semaine 4", details: "Preview en temps reel accessible." }, { title: "Lancement & Suivi", description: "Mise en production, formation et accompagnement post-lancement.", tag: "Semaine 5", details: "Support 30 jours inclus." }] },
  "faq-accordion-full": { title: "Questions frequentes", subtitle: "Tout ce que vous devez savoir avant de commencer.", items: [{ question: "Quels sont vos delais de livraison ?", answer: "Nos delais varient de 5 a 15 jours ouvrables selon la complexite du projet. Chaque devis inclut un calendrier precis." }, { question: "Combien de revisions sont incluses ?", answer: "Selon la formule choisie, entre 1 et un nombre illimite de revisions. Nous ne livrons rien tant que vous n'etes pas satisfait." }, { question: "Quels modes de paiement acceptez-vous ?", answer: "Carte bancaire, virement et PayPal. Paiement en 2 ou 3 fois possible sur les projets de plus de 500 EUR." }, { question: "Proposez-vous un suivi apres livraison ?", answer: "Oui, chaque projet inclut 30 jours de support post-livraison pour ajustements et questions." }, { question: "Comment se deroule la communication ?", answer: "Principalement par email et visio. Vous avez un interlocuteur dedie tout au long du projet." }, { question: "Puis-je voir des exemples de projets similaires ?", answer: "Absolument ! Consultez notre portfolio ou demandez des references specifiques a votre secteur." }, { question: "Que se passe-t-il si je ne suis pas satisfait ?", answer: "Nous travaillons jusqu'a votre satisfaction. En cas de desaccord majeur, nous proposons un remboursement partiel." }] },
  "faq-2column": { title: "FAQ", subtitle: "Les reponses a vos questions.", items: [{ question: "Quel est le prix d'un site web ?", answer: "A partir de 490 EUR pour un site vitrine. Chaque projet est chiffre sur devis." }, { question: "Travaillez-vous a distance ?", answer: "Oui, 100% de nos projets sont geres a distance avec des outils collaboratifs." }, { question: "Fournissez-vous l'hebergement ?", answer: "Nous recommandons et configurons l'hebergement adapte a votre projet." }, { question: "Puis-je modifier le site moi-meme ?", answer: "Oui, nous livrons avec un CMS intuitif et une formation complete." }, { question: "Proposez-vous la maintenance ?", answer: "Oui, nous proposons des forfaits de maintenance mensuelle." }, { question: "Quel est le processus de commande ?", answer: "Prise de contact, devis, acompte 50%, production, livraison, solde." }, { question: "Les fichiers sources sont-ils fournis ?", answer: "Oui, tous les fichiers sources vous appartiennent." }, { question: "Faites-vous du SEO ?", answer: "Oui, chaque site est optimise pour le referencement naturel." }] },
  "cta-centered-strong": { title: "Pret a donner vie a votre projet ?", subtitle: "Discutons de votre vision et construisons quelque chose d'exceptionnel ensemble.", ctaLabel: "Demander un devis gratuit", secondaryCtaLabel: "Voir le portfolio" },
  "cta-split-text": { title: "Transformez votre presence digitale", description: "Rejoignez les centaines d'entrepreneurs qui ont choisi de passer au niveau superieur avec un site qui convertit.", ctaLabel: "Demarrer maintenant", secondaryCtaLabel: "Prendre rendez-vous" },
  "cta-dark-glow": { title: "Ne laissez pas votre concurrence prendre de l'avance", subtitle: "Chaque jour sans site premium est un jour de revenus perdus. Lancez votre projet aujourd'hui.", ctaLabel: "Commencer maintenant", trustBadges: ["Satisfait ou rembourse", "Livraison garantie", "Support premium"] },
  "form-contact-simple": { title: "Contactez-nous", subtitle: "Une question ou un projet ? Ecrivez-nous et nous repondons sous 24h.", fields: [{ label: "Nom", type: "text", placeholder: "Votre nom complet", required: true }, { label: "Email", type: "email", placeholder: "votre@email.com", required: true }, { label: "Message", type: "textarea", placeholder: "Decrivez votre projet ou votre question...", required: true }], submitLabel: "Envoyer le message", trustNote: "Nous ne partageons jamais vos donnees." },
  "form-quote-request": { title: "Demander un devis", subtitle: "Remplissez ce formulaire et recevez une proposition sous 48h.", fields: [{ label: "Nom", type: "text", placeholder: "Votre nom", required: true }, { label: "Email", type: "email", placeholder: "votre@email.com", required: true }, { label: "Type de projet", type: "select", required: true, options: ["Site vitrine", "E-commerce", "Application web", "Branding", "Video", "Autre"] }, { label: "Budget estime", type: "select", required: false, options: ["< 500 EUR", "500 - 1 000 EUR", "1 000 - 3 000 EUR", "3 000 - 5 000 EUR", "> 5 000 EUR"] }, { label: "Delai souhaite", type: "select", required: false, options: ["< 1 semaine", "2-3 semaines", "1 mois", "Pas de rush"] }, { label: "Description du projet", type: "textarea", placeholder: "Decrivez votre projet, vos objectifs et vos attentes...", required: true }], submitLabel: "Envoyer ma demande", sideText: "Reponse garantie sous 48h. Sans engagement." },
  "form-newsletter-lead": { title: "Recevez nos meilleurs conseils", subtitle: "Chaque semaine, des tips actionables sur le branding, le web et la strategie digitale. Rejoignez +2 000 abonnes.", placeholder: "Votre adresse email", ctaLabel: "S'inscrire gratuitement", privacyNote: "Pas de spam. Desabonnement en un clic." },
  "media-featured-video": { title: "Decouvrez notre univers", subtitle: "Un apercu de notre travail et de notre approche.", videoUrl: "", secondaryVideos: [{ title: "Behind the scenes" }, { title: "Interview client" }, { title: "Process creatif" }] },
  "gallery-3up-strip": { title: "En images", items: [{ caption: "Direction artistique" }, { caption: "Shooting studio" }, { caption: "Post-production" }] },
  "gallery-stacked-storyboard": { title: "L'histoire du projet", items: [{ title: "Le brief", description: "Le client souhaitait une identite visuelle moderne et impactante pour son lancement." }, { title: "La recherche", description: "Exploration de references, moodboards et concepts creatifs pour definir la direction." }, { title: "Le resultat", description: "Une marque forte et coherente qui se demarque immediatement de la concurrence." }] },
  "content-feature-article": { title: "Comment creer une identite de marque memorable en 2025", excerpt: "Decouvrez les 7 etapes essentielles pour construire une marque qui marque les esprits, de la strategie a la creation visuelle.", ctaLabel: "Lire l'article", category: "Branding", date: "12 Mars 2025" },
  "content-3articles": { title: "Ressources & Articles", subtitle: "Des guides pratiques pour entrepreneurs et creatifs.", articles: [{ title: "5 erreurs qui tuent votre taux de conversion", excerpt: "Les pieges les plus courants des sites vitrine et comment les eviter pour convertir plus.", category: "Conversion", date: "8 Mars 2025" }, { title: "Guide : Choisir les bonnes couleurs pour votre marque", excerpt: "La psychologie des couleurs appliquee au branding : comment faire les bons choix.", category: "Design", date: "2 Mars 2025" }, { title: "SEO en 2025 : les strategies qui fonctionnent vraiment", excerpt: "Oubliez le keyword stuffing. Voici ce qui marche concretement pour ranker.", category: "SEO", date: "25 Fevrier 2025" }] },
  "content-comparison-why": { title: "Pourquoi nous choisir ?", subtitle: "La difference entre un prestataire classique et notre approche.", leftColumn: { title: "Prestataire classique", items: ["Templates generiques", "Communication sporadique", "Livraison sans suivi", "Approche technique uniquement", "Devis opaques"] }, rightColumn: { title: "Notre approche", items: ["Design 100% sur-mesure", "Interlocuteur dedie", "Suivi post-lancement 30j", "Strategie + design + tech", "Prix fixes et transparents"] } },
  "trust-badges": { title: "Nos engagements", badges: [{ icon: "shield", title: "Paiement securise", description: "Transactions chiffrees et securisees par Stripe." }, { icon: "refresh", title: "Satisfait ou rembourse", description: "14 jours pour changer d'avis, sans condition." }, { icon: "zap", title: "Livraison rapide", description: "Respect des delais garanti sur chaque projet." }, { icon: "headphones", title: "Support reactif", description: "Reponse sous 24h maximum, 7j/7." }, { icon: "check", title: "Revisions incluses", description: "On travaille jusqu'a votre entiere satisfaction." }] },
  "social-proof-marquee": { items: [{ text: "Resultat incroyable, je recommande a 100% !", name: "Marie L.", result: "+250% de leads" }, { text: "Professionnel, creatif et toujours a l'ecoute.", name: "Thomas D.", result: "Livraison en 5 jours" }, { text: "Le meilleur investissement pour ma marque.", name: "Sarah B.", result: "x3 en CA" }, { text: "Un niveau de qualite rarement vu.", name: "Pierre M.", result: "4.9/5 de satisfaction" }, { text: "Mon site convertit enfin comme il devrait.", name: "Julie F.", result: "+180% de conversion" }, { text: "Communication parfaite du debut a la fin.", name: "Alexandre C.", result: "Projet livre en avance" }] },
  "footer-simple-premium": { siteName: "Mon Studio", links: [{ label: "Services" }, { label: "Portfolio" }, { label: "Contact" }, { label: "Blog" }], copyright: "2025 Mon Studio. Tous droits reserves.", showSocials: true, socials: { instagram: "#", twitter: "#", linkedin: "#" } },
  "footer-multi-column": { siteName: "Mon Studio", description: "Design, developpement et strategie digitale pour marques ambitieuses.", columns: [{ title: "Services", links: [{ label: "Web Design" }, { label: "Branding" }, { label: "Developpement" }, { label: "Strategie SEO" }] }, { title: "Ressources", links: [{ label: "Blog" }, { label: "Portfolio" }, { label: "FAQ" }, { label: "Guides gratuits" }] }, { title: "Legal", links: [{ label: "Mentions legales" }, { label: "CGV" }, { label: "Politique de confidentialite" }, { label: "Cookies" }] }], copyright: "2025 Mon Studio. Tous droits reserves.", contact: { email: "hello@monstudio.fr", phone: "+33 6 12 34 56 78" }, showSocials: true, socials: { instagram: "#", twitter: "#", linkedin: "#", youtube: "#" } },
  "signature-creative-closing": { title: "Construisons quelque chose d'exceptionnel ensemble", subtitle: "Chaque grand projet commence par une conversation. La votre commence ici.", ctaLabel: "Lancer votre projet", signatureNote: "Concu avec passion et precision." },
};

/** Generate a stable UUID for new blocks.
 *  Full UUID so it can be persisted to the DB `site_blocks.id` column directly,
 *  keeping navbar blockId references valid across save cycles. */
function newBlockId(): string {
  return crypto.randomUUID();
}

const MAX_HISTORY = 50;
const COALESCE_MS = 500;

// Track last content/style edit to coalesce rapid keystrokes into one history entry
let lastEditAction: string | null = null;
let lastEditBlockId: string | null = null;
let lastEditTime = 0;

function pushHistory(state: BuilderState, coalesceKey?: string): { history: Site[]; historyIndex: number } {
  const now = Date.now();
  const shouldCoalesce = coalesceKey && coalesceKey === lastEditAction
    && lastEditBlockId !== null && now - lastEditTime < COALESCE_MS;

  if (coalesceKey) {
    lastEditAction = coalesceKey;
    lastEditBlockId = state.activeBlockId;
    lastEditTime = now;
  } else {
    lastEditAction = null;
    lastEditBlockId = null;
    lastEditTime = 0;
  }

  const history = state.history.slice(0, state.historyIndex + 1);
  if (shouldCoalesce && history.length > 1) {
    // Replace last snapshot instead of pushing a new one
    history[history.length - 1] = JSON.parse(JSON.stringify(state.site));
  } else {
    history.push(JSON.parse(JSON.stringify(state.site)));
    if (history.length > MAX_HISTORY) history.shift();
  }
  return { history, historyIndex: history.length - 1 };
}

function withHistory(state: BuilderState, site: Site, coalesceKey?: string): BuilderState {
  const h = pushHistory(state, coalesceKey);
  return { ...state, site, isDirty: true, history: h.history, historyIndex: h.historyIndex };
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "INIT_SITE": {
      return {
        ...state,
        site: action.site,
        activePageId: action.site.pages[0]?.id ?? "",
        activeBlockId: null,
        isDirty: false,
        history: [JSON.parse(JSON.stringify(action.site))],
        historyIndex: 0,
        savedHistoryIndex: 0,
      };
    }

    case "MARK_CLEAN":
      return { ...state, isDirty: false, savedHistoryIndex: state.historyIndex };

    case "SET_ACTIVE_PAGE":
      return { ...state, activePageId: action.pageId, activeBlockId: null };

    case "SET_ACTIVE_BLOCK":
      return { ...state, activeBlockId: action.blockId };

    case "SET_BREAKPOINT":
      return { ...state, breakpoint: action.breakpoint };

    case "TOGGLE_PREVIEW_MODE":
      return { ...state, previewMode: !state.previewMode, activeBlockId: null };

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return { ...state, site: JSON.parse(JSON.stringify(state.history[newIndex])), historyIndex: newIndex, isDirty: newIndex !== state.savedHistoryIndex };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return { ...state, site: JSON.parse(JSON.stringify(state.history[newIndex])), historyIndex: newIndex, isDirty: newIndex !== state.savedHistoryIndex };
    }

    case "UPDATE_BLOCK_CONTENT": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, content: { ...b.content, ...action.content } } as Block : b
        ),
      })) };
      return withHistory(state, site, `content:${action.blockId}`);
    }

    case "UPDATE_BLOCK_STYLE": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, style: { ...b.style, ...action.style } } as Block : b
        ),
      })) };
      return withHistory(state, site, `style:${action.blockId}`);
    }

    case "UPDATE_BLOCK_SETTINGS": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, settings: { ...b.settings, ...action.settings } } as Block : b
        ),
      })) };
      return withHistory(state, site);
    }

    case "TOGGLE_BLOCK_VISIBILITY": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.map((b) =>
          b.id === action.blockId ? { ...b, visible: !b.visible } as Block : b
        ),
      })) };
      return withHistory(state, site);
    }

    case "DUPLICATE_BLOCK": {
      const dupId = newBlockId();
      const site = { ...state.site, pages: state.site.pages.map((p) => {
        const idx = p.blocks.findIndex((b) => b.id === action.blockId);
        if (idx === -1) return p;
        const source = p.blocks[idx];
        const dup = { ...source, id: dupId, content: { ...source.content }, style: { ...source.style }, settings: { ...source.settings } } as Block;
        const blocks = [...p.blocks];
        blocks.splice(idx + 1, 0, dup);
        return { ...p, blocks };
      }) };
      return { ...withHistory(state, site), activeBlockId: dupId };
    }

    case "REORDER_BLOCKS": {
      const site = { ...state.site, pages: state.site.pages.map((p) => {
        if (p.id !== action.pageId) return p;
        const blocks = [...p.blocks];
        const [moved] = blocks.splice(action.fromIndex, 1);
        blocks.splice(action.toIndex, 0, moved);
        return { ...p, blocks };
      }) };
      return withHistory(state, site);
    }

    case "ADD_BLOCK": {
      const variant = action.variantKey ? getVariant(action.blockType, action.variantKey) : undefined;
      const newBlock = {
        id: newBlockId(),
        type: action.blockType,
        content: { ...defaultContent[action.blockType], ...(variant?.contentOverrides || {}) },
        style: { paddingTop: 0, paddingBottom: 0, ...(variant?.style || {}) },
        settings: { variantKey: action.variantKey },
        visible: true,
      } as Block;
      const site = { ...state.site, pages: state.site.pages.map((p) =>
        p.id === action.pageId ? { ...p, blocks: [...p.blocks, newBlock] } : p
      ) };
      return { ...withHistory(state, site), activeBlockId: newBlock.id };
    }

    case "REMOVE_BLOCK": {
      const site = { ...state.site, pages: state.site.pages.map((p) => ({
        ...p,
        blocks: p.blocks.filter((b) => b.id !== action.blockId),
      })) };
      return { ...withHistory(state, site), activeBlockId: state.activeBlockId === action.blockId ? null : state.activeBlockId };
    }

    case "ADD_PAGE": {
      const site = { ...state.site, pages: [...state.site.pages, action.page] };
      return { ...withHistory(state, site), activePageId: action.page.id };
    }

    case "REMOVE_PAGE": {
      const site = { ...state.site, pages: state.site.pages.filter((p) => p.id !== action.pageId) };
      const newActivePageId = state.activePageId === action.pageId
        ? (site.pages[0]?.id ?? "")
        : state.activePageId;
      return { ...withHistory(state, site), activePageId: newActivePageId, activeBlockId: null };
    }

    case "UPDATE_PAGE": {
      const site = { ...state.site, pages: state.site.pages.map((p) =>
        p.id === action.pageId ? { ...p, ...action.updates } : p
      ) };
      return withHistory(state, site);
    }

    case "APPLY_TEMPLATE": {
      const site = { ...state.site, pages: action.pages };
      return { ...withHistory(state, site), activePageId: action.pages[0]?.id ?? "", activeBlockId: null };
    }

    case "APPLY_FULL_TEMPLATE": {
      const site = {
        ...state.site,
        theme: action.theme,
        design: action.design,
        nav: action.nav,
        footer: action.footer,
        pages: action.pages,
      };
      return { ...withHistory(state, site), activePageId: action.pages[0]?.id ?? "", activeBlockId: null };
    }

    case "UPDATE_SITE_SETTINGS":
      return withHistory(state, { ...state.site, settings: { ...state.site.settings, ...action.settings } });

    case "UPDATE_SITE_THEME":
      return withHistory(state, { ...state.site, theme: { ...state.site.theme, ...action.theme } });

    case "UPDATE_SITE_SEO":
      return withHistory(state, { ...state.site, seo: { ...state.site.seo, ...action.seo } });

    case "UPDATE_SITE_DOMAIN":
      return withHistory(state, { ...state.site, domain: { ...state.site.domain, ...action.domain } });

    case "UPDATE_NAV":
      return withHistory(state, { ...state.site, nav: action.nav });

    case "UPDATE_FOOTER":
      return withHistory(state, { ...state.site, footer: action.footer });

    case "UPDATE_DESIGN":
      return withHistory(state, { ...state.site, design: { ...state.site.design, ...action.design } as Site["design"] });

    case "APPLY_DESIGN": {
      const site = {
        ...state.site,
        theme: action.theme,
        design: action.design,
        ...(action.nav ? { nav: action.nav } : {}),
        ...(action.footer ? { footer: action.footer } : {}),
      };
      return withHistory(state, site);
    }

    default:
      return state;
  }
}

const emptySite: Site = {
  id: "",
  settings: { name: "", description: "", maintenanceMode: false, socials: {} },
  theme: { primaryColor: "#4F46E5", fontFamily: "Inter, sans-serif", borderRadius: "rounded", shadow: "sm" },
  pages: [],
  domain: { subdomain: "" },
  seo: { globalTitle: "", globalDescription: "" },
};

const initialState: BuilderState = {
  site: emptySite,
  activePageId: "",
  activeBlockId: null,
  isDirty: false,
  breakpoint: "desktop",
  previewMode: false,
  history: [JSON.parse(JSON.stringify(emptySite))],
  historyIndex: 0,
  savedHistoryIndex: 0,
};

// ── Serialize Site → draft payload for autosave ──
function serializeSiteForSave(site: Site) {
  return {
    name: site.settings.name,
    settings: {
      description: site.settings.description,
      logoUrl: site.settings.logoUrl,
      maintenanceMode: site.settings.maintenanceMode,
      socials: site.settings.socials,
      i18n: site.settings.i18n,
    },
    theme: site.theme,
    design: site.design || null,
    seo: {
      globalTitle: site.seo.globalTitle,
      globalDescription: site.seo.globalDescription,
      ogImageUrl: site.seo.ogImageUrl,
    },
    nav: site.nav || null,
    footer: site.footer || null,
    pages: (() => {
      const usedSlugs = new Set<string>();
      return site.pages.map((p, i) => {
        let slug = p.slug === "/" ? "home" : p.slug.replace(/^\//, "");
        if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
        usedSlugs.add(slug);
        return {
          title: p.name,
          slug,
          is_home: p.slug === "/",
          sort_order: i,
          status: p.status || "draft",
          seo_title: p.seoTitle || null,
          seo_description: p.seoDescription || null,
          blocks: p.blocks.map((b, j) => ({
            id: b.id,
            type: b.type,
            sort_order: j,
            content: b.content,
            style: b.style,
            settings: b.settings,
            visible: b.visible,
          })),
        };
      });
    })(),
  };
}

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  saveStatus: SaveStatus;
  siteId: string;
  acquireSaveLock: () => Promise<() => void>;
}>({ state: initialState, dispatch: () => {}, saveStatus: "idle", siteId: "", acquireSaveLock: async () => () => {} });

export function BuilderProvider({ children }: { children: ReactNode }) {
  const { site: loadedSite, siteId, loading: siteLoading, error: siteError, mutate } = useSite();
  const [state, dispatch] = useReducer(builderReducer, initialState);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const initializedRef = useRef(false);
  const saveAbortRef = useRef<AbortController | null>(null);
  const savePendingRef = useRef<Promise<void> | null>(null);
  const retryDirtyRef = useRef(false);
  const saveLockRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize from SiteProvider's data (once per mount)
  useEffect(() => {
    if (!siteLoading && loadedSite.id && !initializedRef.current) {
      dispatch({ type: "INIT_SITE", site: loadedSite });
      initializedRef.current = true;
    }
  }, [siteLoading, loadedSite]);

  // Autosave: debounced 800ms after any dirty change — serialized (no concurrent saves)
  useEffect(() => {
    if (!state.isDirty || !siteId || !initializedRef.current) return;

    const timer = setTimeout(() => {
      // If locked (publish in progress) or a save is in flight, defer
      if (saveLockRef.current || savePendingRef.current) {
        retryDirtyRef.current = true;
        return;
      }

      const doSave = async () => {
        saveAbortRef.current?.abort();
        const ctrl = new AbortController();
        saveAbortRef.current = ctrl;

        setSaveStatus("saving");
        try {
          const snapshot = serializeSiteForSave(stateRef.current.site);
          const res = await fetch(`/api/sites/${siteId}/draft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(snapshot),
            signal: ctrl.signal,
          });
          if (ctrl.signal.aborted) return;
          if (!res.ok) {
            const errBody = await res.json().catch(() => null);
            console.error("[autosave] server error:", res.status, JSON.stringify(errBody));
            throw new Error(`${res.status}`);
          }

          setSaveStatus("saved");
          dispatch({ type: "MARK_CLEAN" });
          mutate();
        } catch (err: unknown) {
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("[autosave] error:", err);
          setSaveStatus("error");
        } finally {
          savePendingRef.current = null;
          // If new changes came in during save, trigger another save
          if (retryDirtyRef.current) {
            retryDirtyRef.current = false;
            savePendingRef.current = doSave();
          }
        }
      };

      savePendingRef.current = doSave();
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.site, state.isDirty, siteId]);

  // Acquire exclusive save lock — waits for in-flight autosave, blocks future ones
  // Returns an unlock function to call when done
  const acquireSaveLock = useCallback(async () => {
    // 1. Abort any pending autosave fetch
    saveAbortRef.current?.abort();
    // 2. Wait for in-flight save to finish
    if (savePendingRef.current) {
      await savePendingRef.current.catch(() => {});
    }
    // 3. Lock autosave
    saveLockRef.current = true;
    retryDirtyRef.current = false;
    return () => { saveLockRef.current = false; };
  }, []);

  // Warn user before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stateRef.current.isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Flush pending changes on unmount (tab switch)
  useEffect(() => {
    return () => {
      saveAbortRef.current?.abort();
      if (stateRef.current.isDirty && siteId) {
        const snapshot = serializeSiteForSave(stateRef.current.site);
        fetch(`/api/sites/${siteId}/draft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [siteId]);

  // Error state — SiteProvider failed (404, auth, network)
  if (!siteLoading && siteError) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <p className="text-[13px] text-red-500 mb-2">{siteError}</p>
          <button
            onClick={() => mutate()}
            className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Loading state — still fetching from API or waiting for initialization
  if (siteLoading || !initializedRef.current) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex items-center gap-2 text-[#999]">
          <div className="w-4 h-4 border-2 border-[#999] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px]">Chargement du site...</span>
        </div>
      </div>
    );
  }

  return (
    <BuilderContext.Provider value={{ state, dispatch, saveStatus, siteId: siteId || "", acquireSaveLock }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  return useContext(BuilderContext);
}

export { defaultContent, serializeSiteForSave };
export type { BuilderAction, Breakpoint, SaveStatus };
