/**
 * Source de vérité unique pour les questions/réponses FAQ.
 * Utilisée par la page (rendu visuel) ET par le layout (JSON-LD FAQPage).
 * Garder le contenu strictement aligné avec ce qui est affiché à l'écran.
 */
export interface FaqQA {
  question: string;
  answer: string;
}

export interface FaqCategory {
  title: string;
  items: FaqQA[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "Général",
    items: [
      {
        question: "Qu'est-ce que Jestly exactement ?",
        answer:
          "Jestly est un SaaS tout-en-un conçu pour les freelances créatifs. Il regroupe site vitrine, CRM, agenda, facturation, commandes, analytics, portfolio, paiements et briefs dans un seul outil — pour remplacer une dizaine d'abonnements séparés.",
      },
      {
        question: "À qui s'adresse Jestly ?",
        answer:
          "Aux freelances créatifs : monteurs vidéo, designers, illustrateurs, motion designers, créateurs de contenu, développeurs, consultants et petites agences qui veulent centraliser leur activité au lieu de jongler entre Notion, Trello, Stripe, Google Drive et Calendly.",
      },
      {
        question: "Comment je démarre concrètement ?",
        answer:
          "Vous créez votre compte gratuitement, vous suivez l'onboarding (5 étapes guidées), vous publiez votre site vitrine, et vous pouvez recevoir votre première commande payante en moins de 10 minutes.",
      },
      {
        question: "Pour quelles professions Jestly est-il vraiment optimisé ?",
        answer:
          "Jestly est optimisé pour les métiers créatifs et de service : monteurs, designers, motion designers, illustrateurs, photographes, développeurs, créateurs de contenu, consultants, coachs et petites agences. Les workflows et templates sont pensés pour ces profils.",
      },
    ],
  },
  {
    title: "Tarifs & bêta",
    items: [
      {
        question: "Est-ce que Jestly est gratuit ?",
        answer:
          "Oui. Jestly est actuellement en bêta gratuite : toutes les fonctionnalités sont accessibles sans carte bancaire. Les tarifs payants seront introduits progressivement à la sortie de la version stable, avec un plan gratuit conservé pour les usages légers.",
      },
      {
        question: "Faut-il une carte bancaire pour s'inscrire ?",
        answer:
          "Non. L'inscription est libre, sans carte bancaire et sans engagement. Vous créez votre compte en moins de 2 minutes et vous pouvez tout tester immédiatement.",
      },
      {
        question: "Comment fonctionne la bêta ?",
        answer:
          "Pendant la bêta, vous accédez à toutes les fonctionnalités gratuitement. Nous publions des mises à jour chaque semaine et nous prenons en compte vos retours via le centre d'aide et notre Discord.",
      },
      {
        question: "Y a-t-il une démo disponible ?",
        answer:
          "Oui. Vous pouvez consulter la page démo pour voir Jestly en action, et créer un compte gratuit pour tester l'environnement réel. Aucune carte bancaire n'est demandée.",
      },
    ],
  },
  {
    title: "Fonctionnalités",
    items: [
      {
        question: "Puis-je créer des devis et des factures avec Jestly ?",
        answer:
          "Oui. Le module Facturation permet d'émettre devis et factures, d'envoyer un lien de paiement Stripe, de suivre les statuts (envoyée, payée, en retard) et d'exporter en PDF. Vos numéros de facture sont incrémentés automatiquement.",
      },
      {
        question: "Puis-je créer mon site vitrine avec Jestly ?",
        answer:
          "Oui. Chaque compte dispose d'un sous-domaine prenom.jestly.fr et d'un éditeur visuel pour bâtir un site freelance avec portfolio, formulaires, prise de commandes et paiement en ligne — sans code et sans abonnement séparé.",
      },
      {
        question: "En quoi Jestly est-il différent de Notion ou Trello ?",
        answer:
          "Notion et Trello sont génériques : vous devez tout construire vous-même et ils n'incluent ni facturation, ni site, ni paiements. Jestly est livré préconfiguré pour les freelances créatifs avec facturation, CRM, site, commandes et paiements intégrés dès le premier jour.",
      },
      {
        question: "Puis-je importer mes clients et exporter mes données ?",
        answer:
          "Oui. Vous pouvez importer vos clients depuis un CSV et exporter à tout moment vos commandes, factures et clients au format CSV ou PDF. Vous restez propriétaire de vos données.",
      },
    ],
  },
  {
    title: "Sécurité, support & compte",
    items: [
      {
        question: "Mes données sont-elles sécurisées et conformes RGPD ?",
        answer:
          "Oui. Vos données sont hébergées en Europe sur Supabase (PostgreSQL chiffré au repos), protégées par Row Level Security au niveau base de données, et nous appliquons strictement le RGPD : droit d'accès, de rectification et de suppression sur simple demande.",
      },
      {
        question: "Quel support est proposé ?",
        answer:
          "Le support se fait par email (support@jestly.fr), via le centre d'aide intégré et sur notre Discord communautaire. Les utilisateurs bêta sont prioritaires et leurs demandes alimentent directement la roadmap.",
      },
      {
        question: "Puis-je me connecter avec Google ?",
        answer:
          "Oui. La connexion Google est disponible sur les pages d'inscription et de connexion. Vous pouvez aussi utiliser une adresse email classique avec mot de passe.",
      },
    ],
  },
];

/** Version aplatie pour le JSON-LD FAQPage. */
export const FAQ_QUESTIONS_FLAT: FaqQA[] = FAQ_CATEGORIES.flatMap((c) => c.items);
