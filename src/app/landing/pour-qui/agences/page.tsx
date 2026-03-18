"use client";

import PersonaPageLayout from "@/components/landing/PersonaPageLayout";
import type { PersonaPageData } from "@/components/landing/PersonaPageLayout";

const DATA: PersonaPageData = {
  persona: "agences",
  accentColor: "#059669",
  accentBg: "#ECFDF5",

  badge: "Conçu pour les agences",
  title: "Le système qui scale",
  titleGradient: "avec votre agence.",
  subtitle: "Multi-clients, multi-projets, multi-factures. Structurez toute votre activité dans un cockpit unifié qui grandit avec vous.",
  heroMetrics: [
    { value: "10h", label: "gagnées / semaine" },
    { value: "x3", label: "meilleur suivi" },
    { value: "15+", label: "clients sans stress" },
  ],
  reassurance: ["Gratuit pour commencer", "Multi-clients", "Scalable"],

  painTitle: "Gérer une agence,",
  painGradient: "c'est gérer le chaos.",
  painSubtitle: "Plus vous grandissez, plus l'admin explose. Chaque nouveau client ajoute une couche de complexité.",
  painTools: [
    { name: "Notion (x12)", emoji: "📝" },
    { name: "Slack", emoji: "💬" },
    { name: "Google Drive", emoji: "📁" },
    { name: "Asana", emoji: "✅" },
    { name: "Monday", emoji: "📊" },
    { name: "QuickBooks", emoji: "🧾" },
    { name: "HubSpot", emoji: "🔶" },
    { name: "Trello", emoji: "📋" },
    { name: "Gmail", emoji: "📧" },
    { name: "Stripe", emoji: "💳" },
  ],

  transformTitle: "Un cockpit central",
  transformGradient: "pour piloter votre agence.",
  beforeItems: [
    "Un Notion par client (ingérable à 10+)",
    "Factures sur Excel client par client",
    "Suivi de projets sur Trello + Asana + Slack",
    "Pas de vision globale du CA",
    "Onboarding client manuel à chaque fois",
  ],
  afterItems: [
    "Tous les clients dans un CRM structuré",
    "Facturation automatisée multi-clients",
    "Pipeline global avec vue par client",
    "Dashboard CA, rentabilité, projections",
    "Onboarding automatisé pour chaque client",
  ],

  features: [
    { title: "CRM", gradient: "multi-clients.", description: "Fiches clients complètes avec projets, factures, notes et historique. Filtrez, segmentez, organisez.", bullets: ["Vue globale multi-clients", "Historique par client", "Filtres et segments avancés"], icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87", color: "#059669" },
    { title: "Pipeline", gradient: "global.", description: "Vue kanban de tous vos projets. Filtrez par client, statut, date limite. Vision instantanée.", bullets: ["Kanban multi-projets", "Filtres par client", "Deadlines et alertes"], icon: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42z", color: "#F59E0B" },
    { title: "Facturation", gradient: "pro.", description: "Générez devis et factures en masse. Relances auto, échéances, acomptes. Pour chaque client.", bullets: ["Facturation en masse", "Acomptes et échéances", "Relances automatiques"], icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4", color: "#22C55E" },
    { title: "Analytics", gradient: "agence.", description: "CA par client, rentabilité par projet, prévisions de trésorerie. Décisions éclairées.", bullets: ["CA par client et global", "Rentabilité par projet", "Prévisions trésorerie"], icon: "M3 3v18h18M7 16l4-8 4 4 5-9", color: "#7C3AED" },
    { title: "Automations", gradient: "à l'échelle.", description: "Onboarding, relances, notifications : tout tourne automatiquement pour chaque client.", bullets: ["Workflows par client", "Onboarding automatisé", "Notifications équipe"], icon: "M13 2L3 14h9l-1 8 10-12h-9z", color: "#6366F1" },
  ],

  proofTitle: "Des agences qui ont",
  proofGradient: "structuré leur croissance.",
  metrics: [
    { value: "10h", label: "d'admin en moins", description: "Par semaine en gestion multi-clients" },
    { value: "x3", label: "meilleur suivi", description: "Projets et clients trackés en temps réel" },
    { value: "15+", label: "clients gérés", description: "Sans stress, sans oubli, sans tableur" },
  ],
  testimonials: [
    { name: "Romain Blanc", role: "Fondateur agence créative, Paris", initials: "RB", color: "#059669", quote: "On gérait 12 clients sur 5 outils différents. Depuis Jestly, tout est centralisé. L'équipe gagne un temps fou et les clients sont beaucoup mieux suivis." },
    { name: "Claire Vasseur", role: "Directrice agence digitale, Lyon", initials: "CV", color: "#7C3AED", quote: "La facturation multi-clients était notre cauchemar mensuel. Jestly l'a transformée en process automatisé. On facture 3x plus vite maintenant." },
  ],

  ctaTitle: "Arrêtez de gérer votre agence",
  ctaGradient: "avec du scotch numérique.",
  ctaSubtitle: "Jestly centralise tout. Un seul outil pour piloter clients, projets, factures et croissance.",
};

export default function AgencesPage() {
  return <PersonaPageLayout data={DATA} />;
}
