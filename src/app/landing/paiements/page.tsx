"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Paiements",
  title: "Encaissez simplement",
  titleGradient: "avec une expérience plus fluide.",
  subtitle:
    "Suivez chaque paiement reçu, en attente ou en retard — directement relié à vos factures et clients. Plus de flou sur qui a payé quoi.",
  videoLabel: "Voir le suivi des paiements",
  accentColor: "#10B981",

  benefitsTitle: "Des paiements suivis",
  benefitsTitleGradient: "avec sérénité.",
  benefits: [
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      title: "Moins de friction",
      description:
        "Vos clients paient plus vite quand le processus est clair et professionnel.",
    },
    {
      icon: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z",
      title: "Suivi limpide",
      description:
        "Payé, en attente, en retard — le statut de chaque paiement est visible instantanément.",
    },
    {
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138c.064.71.322 1.387.806 1.946a3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946A3.42 3.42 0 0 1 7.835 4.697Z",
      title: "Expérience professionnelle",
      description:
        "Vos clients perçoivent un processus carré — ça inspire confiance.",
    },
    {
      icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z",
      title: "Tranquillité d'esprit",
      description:
        "Vous savez exactement ce qui est encaissé et ce qui reste à venir.",
    },
  ],

  showcaseTitle: "Tout ce qui compose",
  showcaseTitleGradient: "un suivi financier serein.",
  showcaseSubtitle:
    "Chaque euro est tracé, du devis au compte en banque.",
  showcaseItems: [
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Paiements reçus",
      description: "Encaissements confirmés, datés et attribués.",
    },
    {
      icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "En attente",
      description: "Ce qui a été facturé mais pas encore réglé.",
    },
    {
      icon: "M3 4h18M3 8h18M3 12h12M3 16h8",
      label: "Statuts",
      description: "Payé, partiel, en retard — statut clair par transaction.",
    },
    {
      icon: "M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101M10.172 13.828a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1",
      label: "Liens factures",
      description: "Chaque paiement est relié à sa facture d'origine.",
    },
    {
      icon: "M12 8v4l3 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z",
      label: "Historique",
      description: "Chronologie complète de tous vos encaissements.",
    },
    {
      icon: "M3 3v18h18M7 16l4-4 4 4 6-6",
      label: "Vue globale",
      description: "Tableau de bord avec totaux, moyennes et projections.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec un suivi de paiements intégré.",
  beforeItems: [
    { label: "Paiements suivis sur un tableur séparé", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucun lien entre facture et encaissement", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Retards de paiement découverts trop tard", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Impossible de savoir qui doit combien", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Chaque paiement relié à sa facture", icon: "M5 13l4 4L19 7" },
    { label: "Retards détectés et signalés automatiquement", icon: "M5 13l4 4L19 7" },
    { label: "Vue claire de la trésorerie en temps réel", icon: "M5 13l4 4L19 7" },
    { label: "Encours par client visible instantanément", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Connecté à votre",
  integrationTitleGradient: "chaîne financière.",
  integrationSubtitle:
    "Les paiements remontent depuis vos factures et se reflètent dans vos analytics — automatiquement.",
  integrationModules: [
    { label: "Facturation", icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z", color: "#22C55E" },
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Analytics", icon: "M3 3v18h18M7 16l4-4 4 4 6-6", color: "#7C3AED" },
  ],

  ctaTitle: "Encaissez plus vite,",
  ctaTitleGradient: "suivez sans effort.",
  ctaSubtitle:
    "Un suivi de paiements relié à vos factures et clients. Zéro tableur, zéro doute.",
};

export default function PaiementsPage() {
  return <FeaturePageLayout data={DATA} />;
}
