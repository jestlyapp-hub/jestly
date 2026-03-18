"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Portfolio",
  title: "Présentez vos meilleurs projets",
  titleGradient: "avec une mise en scène premium.",
  subtitle:
    "Votre portfolio n'est plus un PDF ou un Behance oublié. Il vit dans votre site Jestly, se nourrit de vos projets et impressionne vos prospects.",
  videoLabel: "Voir le portfolio en action",
  accentColor: "#A855F7",

  benefitsTitle: "Un portfolio qui",
  benefitsTitleGradient: "fait le travail pour vous.",
  benefits: [
    {
      icon: "M5 3l14 9-14 9V3Z",
      title: "Image renforcée",
      description:
        "Montrez votre savoir-faire avec des visuels soignés et un storytelling structuré.",
    },
    {
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138c.064.71.322 1.387.806 1.946a3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946A3.42 3.42 0 0 1 7.835 4.697Z",
      title: "Crédibilité immédiate",
      description:
        "Des études de cas détaillées qui prouvent votre expertise, pas juste de jolies images.",
    },
    {
      icon: "M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
      title: "Cohérence totale",
      description:
        "Même design que votre site, mêmes couleurs, même ton — une marque unifiée.",
    },
    {
      icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      title: "Rendu premium",
      description:
        "Galeries, descriptions, résultats — chaque projet mérite une vraie mise en valeur.",
    },
  ],

  showcaseTitle: "Tout ce qui rend",
  showcaseTitleGradient: "votre travail irrésistible.",
  showcaseSubtitle:
    "Chaque projet est présenté avec le niveau de détail qui convainc.",
  showcaseItems: [
    {
      icon: "M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z",
      label: "Projets",
      description: "Vos réalisations, classées et mises en avant.",
    },
    {
      icon: "M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      label: "Visuels",
      description: "Images haute qualité, galeries et avant/après.",
    },
    {
      icon: "M4 6h16M4 12h16M4 18h10",
      label: "Descriptions",
      description: "Contexte, brief, approche et solution — raconté simplement.",
    },
    {
      icon: "M3 3v18h18M7 16l4-4 4 4 6-6",
      label: "Résultats",
      description: "Métriques et retours qui prouvent l'impact de votre travail.",
    },
    {
      icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 12V7a4 4 0 0 1 4-4Z",
      label: "Spécialités",
      description: "Tags et catégories pour filtrer par domaine.",
    },
    {
      icon: "M9 12h6M9 16h6M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-5-5ZM13 4v5h5",
      label: "Études de cas",
      description: "Pages détaillées pour vos projets phares.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec un portfolio intégré.",
  beforeItems: [
    { label: "Portfolio sur Behance, déconnecté du site", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Projets présentés sans contexte ni résultat", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Mise en page incohérente avec le reste", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Prospects obligés de quitter votre site", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Portfolio intégré à votre site Jestly", icon: "M5 13l4 4L19 7" },
    { label: "Études de cas avec brief, visuels et résultats", icon: "M5 13l4 4L19 7" },
    { label: "Design cohérent avec votre identité", icon: "M5 13l4 4L19 7" },
    { label: "Prospect convaincu sans quitter la page", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Connecté aux modules",
  integrationTitleGradient: "qui alimentent vos projets.",
  integrationSubtitle:
    "Vos commandes terminées peuvent devenir des cas portfolio en un clic.",
  integrationModules: [
    { label: "Site web", icon: "M3 9h18M9 21V9M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", color: "#FF8A3D" },
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
  ],

  ctaTitle: "Montrez votre travail",
  ctaTitleGradient: "comme il le mérite.",
  ctaSubtitle:
    "Un portfolio intégré, premium et alimenté par vos vrais projets. Vos prospects n'iront plus voir ailleurs.",
};

export default function PortfolioPage() {
  return <FeaturePageLayout data={DATA} />;
}
