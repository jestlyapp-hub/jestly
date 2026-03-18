"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Commandes",
  title: "Gérez vos commandes et briefs",
  titleGradient: "dans un seul flux clair.",
  subtitle:
    "Transformez chaque demande client en commande structurée — avec brief, statut, livrables et suivi. Plus de briefs perdus dans les messages.",
  videoLabel: "Découvrir la gestion de commandes",
  accentColor: "#F59E0B",

  benefitsTitle: "Des briefs au livrable,",
  benefitsTitleGradient: "un seul chemin.",
  benefits: [
    {
      icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6M9 14l2 2 4-4",
      title: "Briefs structurés",
      description:
        "Chaque commande a son brief complet — fini les infos éparpillées dans cinq canaux.",
    },
    {
      icon: "M4 6h16M4 10h16M4 14h10M4 18h6",
      title: "Statuts en temps réel",
      description:
        "Nouveau, en cours, en révision, livré — vous et votre client savez où en est le projet.",
    },
    {
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z",
      title: "Moins d'allers-retours",
      description:
        "Le brief est clair dès le départ. Les modifications sont trackées, pas perdues.",
    },
    {
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138c.064.71.322 1.387.806 1.946a3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946A3.42 3.42 0 0 1 7.835 4.697Z",
      title: "Image plus pro",
      description:
        "Vos clients voient un processus structuré — pas un freelance qui improvise.",
    },
  ],

  showcaseTitle: "Tout ce qui compose",
  showcaseTitleGradient: "une commande bien gérée.",
  showcaseSubtitle:
    "De la demande initiale à la livraison finale — chaque étape est visible.",
  showcaseItems: [
    {
      icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
      label: "Briefs",
      description: "Le cahier des charges de chaque commande.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Statuts",
      description: "Progression en temps réel de chaque projet.",
    },
    {
      icon: "M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9M15 13l-3 3m0 0-3-3m3 3V8",
      label: "Livrables",
      description: "Fichiers et rendus associés à la commande.",
    },
    {
      icon: "M8 7V3M16 7V3M7 11h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      label: "Dates",
      description: "Deadline, date de début, jalons clés.",
    },
    {
      icon: "M12 8v4l3 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z",
      label: "Historique",
      description: "Timeline complète des actions sur la commande.",
    },
    {
      icon: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z",
      label: "Client associé",
      description: "Lien direct vers la fiche client et ses autres commandes.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec des commandes structurées.",
  beforeItems: [
    { label: "Briefs reçus par mail, DM, vocaux...", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Statut des projets flou et non suivi", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Livrables dispersés dans les conversations", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Allers-retours interminables sur le scope", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Un brief clair par commande, au même endroit", icon: "M5 13l4 4L19 7" },
    { label: "Statuts mis à jour en temps réel", icon: "M5 13l4 4L19 7" },
    { label: "Livrables rattachés à la bonne commande", icon: "M5 13l4 4L19 7" },
    { label: "Processus clair dès le premier échange", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Connecté à tout",
  integrationTitleGradient: "votre workflow.",
  integrationSubtitle:
    "Chaque commande est reliée au client, à la facture et au calendrier — automatiquement.",
  integrationModules: [
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Facturation", icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z", color: "#22C55E" },
    { label: "Portfolio", icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14", color: "#A855F7" },
    { label: "Agenda", icon: "M8 7V3M16 7V3M7 11h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z", color: "#4C8DFF" },
  ],

  ctaTitle: "Transformez les briefs flous",
  ctaTitleGradient: "en projets maîtrisés.",
  ctaSubtitle:
    "Un flux clair de la demande à la livraison. Vos clients verront la différence.",
};

export default function CommandesPage() {
  return <FeaturePageLayout data={DATA} />;
}
