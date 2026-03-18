"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Automations",
  title: "Automatisez les tâches répétitives",
  titleGradient: "sans alourdir votre workflow.",
  subtitle:
    "Relances, changements de statut, rappels — laissez Jestly gérer le mécanique pendant que vous créez. Aucun Zapier requis.",
  videoLabel: "Voir les automations en action",
  accentColor: "#6366F1",

  benefitsTitle: "Moins de répétition,",
  benefitsTitleGradient: "plus de création.",
  benefits: [
    {
      icon: "M4 4v5h.582M19.938 11.22A8.001 8.001 0 0 0 5.17 5.538M20 20v-5h-.581M4.062 12.78A8.001 8.001 0 0 0 18.83 18.462",
      title: "Adieu la répétition",
      description:
        "Les actions que vous faites chaque jour manuellement ? Jestly les exécute pour vous.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      title: "Zéro oubli",
      description:
        "Relances, rappels, mises à jour — tout part au bon moment, sans y penser.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      title: "Flux plus fluide",
      description:
        "Vos processus s'enchaînent naturellement — commande reçue, statut mis à jour, client notifié.",
    },
    {
      icon: "M9.663 17h4.673M12 3v1M6.343 7.343l.707.707M3 12h1M6.343 16.657l.707-.707M17.657 7.343l-.707.707M20 12h1M17.657 16.657l-.707-.707",
      title: "Charge mentale allégée",
      description:
        "Arrêtez de vous rappeler ce qu'il faut faire — concentrez-vous sur ce qui compte.",
    },
  ],

  showcaseTitle: "Ce que Jestly",
  showcaseTitleGradient: "automatise pour vous.",
  showcaseSubtitle:
    "Des déclencheurs simples, des actions concrètes — sans code.",
  showcaseItems: [
    {
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9",
      label: "Relances",
      description: "Rappels de paiement envoyés au bon timing.",
    },
    {
      icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z",
      label: "Messages",
      description: "Notifications clients déclenchées par vos actions.",
    },
    {
      icon: "M4 4v5h.582M19.938 11.22A8.001 8.001 0 0 0 5.17 5.538M20 20v-5h-.581M4.062 12.78A8.001 8.001 0 0 0 18.83 18.462",
      label: "Changements de statut",
      description: "Commandes et factures mises à jour automatiquement.",
    },
    {
      icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Rappels",
      description: "Alertes avant les deadlines et échéances critiques.",
    },
    {
      icon: "M3 3v18h18M7 16l4-4 4 4 6-6",
      label: "Suivi",
      description: "Historique de chaque automation exécutée.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      label: "Déclencheurs",
      description: "Événements qui lancent vos automations — configurables.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec les automations activées.",
  beforeItems: [
    { label: "Relances envoyées manuellement (ou oubliées)", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Statuts mis à jour à la main, en retard", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Rappels sur post-its, notifications absentes", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Zapier payant pour des tâches simples", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Relances programmées et envoyées seules", icon: "M5 13l4 4L19 7" },
    { label: "Statuts synchronisés automatiquement", icon: "M5 13l4 4L19 7" },
    { label: "Rappels natifs, jamais en retard", icon: "M5 13l4 4L19 7" },
    { label: "Automations intégrées, zéro outil tiers", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Des automations qui traversent",
  integrationTitleGradient: "tous vos modules.",
  integrationSubtitle:
    "CRM, factures, commandes, paiements — les automations connectent tout sans configuration lourde.",
  integrationModules: [
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Facturation", icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z", color: "#22C55E" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Paiements", icon: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 10h20", color: "#10B981" },
  ],

  ctaTitle: "Automatisez l'ennuyeux,",
  ctaTitleGradient: "gardez le créatif.",
  ctaSubtitle:
    "Des automations natives, sans Zapier ni code. Jestly fait le travail mécanique pendant que vous créez.",
};

export default function AutomationsPage() {
  return <FeaturePageLayout data={DATA} />;
}
