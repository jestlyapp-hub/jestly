"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const DATA: FeaturePageData = {
  badge: "CRM freelance",
  title: "CRM pour freelance",
  titleGradient: "simple et efficace.",
  subtitle:
    "Fini les contacts éparpillés entre DMs, mails et tableurs. Jestly regroupe vos prospects, clients actifs et historique dans un seul espace clair.",
  videoLabel: "Découvrir le CRM en action",
  useCrmDemo: true,
  accentColor: "#EC4899",

  benefitsTitle: "Un CRM pensé pour",
  benefitsTitleGradient: "les freelances qui avancent.",
  benefits: [
    {
      icon: "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z",
      title: "Visibilité totale",
      description:
        "Chaque prospect, chaque client, chaque échange — au même endroit.",
    },
    {
      icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      title: "Plus aucun oubli",
      description:
        "Les relances et suivis sont visibles. Personne ne passe entre les mailles.",
    },
    {
      icon: "M3 4h18M3 8h18M3 12h12M3 16h8",
      title: "Suivi lisible",
      description:
        "Prospect, en discussion, signé, terminé : chaque contact a un statut clair.",
    },
    {
      icon: "M9.663 17h4.673M12 3v1M6.343 7.343l.707.707M3 12h1M6.343 16.657l.707-.707M17.657 7.343l-.707.707M20 12h1M17.657 16.657l-.707-.707",
      title: "Charge mentale réduite",
      description:
        "Arrêtez de tout garder en tête. Jestly retient pour vous.",
    },
  ],

  showcaseTitle: "Tout ce qui compose",
  showcaseTitleGradient: "un suivi client efficace.",
  showcaseSubtitle:
    "Les informations essentielles, organisées pour agir vite.",
  showcaseItems: [
    {
      icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM3 20a6 6 0 0 1 12 0v1H3v-1Z",
      label: "Prospects",
      description: "Les contacts entrants, triés et qualifiés.",
    },
    {
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
      label: "Clients actifs",
      description: "Vos collaborations en cours, en un coup d'œil.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Statuts",
      description: "Prospect, signé, en cours, terminé — toujours à jour.",
    },
    {
      icon: "M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z",
      label: "Notes",
      description: "Contexte, préférences et détails importants sauvegardés.",
    },
    {
      icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9",
      label: "Relances",
      description: "Rappels visibles pour ne jamais perdre un deal.",
    },
    {
      icon: "M12 8v4l3 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z",
      label: "Historique",
      description: "Tout ce qui s'est passé avec un client, chronologiquement.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec un CRM intégré.",
  beforeItems: [
    { label: "Contacts dispersés dans les DMs et mails", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucun suivi structuré des prospects", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Relances oubliées, deals perdus", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucune vision claire du CA", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Chaque contact a sa fiche complète", icon: "M5 13l4 4L19 7" },
    { label: "CA visible et actionnable", icon: "M5 13l4 4L19 7" },
    { label: "Relances programmées, rien ne tombe", icon: "M5 13l4 4L19 7" },
    { label: "Historique clair par client", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Connecté à tout",
  integrationTitleGradient: "votre écosystème.",
  integrationSubtitle:
    "Vos clients sont reliés à leurs factures, commandes et interactions — automatiquement.",
  integrationModules: [
    { label: "Facturation", icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z", color: "#22C55E" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Site web", icon: "M3 9h18M9 21V9M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", color: "#FF8A3D" },
    { label: "Analytics", icon: "M3 3v18h18M7 16l4-4 4 4 6-6", color: "#7C3AED" },
  ],

  ctaTitle: "Suivez vos clients",
  ctaTitleGradient: "avec la clarté qu'ils méritent.",
  ctaSubtitle:
    "Un CRM qui ne ressemble pas à un tableur. Conçu pour les freelances qui veulent avancer sans friction.",
};

const SEO_BLOCKS = [
  {
    heading: "Pourquoi un CRM quand on est freelance ?",
    paragraphs: [
      "Quand on est freelance, on pense rarement à s'équiper d'un CRM. Les contacts s'accumulent dans les DMs Instagram, les conversations email, les groupes WhatsApp et quelques fichiers Excel. Résultat : des prospects oubliés, des relances manquées, et du chiffre d'affaires qui s'évapore sans même qu'on s'en rende compte.",
      "Un CRM pour freelance résout ce problème en centralisant tous vos contacts — prospects, clients actifs et anciens clients — dans un seul espace structuré. Chaque contact a sa fiche avec son historique complet : commandes passées, factures, notes, préférences. Vous savez exactement où vous en êtes avec chaque client, sans effort de mémoire.",
      "Mais la plupart des CRM du marché (HubSpot, Salesforce, Pipedrive) sont conçus pour des équipes commerciales avec des pipelines complexes. Trop de fonctionnalités, trop de configuration, trop cher. Jestly propose un CRM pensé spécifiquement pour les freelances : simple, connecté à votre facturation et vos commandes, sans superflu.",
    ],
  },
  {
    heading: "Centralisez vos prospects et clients en un seul endroit",
    paragraphs: [
      "Le CRM de Jestly fonctionne comme un carnet d'adresses intelligent. Chaque prospect qui vous contacte — via votre site Jestly, par email ou via les réseaux — est enregistré avec ses informations essentielles. Vous attribuez un statut clair : prospect, en discussion, signé, terminé. En un coup d'œil, vous voyez exactement combien de prospects sont dans votre pipeline et combien de clients actifs vous suivez.",
      "La force de Jestly, c'est que votre CRM ne vit pas en silo. Quand vous créez une commande pour un client, elle apparaît automatiquement dans sa fiche. Quand vous envoyez une facture, le statut de paiement est visible directement. Quand un prospect vous contacte via votre site vitrine Jestly, il est automatiquement ajouté à votre CRM. Zéro ressaisie, zéro perte d'information.",
    ],
  },
  {
    heading: "Suivez vos relances sans effort",
    paragraphs: [
      "La relance est souvent la partie la plus inconfortable du métier de freelance. On hésite, on repousse, et finalement le prospect est parti voir ailleurs. Un bon CRM freelance vous aide à structurer vos relances : vous voyez en un regard quels prospects n'ont pas donné de nouvelles, quels clients ont une facture en attente, et quels anciens clients pourraient être recontactés.",
      "Jestly rend les relances visibles et naturelles. Pas de workflow complexe à configurer : un simple système de statuts et de dates de suivi vous permet de ne jamais laisser un contact sans réponse. Le but n'est pas de transformer votre relation client en machine automatisée, mais de vous donner la visibilité nécessaire pour agir au bon moment.",
    ],
  },
  {
    heading: "Un CRM connecté à tout votre écosystème freelance",
    paragraphs: [
      "C'est la différence fondamentale entre Jestly et un CRM classique. Chez Jestly, le CRM n'est pas un outil isolé : il est connecté à votre facturation, vos commandes, votre site vitrine et vos analytics. Quand vous consultez la fiche d'un client, vous voyez son historique complet : toutes les commandes, toutes les factures, le chiffre d'affaires généré, les projets en cours.",
      "Cette vision à 360° vous permet de prendre de meilleures décisions commerciales. Vous identifiez vos meilleurs clients, vous repérez ceux qui ont besoin d'attention, et vous pilotez votre activité avec des données concrètes plutôt qu'avec votre mémoire. Le tout dans une interface épurée, inspirée de Notion, sans la complexité d'un CRM d'entreprise.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "Ai-je vraiment besoin d'un CRM en freelance ?",
    answer: "Dès que vous gérez plus de 5 à 10 clients simultanément, un CRM devient indispensable pour ne pas perdre de prospects et maintenir une relation professionnelle. Sans CRM, les contacts s'éparpillent entre les emails, DMs et fichiers — et les oublis coûtent cher. Jestly propose un CRM simple pensé pour les freelances, pas un outil d'entreprise surdimensionné.",
  },
  {
    question: "Quelle est la différence entre Jestly et HubSpot pour un freelance ?",
    answer: "HubSpot est un CRM puissant conçu pour des équipes commerciales avec des pipelines complexes. Pour un freelance, c'est souvent surdimensionné et coûteux. Jestly est conçu spécifiquement pour les freelances : CRM simple + facturation + commandes + site vitrine en un seul outil, sans complexité inutile.",
  },
  {
    question: "Comment ajouter des clients dans le CRM Jestly ?",
    answer: "Vous pouvez ajouter des clients manuellement en un clic, ou ils sont créés automatiquement quand quelqu'un passe commande via votre site vitrine Jestly. Chaque client a sa fiche complète avec ses coordonnées, son historique de commandes et ses factures.",
  },
  {
    question: "Le CRM de Jestly est-il gratuit ?",
    answer: "Oui, pendant la bêta, toutes les fonctionnalités de Jestly sont gratuites et illimitées : CRM complet, facturation, commandes, site vitrine, agenda et analytics. Aucune carte bancaire requise.",
  },
  {
    question: "Puis-je importer mes contacts existants dans Jestly ?",
    answer: "Vous pouvez créer vos contacts manuellement ou les ajouter au fil de l'eau lors de vos commandes. L'import CSV est prévu dans la roadmap. En attendant, chaque nouveau contact créé dans une commande ou via votre site est automatiquement ajouté au CRM.",
  },
];

export default function CrmPage() {
  return (
    <>
      <FeaturePageLayout data={DATA} />
      <SeoContentSection blocks={SEO_BLOCKS} />
      <FaqSeoSection
        title="Questions fréquentes sur le CRM freelance"
        items={FAQ_ITEMS}
        accentColor="#EC4899"
      />
    </>
  );
}
