"use client";

import PersonaPageLayout from "@/components/landing/PersonaPageLayout";
import type { PersonaPageData } from "@/components/landing/PersonaPageLayout";

const DATA: PersonaPageData = {
  persona: "createurs",
  accentColor: "#F97316",
  accentBg: "#FFF7ED",

  badge: "Conçu pour les créateurs",
  title: "Le cockpit qui centralise",
  titleGradient: "tout votre business créatif.",
  subtitle: "Monteurs, photographes, vidéastes : arrêtez de jongler entre 10 outils. Portfolio, clients, projets, factures et paiements — un seul système.",
  heroMetrics: [
    { value: "3h", label: "gagnées / semaine" },
    { value: "100%", label: "centralisé" },
    { value: "x2", label: "mieux organisé" },
  ],
  reassurance: ["Gratuit pour commencer", "Aucun engagement", "Prêt en 2 min"],

  painTitle: "Votre quotidien actuel :",
  painGradient: "le chaos créatif.",
  painSubtitle: "Entre les fichiers perdus, les relances oubliées et les factures en retard, vous passez plus de temps à gérer qu'à créer.",
  painTools: [
    { name: "WeTransfer", emoji: "📦" },
    { name: "Google Drive", emoji: "📁" },
    { name: "WhatsApp", emoji: "💬" },
    { name: "Excel", emoji: "📊" },
    { name: "Notion", emoji: "📝" },
    { name: "Behance", emoji: "🎨" },
    { name: "PayPal", emoji: "💳" },
    { name: "Gmail", emoji: "📧" },
    { name: "Trello", emoji: "📋" },
    { name: "Henrri", emoji: "🧾" },
  ],

  transformTitle: "Passez du chaos",
  transformGradient: "à la maîtrise totale.",
  beforeItems: [
    "Briefs reçus par WhatsApp, mail, vocal",
    "Factures faites à la main sur Excel",
    "Portfolio sur un site séparé sans conversion",
    "Suivi client inexistant ou sur post-its",
    "Paiements suivis dans un tableur",
  ],
  afterItems: [
    "Briefs structurés dans chaque commande",
    "Facturation automatique en 2 clics",
    "Portfolio intégré qui génère des leads",
    "CRM avec historique complet par client",
    "Paiements tracés et relances automatiques",
  ],

  features: [
    { title: "Portfolio", gradient: "qui convertit.", description: "Montrez vos meilleurs projets dans une galerie premium. Chaque visiteur peut vous contacter directement.", bullets: ["Galerie responsive multi-projets", "Formulaire de contact intégré", "Personnalisation complète"], icon: "M4 4h16v16H4zM4 12h16M12 4v16", color: "#F97316" },
    { title: "CRM", gradient: "pour créatifs.", description: "Chaque client a sa fiche : projets, factures, briefs, échanges. Plus jamais de contexte perdu.", bullets: ["Fiches clients complètes", "Historique d'échanges", "Tags et filtres intelligents"], icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", color: "#EC4899" },
    { title: "Facturation", gradient: "sans friction.", description: "Devis et factures conformes générés en quelques clics. Relances programmées automatiquement.", bullets: ["Devis et factures pro", "Relances automatiques", "Suivi des paiements en temps réel"], icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4", color: "#22C55E" },
    { title: "Suivi", gradient: "projets.", description: "Suivez chaque commande de la demande initiale à la livraison finale. Vision claire en temps réel.", bullets: ["Kanban visuel par statut", "Deadlines et rappels", "Livraison trackée"], icon: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42z", color: "#F59E0B" },
    { title: "Automations", gradient: "intelligentes.", description: "Bienvenue client, relance impayé, notification livraison : tout tourne en arrière-plan.", bullets: ["Workflows préconfigurés", "Déclencheurs personnalisables", "Notifications auto"], icon: "M13 2L3 14h9l-1 8 10-12h-9z", color: "#6366F1" },
  ],

  proofTitle: "Ils ont adopté Jestly",
  proofGradient: "et ne reviendraient pas.",
  metrics: [
    { value: "3h", label: "gagnées / semaine", description: "En moyenne sur l'ensemble des utilisateurs créateurs" },
    { value: "x2", label: "mieux organisé", description: "Projets mieux suivis, moins d'oublis et de retards" },
    { value: "100%", label: "centralisé", description: "Portfolio, CRM, facturation, paiements au même endroit" },
  ],
  testimonials: [
    { name: "Lucas Moreau", role: "Monteur vidéo freelance, Lyon", initials: "LM", color: "#F97316", quote: "Avant Jestly, je perdais un temps fou entre mails, tableur et WeTransfer. Maintenant tout est au même endroit. Je me concentre enfin sur le montage." },
    { name: "Camille Durand", role: "Photographe, Bordeaux", initials: "CD", color: "#EC4899", quote: "Mon portfolio, mes clients, mes factures : tout est connecté. Quand un client me contacte, je retrouve tout son historique en un clic. C'est un game changer." },
  ],

  ctaTitle: "Arrêtez de jongler entre 10 outils.",
  ctaGradient: "Créez dans un seul système.",
  ctaSubtitle: "Jestly est gratuit pour commencer. Pas de carte bancaire, pas d'engagement. Votre business mérite un vrai cockpit.",
};

export default function CreateursPage() {
  return <PersonaPageLayout data={DATA} />;
}
