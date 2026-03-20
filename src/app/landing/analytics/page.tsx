"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Analytics",
  title: "Suivez vos performances et revenus",
  titleGradient: "en temps réel.",
  subtitle:
    "Fini de naviguer à l'aveugle. Jestly transforme vos données en tableaux de bord lisibles — revenus, activité, tendances — pour décider avec clarté.",
  videoLabel: "Explorer les analytics",
  useAnalyticsDemo: true,
  accentColor: "#7C3AED",

  benefitsTitle: "Des chiffres qui",
  benefitsTitleGradient: "éclairent vos décisions.",
  benefits: [
    {
      icon: "M3 3v18h18M7 16l4-4 4 4 6-6",
      title: "Visibilité sur vos revenus",
      description:
        "Chiffre d'affaires, encours, tendances — tout est affiché, rien n'est deviné.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      title: "Meilleures décisions",
      description:
        "Identifiez ce qui fonctionne, ce qui stagne, et ajustez votre stratégie.",
    },
    {
      icon: "M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2ZM15 19V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2ZM21 19V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2Z",
      title: "Progression mesurée",
      description:
        "Suivez votre croissance mois par mois avec des métriques concrètes.",
    },
    {
      icon: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z",
      title: "Insights actionnables",
      description:
        "Pas juste des courbes — des indicateurs qui vous poussent à agir.",
    },
  ],

  showcaseTitle: "Les métriques qui comptent",
  showcaseTitleGradient: "pour un freelance.",
  showcaseSubtitle:
    "Pas de vanity metrics. Des données utiles, lisibles et à jour.",
  showcaseItems: [
    {
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2M12 2v2M12 20v2",
      label: "Revenus",
      description: "CA mensuel, trimestriel et annuel en un regard.",
    },
    {
      icon: "M3 3v18h18M7 16l4-4 4 4 6-6",
      label: "Évolution",
      description: "Courbes de croissance et comparaisons période à période.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      label: "Activité",
      description: "Nombre de commandes, clients actifs, taux de conversion.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Paiements",
      description: "Suivi des encaissements et factures en attente.",
    },
    {
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
      label: "Clients actifs",
      description: "Rétention, fidélité et valeur client dans le temps.",
    },
    {
      icon: "M4 4v5h.582M19.938 11.22A8.001 8.001 0 0 0 5.17 5.538M20 20v-5h-.581M4.062 12.78A8.001 8.001 0 0 0 18.83 18.462",
      label: "Tendances",
      description: "Saisonnalité, pics d'activité et projections.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec des analytics intégrés.",
  beforeItems: [
    { label: "Revenus calculés à la main sur un tableur", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucune idée de la rentabilité par client", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Décisions au feeling, pas aux données", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Tendances invisibles, opportunités manquées", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Dashboard financier clair et à jour", icon: "M5 13l4 4L19 7" },
    { label: "Rentabilité visible par client et service", icon: "M5 13l4 4L19 7" },
    { label: "Décisions guidées par des vraies métriques", icon: "M5 13l4 4L19 7" },
    { label: "Tendances détectées, ajustements rapides", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Alimenté par",
  integrationTitleGradient: "toutes vos données.",
  integrationSubtitle:
    "Les analytics agrègent vos factures, commandes, clients et paiements — sans configuration.",
  integrationModules: [
    { label: "Facturation", icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z", color: "#22C55E" },
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Paiements", icon: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 10h20", color: "#10B981" },
  ],

  ctaTitle: "Enfin des chiffres",
  ctaTitleGradient: "qui parlent.",
  ctaSubtitle:
    "Tableaux de bord conçus pour les freelances. Lisibles, utiles, à jour — sans formule Excel.",
};

export default function AnalyticsPage() {
  return <FeaturePageLayout data={DATA} />;
}
