"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Briefs & Produits",
  title: "Créez un brief, associez-le à un produit,",
  titleGradient: "recevez tout automatiquement.",
  subtitle:
    "Fini les allers-retours par email. Le client achète, remplit le brief, et vous avez toutes les infos pour travailler — dès la première seconde.",
  videoLabel: "Créer un brief et l'associer à un produit",
  useBriefsDemo: true,
  accentColor: "#F97316",

  benefitsTitle: "Des commandes claires",
  benefitsTitleGradient: "dès le premier jour.",
  benefits: [
    {
      icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6",
      title: "Brief automatique",
      description:
        "Le client remplit le questionnaire juste après l'achat. Zéro relance nécessaire.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      title: "Infos complètes dès le départ",
      description:
        "Titre du projet, description, deadline, fichiers, type — tout arrive avec la commande.",
    },
    {
      icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z",
      title: "Expérience client pro",
      description:
        "Votre client voit un formulaire propre et guidé, pas un email confus.",
    },
    {
      icon: "M12 8v4l3 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z",
      title: "Moins d'échanges, plus d'efficacité",
      description:
        "Chaque champ du brief remplace un email. Vous gagnez des heures par projet.",
    },
  ],

  showcaseTitle: "Tout ce qui compose",
  showcaseTitleGradient: "un brief intelligent.",
  showcaseSubtitle:
    "Chaque champ est pensé pour récolter exactement ce dont vous avez besoin.",
  showcaseItems: [
    {
      icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
      label: "Texte court",
      description: "Titre du projet, nom de marque, slogan.",
    },
    {
      icon: "M4 6h16M4 12h16M4 18h10",
      label: "Texte long",
      description: "Briefing créatif, description du besoin, contexte.",
    },
    {
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      label: "Date",
      description: "Deadline, date de livraison souhaitée.",
    },
    {
      icon: "M15.172 7l-6.586 6.586a2 2 0 1 0 2.828 2.828L18 9.828M15.172 7L18 4.172a2.828 2.828 0 1 1 4 4L18 12.172M15.172 7l2.828-2.828",
      label: "Upload fichiers",
      description: "Logos, photos, documents de référence.",
    },
    {
      icon: "M19 9l-7 7-7-7",
      label: "Liste déroulante",
      description: "Type de création, style préféré, format.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Choix multiple",
      description: "Options, fonctionnalités, préférences.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec les briefs automatiques.",
  beforeItems: [
    { label: "Relances par email pour avoir les infos", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Infos incomplètes, projets qui traînent", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Fichiers envoyés par WeTransfer, Slack, DM...", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucune structure, chaque commande est différente", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Brief rempli automatiquement après achat", icon: "M5 13l4 4L19 7" },
    { label: "Toutes les infos arrivent avec la commande", icon: "M5 13l4 4L19 7" },
    { label: "Fichiers centralisés dans le brief", icon: "M5 13l4 4L19 7" },
    { label: "Chaque commande suit le même format", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Connecté à tout",
  integrationTitleGradient: "votre workflow.",
  integrationSubtitle:
    "Le brief est relié à l'offre, à la commande et au client — tout est automatique.",
  integrationModules: [
    { label: "Offres", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", color: "#10B981" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Clients", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Site web", icon: "M3 9h18M9 21V9M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", color: "#7C5CFF" },
  ],

  ctaTitle: "Chaque commande arrive",
  ctaTitleGradient: "claire et structurée.",
  ctaSubtitle:
    "Créez vos briefs une fois, associez-les à vos offres, et recevez des commandes complètes — sans jamais relancer.",
};

export default function BriefsPage() {
  return <FeaturePageLayout data={DATA} />;
}
