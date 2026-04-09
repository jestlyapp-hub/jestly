"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const DATA: FeaturePageData = {
  badge: "Gestion de commandes",
  title: "Gestion de commandes freelance",
  titleGradient: "structurée et efficace.",
  subtitle:
    "Transformez chaque demande client en commande structurée — avec brief, statut, livrables et suivi. Plus de briefs perdus dans les messages.",
  videoLabel: "Découvrir la gestion de commandes",
  useCommandesDemo: true,
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

const SEO_BLOCKS = [
  {
    heading: "Pourquoi structurer la gestion de vos commandes freelance ?",
    paragraphs: [
      "En freelance, chaque commande client est un projet à part entière. Le brief arrive par email, les fichiers par WeTransfer, les retours par DM Instagram, et la validation par texto. Résultat : vous passez plus de temps à chercher les informations qu'à produire. Sans système de gestion de commandes structuré, le chaos s'installe et votre professionnalisme en souffre.",
      "Jestly centralise tout le cycle de vie d'une commande : de la demande initiale au livrable final. Chaque commande a son brief, son statut, sa deadline, ses fichiers et son client associé. En un coup d'œil, vous savez exactement ce qui est en cours, ce qui est en retard et ce qui attend votre validation.",
    ],
  },
  {
    heading: "Du brief au livrable : un flux de travail clair",
    paragraphs: [
      "Avec Jestly, le processus est simple. Vous créez une commande, y associez un client, renseignez le brief et la deadline. Le statut évolue au fil du projet : nouveau, en cours, en révision, livré, payé. À chaque étape, vous et votre client savez où en est le projet. Les allers-retours sont réduits parce que le brief est clair dès le départ.",
      "Le vrai gain, c'est la connexion avec le reste de votre activité. Une commande livrée peut générer une facture en un clic. Le client est déjà dans votre CRM. La deadline apparaît dans votre agenda. Tout est relié sans ressaisie — c'est la puissance d'un outil de gestion freelance intégré.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "Comment organiser ses commandes quand on est freelance ?",
    answer: "L'idéal est d'utiliser un outil de gestion qui centralise chaque commande avec son brief, son statut et sa deadline. Jestly propose exactement cela : un flux structuré de la demande à la livraison, connecté à votre facturation et votre CRM.",
  },
  {
    question: "Jestly remplace-t-il Trello ou Notion pour gérer ses projets ?",
    answer: "Pour la gestion de commandes freelance, oui. Trello et Notion sont des outils généralistes qui nécessitent beaucoup de configuration. Jestly est pensé pour le workflow freelance : commande → brief → production → livraison → facturation, avec tout relié automatiquement.",
  },
  {
    question: "Puis-je gérer plusieurs commandes en même temps ?",
    answer: "Oui, Jestly gère les commandes multiples avec des statuts distincts, des deadlines et des priorités. Vous pouvez créer plusieurs commandes en lot et les suivre dans un tableau de bord centralisé.",
  },
  {
    question: "Les commandes sont-elles reliées à la facturation ?",
    answer: "Absolument. Chaque commande est reliée à un client et peut générer une facture. Quand le projet est livré et validé, vous facturez en un clic depuis la commande — le montant, le client et les détails sont déjà renseignés.",
  },
];

export default function CommandesPage() {
  return (
    <>
      <FeaturePageLayout data={DATA} />
      <SeoContentSection blocks={SEO_BLOCKS} />
      <FaqSeoSection
        title="Questions fréquentes sur la gestion de commandes freelance"
        items={FAQ_ITEMS}
        accentColor="#F59E0B"
      />
    </>
  );
}
