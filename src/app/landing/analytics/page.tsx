"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const DATA: FeaturePageData = {
  badge: "Tableau de bord freelance",
  title: "Tableau de bord freelance",
  titleGradient: "pour piloter votre activité.",
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

const SEO_BLOCKS = [
  {
    heading: "Pourquoi un tableau de bord quand on est freelance ?",
    paragraphs: [
      "La plupart des freelances naviguent à l'aveugle. Combien avez-vous facturé ce mois-ci ? Quel client génère le plus de revenus ? Votre activité est-elle en croissance ? Sans tableau de bord, ces questions restent sans réponse, et vos décisions se prennent au feeling plutôt qu'avec des données.",
      "Jestly Analytics transforme vos données d'activité en indicateurs lisibles. Revenus mensuels, commandes en cours, clients actifs, paiements en attente — tout est affiché dans un dashboard clair, mis à jour en temps réel. Vous pilotez votre activité freelance avec la même clarté qu'une entreprise structurée.",
    ],
  },
  {
    heading: "Des métriques pensées pour les freelances",
    paragraphs: [
      "Pas de vanity metrics ni de tableaux complexes. Jestly affiche les chiffres qui comptent pour un freelance : chiffre d'affaires (mensuel, trimestriel, annuel), nombre de commandes actives, taux de paiement, répartition par client et par service. Vous identifiez en un regard ce qui fonctionne et ce qui doit être ajusté.",
      "Les analytics sont alimentés automatiquement par vos commandes, factures et paiements. Zéro saisie manuelle, zéro formule Excel. Quand une facture est payée, le dashboard se met à jour. Quand une commande est créée, votre volume d'activité reflète la réalité instantanément.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "Quels indicateurs suivre quand on est freelance ?",
    answer: "Les indicateurs essentiels sont : le chiffre d'affaires mensuel, le nombre de commandes en cours, le délai moyen de paiement, le nombre de clients actifs et la répartition des revenus par service. Jestly calcule et affiche tous ces indicateurs automatiquement.",
  },
  {
    question: "Les analytics de Jestly remplacent-ils un tableur Excel ?",
    answer: "Oui, pour le suivi d'activité freelance. Jestly agrège automatiquement vos données de commandes, factures et paiements — sans formules à maintenir. Vous gagnez du temps et évitez les erreurs de saisie.",
  },
  {
    question: "Les données sont-elles mises à jour en temps réel ?",
    answer: "Oui, le tableau de bord se met à jour dès qu'une commande est créée, une facture envoyée ou un paiement reçu. Aucune action manuelle nécessaire.",
  },
  {
    question: "Puis-je exporter mes données analytics ?",
    answer: "Oui, Jestly permet d'exporter vos rapports en CSV et PDF. Idéal pour votre comptable ou pour vos bilans d'activité trimestriels.",
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <FeaturePageLayout data={DATA} />
      <SeoContentSection blocks={SEO_BLOCKS} />
      <FaqSeoSection
        title="Questions fréquentes sur le suivi d'activité freelance"
        items={FAQ_ITEMS}
        accentColor="#7C3AED"
      />
    </>
  );
}
