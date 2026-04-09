"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const DATA: FeaturePageData = {
  badge: "Portfolio & site vitrine",
  title: "Créez votre portfolio freelance",
  titleGradient: "et site vitrine en minutes.",
  subtitle:
    "Votre vitrine pro intégrée à votre activité. Pas besoin d'un outil de plus — votre site vit dans Jestly, relié à votre CRM, vos commandes et vos paiements.",
  videoLabel: "Voir le builder en action",
  useBuilderDemo: true,
  accentColor: "#FF8A3D",

  benefitsTitle: "Un site qui fait",
  benefitsTitleGradient: "partie de votre business.",
  benefits: [
    {
      icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
      title: "Intégré à votre activité",
      description:
        "Votre site se nourrit de vos données — services, portfolio, témoignages — sans ressaisie.",
    },
    {
      icon: "M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
      title: "Branding cohérent",
      description:
        "Couleurs, typo, mise en page : tout reflète votre identité sans bricoler trois outils.",
    },
    {
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138c.064.71.322 1.387.806 1.946a3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946A3.42 3.42 0 0 1 7.835 4.697Z",
      title: "Simple à maintenir",
      description:
        "Modifiez votre site comme un document. Pas de code, pas de thème WordPress cassé.",
    },
    {
      icon: "M18.36 6.64A9 9 0 1 1 5.64 18.36 9 9 0 0 1 18.36 6.64ZM15 9l-6 6M9 9l6 6",
      title: "Zéro outil en plus",
      description:
        "Plus de Wix, Squarespace ou Carrd en parallèle. Tout est dans Jestly.",
    },
  ],

  showcaseTitle: "Tout ce qu'un freelance",
  showcaseTitleGradient: "attend d'un site pro.",
  showcaseSubtitle:
    "Chaque section est pensée pour convertir vos visiteurs en clients.",
  showcaseItems: [
    {
      icon: "M3 9h18M9 21V9M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
      label: "Présentation",
      description: "Votre pitch, votre histoire, votre positionnement.",
    },
    {
      icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
      label: "Services",
      description: "Vos offres détaillées, avec tarifs et descriptions.",
    },
    {
      icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      label: "Portfolio",
      description: "Vos meilleurs projets, visuels et résultats.",
    },
    {
      icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6",
      label: "Offres",
      description: "Packs et formules claires pour vos clients.",
    },
    {
      icon: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z",
      label: "Contact",
      description: "Formulaire intégré, relié à votre CRM.",
    },
    {
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z",
      label: "Témoignages",
      description: "Les avis de vos clients, affichés avec élégance.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec votre site intégré.",
  beforeItems: [
    { label: "Site bricolé sur un outil séparé", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Branding incohérent entre site et factures", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Portfolio déconnecté de vos projets réels", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Identité éparpillée sur cinq plateformes", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Présence pro hébergée dans Jestly", icon: "M5 13l4 4L19 7" },
    { label: "Vitrine unifiée avec votre activité", icon: "M5 13l4 4L19 7" },
    { label: "Portfolio alimenté par vos vraies commandes", icon: "M5 13l4 4L19 7" },
    { label: "Un seul endroit pour tout montrer", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Connecté aux modules",
  integrationTitleGradient: "qui comptent.",
  integrationSubtitle:
    "Votre site s'alimente de vos données Jestly — pas de copier-coller.",
  integrationModules: [
    { label: "Portfolio", icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14", color: "#A855F7" },
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75", color: "#EC4899" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "Paiements", icon: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7ZM2 10h20", color: "#10B981" },
  ],

  ctaTitle: "Lancez un site",
  ctaTitleGradient: "qui travaille pour vous.",
  ctaSubtitle:
    "Plus propre qu'un Carrd, plus connecté qu'un WordPress. Votre vitrine freelance, enfin intégrée.",
};

const SEO_BLOCKS = [
  {
    heading: "Pourquoi créer un portfolio freelance professionnel ?",
    paragraphs: [
      "En freelance, votre portfolio est votre meilleur commercial. Avant de vous contacter, un prospect veut voir ce que vous avez déjà réalisé. Un portfolio bien construit montre votre expertise, votre style et votre fiabilité en quelques secondes. Sans portfolio, vous dépendez uniquement du bouche-à-oreille et des réseaux sociaux pour décrocher des missions.",
      "Le problème, c'est que créer un site vitrine freelance prend du temps. WordPress demande de la maintenance, Wix ou Squarespace ajoutent un abonnement supplémentaire, et votre portfolio vit déconnecté du reste de votre activité. Avec Jestly, votre site vitrine est intégré à votre espace de travail : vos projets, vos services, vos témoignages et votre formulaire de contact sont alimentés par les mêmes données que votre CRM et votre facturation.",
    ],
  },
  {
    heading: "Un site vitrine connecté à toute votre activité",
    paragraphs: [
      "La différence entre un portfolio Jestly et un site classique ? Tout est connecté. Quand vous terminez un projet et le marquez comme livré dans vos commandes, il peut alimenter votre portfolio. Quand un visiteur remplit votre formulaire de contact, le lead est automatiquement ajouté à votre CRM. Quand quelqu'un passe commande via votre site, elle apparaît dans votre tableau de bord.",
      "Votre site n'est pas un outil isolé — c'est la vitrine de tout votre business freelance. Services, tarifs, portfolio, témoignages et formulaire de contact : tout est mis à jour depuis un seul endroit, sans copier-coller entre cinq outils différents.",
    ],
  },
  {
    heading: "Comment créer un portfolio freelance qui convertit ?",
    paragraphs: [
      "Un bon portfolio freelance ne se contente pas de montrer de jolis visuels. Il doit raconter une histoire, montrer des résultats et faciliter le passage à l'action. Voici les éléments essentiels : une présentation claire de qui vous êtes et ce que vous faites, vos meilleurs projets avec contexte et résultats, vos services avec des tarifs transparents, des témoignages clients, et un formulaire de contact simple.",
      "Jestly inclut tous ces blocs dans son builder de site. Vous les assemblez en quelques minutes, sans toucher une ligne de code. Le design est professionnel par défaut — responsive, rapide, optimisé. Et votre site vit sous votre propre sous-domaine jestly.fr, ou votre domaine personnalisé.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "Comment créer un portfolio freelance gratuitement ?",
    answer: "Avec Jestly, vous pouvez créer un portfolio freelance professionnel gratuitement pendant la bêta. Inscrivez-vous, choisissez vos blocs (présentation, services, portfolio, témoignages, contact), personnalisez les couleurs et le contenu, et publiez. Aucune compétence technique requise.",
  },
  {
    question: "Quels éléments inclure dans un portfolio freelance ?",
    answer: "Un portfolio efficace contient : une présentation de votre expertise, vos meilleurs projets avec visuels et résultats, vos services et tarifs, des témoignages clients, et un moyen de vous contacter facilement. Jestly inclut tous ces blocs dans son builder.",
  },
  {
    question: "Jestly remplace-t-il Wix ou Squarespace pour les freelances ?",
    answer: "Oui, pour les freelances. Contrairement à Wix ou Squarespace qui sont des outils de site isolés, Jestly intègre votre site vitrine à votre CRM, facturation et gestion de commandes. Un seul outil au lieu de trois ou quatre abonnements séparés.",
  },
  {
    question: "Puis-je utiliser mon propre nom de domaine ?",
    answer: "Votre site est publié sur un sous-domaine jestly.fr par défaut (votrenom.jestly.fr). Le domaine personnalisé est prévu dans la roadmap. En attendant, le sous-domaine est professionnel et indexable par Google.",
  },
  {
    question: "Le site Jestly est-il optimisé pour le SEO et le mobile ?",
    answer: "Oui, les sites Jestly sont responsive (adaptés mobile, tablette et desktop) et leur HTML est rendu côté serveur, ce qui les rend crawlables par Google. Les métadonnées de base sont générées automatiquement.",
  },
];

export default function SiteWebPage() {
  return (
    <>
      <FeaturePageLayout data={DATA} />
      <SeoContentSection blocks={SEO_BLOCKS} />
      <FaqSeoSection
        title="Questions fréquentes sur le portfolio freelance"
        items={FAQ_ITEMS}
        accentColor="#FF8A3D"
      />
    </>
  );
}
