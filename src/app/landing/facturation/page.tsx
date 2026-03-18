"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Facturation",
  title: "Pilotez devis, factures et relances",
  titleGradient: "sans vous éparpiller.",
  subtitle:
    "Créez, envoyez et suivez vos documents financiers depuis le même espace que vos clients et commandes. Plus de jonglage entre cinq outils.",
  videoLabel: "Voir la facturation en action",
  accentColor: "#22C55E",

  benefitsTitle: "La facturation qui ne",
  benefitsTitleGradient: "vous ralentit plus.",
  benefits: [
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      title: "Aucune facture oubliée",
      description:
        "Chaque commande peut générer son devis ou sa facture. Rien ne passe à travers.",
    },
    {
      icon: "M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1M15 13h6M18 10v6",
      title: "Documents soignés",
      description:
        "Devis et factures au look professionnel, avec votre branding et vos mentions légales.",
    },
    {
      icon: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z",
      title: "Visibilité sur les encours",
      description:
        "Sachez en un regard ce qui est en attente, payé ou en retard.",
    },
    {
      icon: "M4 4v5h.582M19.938 11.22A8.001 8.001 0 0 0 5.17 5.538M20 20v-5h-.581M4.062 12.78A8.001 8.001 0 0 0 18.83 18.462",
      title: "Relances automatisées",
      description:
        "Les rappels partent au bon moment. Vous gardez la relation, Jestly fait le suivi.",
    },
  ],

  showcaseTitle: "Chaque étape de",
  showcaseTitleGradient: "votre cycle financier.",
  showcaseSubtitle:
    "Du premier devis au dernier paiement — tout est tracé.",
  showcaseItems: [
    {
      icon: "M9 12h6M9 16h6M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-5-5ZM13 4v5h5",
      label: "Devis",
      description: "Envoyez des propositions claires et trackables.",
    },
    {
      icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z",
      label: "Factures",
      description: "Générées depuis vos commandes, prêtes à envoyer.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Statuts",
      description: "Brouillon, envoyé, payé, en retard — en temps réel.",
    },
    {
      icon: "M8 7V3M16 7V3M7 11h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      label: "Échéances",
      description: "Dates limites visibles, alertes avant retard.",
    },
    {
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9",
      label: "Relances",
      description: "Rappels envoyés au bon moment, sans gêne.",
    },
    {
      icon: "M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4",
      label: "Archives",
      description: "Historique complet pour votre comptabilité.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec la facturation intégrée.",
  beforeItems: [
    { label: "Factures faites sur Word ou un outil dédié", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Relances manuelles, souvent oubliées", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucun lien entre facture et commande", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Statuts de paiement flous", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Factures générées depuis vos commandes", icon: "M5 13l4 4L19 7" },
    { label: "Relances programmées et envoyées", icon: "M5 13l4 4L19 7" },
    { label: "Lien direct commande → facture → paiement", icon: "M5 13l4 4L19 7" },
    { label: "Tableau de bord financier lisible", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Relié à vos modules",
  integrationTitleGradient: "essentiels.",
  integrationSubtitle:
    "Facturation connectée à vos clients, commandes et encaissements — zéro ressaisie.",
  integrationModules: [
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Paiements", icon: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 10h20", color: "#10B981" },
    { label: "Analytics", icon: "M3 3v18h18M7 16l4-4 4 4 6-6", color: "#7C3AED" },
  ],

  ctaTitle: "Facturez mieux,",
  ctaTitleGradient: "encaissez plus vite.",
  ctaSubtitle:
    "Devis, factures, relances et suivi — dans un seul flux. Fini la paperasse éparpillée.",
};

export default function FacturationPage() {
  return <FeaturePageLayout data={DATA} />;
}
