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
  "portfolio-grid": { columns: 3, items: [{ title: "Projet 1", imageUrl: "", category: "Design" }], categories: [], showFilter: false, showDetailLink: false, showSearch: false, source: "manual" as const },
  "services-list": { productIds: [], showPrice: true, showCategory: true, ctaMode: "product_page" as const, layout: "list" as const },
  "pack-premium": { productId: "", highlight: true, showFeatures: true, showPrice: true, ctaLabel: "Choisir ce pack" },
  testimonials: { testimonials: [{ name: "Client", role: "CEO", text: "Super travail !" }] },
  "timeline-process": { steps: [{ title: "Étape 1", description: "Description" }] },
  "faq-accordion": { items: [{ question: "Question ?", answer: "Réponse." }] },
  video: { videoUrl: "", caption: "Vidéo de présentation" },
  "full-image": { imageUrl: "", alt: "Image", overlayText: "" },
  "why-me": { title: "Pourquoi me choisir ?", reasons: [{ title: "Raison 1", description: "Description" }] },
  "centered-cta": { title: "Passez à l'action", description: "Description de l'appel à l'action", ctaLabel: "Commencer", ctaLink: "#", blockLink: { type: "none" as const } },
  "custom-form": { fields: [{ label: "Nom", type: "text", required: true }], submitLabel: "Envoyer", successMessage: "Merci ! Votre message a bien été envoyé.", saveAsLead: true },
  "calendar-booking": { title: "Réserver un créneau", description: "Choisissez un horaire", provider: "calendly" as const, embedUrl: "", ctaLabel: "Réserver", openModal: false, slots: ["Lundi 10h", "Mardi 14h"] },
  "stats-counter": { stats: [{ value: "100+", label: "Projets" }] },
  newsletter: { title: "Newsletter", description: "Restez informé", placeholder: "Votre email", buttonLabel: "S'abonner", successMessage: "Merci ! Vous etes inscrit.", saveAsLead: true, leadSource: "newsletter" as const },
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
  "contact-form": { title: "Contactez-nous", description: "Remplissez le formulaire ci-dessous.", fields: [{ label: "Nom", type: "text" as const, required: true }, { label: "Email", type: "email" as const, required: true }, { label: "Message", type: "textarea" as const, required: false }], submitLabel: "Envoyer", successMessage: "Merci ! Nous reviendrons vers vous rapidement.", saveAsLead: true },
  "blog-preview": { title: "Articles récents", posts: [{ title: "Article 1", excerpt: "Résumé de l'article...", date: "2025-03-15" }], columns: 3 },
  "video-text-split": { videoUrl: "", videoPosition: "left" as const, title: "Découvrez notre approche", description: "Description de la vidéo.", ctaLabel: "En savoir plus", blockLink: { type: "none" as const } },
  "before-after": { beforeImageUrl: "", afterImageUrl: "", beforeLabel: "Avant", afterLabel: "Après", initialPosition: 50 },
  "service-cards": { title: "Nos services", mode: "static" as const, services: [{ icon: "palette", name: "Service 1", description: "Description", features: ["Feature 1"], ctaLabel: "Commander" }], productIds: [], columns: 3, showPrice: true, ctaMode: "product_checkout" as const },
  "lead-magnet": { title: "Téléchargez notre guide", description: "Un guide complet pour lancer votre marque.", fileUrl: "", buttonLabel: "Télécharger", successMessage: "Merci ! Vérifiez votre boîte mail.", saveAsLead: true, leadSource: "lead-magnet" as const },
  "availability-banner": { status: "open" as const, message: "Actuellement disponible pour de nouveaux projets", blockLink: { type: "none" as const } },
  "product-hero-checkout": { productId: "", benefits: ["Résultat professionnel", "Livraison rapide", "Révisions incluses"], ctaLabel: "Commander", showFeatures: true, layout: "center" as const },
  "product-cards-grid": { productIds: [], columns: 3 as const, showFilter: true, ctaLabel: "Voir le détail" },
  "inline-checkout": { productId: "", layout: "detailed" as const, ctaLabel: "Commander maintenant" },
  "bundle-builder": { productIds: [], title: "Créez votre pack sur-mesure", description: "Sélectionnez les services qui vous intéressent", ctaLabel: "Commander le pack", discountPercent: 10 },
  "pricing-table-real": { productIds: [], columns: 3 as const, showFeatures: true, highlightIndex: 1, ctaLabel: "Choisir" },
  "hero-split-glow": { title: "Créez des expériences mémorables", subtitle: "Solution complète pour freelances créatifs. Design, développement et stratégie.", primaryCtaLabel: "Démarrer", primaryBlockLink: { type: "none" as const }, secondaryCtaLabel: "En savoir plus", secondaryBlockLink: { type: "none" as const }, badge: "Nouveau" },
  "hero-centered-mesh": { title: "Construisez le futur", subtitle: "Plateforme tout-en-un pour transformer vos idées en produits exceptionnels.", ctaLabel: "Commencer gratuitement", blockLink: { type: "none" as const }, badge: "Open Beta", trustLogos: [{ name: "Figma" }, { name: "Notion" }, { name: "Linear" }, { name: "Vercel" }] },
  "services-premium": { title: "Nos services", subtitle: "Tout ce dont vous avez besoin pour réussir.", services: [{ icon: "palette", title: "Design", description: "Direction artistique et identité visuelle sur mesure.", features: ["Logo & branding", "UI/UX design", "Motion design"] }, { icon: "code", title: "Développement", description: "Sites et applications performants et modernes.", features: ["Sites vitrine", "Web apps", "E-commerce"] }, { icon: "zap", title: "Stratégie", description: "Conseil et accompagnement pour booster votre croissance.", features: ["Audit", "SEO", "Growth"] }], columns: 3 },
  "portfolio-masonry": { title: "Réalisations", subtitle: "Une sélection de nos meilleurs projets.", items: [{ imageUrl: "", title: "Projet Alpha", category: "Branding", description: "Refonte complète de l'identité visuelle" }, { imageUrl: "", title: "Projet Beta", category: "Web", description: "Application SaaS moderne" }, { imageUrl: "", title: "Projet Gamma", category: "Video", description: "Showreel et motion design" }, { imageUrl: "", title: "Projet Delta", category: "Design", description: "Direction artistique premium" }], columns: 2, source: "manual" as const },
  "pricing-modern": { title: "Tarifs transparents", subtitle: "Choisissez la formule qui vous convient.", mode: "manual" as const, productIds: [], plans: [{ name: "Starter", price: "490", period: "par projet", description: "Idéal pour démarrer", features: ["1 page de vente", "Design responsive", "Livraison 7 jours", "1 révision"], isPopular: false, ctaLabel: "Choisir" }, { name: "Pro", price: "990", period: "par projet", description: "Pour les ambitieux", features: ["Jusqu'à 5 pages", "Design premium", "Livraison 5 jours", "3 révisions", "SEO optimisé"], isPopular: true, ctaLabel: "Choisir" }, { name: "Premium", price: "1 990", period: "par projet", description: "L'excellence", features: ["Pages illimitées", "Design sur-mesure", "Livraison 3 jours", "Révisions illimitées", "SEO avancé", "Support prioritaire"], isPopular: false, ctaLabel: "Choisir" }] },
  "testimonials-dark": { title: "Ce que disent nos clients", testimonials: [{ name: "Sophie Martin", role: "CEO", company: "Studio Bloom", text: "Un travail exceptionnel. Le résultat dépasse toutes nos attentes.", rating: 5 }, { name: "Thomas Durand", role: "Fondateur", company: "TechFlow", text: "Professionnel, réactif et créatif. Je recommande à 100%.", rating: 5 }, { name: "Julie Lefebvre", role: "Directrice", company: "Agence Neon", text: "La qualité de travail est remarquable. Un vrai partenaire.", rating: 5 }] },
  "cta-banner": { title: "Prêt à transformer votre vision en réalité ?", description: "Lancez votre projet dès aujourd'hui et rejoignez des centaines de clients satisfaits.", ctaLabel: "Démarrer maintenant", blockLink: { type: "none" as const }, secondaryLabel: "Prendre rendez-vous", secondaryBlockLink: { type: "none" as const } },
  "contact-premium": { title: "Parlons de votre projet", subtitle: "Remplissez le formulaire et nous revenons vers vous sous 24h.", fields: [{ label: "Nom", type: "text" as const, required: true, placeholder: "Votre nom" }, { label: "Email", type: "email" as const, required: true, placeholder: "votre@email.com" }, { label: "Téléphone", type: "phone" as const, required: false, placeholder: "+33 6 00 00 00 00" }, { label: "Message", type: "textarea" as const, required: true, placeholder: "Décrivez votre projet..." }], submitLabel: "Envoyer", successMessage: "Merci ! Nous revenons vers vous rapidement.", saveAsLead: true },
  "footer-block": { siteName: "Mon Studio", description: "Design, développement et stratégie pour freelances créatifs.", columns: [{ title: "Services", links: [{ label: "Design" }, { label: "Développement" }, { label: "Stratégie" }] }, { title: "Ressources", links: [{ label: "Blog" }, { label: "Portfolio" }, { label: "FAQ" }] }, { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }, { label: "Confidentialité" }] }], copyright: "Tous droits réservés.", showSocials: true, socials: { instagram: "#", twitter: "#", linkedin: "#" } },
  "video-showcase": { title: "Showreel 2025", subtitle: "Découvrez notre univers créatif en 60 secondes.", videoUrl: "", stats: [{ value: "200+", label: "Projets" }, { value: "50+", label: "Clients" }, { value: "98%", label: "Satisfaction" }], ctaLabel: "Voir nos réalisations", blockLink: { type: "none" as const } },
  "tech-stack": { title: "Notre stack technique", subtitle: "Les technologies que nous maîtrisons.", categories: [{ name: "Frontend", items: [{ name: "React" }, { name: "Next.js" }, { name: "TypeScript" }, { name: "Tailwind" }] }, { name: "Backend", items: [{ name: "Node.js" }, { name: "PostgreSQL" }, { name: "Supabase" }, { name: "Stripe" }] }, { name: "Outils", items: [{ name: "Figma" }, { name: "GitHub" }, { name: "Vercel" }, { name: "Linear" }] }] },
  "before-after-pro": { title: "Avant / Après", subtitle: "La différence est dans les détails.", items: [{ beforeImageUrl: "", afterImageUrl: "", label: "Refonte site web" }, { beforeImageUrl: "", afterImageUrl: "", label: "Identité visuelle" }], layout: "side-by-side" as const },
  // ─── 50 new blocks ───
  "hero-split-portfolio": { badge: "Disponible", title: "Je crée des identités visuelles qui marquent les esprits", subtitle: "Directeur artistique freelance spécialisé en branding, motion design et direction créative pour les marques ambitieuses.", ctaLabel: "Voir mon portfolio", secondaryCtaLabel: "Demander un devis", stats: [{ value: "120+", label: "Projets livrés" }, { value: "8 ans", label: "Expérience" }, { value: "98%", label: "Satisfaction" }] },
  "hero-minimal-service": { trustBadge: "Plus de 200 clients satisfaits", title: "Des sites web qui convertissent vos visiteurs en clients", subtitle: "Design premium, développement rapide et stratégie de conversion pour freelances et PME ambitieuses.", ctaLabel: "Demander un devis", secondaryCtaLabel: "Voir nos réalisations", proofItems: [{ icon: "zap", text: "Livraison en 7 jours" }, { icon: "shield", text: "Qualité premium garantie" }, { icon: "refresh", text: "Révisions illimitées" }] },
  "hero-dark-saas": { title: "Automatisez votre business en une seule plateforme", subtitle: "Gestion de projet, facturation, CRM et analytics réunis dans un outil élégant et puissant, conçu pour les équipes modernes.", ctaLabel: "Essayer gratuitement", secondaryCtaLabel: "Voir la démo", features: [{ title: "Tableaux de bord", description: "Visualisez vos métriques en temps réel" }, { title: "Automatisations", description: "Gagnez 10h par semaine" }, { title: "Integrations", description: "Connecté à vos outils favoris" }] },
  "hero-creator-brand": { title: "Sarah Morel", subtitle: "Coach business et stratège digitale. J'accompagne les entrepreneurs créatifs à structurer leur offre et multiplier leurs revenus.", credentials: ["Certifiée ICF", "500+ clients accompagnés", "Auteure bestseller"], ctaLabel: "Réserver un appel", secondaryCtaLabel: "Découvrir mes services", socialProof: [{ value: "45K", label: "Abonnés" }, { value: "500+", label: "Clients" }, { value: "4.9/5", label: "Note moyenne" }] },
  "hero-video-showreel": { title: "Showreel 2025", subtitle: "Montage vidéo haut de gamme pour créateurs et marques premium. Du concept à la post-production.", ctaLabel: "Me contacter", tags: ["Montage", "Motion Design", "Color Grading", "Post-Production", "Sound Design"] },
  "projects-grid-cases": { title: "Projets récents", subtitle: "Une sélection de nos dernières réalisations.", projects: [{ title: "Rebrand Luxe Maison", category: "Branding", result: "+340% de notoriété en 6 mois" }, { title: "App Mobile FitTrack", category: "UI/UX Design", result: "4.8/5 sur l'App Store" }, { title: "Campagne Video NovaTech", category: "Video", result: "2.5M de vues en 30 jours" }, { title: "Refonte E-commerce Bloom", category: "Web Design", result: "+180% de taux de conversion" }] },
  "projects-horizontal": { title: "Réalisations", subtitle: "Parcourez nos projets les plus récents.", projects: [{ title: "Brand Identity — Aura Studio", category: "Branding" }, { title: "Landing Page — CryptoVault", category: "Web Design" }, { title: "Motion Reel — Pixel Lab", category: "Video" }, { title: "E-commerce — La Maison Dorée", category: "Dev" }, { title: "Dashboard UI — FinFlow", category: "UI/UX" }], ctaLabel: "Voir tous les projets" },
  "project-before-after": { title: "Transformations", subtitle: "Découvrez l'impact réel de nos interventions", items: [{ beforeLabel: "Ancien site vitrine", afterLabel: "Nouvelle landing premium", beforeImageUrl: "", afterImageUrl: "", resultText: "+250% de leads", metricBadge: "+250%", description: "Refonte complète avec stratégie de conversion et design premium.", category: "Web" }, { beforeLabel: "Logo générique", afterLabel: "Identité sur-mesure", beforeImageUrl: "", afterImageUrl: "", resultText: "Reconnaissance x3", metricBadge: "x3", description: "Création d'une identité visuelle forte et mémorable.", category: "Branding" }, { beforeLabel: "Thumbnails basiques", afterLabel: "Thumbnails optimisées", beforeImageUrl: "", afterImageUrl: "", resultText: "+180% de CTR", metricBadge: "+180%", description: "Optimisation visuelle pour maximiser les clics sur YouTube.", category: "Video" }] },
  "project-timeline": { title: "Étude de cas : Refonte Aura Studio", subtitle: "Comment nous avons transformé la présence digitale d'un studio créatif en 6 semaines.", steps: [{ title: "Découverte", description: "Audit complet de la marque, analyse concurrentielle et définition des objectifs.", tag: "Semaine 1" }, { title: "Stratégie", description: "Positionnement, architecture d'information et wireframes validés.", tag: "Semaine 2" }, { title: "Design", description: "Direction artistique, maquettes haute fidélité et prototypage interactif.", tag: "Semaine 3-4" }, { title: "Développement", description: "Intégration pixel-perfect, optimisation performance et tests cross-device.", tag: "Semaine 5" }, { title: "Livraison", description: "Déploiement, formation client et suivi post-lancement.", tag: "Semaine 6" }], resultSummary: "Résultat : +340% de trafic organique et +180% de leads qualifiés en 3 mois." },
  "project-masonry-wall": { title: "Portfolio", items: [{ title: "Identité Aura", category: "Branding" }, { title: "App FinTrack", category: "UI/UX" }, { title: "Reel NovaTech", category: "Video" }, { title: "Site Bloom", category: "Web" }, { title: "Campagne Zenith", category: "Marketing" }, { title: "Packaging Maison", category: "Print" }], columns: 3, source: "manual" as const },
  "services-3card-premium": { title: "Nos services", subtitle: "Des prestations sur-mesure pour propulser votre marque.", services: [{ title: "Montage Vidéo", description: "Montage professionnel pour YouTube, réseaux sociaux et campagnes publicitaires.", features: ["Montage dynamique", "Color grading cinéma", "Sound design", "Sous-titres"], ctaLabel: "En savoir plus" }, { title: "Miniatures YouTube", description: "Des thumbnails qui captent l'attention et maximisent votre taux de clic.", features: ["Design sur-mesure", "A/B testing", "Optimisation CTR", "Livraison 24h"], ctaLabel: "Commander" }, { title: "Motion Design", description: "Animations et graphismes animés pour donner vie à votre marque.", features: ["Intros/Outros", "Infographies animées", "Logos animés", "Transitions"], ctaLabel: "Découvrir" }] },
  "services-icon-grid": { title: "Ce que nous proposons", subtitle: "Un écosystème complet de services pour votre croissance.", services: [{ icon: "palette", title: "Direction Artistique", description: "Identité visuelle et charte graphique sur-mesure." }, { icon: "code", title: "Développement Web", description: "Sites performants et applications modernes." }, { icon: "video", title: "Production Vidéo", description: "Contenu vidéo professionnel et engageant." }, { icon: "megaphone", title: "Stratégie Digitale", description: "SEO, ads et content marketing." }, { icon: "camera", title: "Photographie", description: "Shootings produit et corporate." }, { icon: "pen", title: "Rédaction", description: "Copywriting et content strategy." }] },
  "services-split-value": { title: "Pourquoi travailler avec nous", subtitle: "Une approche premium, des résultats concrets.", description: "Nous ne sommes pas une agence de plus. Notre méthode combine stratégie, design et technologie pour créer des experiences digitales qui convertissent.", pillars: [{ title: "Stratégie d'abord", description: "Chaque projet commence par une réflexion stratégique approfondie." }, { title: "Design premium", description: "Pas de templates. Tout est crée sur-mesure pour votre marque." }, { title: "Résultats mesurables", description: "Chaque décision est guidée par la donnée et la performance." }, { title: "Accompagnement continu", description: "Un suivi post-projet pour optimiser vos résultats." }] },
  "services-process-offers": { title: "Nos prestations", offers: [{ title: "Site Vitrine Premium", description: "Un site à votre image qui convertit vos visiteurs.", steps: ["Brief & découverte", "Maquettes & validation", "Développement & tests", "Mise en ligne & formation"] }, { title: "Identité de Marque", description: "Une identité visuelle forte et cohérente.", steps: ["Audit & recherche", "Concepts créatifs", "Déclinaisons & charte", "Livraison & guidelines"] }, { title: "Stratégie Digitale", description: "Un plan d'action pour booster votre visibilité.", steps: ["Analyse du marché", "Plan d'action SEO/Ads", "Mise en œuvre", "Suivi & optimisation"] }] },
  "product-featured-card": { title: "Pack Branding Complet", description: "Tout ce dont vous avez besoin pour lancer votre marque avec une identité visuelle professionnelle et cohérente.", price: "1 490 EUR", benefits: ["Logo principal + variations", "Charte graphique complète", "Templates réseaux sociaux", "Guide de marque PDF", "Fichiers sources inclus"], ctaLabel: "Commander maintenant", trustNote: "Satisfait ou remboursé sous 14 jours." },
  "products-3card-shop": { title: "Nos packs", subtitle: "Des solutions clés en main pour chaque besoin.", products: [{ title: "Pack Templates Canva", price: "49 EUR", description: "30 templates premium pour vos réseaux sociaux.", ctaLabel: "Acheter" }, { title: "Pack Presets Photo", price: "79 EUR", description: "12 presets Lightroom pour un feed Instagram cohérent.", ctaLabel: "Acheter" }, { title: "Pack Formation Video", price: "197 EUR", description: "Formation complète : du tournage au montage pro.", ctaLabel: "Acheter" }] },
  "product-bundle-compare": { title: "Choisissez votre formule", subtitle: "Trois niveaux pour s'adapter à votre ambition.", bundles: [{ name: "Essentiel", price: "490 EUR", description: "L'essentiel pour démarrer.", features: ["1 page de vente", "Design responsive", "Livraison 10 jours", "1 révision"], ctaLabel: "Choisir" }, { name: "Professionnel", price: "990 EUR", description: "La formule la plus populaire.", features: ["Jusqu'à 5 pages", "Design premium", "Livraison 7 jours", "3 révisions", "SEO de base"], isPopular: true, ctaLabel: "Choisir" }, { name: "Sur-mesure", price: "2 490 EUR", description: "L'excellence sans compromis.", features: ["Pages illimitées", "Design sur-mesure", "Livraison 5 jours", "Révisions illimitées", "SEO avancé", "Support 6 mois"], ctaLabel: "Choisir" }] },
  "product-benefits-mockup": { title: "Guide : Lancer sa marque en 30 jours", subtitle: "Le guide étape par étape utilise par +500 entrepreneurs pour construire une marque mémorable.", benefits: ["Méthode éprouvée en 7 étapes", "Templates et checklists inclus", "Exemples reels de marques a succès", "Bonus : 30 prompts IA pour votre branding"], ctaLabel: "Télécharger le guide", imageUrl: "" },
  "pricing-3tier-saas": { title: "Tarifs simples et transparents", subtitle: "Pas de frais cachés. Changez de formule à tout moment.", plans: [{ name: "Starter", price: "19 EUR", period: "/ mois", description: "Pour les indépendants.", features: ["5 projets", "1 Go stockage", "Support email", "Templates de base"], ctaLabel: "Commencer" }, { name: "Pro", price: "49 EUR", period: "/ mois", description: "Pour les équipes en croissance.", features: ["Projets illimités", "50 Go stockage", "Support prioritaire", "Templates premium", "Analytics avancés", "API access"], isPopular: true, ctaLabel: "Essayer 14 jours" }, { name: "Business", price: "99 EUR", period: "/ mois", description: "Pour les entreprises.", features: ["Tout du plan Pro", "Stockage illimité", "Support dédié", "SSO & SAML", "SLA garanti", "Formation incluse", "Manager de compte"], ctaLabel: "Contacter" }] },
  "pricing-custom-quote": { title: "Un projet sur-mesure ?", subtitle: "Chaque projet est unique. Discutons de vos besoins pour construire la solution idéale.", features: ["Audit et stratégie personnalisés", "Design et développement sur-mesure", "Accompagnement de A a Z", "Suivi post-lancement inclus", "Engagement qualité garantie"], ctaLabel: "Demander un devis gratuit", note: "Réponse sous 24h ouvrées. Sans engagement." },
  "pricing-mini-faq": { title: "Nos formules", plans: [{ name: "Starter", price: "490 EUR", features: ["1 page", "Design responsive", "1 révision"], ctaLabel: "Choisir" }, { name: "Pro", price: "990 EUR", features: ["5 pages", "Design premium", "3 révisions", "SEO"], ctaLabel: "Choisir" }, { name: "Premium", price: "1 990 EUR", features: ["Illimité", "Sur-mesure", "Illimitées", "SEO+Support"], ctaLabel: "Choisir" }], faq: [{ question: "Quels sont les délais de livraison ?", answer: "Entre 5 et 15 jours selon la formule choisie." }, { question: "Proposez-vous des facilités de paiement ?", answer: "Oui, paiement en 2 ou 3 fois sans frais." }, { question: "Que comprend le support post-lancement ?", answer: "Corrections, ajustements et conseil pendant 30 jours." }, { question: "Puis-je changer de formule en cours de route ?", answer: "Absolument, nous nous adaptons à l'évolution de votre projet." }] },
  "testimonials-3dark": { title: "Ils nous ont fait confiance", testimonials: [{ name: "Marie Laurent", role: "Fondatrice", company: "Studio Bloom", text: "Un travail exceptionnel du début à la fin. Le résultat dépasse toutes mes attentes. Je recommande les yeux fermés.", rating: 5 }, { name: "Alexandre Chen", role: "CEO", company: "TechVault", text: "Professionnalisme, créativité et réactivité. Trois mots qui résument parfaitement cette collaboration.", rating: 5 }, { name: "Camille Dubois", role: "Directrice Marketing", company: "Neon Agency", text: "Depuis notre collaboration, notre taux de conversion a augmenté de 240%. Un vrai game-changer.", rating: 5 }] },
  "testimonials-video": { title: "Témoignages clients", subtitle: "Découvrez les retours de nos clients en vidéo.", testimonials: [{ name: "Jean-Marc Petit", company: "Agence Horizon", quote: "Grâce à leur expertise, nous avons triplé notre chiffre d'affaires en un an." }, { name: "Sarah Benali", company: "Studio Éclat", quote: "Le meilleur investissement que j'ai fait pour ma marque." }, { name: "Thomas Rivière", company: "FinTech Pro", quote: "Un accompagnement premium du début à la fin." }] },
  "results-logos-quotes": { title: "Ils nous font confiance", logos: [{ name: "Notion" }, { name: "Figma" }, { name: "Linear" }, { name: "Vercel" }, { name: "Stripe" }, { name: "Supabase" }], quotes: [{ text: "Un partenaire stratégique incontournable pour notre croissance digitale.", name: "Pierre Moreau", role: "CEO, TechFlow" }, { text: "La qualité d'exécution et la vision stratégique sont remarquables.", name: "Sophie Laurent", role: "CMO, Bloom Studio" }] },
  "numbers-impact": { title: "Nos résultats parlent d'eux-mêmes", subtitle: "Des chiffres concrets, pas des promesses.", stats: [{ value: "12M+", label: "Vues générées", context: "pour nos clients" }, { value: "350+", label: "Projets livrés", context: "depuis 2019" }, { value: "< 24h", label: "Temps de réponse", context: "en moyenne" }, { value: "98%", label: "Taux de satisfaction", context: "sur 5 ans" }, { value: "8 ans", label: "Expérience", context: "dans le digital" }] },
  "results-timeline": { title: "L'impact de notre collaboration", subtitle: "Résultats typiques de nos clients dans les 90 premiers jours.", milestones: [{ label: "Jour 1", value: "Lancement", description: "Mise en ligne du nouveau site et des assets de marque." }, { label: "30 jours", value: "+120%", description: "Augmentation du trafic organique grâce au SEO." }, { label: "60 jours", value: "+85%", description: "Hausse du taux de conversion sur les pages clés." }, { label: "90 jours", value: "x3", description: "Triplement du nombre de leads qualifiés." }] },
  "about-personal-story": { title: "Mon parcours", story: "Après 8 ans en agence à Paris et Londres, j'ai décidé de me lancer en indépendant pour offrir à mes clients un accompagnement plus personnel et plus stratégique. Aujourd'hui, j'aide les entrepreneurs et les marques ambitieuses à construire une présence digitale qui reflète leur excellence.", highlights: ["Direction artistique pour Publicis et BBDO", "Plus de 200 projets livrés", "Expertise en branding et web design", "Approche centree résultats"], mission: "Ma mission : transformer votre vision en une expérience digitale mémorable.", imageUrl: "" },
  "about-studio-values": { title: "Nos valeurs", subtitle: "Ce qui guide chacune de nos décisions.", values: [{ title: "Excellence", description: "Nous ne livrons rien qui ne soit à la hauteur de nos standards.", icon: "star" }, { title: "Réactivité", description: "Réponse sous 24h, livraison dans les délais, toujours.", icon: "zap" }, { title: "Stratégie", description: "Le design sans stratégie, c'est de l'art. Nous faisons du business.", icon: "target" }, { title: "Transparence", description: "Communication claire, prix fixes, pas de surprises.", icon: "eye" }], teamNote: "Une équipe de 4 experts passionnés au service de votre marque." },
  "team-mini-grid": { title: "L'équipe", subtitle: "Des experts passionnés à votre service.", members: [{ name: "Thomas Morel", role: "Fondateur & DA", bio: "8 ans d'expérience en direction artistique et branding." }, { name: "Lea Martin", role: "Développeuse Senior", bio: "Experte React, Next.js et architectures modernes." }, { name: "Hugo Petit", role: "Motion Designer", bio: "Spécialiste After Effects et animations web." }, { name: "Camille Roy", role: "Stratégiste Digital", bio: "SEO, growth et conversion pour marques ambitieuses." }] },
  "process-4steps": { title: "Comment ça marche", subtitle: "Un processus simple et efficace en 4 étapes.", steps: [{ title: "Découverte", description: "On échange sur vos besoins, objectifs et vision.", icon: "search" }, { title: "Proposition", description: "Vous recevez un devis détaillé et un calendrier clair.", icon: "file" }, { title: "Production", description: "On crée, vous validez. Révisions incluses.", icon: "pen" }, { title: "Livraison", description: "Livraison des fichiers, formation et suivi.", icon: "check" }] },
  "process-detailed-timeline": { title: "Notre méthode de travail", subtitle: "Un processus éprouvé pour des résultats previsibles.", steps: [{ title: "Kick-off & Brief", description: "Réunion de lancement pour aligner la vision, les objectifs et les contraintes du projet.", tag: "Jour 1", details: "Appel vidéo de 60 min avec questionnaire préalable." }, { title: "Recherche & Stratégie", description: "Analyse du marché, benchmark concurrentiel et définition du positionnement.", tag: "Semaine 1", details: "Livrable : document stratégique + moodboard." }, { title: "Design & Prototypage", description: "Création des maquettes haute fidélité et prototypage interactif.", tag: "Semaine 2-3", details: "2 tours de révision inclus." }, { title: "Développement", description: "Intégration pixel-perfect, optimisation et tests de performance.", tag: "Semaine 4", details: "Preview en temps réel accessible." }, { title: "Lancement & Suivi", description: "Mise en production, formation et accompagnement post-lancement.", tag: "Semaine 5", details: "Support 30 jours inclus." }] },
  "faq-accordion-full": { title: "Questions fréquentes", subtitle: "Tout ce que vous devez savoir avant de commencer.", items: [{ question: "Quels sont vos délais de livraison ?", answer: "Nos délais varient de 5 à 15 jours ouvrables selon la complexité du projet. Chaque devis inclut un calendrier précis." }, { question: "Combien de révisions sont incluses ?", answer: "Selon la formule choisie, entre 1 et un nombre illimité de révisions. Nous ne livrons rien tant que vous n'êtes pas satisfait." }, { question: "Quels modes de paiement acceptez-vous ?", answer: "Carte bancaire, virement et PayPal. Paiement en 2 ou 3 fois possible sur les projets de plus de 500 EUR." }, { question: "Proposez-vous un suivi après livraison ?", answer: "Oui, chaque projet inclut 30 jours de support post-livraison pour ajustements et questions." }, { question: "Comment se déroule la communication ?", answer: "Principalement par email et visio. Vous avez un interlocuteur dédié tout au long du projet." }, { question: "Puis-je voir des exemples de projets similaires ?", answer: "Absolument ! Consultez notre portfolio ou demandez des références spécifiques à votre secteur." }, { question: "Que se passe-t-il si je ne suis pas satisfait ?", answer: "Nous travaillons jusqu'à votre satisfaction. En cas de désaccord majeur, nous proposons un remboursement partiel." }] },
  "faq-2column": { title: "FAQ", subtitle: "Les réponses a vos questions.", items: [{ question: "Quel est le prix d'un site web ?", answer: "À partir de 490 EUR pour un site vitrine. Chaque projet est chiffré sur devis." }, { question: "Travaillez-vous à distance ?", answer: "Oui, 100% de nos projets sont gérés à distance avec des outils collaboratifs." }, { question: "Fournissez-vous l'hébergement ?", answer: "Nous recommandons et configurons l'hébergement adapté à votre projet." }, { question: "Puis-je modifier le site moi-meme ?", answer: "Oui, nous livrons avec un CMS intuitif et une formation complète." }, { question: "Proposez-vous la maintenance ?", answer: "Oui, nous proposons des forfaits de maintenance mensuelle." }, { question: "Quel est le processus de commande ?", answer: "Prise de contact, devis, acompte 50%, production, livraison, solde." }, { question: "Les fichiers sources sont-ils fournis ?", answer: "Oui, tous les fichiers sources vous appartiennent." }, { question: "Faites-vous du SEO ?", answer: "Oui, chaque site est optimisé pour le référencement naturel." }] },
  "cta-centered-strong": { title: "Prêt à donner vie à votre projet ?", subtitle: "Discutons de votre vision et construisons quelque chose d'exceptionnel ensemble.", ctaLabel: "Demander un devis gratuit", secondaryCtaLabel: "Voir le portfolio" },
  "cta-split-text": { title: "Transformez votre présence digitale", description: "Rejoignez les centaines d'entrepreneurs qui ont choisi de passer au niveau supérieur avec un site qui convertit.", ctaLabel: "Démarrer maintenant", secondaryCtaLabel: "Prendre rendez-vous" },
  "cta-dark-glow": { title: "Ne laissez pas votre concurrence prendre de l'avance", subtitle: "Chaque jour sans site premium est un jour de revenus perdus. Lancez votre projet aujourd'hui.", ctaLabel: "Commencer maintenant", trustBadges: ["Satisfait ou remboursé", "Livraison garantie", "Support premium"] },
  "form-contact-simple": { title: "Contactez-nous", subtitle: "Une question ou un projet ? Écrivez-nous et nous répondons sous 24h.", fields: [{ label: "Nom", type: "text", placeholder: "Votre nom complet", required: true }, { label: "Email", type: "email", placeholder: "votre@email.com", required: true }, { label: "Message", type: "textarea", placeholder: "Décrivez votre projet ou votre question...", required: true }], submitLabel: "Envoyer le message", trustNote: "Nous ne partageons jamais vos données.", successMessage: "Merci ! Nous revenons vers vous sous 24h.", saveAsLead: true },
  "form-quote-request": { title: "Demander un devis", subtitle: "Remplissez ce formulaire et recevez une proposition sous 48h.", fields: [{ label: "Nom", type: "text", placeholder: "Votre nom", required: true }, { label: "Email", type: "email", placeholder: "votre@email.com", required: true }, { label: "Type de projet", type: "select", required: true, options: ["Site vitrine", "E-commerce", "Application web", "Branding", "Video", "Autre"] }, { label: "Budget estimé", type: "select", required: false, options: ["< 500 EUR", "500 - 1 000 EUR", "1 000 - 3 000 EUR", "3 000 - 5 000 EUR", "> 5 000 EUR"] }, { label: "Délai souhaité", type: "select", required: false, options: ["< 1 semaine", "2-3 semaines", "1 mois", "Pas de rush"] }, { label: "Description du projet", type: "textarea", placeholder: "Décrivez votre projet, vos objectifs et vos attentes...", required: true }], submitLabel: "Envoyer ma demande", sideText: "Réponse garantie sous 48h. Sans engagement.", successMessage: "Merci ! Votre demande de devis a été envoyée.", saveAsLead: true, leadSource: "quote-request" as const, leadTags: ["devis"] },
  "form-newsletter-lead": { title: "Recevez nos meilleurs conseils", subtitle: "Chaque semaine, des tips actionables sur le branding, le web et la stratégie digitale. Rejoignez +2 000 abonnes.", placeholder: "Votre adresse email", ctaLabel: "S'inscrire gratuitement", privacyNote: "Pas de spam. Désabonnement en un clic.", successMessage: "Merci ! Vous êtes inscrit à notre newsletter.", saveAsLead: true, leadSource: "newsletter" as const },
  "media-featured-video": { title: "Découvrez notre univers", subtitle: "Un aperçu de notre travail et de notre approche.", videoUrl: "", secondaryVideos: [{ title: "Behind the scenes" }, { title: "Interview client" }, { title: "Process créatif" }] },
  "gallery-3up-strip": { title: "En images", items: [{ caption: "Direction artistique" }, { caption: "Shooting studio" }, { caption: "Post-production" }] },
  "gallery-stacked-storyboard": { title: "L'histoire du projet", items: [{ title: "Le brief", description: "Le client souhaitait une identité visuelle moderne et impactante pour son lancement." }, { title: "La recherche", description: "Exploration de références, moodboards et concepts créatifs pour définir la direction." }, { title: "Le résultat", description: "Une marque forte et cohérente qui se démarque immédiatement de la concurrence." }] },
  "content-feature-article": { title: "Comment créer une identité de marque mémorable en 2025", excerpt: "Découvrez les 7 étapes essentielles pour construire une marque qui marque les esprits, de la stratégie a la création visuelle.", ctaLabel: "Lire l'article", category: "Branding", date: "12 Mars 2025" },
  "content-3articles": { title: "Ressources & Articles", subtitle: "Des guides pratiques pour entrepreneurs et créatifs.", articles: [{ title: "5 erreurs qui tuent votre taux de conversion", excerpt: "Les pièges les plus courants des sites vitrine et comment les éviter pour convertir plus.", category: "Conversion", date: "8 Mars 2025" }, { title: "Guide : Choisir les bonnes couleurs pour votre marque", excerpt: "La psychologie des couleurs appliquée au branding : comment faire les bons choix.", category: "Design", date: "2 Mars 2025" }, { title: "SEO en 2025 : les stratégies qui fonctionnent vraiment", excerpt: "Oubliez le keyword stuffing. Voici ce qui marche concrètement pour ranker.", category: "SEO", date: "25 Février 2025" }] },
  "content-comparison-why": { title: "Pourquoi nous choisir ?", subtitle: "La différence entre un prestataire classique et notre approche.", leftColumn: { title: "Prestataire classique", items: ["Templates génériques", "Communication sporadique", "Livraison sans suivi", "Approche technique uniquement", "Devis opaques"] }, rightColumn: { title: "Notre approche", items: ["Design 100% sur-mesure", "Interlocuteur dédié", "Suivi post-lancement 30j", "Stratégie + design + tech", "Prix fixes et transparents"] } },
  "trust-badges": { title: "Nos engagements", badges: [{ icon: "shield", title: "Paiement sécurisé", description: "Transactions chiffrées et sécurisées par Stripe." }, { icon: "refresh", title: "Satisfait ou remboursé", description: "14 jours pour changer d'avis, sans condition." }, { icon: "zap", title: "Livraison rapide", description: "Respect des délais garanti sur chaque projet." }, { icon: "headphones", title: "Support réactif", description: "Réponse sous 24h maximum, 7j/7." }, { icon: "check", title: "Révisions incluses", description: "On travaille jusqu'à votre entière satisfaction." }] },
  "social-proof-marquee": { items: [{ text: "Résultat incroyable, je recommande à 100% !", name: "Marie L.", result: "+250% de leads" }, { text: "Professionnel, créatif et toujours à l'écoute.", name: "Thomas D.", result: "Livraison en 5 jours" }, { text: "Le meilleur investissement pour ma marque.", name: "Sarah B.", result: "x3 en CA" }, { text: "Un niveau de qualité rarement vu.", name: "Pierre M.", result: "4.9/5 de satisfaction" }, { text: "Mon site convertit enfin comme il devrait.", name: "Julie F.", result: "+180% de conversion" }, { text: "Communication parfaite du début à la fin.", name: "Alexandre C.", result: "Projet livré en avance" }] },
  "footer-simple-premium": { siteName: "Mon Studio", links: [{ label: "Services" }, { label: "Portfolio" }, { label: "Contact" }, { label: "Blog" }], copyright: "2025 Mon Studio. Tous droits réservés.", showSocials: true, socials: { instagram: "#", twitter: "#", linkedin: "#" } },
  "footer-multi-column": { siteName: "Mon Studio", description: "Design, développement et stratégie digitale pour marques ambitieuses.", columns: [{ title: "Services", links: [{ label: "Web Design" }, { label: "Branding" }, { label: "Développement" }, { label: "Stratégie SEO" }] }, { title: "Ressources", links: [{ label: "Blog" }, { label: "Portfolio" }, { label: "FAQ" }, { label: "Guides gratuits" }] }, { title: "Legal", links: [{ label: "Mentions légales" }, { label: "CGV" }, { label: "Politique de confidentialité" }, { label: "Cookies" }] }], copyright: "2025 Mon Studio. Tous droits réservés.", contact: { email: "hello@monstudio.fr", phone: "+33 6 12 34 56 78" }, showSocials: true, socials: { instagram: "#", twitter: "#", linkedin: "#", youtube: "#" } },
  "signature-creative-closing": { title: "Construisons quelque chose d'exceptionnel ensemble", subtitle: "Chaque grand projet commence par une conversation. La vôtre commence ici.", ctaLabel: "Lancer votre projet", signatureNote: "Conçu avec passion et précision." },
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
        }).catch((err) => { console.error("[Builder] Unmount save failed:", err); });
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
