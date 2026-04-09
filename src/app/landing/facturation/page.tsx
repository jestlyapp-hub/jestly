"use client";

import FeaturePageLayout from "@/components/landing/FeaturePageLayout";
import type { FeaturePageData } from "@/components/landing/FeaturePageLayout";
import SeoContentSection from "@/components/seo/SeoContentSection";
import FaqSeoSection from "@/components/seo/FaqSeoSection";

const DATA: FeaturePageData = {
  badge: "Facturation freelance",
  title: "Logiciel de facturation freelance",
  titleGradient: "simple et complet.",
  subtitle:
    "Créez devis et factures en quelques secondes, automatisez vos relances et suivez vos paiements. Tout est connecté à vos clients et commandes.",
  videoLabel: "Voir la facturation en action",
  useFacturationDemo: true,
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

const SEO_BLOCKS = [
  {
    heading: "Pourquoi utiliser un logiciel de facturation freelance ?",
    paragraphs: [
      "En tant que freelance, la facturation est une obligation légale incontournable. Chaque prestation doit faire l'objet d'une facture conforme, avec des mentions obligatoires précises : numéro de facture séquentiel, date d'émission, identité du prestataire et du client, description détaillée de la prestation, montant HT et TTC, conditions de paiement et pénalités de retard. Utiliser un logiciel de facturation freelance dédié garantit la conformité de chacun de vos documents, sans risque d'erreur manuelle.",
      "Au-delà de la conformité, un bon outil de facturation freelance vous fait gagner un temps considérable. Plutôt que de créer vos factures sur Word ou Excel — avec le risque d'oublier une mention, de perdre un fichier ou de sauter un numéro — un logiciel dédié automatise tout le processus. Numérotation séquentielle, calcul automatique des montants, envoi par email, suivi des paiements : tout est pris en charge.",
      "Jestly va encore plus loin en connectant votre facturation à l'ensemble de votre activité freelance. Vos factures sont générées directement depuis vos commandes, liées à vos fiches clients dans le CRM, et suivies dans votre tableau de bord financier. Vous ne jonglez plus entre cinq outils différents : tout est au même endroit.",
    ],
  },
  {
    heading: "Créez devis et factures en quelques secondes",
    paragraphs: [
      "Avec Jestly, créer un devis ou une facture prend moins d'une minute. Sélectionnez votre client (ou créez-le à la volée), ajoutez vos prestations avec leurs tarifs, et votre document est prêt. Le logiciel applique automatiquement vos informations légales, votre branding et les mentions obligatoires.",
      "Le système de numérotation séquentielle est géré automatiquement — impossible de créer un doublon ou de sauter un numéro. Vos documents sont toujours conformes aux exigences de l'administration fiscale française. Et grâce à la connexion directe avec vos commandes, vous pouvez transformer n'importe quel projet en facture en un clic.",
    ],
  },
  {
    heading: "Automatisez vos relances clients",
    paragraphs: [
      "Les retards de paiement sont le cauchemar de tout freelance. Selon les études, le délai moyen de paiement en France dépasse régulièrement les 30 jours. Relancer manuellement chaque client est chronophage et inconfortable. C'est là qu'un logiciel de facturation freelance avec relances automatisées fait toute la différence.",
      "Jestly vous permet de programmer vos rappels de paiement. Quand une échéance approche ou qu'une facture est en retard, le système envoie un rappel professionnel à votre client. Vous gardez une relation saine avec vos clients tout en vous assurant d'être payé à temps. Le tout sans y penser.",
    ],
  },
  {
    heading: "Suivez vos paiements et votre trésorerie",
    paragraphs: [
      "Savoir exactement combien vous avez facturé, combien a été payé et combien est en attente — c'est essentiel pour gérer votre activité freelance sereinement. Le tableau de bord financier de Jestly vous donne cette visibilité en temps réel : chiffre d'affaires du mois, factures en attente, montants en retard, tout est affiché clairement.",
      "Chaque facture a un statut visible : brouillon, envoyée, payée ou en retard. Vous pouvez filtrer par période, par client ou par statut pour retrouver n'importe quel document en quelques secondes. En fin d'année, l'export comptable vous simplifie la déclaration fiscale.",
    ],
  },
  {
    heading: "Pourquoi choisir Jestly pour votre facturation freelance ?",
    paragraphs: [
      "Contrairement aux logiciels de facturation classiques qui fonctionnent en silo, Jestly intègre la facturation dans un écosystème complet. Votre CRM, vos commandes, votre agenda, votre site vitrine et vos analytics sont tous connectés. Quand vous créez une commande pour un client, la facture correspondante est à portée de clic. Quand un paiement est reçu, votre tableau de bord se met à jour automatiquement.",
      "Jestly est conçu spécifiquement pour les freelances créatifs : designers, développeurs, vidéastes, consultants. L'interface est épurée, inspirée de Notion, sans la complexité d'un ERP. Pas de fonctions superflues, pas de menus interminables — juste l'essentiel pour facturer vite et bien. Et pendant la bêta, l'accès est 100 % gratuit, sans carte bancaire.",
    ],
  },
];

const FAQ_ITEMS = [
  {
    question: "Quel logiciel de facturation choisir quand on est freelance ?",
    answer: "Le meilleur logiciel de facturation freelance est celui qui s'intègre à votre façon de travailler. Jestly combine facturation, CRM, gestion de commandes et site vitrine en un seul outil. Vous n'avez plus besoin de jongler entre plusieurs abonnements. L'interface est simple, les factures sont conformes, et tout est connecté à vos clients et projets.",
  },
  {
    question: "Comment créer une facture conforme en freelance ?",
    answer: "Une facture freelance conforme doit contenir : un numéro unique et séquentiel, la date d'émission, l'identité du prestataire et du client, la description détaillée de la prestation, le montant HT et TTC, les conditions de paiement et les pénalités de retard. Avec Jestly, toutes ces mentions sont ajoutées automatiquement — vous n'avez qu'à renseigner la prestation et le montant.",
  },
  {
    question: "Un logiciel de facturation est-il obligatoire pour un freelance ?",
    answer: "La loi française n'impose pas l'utilisation d'un logiciel spécifique, mais elle exige des factures conformes avec des mentions obligatoires et une numérotation séquentielle inaltérable. En pratique, utiliser un logiciel de facturation certifié ou conforme est la meilleure façon de respecter ces obligations sans risque d'erreur. Jestly génère automatiquement des factures conformes.",
  },
  {
    question: "Jestly est-il gratuit pour la facturation freelance ?",
    answer: "Oui, pendant toute la phase bêta, Jestly est 100 % gratuit avec un accès complet à toutes les fonctionnalités : facturation illimitée, CRM, commandes, site vitrine, agenda et analytics. Aucune carte bancaire n'est requise. Inscrivez-vous et commencez à facturer en moins de 2 minutes.",
  },
  {
    question: "Puis-je envoyer des devis et des factures depuis Jestly ?",
    answer: "Absolument. Jestly vous permet de créer des devis professionnels et de les convertir en factures en un clic une fois le projet validé. Chaque document est personnalisé avec votre branding, vos mentions légales et vos conditions de paiement. Vous pouvez les envoyer par email directement depuis la plateforme et suivre leur statut en temps réel.",
  },
  {
    question: "Comment Jestly se compare-t-il à d'autres logiciels de facturation ?",
    answer: "Les logiciels de facturation classiques (Henrri, Freebe, Abby) se limitent à la facturation. Jestly intègre la facturation dans un écosystème complet : CRM, gestion de commandes, site vitrine, agenda et analytics. Vous remplacez 5 à 10 outils par un seul, avec toutes les données connectées entre elles.",
  },
];

export default function FacturationPage() {
  return (
    <>
      <FeaturePageLayout data={DATA} />
      <SeoContentSection blocks={SEO_BLOCKS} />
      <FaqSeoSection
        title="Questions fréquentes sur la facturation freelance"
        items={FAQ_ITEMS}
        accentColor="#22C55E"
      />
    </>
  );
}
