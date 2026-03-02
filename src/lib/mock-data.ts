import type {
  Order,
  Client,
  Product,
  Invoice,
  Subscription,
  Activity,
  Lead,
  AnalyticsEvent,
} from "@/types";

export const orders: Order[] = [
  { id: "CMD-001", client: "Marie Dupont", clientEmail: "marie@studio.fr", product: "Logo redesign", price: 450, status: "in_progress", date: "2025-03-15" },
  { id: "CMD-002", client: "Lucas Martin", clientEmail: "lucas@agency.com", product: "Motion intro YouTube", price: 280, status: "delivered", date: "2025-03-14" },
  { id: "CMD-003", client: "Sophie Bernard", clientEmail: "sophie@freelance.fr", product: "Pack réseaux sociaux", price: 150, status: "pending", date: "2025-03-13" },
  { id: "CMD-004", client: "Thomas Petit", clientEmail: "thomas@startup.io", product: "Montage podcast #12", price: 120, status: "delivered", date: "2025-03-12" },
  { id: "CMD-005", client: "Emma Leroy", clientEmail: "emma@brand.co", product: "Identité visuelle", price: 890, status: "in_progress", date: "2025-03-11" },
  { id: "CMD-006", client: "Hugo Moreau", clientEmail: "hugo@media.fr", product: "Thumbnail YouTube x10", price: 200, status: "pending", date: "2025-03-10" },
  { id: "CMD-007", client: "Léa Fournier", clientEmail: "lea@design.com", product: "Template Notion", price: 49, status: "cancelled", date: "2025-03-09" },
  { id: "CMD-008", client: "Marie Dupont", clientEmail: "marie@studio.fr", product: "Charte graphique", price: 680, status: "delivered", date: "2025-03-08" },
];

export const clients: Client[] = [
  { id: "CLI-001", name: "Marie Dupont", email: "marie@studio.fr", totalRevenue: 2340, ordersCount: 5, lastOrder: "2025-03-15", avatar: "MD" },
  { id: "CLI-002", name: "Lucas Martin", email: "lucas@agency.com", totalRevenue: 1680, ordersCount: 3, lastOrder: "2025-03-14", avatar: "LM" },
  { id: "CLI-003", name: "Sophie Bernard", email: "sophie@freelance.fr", totalRevenue: 890, ordersCount: 2, lastOrder: "2025-03-13", avatar: "SB" },
  { id: "CLI-004", name: "Thomas Petit", email: "thomas@startup.io", totalRevenue: 1240, ordersCount: 4, lastOrder: "2025-03-12", avatar: "TP" },
  { id: "CLI-005", name: "Emma Leroy", email: "emma@brand.co", totalRevenue: 2890, ordersCount: 6, lastOrder: "2025-03-11", avatar: "EL" },
  { id: "CLI-006", name: "Hugo Moreau", email: "hugo@media.fr", totalRevenue: 600, ordersCount: 2, lastOrder: "2025-03-10", avatar: "HM" },
];

export const products: Product[] = [
  {
    id: "PRD-001", name: "Logo redesign", price: 450, active: true, sales: 12, category: "Design",
    type: "service", slug: "logo-redesign", shortDescription: "Refonte complète de votre logo avec 3 propositions et révisions illimitées.",
    features: ["3 propositions créatives", "Révisions illimitées", "Fichiers sources (AI, SVG, PNG)", "Déclinaisons couleur"],
    deliveryTimeDays: 7, featured: true,
  },
  {
    id: "PRD-002", name: "Motion intro YouTube", price: 280, active: true, sales: 8, category: "Motion",
    type: "service", slug: "motion-intro-youtube", shortDescription: "Animation d'intro professionnelle pour votre chaîne YouTube (5-15s).",
    features: ["Animation sur-mesure", "Musique libre de droits", "Format optimisé YouTube", "1 révision incluse"],
    deliveryTimeDays: 5,
  },
  {
    id: "PRD-003", name: "Pack réseaux sociaux", price: 150, active: true, sales: 23, category: "Design",
    type: "service", slug: "pack-reseaux-sociaux", shortDescription: "10 templates personnalisés pour vos réseaux sociaux (Instagram, LinkedIn, TikTok).",
    features: ["10 templates Canva/Figma", "Charte graphique respectée", "Stories + Posts + Carrousels", "Guide d'utilisation"],
    deliveryTimeDays: 5,
  },
  {
    id: "PRD-004", name: "Montage podcast", price: 120, active: true, sales: 15, category: "Montage",
    type: "service", slug: "montage-podcast", shortDescription: "Montage audio professionnel de votre épisode de podcast avec nettoyage et mastering.",
    features: ["Nettoyage audio", "Suppression des blancs", "Ajout intro/outro", "Export multi-format"],
    deliveryTimeDays: 3,
  },
  {
    id: "PRD-005", name: "Identité visuelle", price: 890, active: true, sales: 4, category: "Design",
    type: "pack", slug: "identite-visuelle", shortDescription: "Pack complet : logo, charte graphique, templates et guide de marque.", featured: true,
    longDescription: "L'offre tout-en-un pour lancer ou refondre votre marque. Inclut le logo, la charte graphique complète, les templates réseaux sociaux, et un guide d'utilisation détaillé.",
    features: ["Logo + déclinaisons", "Charte graphique complète", "Templates réseaux sociaux", "Motion intro 15s", "Guide d'utilisation", "Support 30 jours"],
    deliveryTimeDays: 21,
  },
  {
    id: "PRD-006", name: "Thumbnail YouTube x10", price: 200, active: true, sales: 31, category: "Design",
    type: "service", slug: "thumbnail-youtube-x10", shortDescription: "Lot de 10 thumbnails YouTube optimisées pour le CTR.",
    features: ["10 visuels sur-mesure", "Tests A/B inclus", "Optimisation CTR", "Livraison sous 48h"],
    deliveryTimeDays: 2,
  },
  {
    id: "PRD-007", name: "Template Notion", price: 49, active: true, sales: 67, category: "Digital",
    type: "digital", slug: "template-notion", shortDescription: "Template Notion tout-en-un pour gérer votre activité freelance.",
    features: ["Dashboard activité", "Suivi clients & projets", "Facturation intégrée", "Tutoriel vidéo inclus"],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByIds(ids: string[]): Product[] {
  return ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => p !== undefined);
}

export const invoices: Invoice[] = [
  { id: "FAC-001", number: "FAC-2025-047", client: "Marie Dupont", amount: 450, status: "paid", date: "2025-03-15" },
  { id: "FAC-002", number: "FAC-2025-046", client: "Lucas Martin", amount: 280, status: "paid", date: "2025-03-14" },
  { id: "FAC-003", number: "FAC-2025-045", client: "Sophie Bernard", amount: 150, status: "pending", date: "2025-03-13" },
  { id: "FAC-004", number: "FAC-2025-044", client: "Thomas Petit", amount: 120, status: "paid", date: "2025-03-12" },
  { id: "FAC-005", number: "FAC-2025-043", client: "Emma Leroy", amount: 890, status: "overdue", date: "2025-03-11" },
  { id: "FAC-006", number: "FAC-2025-042", client: "Hugo Moreau", amount: 200, status: "pending", date: "2025-03-10" },
];

export const subscriptions: Subscription[] = [
  { id: "SUB-001", client: "Marie Dupont", plan: "Pack mensuel Design", amount: 199, status: "active", startDate: "2025-01-15", nextBilling: "2025-04-15" },
  { id: "SUB-002", client: "Lucas Martin", plan: "Montage hebdo", amount: 349, status: "active", startDate: "2025-02-01", nextBilling: "2025-04-01" },
  { id: "SUB-003", client: "Sophie Bernard", plan: "CM réseaux sociaux", amount: 249, status: "active", startDate: "2024-11-10", nextBilling: "2025-04-10" },
  { id: "SUB-004", client: "Thomas Petit", plan: "Podcast mensuel", amount: 120, status: "cancelled", startDate: "2024-09-01", nextBilling: "-" },
];

export const revenueData = [
  { month: "Oct", revenue: 2400 },
  { month: "Nov", revenue: 3200 },
  { month: "Déc", revenue: 2800 },
  { month: "Jan", revenue: 3600 },
  { month: "Fév", revenue: 4100 },
  { month: "Mars", revenue: 3900 },
];

export const ordersChartData = [
  { month: "Oct", orders: 18 },
  { month: "Nov", orders: 24 },
  { month: "Déc", orders: 21 },
  { month: "Jan", orders: 28 },
  { month: "Fév", orders: 32 },
  { month: "Mars", orders: 29 },
];

export const activities: Activity[] = [
  { id: 1, type: "order", message: "Nouvelle commande de Marie Dupont", time: "il y a 2h" },
  { id: 2, type: "payment", message: "Paiement reçu — 280 \u20ac", time: "il y a 4h" },
  { id: 3, type: "client", message: "Nouveau client : Hugo Moreau", time: "il y a 6h" },
  { id: 4, type: "delivery", message: "Commande CMD-004 livrée", time: "hier" },
  { id: 5, type: "invoice", message: "Facture FAC-2025-047 payée", time: "hier" },
];

/* ─── Leads ─── */

export const mockLeads: Lead[] = [
  { id: "LEAD-001", name: "Julien Roche", email: "julien@startup.io", source: "contact-form", date: "2025-03-15", fields: { message: "Intéressé par une refonte de logo" } },
  { id: "LEAD-002", name: "Camille Duval", email: "camille@agence.fr", source: "newsletter", date: "2025-03-14", fields: {} },
  { id: "LEAD-003", name: "Antoine Moreau", email: "antoine@brand.co", source: "lead-magnet", date: "2025-03-13", fields: { downloaded: "guide-branding.pdf" } },
  { id: "LEAD-004", name: "Laura Petit", email: "laura@design.com", source: "contact-form", date: "2025-03-12", fields: { message: "Besoin d'un pack réseaux sociaux" } },
];

/* ─── Workspace FAQ ─── */

export const workspaceFaq = [
  { question: "Quels sont vos délais de livraison ?", answer: "En moyenne 2 à 4 semaines selon la complexité du projet." },
  { question: "Proposez-vous des facilités de paiement ?", answer: "Oui, paiement en 2 ou 3 fois sans frais pour les prestations supérieures à 500 €." },
  { question: "Comment se déroule un projet type ?", answer: "Brief → Moodboard → Propositions → Révisions → Livraison des fichiers sources." },
  { question: "Travaillez-vous avec des entreprises à l'étranger ?", answer: "Oui, je travaille à distance avec des clients partout dans le monde." },
  { question: "Puis-je demander des modifications après livraison ?", answer: "Bien sûr, des révisions mineures sont incluses pendant 15 jours après livraison." },
];

export function getWorkspaceFaq() {
  return workspaceFaq;
}

/* ─── Analytics Events ─── */

export const mockAnalyticsEvents: AnalyticsEvent[] = [
  { id: "EVT-001", type: "page_view", page: "/", timestamp: "2025-03-15T10:23:00Z" },
  { id: "EVT-002", type: "page_view", page: "/services", timestamp: "2025-03-15T10:25:00Z" },
  { id: "EVT-003", type: "click_cta", page: "/services", data: { label: "Choisir ce pack" }, timestamp: "2025-03-15T10:26:00Z" },
  { id: "EVT-004", type: "page_view", page: "/portfolio", timestamp: "2025-03-15T11:00:00Z" },
  { id: "EVT-005", type: "form_submit", page: "/contact", data: { form: "contact" }, timestamp: "2025-03-15T11:05:00Z" },
  { id: "EVT-006", type: "order_start", page: "/order/logo-redesign", data: { product: "PRD-001" }, timestamp: "2025-03-15T12:00:00Z" },
  { id: "EVT-007", type: "order_complete", page: "/order/logo-redesign", data: { product: "PRD-001", amount: "450" }, timestamp: "2025-03-15T12:10:00Z" },
  { id: "EVT-008", type: "page_view", page: "/", timestamp: "2025-03-15T14:00:00Z" },
  { id: "EVT-009", type: "page_view", page: "/a-propos", timestamp: "2025-03-15T14:20:00Z" },
  { id: "EVT-010", type: "click_cta", page: "/", data: { label: "Voir mes services" }, timestamp: "2025-03-15T14:22:00Z" },
];

/* ─── Site Builder Mock Data ─── */

import type { Site, SiteOrder, SiteTemplate, NavConfig, FooterConfig } from "@/types";

export const mockSite: Site = {
  id: "SITE-001",
  settings: {
    name: "Studio Nova",
    description: "Studio créatif spécialisé en identité visuelle et motion design",
    maintenanceMode: false,
    socials: {
      instagram: "https://instagram.com/studionova",
      twitter: "https://twitter.com/studionova",
      linkedin: "https://linkedin.com/company/studionova",
    },
    i18n: { locales: ["fr"], defaultLocale: "fr" },
  },
  nav: {
    links: [
      { label: "Accueil", pageId: "PAGE-001" },
      { label: "Services", pageId: "PAGE-002" },
      { label: "Portfolio", pageId: "PAGE-003" },
      { label: "À propos", pageId: "PAGE-004" },
      { label: "Contact", pageId: "PAGE-005" },
    ],
    showCta: true,
    ctaLabel: "Demander un devis",
    ctaLink: { type: "internal_page", value: "PAGE-005" },
  },
  footer: {
    links: [
      { label: "Accueil", pageId: "PAGE-001" },
      { label: "Services", pageId: "PAGE-002" },
      { label: "Portfolio", pageId: "PAGE-003" },
      { label: "Mentions légales", pageId: "PAGE-006" },
    ],
    showSocials: true,
    copyright: "© 2025 Studio Nova. Tous droits réservés.",
  },
  members: [
    { userId: "USR-001", role: "owner", email: "alex@studionova.fr" },
    { userId: "USR-002", role: "editor", email: "marie@studionova.fr" },
  ],
  theme: {
    primaryColor: "#4F46E5",
    fontFamily: "Inter",
    borderRadius: "rounded",
    shadow: "md",
  },
  domain: {
    subdomain: "studionova",
    customDomain: undefined,
  },
  seo: {
    globalTitle: "Studio Nova — Identité visuelle & Motion design",
    globalDescription: "Studio créatif freelance spécialisé dans l'identité visuelle, le motion design et la direction artistique.",
    ogImageUrl: undefined,
  },
  pages: [
    {
      id: "PAGE-001",
      name: "Accueil",
      slug: "/",
      status: "published",
      seoTitle: "Studio Nova — Accueil",
      seoDescription: "Bienvenue chez Studio Nova, studio créatif freelance.",
      blocks: [
        {
          id: "BLK-001",
          type: "hero",
          visible: true,
          settings: {},
          style: { backgroundColor: "#FFFFFF", textColor: "#ffffff", paddingTop: 80, paddingBottom: 80 },
          content: { title: "Créons ensemble votre identité visuelle", subtitle: "Studio créatif spécialisé en branding, motion design et direction artistique.", ctaLabel: "Voir mes services", ctaLink: "/services" },
        },
        {
          id: "BLK-002",
          type: "portfolio-grid",
          visible: true,
          settings: {},
          style: { paddingTop: 60, paddingBottom: 60 },
          content: {
            columns: 3,
            categories: ["Branding", "Motion", "Design", "Print"],
            showFilter: false,
            showDetailLink: false,
            items: [
              { title: "Rebranding Café Bloom", imageUrl: "/portfolio/cafe-bloom.jpg", category: "Branding", slug: "rebranding-cafe-bloom", featured: true },
              { title: "Motion Reel 2025", imageUrl: "/portfolio/motion-reel.jpg", category: "Motion", slug: "motion-reel-2025" },
              { title: "Identité Maison Dorée", imageUrl: "/portfolio/maison-doree.jpg", category: "Branding", slug: "identite-maison-doree" },
              { title: "UI Kit SaaS", imageUrl: "/portfolio/saas-ui.jpg", category: "Design", slug: "ui-kit-saas" },
              { title: "Packaging Bio Terre", imageUrl: "/portfolio/bio-terre.jpg", category: "Print", slug: "packaging-bio-terre" },
              { title: "Animation Logo Tech", imageUrl: "/portfolio/logo-tech.jpg", category: "Motion", slug: "animation-logo-tech" },
            ],
          },
        },
        {
          id: "BLK-003",
          type: "testimonials",
          visible: true,
          settings: {},
          style: { backgroundColor: "#f8f9fc", paddingTop: 60, paddingBottom: 60 },
          content: {
            testimonials: [
              { name: "Marie Dupont", role: "CEO, Café Bloom", text: "Un travail exceptionnel. Notre nouvelle identité a transformé notre image." },
              { name: "Thomas Petit", role: "Fondateur, TechStart", text: "Rapide, créatif et toujours à l'écoute. Je recommande à 100%." },
            ],
          },
        },
        {
          id: "BLK-004",
          type: "centered-cta",
          visible: true,
          settings: {},
          style: { backgroundColor: "#4F46E5", textColor: "#ffffff", paddingTop: 60, paddingBottom: 60 },
          content: { title: "Prêt à démarrer votre projet ?", description: "Réservez un appel découverte gratuit de 30 minutes.", ctaLabel: "Réserver un créneau", ctaLink: "/contact" },
        },
      ],
    },
    {
      id: "PAGE-002",
      name: "Services",
      slug: "/services",
      status: "published",
      seoTitle: "Nos services — Studio Nova",
      seoDescription: "Découvrez nos offres en identité visuelle, motion design et direction artistique.",
      blocks: [
        {
          id: "BLK-010",
          type: "hero",
          visible: true,
          settings: {},
          style: { paddingTop: 60, paddingBottom: 40 },
          content: { title: "Mes services", subtitle: "Des prestations sur-mesure pour donner vie à vos projets créatifs.", ctaLabel: "Demander un devis", ctaLink: "/contact" },
        },
        {
          id: "BLK-011",
          type: "services-list",
          visible: true,
          settings: {},
          style: { paddingTop: 40, paddingBottom: 40 },
          content: {
            title: "Mes services",
            layout: "list" as const,
            productIds: ["PRD-001", "PRD-002", "PRD-003", "PRD-004"],
            showPrice: true,
            showCategory: true,
            ctaMode: "product_page" as const,
          },
        },
        {
          id: "BLK-012",
          type: "pack-premium",
          visible: true,
          settings: {},
          style: { backgroundColor: "#f8f9fc", paddingTop: 60, paddingBottom: 60 },
          content: {
            productId: "PRD-005",
            highlight: true,
            showFeatures: true,
            showPrice: true,
            ctaLabel: "Choisir ce pack",
          },
        },
        {
          id: "BLK-013",
          type: "faq-accordion",
          visible: true,
          settings: {},
          style: { paddingTop: 60, paddingBottom: 60 },
          content: {
            items: [
              { question: "Quels sont vos délais de livraison ?", answer: "En moyenne 2 à 4 semaines selon la complexité du projet." },
              { question: "Proposez-vous des facilités de paiement ?", answer: "Oui, paiement en 2 ou 3 fois sans frais pour les prestations supérieures à 500 \u20ac." },
              { question: "Comment se déroule un projet type ?", answer: "Brief \u2192 Moodboard \u2192 Propositions \u2192 Révisions \u2192 Livraison des fichiers sources." },
            ],
          },
        },
      ],
    },
    {
      id: "PAGE-003",
      name: "Portfolio",
      slug: "/portfolio",
      status: "published",
      blocks: [
        {
          id: "BLK-020",
          type: "hero",
          visible: true,
          settings: {},
          style: { paddingTop: 60, paddingBottom: 40 },
          content: { title: "Portfolio", subtitle: "Une sélection de mes réalisations récentes.", ctaLabel: "Me contacter", ctaLink: "/contact" },
        },
        {
          id: "BLK-021",
          type: "portfolio-grid",
          visible: true,
          settings: {},
          style: { paddingTop: 20, paddingBottom: 60 },
          content: {
            columns: 3,
            categories: ["Branding", "Motion", "Design", "Print"],
            showFilter: true,
            showDetailLink: true,
            showSearch: true,
            items: [
              { title: "Rebranding Café Bloom", imageUrl: "/portfolio/cafe-bloom.jpg", category: "Branding", slug: "rebranding-cafe-bloom", description: "Refonte complète de l'identité visuelle du Café Bloom.", featured: true },
              { title: "Motion Reel 2025", imageUrl: "/portfolio/motion-reel.jpg", category: "Motion", slug: "motion-reel-2025", description: "Showreel animation et motion design 2025." },
              { title: "Identité Maison Dorée", imageUrl: "/portfolio/maison-doree.jpg", category: "Branding", slug: "identite-maison-doree", description: "Création d'identité pour une marque de luxe." },
              { title: "UI Kit SaaS", imageUrl: "/portfolio/saas-ui.jpg", category: "Design", slug: "ui-kit-saas", description: "Design system complet pour une application SaaS." },
              { title: "Packaging Bio Terre", imageUrl: "/portfolio/bio-terre.jpg", category: "Print", slug: "packaging-bio-terre", description: "Packaging éco-responsable pour Bio Terre." },
              { title: "Animation Logo Tech", imageUrl: "/portfolio/logo-tech.jpg", category: "Motion", slug: "animation-logo-tech", description: "Animation de logo pour une startup tech." },
            ],
          },
        },
      ],
    },
    {
      id: "PAGE-004",
      name: "À propos",
      slug: "/a-propos",
      status: "published",
      blocks: [
        {
          id: "BLK-030",
          type: "hero",
          visible: true,
          settings: {},
          style: { paddingTop: 60, paddingBottom: 40 },
          content: { title: "À propos", subtitle: "Passionné par le design depuis plus de 8 ans.", ctaLabel: "", ctaLink: "" },
        },
        {
          id: "BLK-031",
          type: "why-me",
          visible: true,
          settings: {},
          style: { paddingTop: 40, paddingBottom: 40 },
          content: {
            title: "Pourquoi travailler avec moi ?",
            reasons: [
              { title: "Expertise multi-domaine", description: "Branding, motion, print \u2014 un studio tout-en-un." },
              { title: "Process transparent", description: "Suivi en temps réel, révisions illimitées jusqu'à validation." },
              { title: "Résultats prouvés", description: "+50 marques accompagnées avec un taux de satisfaction de 98%." },
            ],
          },
        },
        {
          id: "BLK-032",
          type: "timeline-process",
          visible: true,
          settings: {},
          style: { paddingTop: 40, paddingBottom: 40 },
          content: {
            steps: [
              { title: "Appel découverte", description: "On échange sur vos besoins et objectifs." },
              { title: "Proposition créative", description: "Moodboard et directions artistiques." },
              { title: "Réalisation", description: "Production des livrables avec points d'étape." },
              { title: "Livraison", description: "Fichiers sources + guide d'utilisation." },
            ],
          },
        },
        {
          id: "BLK-033",
          type: "stats-counter",
          visible: true,
          settings: {},
          style: { backgroundColor: "#4F46E5", textColor: "#ffffff", paddingTop: 60, paddingBottom: 60 },
          content: {
            stats: [
              { value: "50+", label: "Projets réalisés" },
              { value: "98%", label: "Satisfaction client" },
              { value: "8", label: "Années d'expérience" },
              { value: "24h", label: "Temps de réponse" },
            ],
          },
        },
      ],
    },
    {
      id: "PAGE-005",
      name: "Contact",
      slug: "/contact",
      status: "published",
      blocks: [
        {
          id: "BLK-040",
          type: "hero",
          visible: true,
          settings: {},
          style: { paddingTop: 60, paddingBottom: 40 },
          content: { title: "Contact", subtitle: "Envie de collaborer ? Écrivez-moi ou réservez un créneau.", ctaLabel: "", ctaLink: "" },
        },
        {
          id: "BLK-041",
          type: "custom-form",
          visible: true,
          settings: {},
          style: { paddingTop: 20, paddingBottom: 40 },
          content: {
            fields: [
              { label: "Nom complet", type: "text", required: true },
              { label: "Email", type: "email", required: true },
              { label: "Type de projet", type: "select", required: true },
              { label: "Message", type: "textarea", required: false },
            ],
            submitLabel: "Envoyer ma demande",
          },
        },
        {
          id: "BLK-042",
          type: "calendar-booking",
          visible: true,
          settings: {},
          style: { backgroundColor: "#f8f9fc", paddingTop: 60, paddingBottom: 60 },
          content: {
            title: "Réserver un appel découverte",
            description: "30 minutes pour discuter de votre projet, sans engagement.",
            provider: "calendly" as const,
            embedUrl: "",
            ctaLabel: "Réserver",
            openModal: false,
            slots: ["Lundi 10h", "Mardi 14h", "Mercredi 10h", "Jeudi 16h", "Vendredi 10h"],
          },
        },
      ],
    },
    {
      id: "PAGE-006",
      name: "Mentions légales",
      slug: "/mentions-legales",
      status: "draft",
      blocks: [
        {
          id: "BLK-050",
          type: "hero",
          visible: true,
          settings: {},
          style: { paddingTop: 40, paddingBottom: 20 },
          content: { title: "Mentions légales", subtitle: "", ctaLabel: "", ctaLink: "" },
        },
      ],
    },
  ],
};

export const siteOrders: SiteOrder[] = [
  { id: "SCMD-001", client: "Marie Dupont", clientEmail: "marie@studio.fr", service: "Identité visuelle", price: 890, status: "in_progress", date: "2025-03-15", message: "J'aimerais un univers épuré et moderne." },
  { id: "SCMD-002", client: "Lucas Martin", clientEmail: "lucas@agency.com", service: "Motion intro YouTube", price: 450, status: "delivered", date: "2025-03-14" },
  { id: "SCMD-003", client: "Sophie Bernard", clientEmail: "sophie@freelance.fr", service: "Pack réseaux sociaux", price: 150, status: "pending", date: "2025-03-13", message: "Pour mon compte Instagram professionnel." },
  { id: "SCMD-004", client: "Thomas Petit", clientEmail: "thomas@startup.io", service: "Direction artistique", price: 680, status: "delivered", date: "2025-03-12" },
  { id: "SCMD-005", client: "Emma Leroy", clientEmail: "emma@brand.co", service: "Pack Premium", price: 1490, status: "in_progress", date: "2025-03-11", message: "Lancement de ma marque de cosmétiques bio." },
];

export const siteStats = {
  visits: "1 247",
  conversion: "3,2 %",
  avgCart: "340 \u20ac",
  ctaRate: "12,5 %",
};

export const siteTemplates: SiteTemplate[] = [
  {
    id: "TPL-001",
    name: "Creator Pro",
    description: "Template moderne pour créateurs de contenu avec portfolio en grille et prise de commande intégrée.",
    gradient: "from-purple-600 to-indigo-600",
    pages: [],
  },
  {
    id: "TPL-002",
    name: "Studio Minimal",
    description: "Design épuré et minimaliste, idéal pour les studios de design et photographes.",
    gradient: "from-gray-800 to-gray-600",
    pages: [],
  },
  {
    id: "TPL-003",
    name: "Agency Dark",
    description: "Thème sombre premium pour agences créatives et consultants haut de gamme.",
    gradient: "from-violet-900 to-black",
    pages: [],
  },
];
