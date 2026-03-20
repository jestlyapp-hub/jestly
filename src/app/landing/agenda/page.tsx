"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";

const DATA: FeaturePageData = {
  badge: "Agenda",
  title: "Planifiez rendez-vous et deadlines",
  titleGradient: "avec plus de clarté.",
  subtitle:
    "Un calendrier pensé pour les freelances. Vos rendez-vous, deadlines et tâches dans une vue unique — reliée à vos commandes et à vos clients.",
  videoLabel: "Voir l'agenda en action",
  useAgendaDemo: true,
  accentColor: "#4C8DFF",

  benefitsTitle: "Votre temps mérite",
  benefitsTitleGradient: "plus de visibilité.",
  benefits: [
    {
      icon: "M8 7V3M16 7V3M7 11h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z",
      title: "Vue d'ensemble sur votre temps",
      description:
        "Deadlines, RDV et tâches au même endroit — plus rien n'est invisible.",
    },
    {
      icon: "M13 10V3L4 14h7v7l9-11h-7Z",
      title: "Anticipation naturelle",
      description:
        "Voyez ce qui arrive et préparez-vous au lieu de subir les urgences.",
    },
    {
      icon: "M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0Z",
      title: "Rythme plus serein",
      description:
        "Planifiez à l'avance, évitez les semaines de rush et les trous vides.",
    },
    {
      icon: "M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5",
      title: "Calendrier connecté",
      description:
        "Les deadlines de vos commandes apparaissent automatiquement dans votre agenda.",
    },
  ],

  showcaseTitle: "Tout ce qui rythme",
  showcaseTitleGradient: "votre semaine de freelance.",
  showcaseSubtitle:
    "Plus qu'un calendrier — un cockpit pour votre temps.",
  showcaseItems: [
    {
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87",
      label: "Rendez-vous",
      description: "Meetings clients, calls et sessions de travail.",
    },
    {
      icon: "M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5Z",
      label: "Appels",
      description: "Appels planifiés avec rappels automatiques.",
    },
    {
      icon: "M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Deadlines",
      description: "Échéances de commandes visibles et alertées.",
    },
    {
      icon: "M4 6h16M4 10h16M4 14h16M4 18h16",
      label: "Disponibilités",
      description: "Bloquez vos créneaux libres et occupés.",
    },
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      label: "Tâches",
      description: "To-dos reliés à vos projets et commandes.",
    },
    {
      icon: "M3 9h18M9 21V9M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
      label: "Vue calendrier",
      description: "Jour, semaine, mois — la vue qui vous convient.",
    },
  ],

  beforeAfterTitle: "Avant Jestly vs.",
  beforeAfterTitleGradient: "avec un agenda connecté.",
  beforeItems: [
    { label: "Deadlines notées sur des post-its mentaux", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Rendez-vous éparpillés entre Google Cal et Notion", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Aucun lien entre tâches et commandes", icon: "M6 18L18 6M6 6l12 12" },
    { label: "Rush permanent faute de visibilité", icon: "M6 18L18 6M6 6l12 12" },
  ],
  afterItems: [
    { label: "Toutes vos échéances dans un seul calendrier", icon: "M5 13l4 4L19 7" },
    { label: "Deadlines commandes synchronisées", icon: "M5 13l4 4L19 7" },
    { label: "Disponibilités claires, rythme maîtrisé", icon: "M5 13l4 4L19 7" },
    { label: "Semaines planifiées, stress diminué", icon: "M5 13l4 4L19 7" },
  ],

  integrationTitle: "Synchronisé avec",
  integrationTitleGradient: "votre activité.",
  integrationSubtitle:
    "Vos deadlines de commandes et rendez-vous clients remontent automatiquement dans l'agenda.",
  integrationModules: [
    { label: "Commandes", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6", color: "#F59E0B" },
    { label: "CRM", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", color: "#EC4899" },
    { label: "Facturation", icon: "M9 14l6-6M9 8h.01M15 14h.01M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z", color: "#22C55E" },
  ],

  ctaTitle: "Reprenez le contrôle",
  ctaTitleGradient: "de votre temps.",
  ctaSubtitle:
    "Un agenda qui connaît votre activité. Planifiez mieux, respirez plus.",
};

export default function AgendaPage() {
  return <FeaturePageLayout data={DATA} />;
}
