"use client";

import PersonaPageLayout from "@/components/landing/PersonaPageLayout";
import type { PersonaPageData } from "@/components/landing/PersonaPageLayout";

const DATA: PersonaPageData = {
  persona: "developpeurs",
  accentColor: "#3B82F6",
  accentBg: "#EFF6FF",

  badge: "Conçu pour les développeurs",
  title: "Le système de gestion",
  titleGradient: "que vous auriez codé vous-même.",
  subtitle: "Devs freelance et indie hackers : gérez clients, projets et revenus sans quitter votre zone de productivité. Zéro config, 100% opérationnel.",
  heroMetrics: [
    { value: "5h", label: "d'admin en moins" },
    { value: "1", label: "seul outil" },
    { value: "0", label: "config nécessaire" },
  ],
  reassurance: ["Gratuit pour commencer", "Zéro config", "Prêt en 2 min"],

  painTitle: "Votre stack admin ?",
  painGradient: "Un enfer de bricolage.",
  painSubtitle: "Vous avez automatisé votre CI/CD mais votre gestion client tient avec du scotch numérique.",
  painTools: [
    { name: "Slack", emoji: "💬" },
    { name: "Discord", emoji: "🎮" },
    { name: "GitHub Issues", emoji: "🐛" },
    { name: "Google Docs", emoji: "📄" },
    { name: "Notion", emoji: "📝" },
    { name: "Stripe Dashboard", emoji: "💳" },
    { name: "Linear", emoji: "📐" },
    { name: "Trello", emoji: "📋" },
    { name: "Gmail", emoji: "📧" },
    { name: "Spreadsheets", emoji: "📊" },
  ],

  transformTitle: "Un système unifié,",
  transformGradient: "zéro friction.",
  beforeItems: [
    "Clients sur Slack, Discord, email, GitHub",
    "Factures sur Google Docs ou Notion",
    "Suivi de projet sur Trello ou Linear",
    "Paiements sur Stripe sans vision globale",
    "Pas de CRM, juste de la mémoire",
  ],
  afterItems: [
    "Tous les clients dans un CRM structuré",
    "Facturation auto liée aux commandes",
    "Pipeline visuel avec statuts en temps réel",
    "Paiements intégrés + suivi des encaissements",
    "Historique complet par client et par projet",
  ],

  features: [
    { title: "CRM", gradient: "technique.", description: "Centralisez clients avec tags, notes, historique de projets et revenus générés par client.", bullets: ["Fiches clients enrichies", "Tags et segments", "Revenus par client"], icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", color: "#3B82F6" },
    { title: "Pipeline", gradient: "de projets.", description: "Kanban visuel pour suivre chaque mission du brief au déploiement.", bullets: ["Vue kanban par statut", "Filtres par client / deadline", "Historique par projet"], icon: "M9 5H2v7l6.29 6.29a1 1 0 001.42 0l5.58-5.58a1 1 0 000-1.42z", color: "#F59E0B" },
    { title: "Facturation", gradient: "dev-friendly.", description: "Générez des factures conformes en 2 clics. TJM, forfait, par projet.", bullets: ["TJM ou forfait", "Factures conformes auto", "Relances programmées"], icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 14l2 2 4-4", color: "#22C55E" },
    { title: "Dashboard", gradient: "revenus.", description: "Suivez votre CA, TJM effectif, projets en cours et projections financières.", bullets: ["CA mensuel et cumulé", "TJM effectif calculé", "Projections trésorerie"], icon: "M3 3v18h18M7 16l4-8 4 4 5-9", color: "#7C3AED" },
    { title: "Automations", gradient: "métier.", description: "Relance de paiement, onboarding client, notification livraison : tout automatisé.", bullets: ["Workflows personnalisables", "Déclencheurs smart", "Zéro intervention manuelle"], icon: "M13 2L3 14h9l-1 8 10-12h-9z", color: "#6366F1" },
  ],

  proofTitle: "Des devs freelance",
  proofGradient: "qui ont simplifié leur business.",
  metrics: [
    { value: "5h", label: "d'admin en moins", description: "Par semaine en moyenne pour un dev freelance" },
    { value: "x3", label: "meilleur suivi", description: "Clients et projets mieux trackés, zéro oubli" },
    { value: "100%", label: "centralisé", description: "CRM, facturation, pipeline, analytics" },
  ],
  testimonials: [
    { name: "Antoine Mercier", role: "Dev fullstack freelance, Paris", initials: "AM", color: "#3B82F6", quote: "J'avais une stack de 6 outils pour gérer mon business. Jestly a tout remplacé. J'ai retrouvé le temps de coder sur mes side-projects." },
    { name: "Marie Chen", role: "Dev backend, Lyon", initials: "MC", color: "#7C3AED", quote: "La facturation automatique m'a changé la vie. Je ne passe plus mes dimanches soirs à faire des factures sur Google Docs." },
  ],

  ctaTitle: "Arrêtez de bricoler votre stack business.",
  ctaGradient: "Codez, Jestly gère le reste.",
  ctaSubtitle: "Gratuit pour commencer. Zéro config. Prêt en 2 minutes. Votre business mérite mieux qu'un Google Doc.",
};

export default function DeveloppeursPage() {
  return <PersonaPageLayout data={DATA} />;
}
