"use client";

import PersonaPageLayout from "@/components/landing/PersonaPageLayout";
import type { PersonaPageData } from "@/components/landing/PersonaPageLayout";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const DATA: PersonaPageData = {
  persona: "consultants",
  accentColor: "#0EA5E9",
  accentBg: "#F0F9FF",

  badge: "Conçu pour les consultants",
  title: "Gérez vos missions",
  titleGradient: "comme un vrai business.",
  subtitle: "Consultants, coachs, formateurs : structurez votre activité avec un système qui professionnalise chaque interaction client.",
  heroMetrics: [
    { value: "4h", label: "gagnées / semaine" },
    { value: "x2", label: "meilleur suivi" },
    { value: "0", label: "facture oubliée" },
  ],
  reassurance: ["Gratuit pour commencer", "CRM intégré", "Prêt en 2 min"],

  painTitle: "Consultant ≠",
  painGradient: "gestionnaire.",
  painSubtitle: "Votre expertise est votre valeur. Pas votre capacité à jongler entre 8 outils d'admin.",
  painTools: [
    { name: "Google Calendar", emoji: "📅" },
    { name: "Notion", emoji: "📝" },
    { name: "Excel", emoji: "📊" },
    { name: "Gmail", emoji: "📧" },
    { name: "Word", emoji: "📄" },
    { name: "Henrri", emoji: "🧾" },
    { name: "Calendly", emoji: "🔗" },
    { name: "WhatsApp", emoji: "💬" },
    { name: "Stripe", emoji: "💳" },
    { name: "Post-its", emoji: "🟡" },
  ],

  transformTitle: "Un système qui fait",
  transformGradient: "tourner votre cabinet.",
  beforeItems: [
    "Clients suivis par email et mémoire",
    "Factures sur Excel avec formules cassées",
    "Planning sur Google Calendar sans lien CRM",
    "Devis envoyés en Word par mail",
    "Pas de suivi de mission structuré",
  ],
  afterItems: [
    "CRM avec historique complet par client",
    "Facturation automatique liée aux missions",
    "Agenda intégré au CRM et aux projets",
    "Devis professionnels en 2 clics",
    "Suivi de missions avec statuts temps réel",
  ],

  features: [
    { title: "CRM", gradient: "missions.", description: "Fiches clients avec historique des missions, factures, notes et prochaines étapes.", bullets: ["Historique par client", "Notes et fichiers", "Prochaines étapes"], icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", color: "#0EA5E9" },
    { title: "Agenda", gradient: "connecté.", description: "Vos rendez-vous sont liés à vos clients et missions. Un clic pour tout le contexte.", bullets: ["Lié au CRM", "Contexte client instantané", "Rappels automatiques"], icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18", color: "#4C8DFF" },
    { title: "Facturation", gradient: "intelligente.", description: "TJM, forfait, par mission. Factures conformes générées automatiquement.", bullets: ["TJM ou forfait", "Génération automatique", "Relances programmées"], icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4", color: "#22C55E" },
    { title: "Dashboard", gradient: "consultant.", description: "TJM effectif, jours facturés, CA mensuel, projections. Pilotez avec des chiffres.", bullets: ["TJM effectif calculé", "Jours facturés vs disponibles", "Projections financières"], icon: "M3 3v18h18M7 16l4-8 4 4 5-9", color: "#7C3AED" },
  ],

  proofTitle: "Des consultants qui ont",
  proofGradient: "professionnalisé leur activité.",
  metrics: [
    { value: "4h", label: "gagnées / semaine", description: "Moins de temps admin, plus de temps client" },
    { value: "x2", label: "missions mieux suivies", description: "Suivi clair, zéro oubli, zéro retard" },
    { value: "0", label: "facture oubliée", description: "Relances auto et suivi intégré" },
  ],
  testimonials: [
    { name: "Nicolas Bernard", role: "Consultant stratégie, Paris", initials: "NB", color: "#0EA5E9", quote: "Je gère 8 missions en parallèle sans stress. Le suivi me donne une vision claire et la facturation tourne toute seule. Énorme gain de temps." },
    { name: "Isabelle Morel", role: "Coach business, Lyon", initials: "IM", color: "#EC4899", quote: "L'agenda connecté au CRM m'a changé la vie. Avant chaque call, j'ai tout le contexte client en un coup d'œil. Mes clients sentent la différence." },
  ],

  ctaTitle: "Concentrez-vous sur vos clients.",
  ctaGradient: "Jestly gère le reste.",
  ctaSubtitle: "Gratuit pour démarrer. Prêt en 2 minutes. Aucun engagement. Votre activité mérite un vrai système.",
};

const SEO_BLOCKS = [
  {
    heading: "Un outil de gestion pour consultants et coachs freelances",
    paragraphs: [
      "En tant que consultant, coach ou formateur freelance, votre activité repose sur la confiance et la relation client. Mais entre les propositions commerciales, le suivi des missions, la facturation et la prospection, la partie administrative mange un temps précieux que vous pourriez consacrer à vos clients.",
      "Jestly professionnalise chaque interaction : du premier contact via votre site vitrine, au brief de mission structuré, jusqu'à la facture et le suivi de paiement. Vos clients voient un consultant organisé et fiable, vous gardez une vision claire de votre pipeline commercial.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "Jestly convient-il aux consultants et coachs ?",
    answer: "Oui, Jestly est adapté aux consultants, coachs et formateurs freelances. Le CRM vous aide à suivre vos prospects, les briefs structurent le cadrage de mission, et la facturation est intégrée au flux de travail.",
  },
  {
    question: "Comment suivre mes missions de consulting avec Jestly ?",
    answer: "Chaque mission est une commande avec son brief, son statut et sa deadline. Vous suivez la progression, gérez les livrables et facturez directement depuis Jestly. Tout l'historique client est conservé.",
  },
  {
    question: "Puis-je gérer ma prospection avec le CRM de Jestly ?",
    answer: "Oui, le CRM de Jestly permet de suivre vos prospects avec des statuts clairs (prospect, en discussion, signé). Vous ne perdez plus de leads entre les emails et les appels.",
  },
];

export default function ConsultantsPage() {
  return (
    <>
      <PersonaPageLayout data={DATA} />
      <SeoContentSection blocks={SEO_BLOCKS} />
      <FaqSeoSection title="Questions fréquentes — Consultants freelance" items={FAQ_ITEMS} accentColor="#14B8A6" />
    </>
  );
}
