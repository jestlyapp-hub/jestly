import type {
  HelpArticle,
  HelpCategory,
  HelpFaqItem,
  HelpGuide,
} from "./types";

/* ─────────────────────────────────────────────
 * CATÉGORIES
 * ───────────────────────────────────────────── */

export const categories: HelpCategory[] = [
  {
    slug: "demarrage",
    title: "Démarrage",
    description:
      "Vos premiers pas sur Jestly : inscription, configuration et prise en main des modules essentiels.",
    icon: "🚀",
    articleSlugs: [],
    guideSlugs: [
      "creer-compte-configurer",
      "premiere-commande",
      "personnaliser-site",
    ],
    featured: true,
  },
  {
    slug: "commandes-projets",
    title: "Commandes & projets",
    description:
      "Créer, suivre, livrer et archiver vos commandes clients de A à Z.",
    icon: "📦",
    articleSlugs: [
      "creer-premier-projet",
      "comprendre-les-statuts-de-commande",
      "modifier-une-commande",
      "marquer-une-commande-comme-livree",
      "archiver-une-commande",
      "dupliquer-une-commande",
      "annuler-une-commande",
      "changer-une-echeance",
      "retrouver-une-commande-archivee",
      "ajouter-une-note-a-une-commande",
    ],
    guideSlugs: ["premiere-commande", "livrer-une-commande-complete"],
    featured: true,
  },
  {
    slug: "clients-crm",
    title: "Clients & CRM",
    description:
      "Gérer vos contacts, centraliser les informations et suivre l’historique de chaque client.",
    icon: "👥",
    articleSlugs: [
      "ajouter-un-client",
      "modifier-la-fiche-client",
      "retrouver-lhistorique-dun-client",
      "organiser-ses-notes-client",
      "quand-creer-un-client-avant-ou-apres-une-commande",
      "supprimer-un-client",
      "fusionner-deux-clients",
      "exporter-une-liste-de-clients",
      "importer-clients-csv",
    ],
    guideSlugs: ["gerer-plusieurs-clients"],
  },
  {
    slug: "facturation",
    title: "Facturation",
    description:
      "Émettre des factures, suivre les paiements et garder votre comptabilité sous contrôle.",
    icon: "💳",
    articleSlugs: [
      "creer-une-facture",
      "envoyer-une-facture",
      "suivre-le-statut-de-paiement",
      "exporter-ses-factures",
      "corriger-une-facture",
      "envoyer-un-rappel-de-paiement",
      "marquer-une-facture-comme-payee",
      "ajouter-une-remise",
      "ajouter-la-tva",
      "numerotation-factures",
    ],
    guideSlugs: ["envoyer-premiere-facture"],
    featured: true,
  },
  {
    slug: "site-vitrine",
    title: "Site vitrine & portfolio",
    description:
      "Personnaliser, publier et optimiser votre site vitrine Jestly et votre portfolio.",
    icon: "🌐",
    articleSlugs: [
      "personnaliser-sa-page-daccueil",
      "ajouter-ou-modifier-une-section",
      "publier-son-site",
      "connecter-son-domaine",
      "optimiser-son-portfolio",
      "ajouter-un-logo",
      "modifier-le-menu",
      "ajouter-une-page-contact",
      "changer-couleurs-typo",
    ],
    guideSlugs: ["personnaliser-site", "creer-site-client"],
  },
  {
    slug: "calendrier-taches",
    title: "Calendrier & tâches",
    description:
      "Organiser votre temps, planifier vos deadlines et suivre vos tâches quotidiennes.",
    icon: "🗓️",
    articleSlugs: [
      "ajouter-une-tache",
      "planifier-une-echeance",
      "organiser-sa-semaine",
      "suivre-ses-deadlines",
      "utiliser-calendrier-et-taches-ensemble",
    ],
  },
  {
    slug: "compte-parametres",
    title: "Mon compte & paramètres",
    description:
      "Gérer votre profil, votre abonnement, la sécurité de votre compte et le support.",
    icon: "⚙️",
    articleSlugs: [
      "modifier-son-profil",
      "gerer-son-abonnement",
      "securiser-son-compte",
      "changer-son-email-ou-mot-de-passe",
      "contacter-le-support",
      "resilier-abonnement",
      "supprimer-son-compte",
    ],
  },
];

/* ─────────────────────────────────────────────
 * PARCOURS RECOMMANDÉS
 * ───────────────────────────────────────────── */

export const parcours = [
  {
    slug: "demarrer-avec-jestly",
    title: "Démarrer avec Jestly",
    description:
      "Le chemin le plus court pour configurer votre compte et livrer votre premier projet.",
    icon: "🚀",
    guideSlugs: [
      "creer-compte-configurer",
      "demarrage-10-minutes",
      "premiere-commande",
    ],
  },
  {
    slug: "facturer-un-projet",
    title: "Facturer un projet",
    description:
      "Tout ce qu’il faut pour émettre, envoyer et suivre vos factures sans stress.",
    icon: "💳",
    guideSlugs: ["envoyer-premiere-facture", "livrer-une-commande-complete"],
  },
  {
    slug: "publier-votre-site",
    title: "Publier votre site",
    description:
      "De la personnalisation à la mise en ligne de votre vitrine professionnelle.",
    icon: "🌐",
    guideSlugs: ["personnaliser-site", "creer-site-client"],
  },
] as const;

/* ─────────────────────────────────────────────
 * GUIDES
 * ───────────────────────────────────────────── */

export const guides: HelpGuide[] = [
  {
    slug: "creer-compte-configurer",
    title: "Créer votre compte et configurer Jestly",
    excerpt:
      "Inscription, profil, paramétrage initial : tout ce qu’il faut savoir pour bien démarrer sur Jestly.",
    intro:
      "Un compte bien configuré, c’est la base de tout le reste : factures propres, site vitrine crédible, CRM utilisable. Ce guide vous accompagne dans les 4 étapes clés pour partir sur de bonnes fondations, en moins de 10 minutes.",
    checklist: [
      "Compte créé et e-mail confirmé",
      "Profil complet (nom, bio, photo)",
      "Informations légales renseignées",
      "Premier client ajouté",
      "Vous connaissez l’emplacement des modules principaux",
    ],
    duration: "10 min",
    audience: "Nouveaux utilisateurs",
    objective:
      "Avoir un compte Jestly fonctionnel, un profil complet et une vision claire des modules disponibles.",
    prerequisites: ["Une adresse e-mail valide"],
    steps: [
      {
        title: "Créer votre compte",
        description: [
          "Rendez-vous sur la page d’inscription de Jestly et renseignez votre adresse e-mail ainsi qu’un mot de passe sécurisé.",
          "Vérifiez votre e-mail pour confirmer l’adresse. Cette étape est nécessaire pour activer toutes les fonctionnalités.",
        ],
        tips: [
          "Utilisez un mot de passe unique avec au moins 12 caractères.",
          "Conservez votre e-mail de confirmation, certains liens y sont utiles plus tard.",
        ],
      },
      {
        title: "Compléter votre profil",
        description: [
          "Depuis votre tableau de bord, ouvrez la section Paramètres puis Profil.",
          "Ajoutez votre nom, votre activité, une photo et une courte bio. Ces informations sont utilisées par votre site vitrine et vos documents (factures, devis).",
        ],
        tips: [
          "Un profil complet augmente la crédibilité de votre site vitrine et la clarté de vos factures.",
        ],
      },
      {
        title: "Faire le tour des modules",
        description: [
          "Jestly regroupe plusieurs modules : Commandes, Clients, Facturation, Site vitrine, Calendrier et Paramètres.",
          "Parcourez rapidement chacun d’eux pour comprendre où se trouvent les actions principales.",
        ],
      },
      {
        title: "Configurer l’essentiel",
        description: [
          "Ajoutez votre premier client ou importez votre carnet d’adresses existant.",
          "Vérifiez les informations légales utilisées pour la facturation (nom, adresse, numéro de TVA si applicable).",
          "Activez votre site vitrine si vous souhaitez recevoir des briefs directement en ligne.",
        ],
      },
    ],
    commonMistakes: [
      "Sauter l’étape de vérification de l’e-mail.",
      "Laisser un profil vide : votre site vitrine et vos documents en pâtissent.",
      "Oublier de renseigner les informations légales avant d’envoyer la première facture.",
    ],
    nextSteps: [
      {
        label: "Créer votre première commande",
        href: "/centre-aide/guide/premiere-commande",
        description:
          "Passez à l’action avec votre premier projet client de bout en bout.",
      },
      {
        label: "Personnaliser votre site vitrine",
        href: "/centre-aide/guide/personnaliser-site",
        description: "Rendez votre site unique en quelques minutes.",
      },
    ],
    relatedArticleSlugs: [
      "modifier-son-profil",
      "securiser-son-compte",
      "contacter-le-support",
    ],
  },

  {
    slug: "premiere-commande",
    title: "Ajouter votre première commande",
    excerpt:
      "Créez, suivez et préparez la livraison d’une commande complète en suivant ces étapes.",
    intro:
      "Créer une commande dans Jestly, c’est formaliser un engagement avec votre client : périmètre, échéance, prix. Ce guide vous fait passer de « j’ai un nouveau projet » à « mon projet est suivi et prêt à être facturé ».",
    checklist: [
      "Commande créée avec titre clair",
      "Client rattaché",
      "Échéance définie",
      "Statut à jour",
      "Livraison effectuée",
      "Facture générée",
    ],
    duration: "8 min",
    audience: "Freelances qui démarrent un premier projet client",
    objective:
      "Gérer un projet client du brief à la livraison, en passant par le suivi et la facturation.",
    prerequisites: [
      "Avoir un compte Jestly configuré",
      "Au moins un client dans votre CRM (sinon, vous pourrez le créer en cours de route)",
    ],
    steps: [
      {
        title: "Créer la commande",
        description: [
          "Depuis le module Commandes, cliquez sur « Nouvelle commande ».",
          "Renseignez le titre du projet, la description et la date d’échéance souhaitée.",
        ],
        tips: [
          "Un titre clair facilite les recherches ultérieures dans votre pipeline.",
        ],
      },
      {
        title: "Rattacher un client",
        description: [
          "Sélectionnez un client existant depuis votre CRM ou créez-le à la volée si nécessaire.",
          "Les informations du client seront automatiquement reprises pour les documents liés (devis, factures).",
        ],
        links: [
          {
            label: "Ajouter un client",
            href: "/centre-aide/article/ajouter-un-client",
          },
        ],
      },
      {
        title: "Définir un statut et une échéance",
        description: [
          "Choisissez le statut initial (En attente, En cours, En revue…) pour refléter l’état du projet.",
          "Positionnez une échéance réaliste pour ne pas être débordé.",
        ],
        links: [
          {
            label: "Comprendre les statuts",
            href: "/centre-aide/article/comprendre-les-statuts-de-commande",
          },
        ],
      },
      {
        title: "Suivre l’avancement",
        description: [
          "Au fil du projet, mettez à jour le statut et ajoutez des notes internes pour documenter les échanges importants.",
          "Utilisez le calendrier pour ne pas manquer les jalons clés.",
        ],
      },
      {
        title: "Livrer et facturer",
        description: [
          "Une fois la commande terminée, marquez-la comme livrée et générez la facture correspondante depuis le module Facturation.",
        ],
        links: [
          {
            label: "Créer une facture",
            href: "/centre-aide/article/creer-une-facture",
          },
          {
            label: "Marquer une commande comme livrée",
            href: "/centre-aide/article/marquer-une-commande-comme-livree",
          },
        ],
      },
    ],
    commonMistakes: [
      "Oublier de rattacher un client : la facturation devient plus difficile.",
      "Laisser le statut « En attente » pendant toute la durée du projet.",
      "Créer une nouvelle commande à chaque micro-tâche au lieu d’utiliser des sous-étapes.",
    ],
    nextSteps: [
      {
        label: "Créer la facture associée",
        href: "/centre-aide/article/creer-une-facture",
      },
      {
        label: "Archiver une commande terminée",
        href: "/centre-aide/article/archiver-une-commande",
      },
    ],
    relatedArticleSlugs: [
      "creer-premier-projet",
      "comprendre-les-statuts-de-commande",
      "marquer-une-commande-comme-livree",
    ],
  },

  {
    slug: "personnaliser-site",
    title: "Personnaliser votre site vitrine",
    excerpt:
      "Adaptez votre site Jestly à votre identité en quelques minutes, puis publiez-le.",
    intro:
      "Votre site vitrine est le premier contact avec vos prospects. Un site générique envoie un signal de manque de soin. Ce guide vous aide à le rendre unique, cohérent avec votre identité et prêt à être partagé.",
    checklist: [
      "Éditeur ouvert et découvert",
      "Section d’accueil personnalisée",
      "Branding ajusté (couleurs, logo)",
      "Rendu mobile vérifié",
      "Site publié",
    ],
    duration: "15 min",
    audience: "Freelances qui veulent mettre en ligne leur vitrine rapidement",
    objective:
      "Obtenir un site vitrine à votre image, publié et prêt à recevoir vos premiers visiteurs.",
    prerequisites: ["Un compte Jestly actif"],
    steps: [
      {
        title: "Ouvrir l’éditeur du site",
        description: [
          "Depuis votre tableau de bord, rendez-vous dans le module Site vitrine.",
          "Cliquez sur « Modifier le site » pour accéder à l’éditeur par sections.",
        ],
      },
      {
        title: "Personnaliser les sections principales",
        description: [
          "Commencez par la section d’accueil : modifiez le titre, la description et l’image de fond pour refléter votre positionnement.",
          "Ajustez ensuite les sections « À propos », « Services » et « Portfolio » avec vos propres contenus.",
        ],
        tips: [
          "Privilégiez des phrases courtes et orientées bénéfices côté visiteur.",
        ],
        links: [
          {
            label: "Ajouter ou modifier une section",
            href: "/centre-aide/article/ajouter-ou-modifier-une-section",
          },
        ],
      },
      {
        title: "Ajuster votre branding",
        description: [
          "Depuis les paramètres du site, choisissez vos couleurs principales et votre typographie.",
          "Ajoutez votre logo et, si possible, une favicon pour renforcer la cohérence visuelle.",
        ],
      },
      {
        title: "Prévisualiser et publier",
        description: [
          "Utilisez la prévisualisation pour vérifier le rendu sur desktop et mobile.",
          "Quand vous êtes satisfait, cliquez sur « Publier ». Votre site est alors accessible via votre sous-domaine Jestly.",
        ],
        links: [
          {
            label: "Publier son site",
            href: "/centre-aide/article/publier-son-site",
          },
        ],
      },
    ],
    commonMistakes: [
      "Publier sans relire les textes par défaut.",
      "Oublier d’adapter la version mobile.",
      "Ne pas connecter de domaine personnalisé alors que l’image pro est importante.",
    ],
    nextSteps: [
      {
        label: "Connecter votre domaine",
        href: "/centre-aide/article/connecter-son-domaine",
      },
      {
        label: "Optimiser votre portfolio",
        href: "/centre-aide/article/optimiser-son-portfolio",
      },
    ],
    relatedArticleSlugs: [
      "personnaliser-sa-page-daccueil",
      "publier-son-site",
      "connecter-son-domaine",
    ],
  },

  /* ── Guide 4 : démarrage express ──────────── */
  {
    slug: "demarrage-10-minutes",
    title: "Démarrer avec Jestly en 10 minutes",
    excerpt:
      "Un onboarding éclair : compte, client, commande, livraison. Tout en 10 minutes chrono.",
    intro:
      "Vous n’avez pas le temps de lire tous les guides ? Celui-ci vous donne le strict nécessaire pour comprendre la boucle complète de Jestly en 10 minutes, sans fioritures.",
    duration: "10 min",
    audience: "Freelances pressés qui veulent voir rapidement si Jestly leur convient",
    objective:
      "Comprendre la boucle compte → client → commande → livraison en créant un projet test de bout en bout.",
    prerequisites: ["Une adresse e-mail valide"],
    steps: [
      {
        title: "Créer votre compte",
        description: [
          "Inscrivez-vous avec votre e-mail, validez la confirmation et connectez-vous.",
          "Ne vous attardez pas sur la configuration : vous y reviendrez.",
        ],
        screenshot: "Capture : écran d’inscription Jestly",
      },
      {
        title: "Ajouter un client test",
        description: [
          "Depuis le module Clients, cliquez sur « Nouveau client » et remplissez uniquement nom et e-mail. L’objectif est de tester, pas d’être exhaustif.",
        ],
        tips: ["Vous pourrez compléter la fiche plus tard."],
        links: [
          {
            label: "Ajouter un client",
            href: "/centre-aide/article/ajouter-un-client",
          },
        ],
      },
      {
        title: "Créer une commande test",
        description: [
          "Rendez-vous dans Commandes → Nouvelle commande. Associez votre client test et mettez une échéance à dans 3 jours.",
        ],
        screenshot: "Capture : formulaire de création d’une commande",
      },
      {
        title: "Ajouter une deadline",
        description: [
          "Vérifiez que la date d’échéance apparaît bien dans votre calendrier. C’est la garantie que vous ne l’oublierez pas.",
        ],
      },
      {
        title: "Marquer comme livrée",
        description: [
          "Une fois votre tour du produit terminé, passez la commande en « Livrée ». Vous venez de faire un tour complet de Jestly.",
        ],
      },
    ],
    checklist: [
      "Compte créé",
      "Un client dans le CRM",
      "Une commande créée",
      "Une échéance définie",
      "Une commande livrée",
    ],
    commonMistakes: [
      "Passer 20 minutes à peaufiner le profil avant d’avoir testé le produit.",
      "Ne jamais marquer la commande comme livrée : vous passez à côté du sentiment de boucle fermée.",
    ],
    nextSteps: [
      {
        label: "Créer votre compte et configurer Jestly",
        href: "/centre-aide/guide/creer-compte-configurer",
        description: "Configurez sérieusement votre espace après le test.",
      },
      {
        label: "Envoyer votre première facture",
        href: "/centre-aide/guide/envoyer-premiere-facture",
      },
    ],
    relatedArticleSlugs: [
      "creer-premier-projet",
      "ajouter-un-client",
      "marquer-une-commande-comme-livree",
    ],
  },

  /* ── Guide 5 : livrer de A à Z ────────────── */
  {
    slug: "livrer-une-commande-complete",
    title: "Livrer une commande de A à Z",
    excerpt:
      "Le workflow complet d’un projet client : de la création à la facturation, sans rien oublier.",
    intro:
      "Ce guide décrit le workflow idéal pour traiter un projet client sans rien rater : création, suivi, livraison, facturation et archivage. C’est la trame qui vous fera gagner en sérénité dès le deuxième client.",
    duration: "18 min",
    audience: "Freelances qui veulent un process reproductible pour chaque projet",
    objective:
      "Mettre en place un workflow reproductible qui couvre tout le cycle d’une commande.",
    prerequisites: [
      "Compte Jestly configuré",
      "Au moins un client dans votre CRM",
    ],
    steps: [
      {
        title: "Créer la commande",
        description: [
          "Titre clair, description précise du périmètre, prix estimé. La clarté en amont évite 80 % des malentendus.",
        ],
        screenshot: "Capture : formulaire de création d’une commande",
        links: [
          {
            label: "Créer votre premier projet",
            href: "/centre-aide/article/creer-premier-projet",
          },
        ],
      },
      {
        title: "Rattacher le client",
        description: [
          "Toujours relier la commande à une fiche client, même pour une mission one-shot. Cela prépare la facturation et l’historique.",
        ],
        commonMistakes: [
          "Laisser le champ client vide et devoir tout re-saisir plus tard.",
        ],
      },
      {
        title: "Définir une deadline réaliste",
        description: [
          "Prévoyez une marge pour les allers-retours client. Mieux vaut promettre moins et livrer avant que l’inverse.",
        ],
      },
      {
        title: "Suivre la progression",
        description: [
          "Mettez à jour le statut au fil du projet (En cours, En revue). Ajoutez des notes pour documenter les validations importantes.",
        ],
        tips: [
          "Prenez 2 minutes par jour pour mettre à jour le statut de vos commandes.",
        ],
      },
      {
        title: "Livrer le travail",
        description: [
          "Utilisez le canal convenu avec le client (e-mail, drive, lien de livraison). Une fois validé, passez la commande en « Livrée ».",
        ],
        screenshot: "Capture : statut livré sur une fiche commande",
        links: [
          {
            label: "Marquer une commande comme livrée",
            href: "/centre-aide/article/marquer-une-commande-comme-livree",
          },
        ],
      },
      {
        title: "Facturer immédiatement",
        description: [
          "Générez la facture dès la livraison, pendant que le projet est encore frais dans votre tête. Repousser = oublier.",
        ],
        links: [
          {
            label: "Envoyer votre première facture",
            href: "/centre-aide/guide/envoyer-premiere-facture",
          },
        ],
      },
      {
        title: "Archiver",
        description: [
          "Une fois la facture payée, archivez la commande pour garder votre pipeline propre sans perdre l’historique.",
        ],
      },
    ],
    checklist: [
      "Commande créée avec périmètre clair",
      "Client rattaché",
      "Deadline posée",
      "Statut tenu à jour",
      "Travail livré et validé",
      "Facture émise et envoyée",
      "Commande archivée une fois payée",
    ],
    commonMistakes: [
      "Oublier de facturer après la livraison.",
      "Archiver une commande avant d’avoir reçu le paiement.",
    ],
    nextSteps: [
      {
        label: "Envoyer votre première facture",
        href: "/centre-aide/guide/envoyer-premiere-facture",
      },
      {
        label: "Organiser votre semaine efficacement",
        href: "/centre-aide/guide/organiser-sa-semaine-guide",
      },
    ],
    relatedArticleSlugs: [
      "comprendre-les-statuts-de-commande",
      "marquer-une-commande-comme-livree",
      "archiver-une-commande",
      "creer-une-facture",
    ],
  },

  /* ── Guide 6 : première facture ──────────── */
  {
    slug: "envoyer-premiere-facture",
    title: "Envoyer votre première facture",
    excerpt:
      "Créez, envoyez et suivez votre première facture professionnelle en toute sérénité.",
    intro:
      "Envoyer sa première facture est un cap pour beaucoup de freelances. Ce guide vous accompagne pas à pas pour que tout soit propre et conforme, du premier essai jusqu’au suivi du paiement.",
    duration: "12 min",
    audience: "Freelances qui émettent une facture pour la première fois",
    objective:
      "Émettre une facture valide, l’envoyer à un client et suivre son paiement.",
    prerequisites: [
      "Compte Jestly configuré",
      "Informations légales renseignées",
      "Un client créé",
    ],
    steps: [
      {
        title: "Créer la facture",
        description: [
          "Depuis le module Facturation, cliquez sur « Nouvelle facture ». Sélectionnez le client et, si possible, la commande associée.",
        ],
        screenshot: "Capture : formulaire de nouvelle facture",
        links: [
          {
            label: "Créer une facture",
            href: "/centre-aide/article/creer-une-facture",
          },
        ],
      },
      {
        title: "Renseigner les lignes",
        description: [
          "Ajoutez une ligne par prestation avec une description claire, une quantité et un prix unitaire. Pensez à la TVA si vous êtes assujetti.",
        ],
        tips: [
          "Un libellé clair = moins de questions de la part du client = paiement plus rapide.",
        ],
        links: [
          {
            label: "Ajouter la TVA",
            href: "/centre-aide/article/ajouter-la-tva",
          },
        ],
      },
      {
        title: "Vérifier les mentions légales",
        description: [
          "Vérifiez nom, adresse, numéro SIRET et mention TVA (ou « TVA non applicable, art. 293 B du CGI » en franchise en base).",
        ],
        commonMistakes: [
          "Envoyer une facture sans les mentions légales obligatoires.",
        ],
      },
      {
        title: "Envoyer au client",
        description: [
          "Validez la facture puis cliquez sur « Envoyer ». Personnalisez le message pour qu’il ne ressemble pas à un envoi automatique froid.",
        ],
        screenshot: "Capture : écran d’envoi d’une facture",
        links: [
          {
            label: "Envoyer une facture",
            href: "/centre-aide/article/envoyer-une-facture",
          },
        ],
      },
      {
        title: "Suivre le paiement",
        description: [
          "Surveillez le statut de la facture. Si la date d’échéance est dépassée, envoyez un rappel poli.",
        ],
        links: [
          {
            label: "Envoyer un rappel de paiement",
            href: "/centre-aide/article/envoyer-un-rappel-de-paiement",
          },
          {
            label: "Marquer une facture comme payée",
            href: "/centre-aide/article/marquer-une-facture-comme-payee",
          },
        ],
      },
    ],
    checklist: [
      "Facture créée avec lignes claires",
      "Mentions légales vérifiées",
      "Facture envoyée",
      "Statut de paiement suivi",
      "Paiement encaissé et marqué",
    ],
    commonMistakes: [
      "Oublier d’envoyer la facture après sa création.",
      "Ne pas relancer à temps en cas de retard.",
    ],
    nextSteps: [
      {
        label: "Suivre le statut de paiement",
        href: "/centre-aide/article/suivre-le-statut-de-paiement",
      },
      {
        label: "Exporter vos factures",
        href: "/centre-aide/article/exporter-ses-factures",
      },
    ],
    relatedArticleSlugs: [
      "creer-une-facture",
      "envoyer-une-facture",
      "suivre-le-statut-de-paiement",
      "envoyer-un-rappel-de-paiement",
    ],
  },

  /* ── Guide 7 : organiser sa semaine ──────── */
  {
    slug: "organiser-sa-semaine-guide",
    title: "Organiser votre semaine efficacement",
    excerpt:
      "Un rituel simple pour prioriser, planifier et finir chaque semaine sans stress.",
    intro:
      "La différence entre un freelance débordé et un freelance serein ne tient pas au volume de travail, mais à la qualité de sa planification. Ce guide vous donne un rituel hebdo de 20 minutes qui fait toute la différence.",
    duration: "20 min",
    audience: "Freelances qui se sentent débordés ou perdent en visibilité",
    objective:
      "Mettre en place un rituel hebdomadaire pour prioriser les tâches et tenir vos deadlines.",
    steps: [
      {
        title: "Lister toutes vos tâches en cours",
        description: [
          "Ouvrez le module Calendrier & tâches et passez en revue tout ce qui est en cours. Ajoutez ce qui manque à la liste.",
        ],
        screenshot: "Capture : vue liste des tâches",
      },
      {
        title: "Prioriser",
        description: [
          "Classez chaque tâche en trois catégories : urgent, important, secondaire. Ne vous mentez pas : tout n’est pas urgent.",
        ],
        tips: ["Règle d’or : 3 priorités maximum par jour."],
      },
      {
        title: "Planifier dans le calendrier",
        description: [
          "Placez les priorités sur des créneaux précis. Un rendez-vous avec vous-même vaut autant qu’un rendez-vous client.",
        ],
        links: [
          {
            label: "Planifier une échéance",
            href: "/centre-aide/article/planifier-une-echeance",
          },
        ],
      },
      {
        title: "Bloquer du temps pour l’administratif",
        description: [
          "Réservez un créneau hebdomadaire pour la facturation et les relances. C’est ce créneau qui finance votre liberté.",
        ],
      },
      {
        title: "Faire un bilan le vendredi",
        description: [
          "Cinq minutes pour noter ce qui a été fait, ce qui glisse et ce qui doit passer en priorité la semaine prochaine.",
        ],
      },
    ],
    checklist: [
      "Tâches listées",
      "Priorités identifiées",
      "Créneaux planifiés",
      "Créneau admin bloqué",
      "Bilan hebdo fait",
    ],
    commonMistakes: [
      "Planifier 15 priorités dans la semaine : rien ne sera fait.",
      "Zapper le créneau facturation sous prétexte que « ce n’est pas urgent ».",
    ],
    nextSteps: [
      {
        label: "Suivre vos deadlines",
        href: "/centre-aide/article/suivre-ses-deadlines",
      },
    ],
    relatedArticleSlugs: [
      "organiser-sa-semaine",
      "suivre-ses-deadlines",
      "planifier-une-echeance",
      "utiliser-calendrier-et-taches-ensemble",
    ],
  },

  /* ── Guide 8 : créer un site client ──────── */
  {
    slug: "creer-site-client",
    title: "Créer un site client complet",
    excerpt:
      "Construisez un site vitrine complet prêt à impressionner vos prospects.",
    intro:
      "Ce guide va au-delà de la simple personnalisation : il vous aide à construire un site vitrine complet, avec toutes les pages essentielles, prêt à convertir un visiteur en client.",
    duration: "30 min",
    audience:
      "Freelances qui veulent un site vitrine complet et professionnel",
    objective:
      "Publier un site vitrine structuré avec toutes les pages essentielles.",
    prerequisites: ["Avoir suivi le guide « Personnaliser votre site vitrine »"],
    steps: [
      {
        title: "Construire la page d’accueil",
        description: [
          "Soignez le titre principal, la proposition de valeur et l’appel à l’action. Trois secondes suffisent à un visiteur pour décider s’il reste.",
        ],
        screenshot: "Capture : éditeur de la page d’accueil",
      },
      {
        title: "Ajouter une page À propos",
        description: [
          "Racontez votre parcours, vos valeurs et votre différence. Les clients achètent autant une personne qu’une prestation.",
        ],
      },
      {
        title: "Structurer vos services",
        description: [
          "Créez une section ou une page dédiée avec une description claire pour chaque prestation. Utilisez des titres simples et compréhensibles.",
        ],
      },
      {
        title: "Mettre en avant votre portfolio",
        description: [
          "Choisissez 6 à 10 projets qui correspondent aux missions que vous voulez attirer.",
        ],
        links: [
          {
            label: "Optimiser votre portfolio",
            href: "/centre-aide/article/optimiser-son-portfolio",
          },
        ],
      },
      {
        title: "Ajouter une page contact",
        description: [
          "Formulaire simple, e-mail visible, éventuellement un lien de prise de rendez-vous. Ne compliquez pas l’accès.",
        ],
        links: [
          {
            label: "Ajouter une page contact",
            href: "/centre-aide/article/ajouter-une-page-contact",
          },
        ],
      },
      {
        title: "Publier et partager",
        description: [
          "Vérifiez le rendu mobile, publiez, puis partagez le lien dans votre signature e-mail et vos réseaux pro.",
        ],
        links: [
          {
            label: "Publier son site",
            href: "/centre-aide/article/publier-son-site",
          },
          {
            label: "Connecter son domaine",
            href: "/centre-aide/article/connecter-son-domaine",
          },
        ],
      },
    ],
    checklist: [
      "Accueil optimisé",
      "Page À propos complète",
      "Services décrits",
      "Portfolio sélectionné",
      "Page contact en place",
      "Site publié",
    ],
    commonMistakes: [
      "Remplir le site de textes vagues façon « expert passionné ».",
      "Oublier la page contact.",
    ],
    nextSteps: [
      {
        label: "Connecter votre domaine",
        href: "/centre-aide/article/connecter-son-domaine",
      },
    ],
    relatedArticleSlugs: [
      "personnaliser-sa-page-daccueil",
      "ajouter-ou-modifier-une-section",
      "ajouter-un-logo",
      "modifier-le-menu",
      "ajouter-une-page-contact",
      "publier-son-site",
    ],
  },

  /* ── Guide 9 : gérer plusieurs clients ───── */
  {
    slug: "gerer-plusieurs-clients",
    title: "Gérer plusieurs clients efficacement",
    excerpt:
      "Organisez votre CRM pour rester clair et réactif, même avec 10 ou 20 clients actifs.",
    intro:
      "Au-delà de cinq clients actifs, la mémoire ne suffit plus. Ce guide vous aide à structurer votre CRM pour garder la tête froide et ne jamais laisser un client dans le flou.",
    duration: "15 min",
    audience: "Freelances avec plusieurs clients actifs en parallèle",
    objective:
      "Structurer votre CRM pour garder un suivi clair et réactif sur chaque client.",
    steps: [
      {
        title: "Compléter les fiches clients",
        description: [
          "Pour chaque client, vérifiez que le nom, l’e-mail, le téléphone et l’adresse de facturation sont renseignés. Une fiche incomplète est une source de friction.",
        ],
      },
      {
        title: "Ajouter des notes de contexte",
        description: [
          "Décisions importantes, préférences, contacts secondaires : tout ce qui vous ferait perdre du temps si vous l’oubliez doit être dans une note.",
        ],
        links: [
          {
            label: "Organiser ses notes client",
            href: "/centre-aide/article/organiser-ses-notes-client",
          },
        ],
      },
      {
        title: "Regrouper commandes et factures par client",
        description: [
          "Utilisez l’historique de chaque fiche client pour avoir une vue claire de ce qui est en cours, payé ou en attente.",
        ],
        links: [
          {
            label: "Retrouver l’historique d’un client",
            href: "/centre-aide/article/retrouver-lhistorique-dun-client",
          },
        ],
      },
      {
        title: "Identifier les clients à risque",
        description: [
          "Un client qui paie toujours en retard ou demande sans cesse des ajustements mérite une note. Prenez des décisions éclairées pour les missions futures.",
        ],
      },
      {
        title: "Faire le ménage trimestriellement",
        description: [
          "Tous les 3 mois, passez en revue votre liste : clients inactifs à archiver, informations obsolètes à mettre à jour, doublons à fusionner.",
        ],
        links: [
          {
            label: "Fusionner deux clients",
            href: "/centre-aide/article/fusionner-deux-clients",
          },
        ],
      },
    ],
    checklist: [
      "Fiches clients complètes",
      "Notes de contexte ajoutées",
      "Historique consulté régulièrement",
      "Clients à risque identifiés",
      "Ménage trimestriel effectué",
    ],
    commonMistakes: [
      "Utiliser son historique e-mail comme CRM.",
      "Ne jamais archiver les clients inactifs.",
    ],
    nextSteps: [
      {
        label: "Exporter votre liste de clients",
        href: "/centre-aide/article/exporter-une-liste-de-clients",
      },
    ],
    relatedArticleSlugs: [
      "ajouter-un-client",
      "retrouver-lhistorique-dun-client",
      "fusionner-deux-clients",
      "supprimer-un-client",
    ],
  },
];

/* ─────────────────────────────────────────────
 * ARTICLES — helper compact pour réduire la verbosité
 * ───────────────────────────────────────────── */

type ArticleSeed = Omit<HelpArticle, "updatedAt" | "readingTime"> & {
  updatedAt?: string;
  readingTime?: string;
};

const seed = (a: ArticleSeed): HelpArticle => ({
  updatedAt: a.updatedAt ?? "2026-04-01",
  readingTime: a.readingTime ?? "3 min",
  difficulty: a.difficulty ?? "Débutant",
  ...a,
});

export const articles: HelpArticle[] = [
  /* ── Commandes & projets ──────────────────── */
  seed({
    slug: "creer-premier-projet",
    title: "Créer votre premier projet",
    categorySlug: "commandes-projets",
    excerpt:
      "Démarrez un nouveau projet client en quelques clics depuis le module Commandes.",
    popular: true,
    featured: true,
    searchKeywords: ["commande", "projet", "nouveau", "créer"],
    sections: [
      {
        heading: "Ouvrir le module Commandes",
        body: [
          "Depuis votre tableau de bord, cliquez sur « Commandes » dans la navigation principale. Vous arrivez sur votre pipeline : une vue d’ensemble de tous vos projets en cours, triés par statut.",
        ],
      },
      {
        heading: "Créer la commande",
        body: [
          "Cliquez sur « Nouvelle commande » en haut à droite. Un formulaire apparaît avec les champs essentiels : titre du projet, client, description, date d’échéance et prix estimé.",
        ],
        bullets: [
          "Titre : court, explicite, recherchable",
          "Client : sélectionnez dans votre CRM ou créez-le à la volée",
          "Échéance : une vraie date pour éviter les oublis",
        ],
      },
      {
        heading: "Valider et suivre",
        body: [
          "Une fois enregistrée, la commande apparaît dans votre pipeline au statut initial. Vous pouvez la modifier, ajouter des notes ou changer son statut à tout moment.",
        ],
      },
    ],
    commonMistakes: [
      "Laisser le champ client vide : la facturation deviendra plus compliquée.",
      "Créer plusieurs commandes pour un même projet au lieu d’utiliser des étapes internes.",
    ],
    relatedArticleSlugs: [
      "comprendre-les-statuts-de-commande",
      "modifier-une-commande",
    ],
    relatedGuideSlugs: ["premiere-commande"],
  }),
  seed({
    slug: "comprendre-les-statuts-de-commande",
    title: "Comprendre les statuts de commande",
    categorySlug: "commandes-projets",
    excerpt:
      "Maîtrisez le cycle de vie d’une commande : de la réception à l’archivage.",
    popular: true,
    searchKeywords: ["statut", "pipeline", "cycle", "avancement"],
    sections: [
      {
        heading: "Les statuts par défaut",
        body: [
          "Chaque commande passe par plusieurs statuts qui reflètent son avancement. Les statuts disponibles peuvent varier selon votre configuration, mais les plus courants sont :",
        ],
        bullets: [
          "En attente : la commande est reçue mais n’a pas encore démarré",
          "En cours : vous êtes en train de travailler dessus",
          "En revue : le livrable est prêt et en attente de validation client",
          "Livrée : le projet est terminé et accepté",
          "Archivée : la commande est clôturée",
        ],
      },
      {
        heading: "Changer un statut",
        body: [
          "Ouvrez la commande concernée, puis utilisez le menu de statut en haut de la fiche. Le changement est instantané et visible dans le pipeline.",
        ],
      },
    ],
    relatedArticleSlugs: ["creer-premier-projet", "archiver-une-commande"],
  }),
  seed({
    slug: "modifier-une-commande",
    title: "Modifier une commande existante",
    categorySlug: "commandes-projets",
    excerpt:
      "Mettez à jour une commande en cours sans perdre l’historique des échanges.",
    searchKeywords: ["modifier", "éditer", "mettre à jour"],
    sections: [
      {
        heading: "Ouvrir la fiche de la commande",
        body: [
          "Depuis le module Commandes, cliquez sur la commande concernée pour afficher sa fiche détaillée.",
        ],
      },
      {
        heading: "Modifier les informations",
        body: [
          "Vous pouvez ajuster le titre, la description, l’échéance, le client ou le montant estimé. Les changements sont sauvegardés automatiquement ou après validation, selon les champs.",
        ],
      },
    ],
    commonMistakes: [
      "Supprimer une commande au lieu de la modifier : vous perdez l’historique.",
    ],
    relatedArticleSlugs: [
      "creer-premier-projet",
      "comprendre-les-statuts-de-commande",
    ],
  }),
  seed({
    slug: "marquer-une-commande-comme-livree",
    title: "Marquer une commande comme livrée",
    categorySlug: "commandes-projets",
    excerpt:
      "Clôturez proprement un projet terminé et enchaînez sur la facturation.",
    searchKeywords: ["livrée", "terminée", "clôturer"],
    sections: [
      {
        heading: "Changer le statut en « Livrée »",
        body: [
          "Depuis la fiche de la commande, choisissez le statut « Livrée ». Cette action signale que le travail est validé par le client.",
        ],
      },
      {
        heading: "Enchaîner sur la facturation",
        body: [
          "Une fois la commande livrée, générez la facture correspondante directement depuis la fiche. Vous gardez ainsi un lien clair entre projet et document comptable.",
        ],
      },
    ],
    relatedArticleSlugs: ["archiver-une-commande", "creer-une-facture"],
  }),
  seed({
    slug: "archiver-une-commande",
    title: "Archiver une commande",
    categorySlug: "commandes-projets",
    excerpt:
      "Rangez une commande terminée tout en gardant l’accès à son historique.",
    searchKeywords: ["archiver", "ranger", "terminé"],
    sections: [
      {
        heading: "Pourquoi archiver plutôt que supprimer",
        body: [
          "L’archivage conserve toutes les données (client, factures liées, notes) mais retire la commande de votre pipeline actif. C’est la meilleure option pour garder un historique propre.",
        ],
      },
      {
        heading: "Comment archiver",
        body: [
          "Ouvrez la fiche de la commande, puis choisissez l’action « Archiver ». Vous retrouverez la commande dans le filtre dédié aux commandes archivées.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "marquer-une-commande-comme-livree",
      "comprendre-les-statuts-de-commande",
    ],
  }),

  /* ── Clients & CRM ────────────────────────── */
  seed({
    slug: "ajouter-un-client",
    title: "Ajouter un client",
    categorySlug: "clients-crm",
    excerpt:
      "Créez une fiche client complète pour centraliser tous vos échanges et documents.",
    popular: true,
    searchKeywords: ["client", "crm", "nouveau", "ajouter"],
    sections: [
      {
        heading: "Ouvrir le module Clients",
        body: [
          "Depuis le tableau de bord, rendez-vous dans le module Clients (ou CRM selon votre interface).",
        ],
      },
      {
        heading: "Créer la fiche",
        body: [
          "Cliquez sur « Nouveau client » et renseignez au minimum le nom, l’e-mail et les informations utiles à la facturation.",
        ],
        bullets: [
          "Nom ou raison sociale",
          "E-mail principal",
          "Adresse de facturation",
          "Numéro de TVA si applicable",
        ],
      },
    ],
    commonMistakes: [
      "Oublier l’adresse de facturation : elle sera demandée plus tard au moment d’émettre la première facture.",
    ],
    relatedArticleSlugs: [
      "modifier-la-fiche-client",
      "retrouver-lhistorique-dun-client",
    ],
  }),
  seed({
    slug: "modifier-la-fiche-client",
    title: "Modifier la fiche d’un client",
    categorySlug: "clients-crm",
    excerpt:
      "Mettez à jour les coordonnées, la raison sociale ou les informations de facturation d’un client.",
    sections: [
      {
        heading: "Ouvrir la fiche",
        body: [
          "Depuis le module Clients, cliquez sur le client concerné. Vous accédez à l’ensemble des informations le concernant.",
        ],
      },
      {
        heading: "Éditer les champs",
        body: [
          "Cliquez sur « Modifier » puis ajustez les champs nécessaires. Les modifications s’appliquent aux futurs documents. Les documents déjà émis restent intacts.",
        ],
      },
    ],
    relatedArticleSlugs: ["ajouter-un-client", "organiser-ses-notes-client"],
  }),
  seed({
    slug: "retrouver-lhistorique-dun-client",
    title: "Retrouver l’historique d’un client",
    categorySlug: "clients-crm",
    excerpt:
      "Consultez d’un coup d’œil toutes les commandes, factures et notes liées à un client.",
    popular: true,
    sections: [
      {
        heading: "Ouvrir la fiche du client",
        body: [
          "Chaque fiche client regroupe l’ensemble des éléments associés : commandes, factures, notes et éventuellement documents.",
        ],
      },
      {
        heading: "Filtrer par type",
        body: [
          "Utilisez les onglets ou filtres en haut de la fiche pour afficher uniquement ce qui vous intéresse : uniquement les commandes, uniquement les factures, etc.",
        ],
      },
    ],
    relatedArticleSlugs: ["ajouter-un-client", "modifier-la-fiche-client"],
  }),
  seed({
    slug: "organiser-ses-notes-client",
    title: "Organiser ses notes client",
    categorySlug: "clients-crm",
    excerpt:
      "Centralisez vos échanges et décisions importantes dans les notes de chaque client.",
    sections: [
      {
        heading: "Ajouter une note",
        body: [
          "Depuis la fiche d’un client, ouvrez l’onglet Notes puis cliquez sur « Nouvelle note ». Saisissez votre contenu puis enregistrez.",
        ],
      },
      {
        heading: "Bonnes pratiques",
        body: [
          "Utilisez les notes pour documenter les décisions importantes : validation de devis, demandes particulières, points de vigilance. Elles vous feront gagner un temps précieux sur les projets longs.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "retrouver-lhistorique-dun-client",
      "modifier-la-fiche-client",
    ],
  }),
  seed({
    slug: "quand-creer-un-client-avant-ou-apres-une-commande",
    title: "Faut-il créer un client avant ou après une commande ?",
    categorySlug: "clients-crm",
    excerpt:
      "Découvrez la meilleure approche pour garder un CRM propre, même en cas de prospection.",
    sections: [
      {
        heading: "Les deux approches possibles",
        body: [
          "Jestly permet les deux : créer le client en amont, ou le créer à la volée depuis une commande. Le choix dépend de la maturité de la relation.",
        ],
      },
      {
        heading: "Notre recommandation",
        body: [
          "Pour un prospect récurrent ou un contact en phase de négociation, créez la fiche client en amont. Pour une mission one-shot rapide, créer le client au moment de la commande est suffisant.",
        ],
      },
    ],
    relatedArticleSlugs: ["ajouter-un-client", "creer-premier-projet"],
  }),

  /* ── Facturation ──────────────────────────── */
  seed({
    slug: "creer-une-facture",
    title: "Créer une facture",
    categorySlug: "facturation",
    excerpt:
      "Générez une facture professionnelle à partir d’une commande ou d’un client.",
    popular: true,
    featured: true,
    searchKeywords: ["facture", "créer", "émettre"],
    sections: [
      {
        heading: "Depuis le module Facturation",
        body: [
          "Ouvrez le module Facturation et cliquez sur « Nouvelle facture ». Choisissez le client concerné et, si disponible, rattachez-la à une commande existante.",
        ],
      },
      {
        heading: "Renseigner les lignes",
        body: [
          "Ajoutez les lignes de prestation avec description, quantité et prix unitaire. Les totaux et la TVA sont calculés automatiquement selon votre configuration.",
        ],
      },
      {
        heading: "Vérifier et valider",
        body: [
          "Relisez les informations légales (nom, adresse, numéro de TVA si applicable) puis validez la facture. Une fois validée, elle reçoit un numéro définitif et ne peut plus être modifiée librement.",
        ],
      },
    ],
    commonMistakes: [
      "Oublier de rattacher la facture à une commande : vous perdez le lien projet/document.",
      "Valider avec des informations légales incomplètes.",
    ],
    relatedArticleSlugs: [
      "envoyer-une-facture",
      "suivre-le-statut-de-paiement",
      "corriger-une-facture",
    ],
  }),
  seed({
    slug: "envoyer-une-facture",
    title: "Envoyer une facture à un client",
    categorySlug: "facturation",
    excerpt:
      "Transmettez votre facture par e-mail ou en téléchargement direct, en quelques clics.",
    popular: true,
    sections: [
      {
        heading: "Envoyer par e-mail",
        body: [
          "Depuis la fiche de la facture validée, cliquez sur « Envoyer ». L’e-mail du client est pré-rempli. Vous pouvez personnaliser le message avant l’envoi.",
        ],
      },
      {
        heading: "Télécharger le PDF",
        body: [
          "Si vous préférez transmettre la facture par un autre canal, téléchargez simplement le PDF depuis la fiche et envoyez-le manuellement.",
        ],
      },
    ],
    relatedArticleSlugs: ["creer-une-facture", "suivre-le-statut-de-paiement"],
  }),
  seed({
    slug: "suivre-le-statut-de-paiement",
    title: "Suivre le statut de paiement d’une facture",
    categorySlug: "facturation",
    excerpt:
      "Identifiez rapidement les factures payées, en attente ou en retard.",
    sections: [
      {
        heading: "Les statuts possibles",
        body: [
          "Une facture peut être En attente, Payée, En retard ou Annulée. Le module Facturation affiche ces statuts dans la liste principale.",
        ],
      },
      {
        heading: "Marquer comme payée",
        body: [
          "Lorsque vous recevez le paiement, ouvrez la facture et cliquez sur « Marquer comme payée ». Renseignez la date réelle de paiement si elle diffère.",
        ],
      },
    ],
    relatedArticleSlugs: ["envoyer-une-facture", "exporter-ses-factures"],
  }),
  seed({
    slug: "exporter-ses-factures",
    title: "Exporter vos factures",
    categorySlug: "facturation",
    excerpt:
      "Téléchargez vos factures en PDF ou CSV pour votre comptable ou vos archives.",
    sections: [
      {
        heading: "Export en PDF",
        body: [
          "Depuis la liste des factures, sélectionnez celles que vous voulez exporter et cliquez sur « Exporter en PDF ». Vous obtenez une archive prête à transmettre.",
        ],
      },
      {
        heading: "Export en CSV",
        body: [
          "Pour un traitement comptable, l’export CSV contient les informations clés : numéro, date, client, montant HT, TVA, montant TTC et statut.",
        ],
      },
    ],
    relatedArticleSlugs: ["creer-une-facture", "suivre-le-statut-de-paiement"],
  }),
  seed({
    slug: "corriger-une-facture",
    title: "Corriger une facture émise",
    categorySlug: "facturation",
    excerpt:
      "Apprenez à corriger une erreur tout en respectant vos obligations comptables.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "Le principe de l’avoir",
        body: [
          "Une facture validée ne peut pas être modifiée librement pour des raisons comptables. Pour corriger une erreur, vous devez émettre un avoir puis une nouvelle facture corrigée.",
        ],
      },
      {
        heading: "Créer un avoir",
        body: [
          "Depuis la facture à corriger, choisissez l’action « Créer un avoir ». L’avoir reprend les lignes en négatif. Enregistrez-le, puis créez une nouvelle facture correcte.",
        ],
      },
    ],
    commonMistakes: [
      "Supprimer une facture validée : interdit dans la plupart des contextes comptables.",
    ],
    relatedArticleSlugs: ["creer-une-facture", "suivre-le-statut-de-paiement"],
  }),

  /* ── Site vitrine ─────────────────────────── */
  seed({
    slug: "personnaliser-sa-page-daccueil",
    title: "Personnaliser votre page d’accueil",
    categorySlug: "site-vitrine",
    excerpt:
      "Adaptez le hero, le titre et les visuels de votre page d’accueil pour refléter votre identité.",
    popular: true,
    sections: [
      {
        heading: "Ouvrir l’éditeur",
        body: [
          "Depuis le module Site vitrine, cliquez sur « Modifier le site » puis sélectionnez la section d’accueil.",
        ],
      },
      {
        heading: "Modifier les contenus",
        body: [
          "Ajustez le titre principal, la description et l’image de fond. Une phrase d’accroche claire qui explique ce que vous proposez est plus efficace qu’un titre vague.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "ajouter-ou-modifier-une-section",
      "publier-son-site",
    ],
    relatedGuideSlugs: ["personnaliser-site"],
  }),
  seed({
    slug: "ajouter-ou-modifier-une-section",
    title: "Ajouter ou modifier une section",
    categorySlug: "site-vitrine",
    excerpt:
      "Structurez votre site en ajoutant de nouvelles sections ou en ajustant celles existantes.",
    sections: [
      {
        heading: "Ajouter une section",
        body: [
          "Dans l’éditeur du site, cliquez sur « Ajouter une section » et choisissez le type qui correspond à votre besoin : À propos, Services, Témoignages, Contact…",
        ],
      },
      {
        heading: "Réorganiser",
        body: [
          "Utilisez le glisser-déposer pour changer l’ordre des sections et contrôler la hiérarchie de lecture.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "personnaliser-sa-page-daccueil",
      "optimiser-son-portfolio",
    ],
  }),
  seed({
    slug: "publier-son-site",
    title: "Publier votre site",
    categorySlug: "site-vitrine",
    excerpt:
      "Mettez votre site en ligne et partagez son adresse avec vos futurs clients.",
    popular: true,
    sections: [
      {
        heading: "Prévisualiser avant publication",
        body: [
          "Avant de cliquer sur Publier, utilisez la prévisualisation pour vérifier que tous les textes, images et liens sont corrects sur desktop et mobile.",
        ],
      },
      {
        heading: "Publier",
        body: [
          "Dans l’éditeur, cliquez sur « Publier ». Votre site est immédiatement accessible via votre sous-domaine Jestly.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "connecter-son-domaine",
      "personnaliser-sa-page-daccueil",
    ],
  }),
  seed({
    slug: "connecter-son-domaine",
    title: "Connecter un nom de domaine personnalisé",
    categorySlug: "site-vitrine",
    excerpt:
      "Utilisez votre propre nom de domaine pour un rendu totalement professionnel.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "Ajouter le domaine dans Jestly",
        body: [
          "Dans les paramètres de votre site, renseignez le nom de domaine que vous souhaitez utiliser. Jestly vous indique les enregistrements DNS à configurer chez votre registrar.",
        ],
      },
      {
        heading: "Configurer les DNS",
        body: [
          "Rendez-vous chez votre fournisseur de domaine et ajoutez les enregistrements indiqués (généralement un A et/ou un CNAME). La propagation peut prendre de quelques minutes à plusieurs heures.",
        ],
      },
    ],
    commonMistakes: [
      "Oublier de configurer le sous-domaine www.",
      "Ne pas attendre la propagation DNS avant de tester.",
    ],
    relatedArticleSlugs: ["publier-son-site"],
  }),
  seed({
    slug: "optimiser-son-portfolio",
    title: "Optimiser votre portfolio",
    categorySlug: "site-vitrine",
    excerpt:
      "Présentez vos meilleures réalisations de manière claire et convaincante.",
    sections: [
      {
        heading: "Sélectionner les bons projets",
        body: [
          "Mieux vaut 6 projets excellents que 20 projets moyens. Choisissez des réalisations qui correspondent au type de missions que vous souhaitez attirer.",
        ],
      },
      {
        heading: "Soigner les descriptions",
        body: [
          "Pour chaque projet, ajoutez le contexte, votre rôle, les défis et les résultats. Les visiteurs cherchent à se projeter dans une future collaboration.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "ajouter-ou-modifier-une-section",
      "personnaliser-sa-page-daccueil",
    ],
  }),

  /* ── Calendrier & tâches ──────────────────── */
  seed({
    slug: "ajouter-une-tache",
    title: "Ajouter une tâche",
    categorySlug: "calendrier-taches",
    excerpt:
      "Créez rapidement une tâche et rattachez-la à un projet ou à un client.",
    sections: [
      {
        heading: "Créer la tâche",
        body: [
          "Depuis le module Calendrier & tâches, cliquez sur « Nouvelle tâche ». Renseignez un titre clair et une date d’échéance.",
        ],
      },
      {
        heading: "Rattacher au contexte",
        body: [
          "Si la tâche concerne un projet en cours, rattachez-la à la commande correspondante. Vous la retrouverez directement depuis la fiche du projet.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "planifier-une-echeance",
      "utiliser-calendrier-et-taches-ensemble",
    ],
  }),
  seed({
    slug: "planifier-une-echeance",
    title: "Planifier une échéance",
    categorySlug: "calendrier-taches",
    excerpt: "Posez des deadlines claires et visibles dans votre calendrier.",
    sections: [
      {
        heading: "Fixer une date d’échéance",
        body: [
          "Lors de la création d’une tâche ou d’une commande, définissez toujours une date d’échéance. Sans cette information, le risque d’oubli augmente significativement.",
        ],
      },
      {
        heading: "Visualiser dans le calendrier",
        body: [
          "Les échéances apparaissent automatiquement dans votre vue calendrier, ce qui vous donne une lecture claire de la charge des prochains jours.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "organiser-sa-semaine",
      "suivre-ses-deadlines",
    ],
  }),
  seed({
    slug: "organiser-sa-semaine",
    title: "Organiser votre semaine",
    categorySlug: "calendrier-taches",
    excerpt:
      "Adoptez une routine hebdomadaire pour garder le contrôle sur vos projets.",
    sections: [
      {
        heading: "Le rituel du lundi",
        body: [
          "Chaque lundi, prenez 15 minutes pour parcourir vos commandes en cours et vos tâches de la semaine. Cette routine évite 90 % des oublis.",
        ],
      },
      {
        heading: "Bloquer du temps dédié",
        body: [
          "Réservez dans votre calendrier des créneaux dédiés aux tâches récurrentes : facturation, relances, suivi client. Ce qui est planifié est fait.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "planifier-une-echeance",
      "utiliser-calendrier-et-taches-ensemble",
    ],
  }),
  seed({
    slug: "suivre-ses-deadlines",
    title: "Suivre vos deadlines",
    categorySlug: "calendrier-taches",
    excerpt: "Ne ratez plus une échéance grâce aux vues filtrées et alertes.",
    sections: [
      {
        heading: "Vue « à venir »",
        body: [
          "Utilisez la vue filtrée des tâches à venir pour identifier rapidement ce qui doit être traité cette semaine.",
        ],
      },
      {
        heading: "En cas de retard",
        body: [
          "Les tâches en retard sont mises en évidence. Prenez le réflexe de les traiter en priorité ou de les replanifier honnêtement.",
        ],
      },
    ],
    relatedArticleSlugs: ["organiser-sa-semaine", "ajouter-une-tache"],
  }),
  seed({
    slug: "utiliser-calendrier-et-taches-ensemble",
    title: "Utiliser calendrier et tâches ensemble",
    categorySlug: "calendrier-taches",
    excerpt:
      "Combinez les deux outils pour une vision claire du quoi et du quand.",
    sections: [
      {
        heading: "Tâches = quoi, calendrier = quand",
        body: [
          "Les tâches décrivent ce que vous devez faire. Le calendrier indique quand vous prévoyez de le faire. Les deux sont complémentaires.",
        ],
      },
      {
        heading: "Glisser-déposer",
        body: [
          "Vous pouvez déplacer facilement une tâche sur une autre date. Cela permet de replanifier sans perdre le contexte.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "organiser-sa-semaine",
      "suivre-ses-deadlines",
    ],
  }),

  /* ── Mon compte & paramètres ──────────────── */
  seed({
    slug: "modifier-son-profil",
    title: "Modifier votre profil",
    categorySlug: "compte-parametres",
    excerpt:
      "Mettez à jour votre nom, votre photo, votre bio et vos informations publiques.",
    sections: [
      {
        heading: "Accéder au profil",
        body: [
          "Depuis votre tableau de bord, ouvrez Paramètres puis Profil. Vous y trouvez l’ensemble des informations modifiables.",
        ],
      },
      {
        heading: "Mettre à jour les informations",
        body: [
          "Ajustez votre nom, votre bio et votre photo. Ces informations sont reprises dans votre site vitrine et certains de vos documents.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "changer-son-email-ou-mot-de-passe",
      "securiser-son-compte",
    ],
  }),
  seed({
    slug: "gerer-son-abonnement",
    title: "Gérer votre abonnement",
    categorySlug: "compte-parametres",
    excerpt:
      "Passez à un plan supérieur, changez de formule ou annulez depuis votre espace.",
    sections: [
      {
        heading: "Changer de formule",
        body: [
          "Dans Paramètres > Abonnement, sélectionnez la formule souhaitée. Le changement prend effet immédiatement ou à la prochaine échéance selon votre situation.",
        ],
      },
      {
        heading: "Annuler",
        body: [
          "Vous pouvez annuler votre abonnement à tout moment. Vos données restent accessibles pendant une période de grâce avant archivage.",
        ],
      },
    ],
    relatedArticleSlugs: ["modifier-son-profil", "contacter-le-support"],
  }),
  seed({
    slug: "securiser-son-compte",
    title: "Sécuriser votre compte",
    categorySlug: "compte-parametres",
    excerpt:
      "Adoptez les bonnes pratiques pour protéger votre compte Jestly.",
    sections: [
      {
        heading: "Mot de passe fort",
        body: [
          "Utilisez un mot de passe unique d’au moins 12 caractères, combinant lettres, chiffres et symboles. Un gestionnaire de mots de passe facilite grandement cette hygiène.",
        ],
      },
      {
        heading: "Authentification renforcée",
        body: [
          "Si disponible dans vos paramètres, activez la double authentification. Elle ajoute une couche de sécurité efficace face aux tentatives de phishing.",
        ],
      },
    ],
    relatedArticleSlugs: [
      "changer-son-email-ou-mot-de-passe",
      "contacter-le-support",
    ],
  }),
  seed({
    slug: "changer-son-email-ou-mot-de-passe",
    title: "Changer votre e-mail ou mot de passe",
    categorySlug: "compte-parametres",
    excerpt:
      "Mettez à jour vos identifiants de connexion en toute sécurité.",
    sections: [
      {
        heading: "Changer le mot de passe",
        body: [
          "Depuis Paramètres > Sécurité, cliquez sur « Modifier le mot de passe ». Vous devrez confirmer votre mot de passe actuel avant d’en saisir un nouveau.",
        ],
      },
      {
        heading: "Changer l’e-mail",
        body: [
          "Le changement d’adresse e-mail nécessite une confirmation par lien envoyé à la nouvelle adresse, pour s’assurer qu’elle vous appartient bien.",
        ],
      },
    ],
    relatedArticleSlugs: ["securiser-son-compte", "modifier-son-profil"],
  }),
  seed({
    slug: "contacter-le-support",
    title: "Contacter le support",
    categorySlug: "compte-parametres",
    excerpt:
      "Joignez l’équipe Jestly quand vous êtes bloqué ou que vous avez un doute.",
    popular: true,
    sections: [
      {
        heading: "Par e-mail",
        body: [
          "Écrivez-nous à support@jestly.fr en précisant votre question et, si possible, une capture d’écran. Vous recevrez une réponse sous 24 h en jours ouvrés.",
        ],
      },
      {
        heading: "Via la page contact",
        body: [
          "Vous pouvez également utiliser la page /contact pour nous joindre. N’hésitez pas à détailler votre situation : plus nous avons de contexte, plus nous sommes efficaces.",
        ],
      },
    ],
    relatedArticleSlugs: ["securiser-son-compte", "gerer-son-abonnement"],
  }),
];

/* ─────────────────────────────────────────────
 * ARTICLES V2.1 — lot d'enrichissement
 * ───────────────────────────────────────────── */

articles.push(
  /* ── Commandes ── */
  seed({
    slug: "dupliquer-une-commande",
    title: "Dupliquer une commande",
    categorySlug: "commandes-projets",
    excerpt:
      "Gagnez du temps en reproduisant une commande type au lieu de la recréer à la main.",
    sections: [
      {
        heading: "Quand dupliquer",
        body: [
          "Si vous avez des prestations récurrentes avec la même structure, la duplication est votre alliée. Elle reprend le titre, la description, les lignes et l’estimation.",
        ],
      },
      {
        heading: "Comment faire",
        body: [
          "Ouvrez la fiche de la commande à dupliquer, puis choisissez l’action « Dupliquer ». La nouvelle commande s’ouvre en mode brouillon, prête à être adaptée.",
        ],
      },
    ],
    commonMistakes: [
      "Oublier de modifier le client après duplication.",
      "Conserver l’ancienne date d’échéance par inadvertance.",
    ],
    relatedArticleSlugs: ["creer-premier-projet", "modifier-une-commande"],
  }),
  seed({
    slug: "annuler-une-commande",
    title: "Annuler une commande",
    categorySlug: "commandes-projets",
    excerpt:
      "Clôturez proprement une commande qui ne se fera finalement pas.",
    sections: [
      {
        heading: "Annulation côté projet",
        body: [
          "Depuis la fiche de la commande, utilisez l’action « Annuler » puis précisez la raison dans les notes. Cela conserve la trace sans polluer votre pipeline actif.",
        ],
      },
      {
        heading: "Impact sur la facturation",
        body: [
          "Si une facture a déjà été émise, vous devrez éventuellement créer un avoir. Consultez l’article dédié à la correction de facture.",
        ],
      },
    ],
    commonMistakes: [
      "Supprimer au lieu d’annuler : vous perdez l’historique.",
    ],
    relatedArticleSlugs: ["archiver-une-commande", "corriger-une-facture"],
  }),
  seed({
    slug: "changer-une-echeance",
    title: "Changer la date d’échéance d’une commande",
    categorySlug: "commandes-projets",
    excerpt:
      "Replanifiez une échéance sans perdre les notes et l’historique du projet.",
    sections: [
      {
        heading: "Modifier la date",
        body: [
          "Ouvrez la commande et cliquez sur la date d’échéance pour la modifier. Le changement se répercute immédiatement dans le calendrier.",
        ],
      },
      {
        heading: "Prévenir le client",
        body: [
          "Quand c’est vous qui décalez, prévenez le client en amont. Quand c’est lui, ajoutez une note datée dans la fiche pour garder trace.",
        ],
      },
    ],
    relatedArticleSlugs: ["modifier-une-commande", "planifier-une-echeance"],
  }),
  seed({
    slug: "retrouver-une-commande-archivee",
    title: "Retrouver une commande archivée",
    categorySlug: "commandes-projets",
    excerpt:
      "Accédez à l’historique de vos anciens projets en quelques clics.",
    sections: [
      {
        heading: "Activer le filtre archives",
        body: [
          "Depuis le module Commandes, utilisez le filtre « Archivées » pour afficher les commandes clôturées. Elles restent accessibles indéfiniment.",
        ],
      },
      {
        heading: "Désarchiver si besoin",
        body: [
          "Si vous devez reprendre le projet (par exemple pour un retour client), vous pouvez désarchiver la commande et la remettre dans le pipeline actif.",
        ],
      },
    ],
    relatedArticleSlugs: ["archiver-une-commande", "comprendre-les-statuts-de-commande"],
  }),
  seed({
    slug: "ajouter-une-note-a-une-commande",
    title: "Ajouter une note interne à une commande",
    categorySlug: "commandes-projets",
    excerpt:
      "Gardez trace des décisions et échanges importants sans encombrer vos e-mails.",
    sections: [
      {
        heading: "Pourquoi noter",
        body: [
          "Les notes internes documentent les validations, les points de vigilance et les décisions clés. Elles sont invisibles pour le client.",
        ],
      },
      {
        heading: "Comment ajouter une note",
        body: [
          "Ouvrez la fiche de la commande et utilisez l’onglet Notes. Saisissez un titre court et un contenu clair.",
        ],
      },
    ],
    relatedArticleSlugs: ["modifier-une-commande", "organiser-ses-notes-client"],
  }),

  /* ── Clients ── */
  seed({
    slug: "supprimer-un-client",
    title: "Supprimer un client",
    categorySlug: "clients-crm",
    excerpt:
      "Retirez définitivement une fiche client, dans le respect des données liées.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "Avant de supprimer",
        body: [
          "La suppression est définitive. Si des commandes ou factures sont rattachées au client, Jestly vous alertera. Archivez plutôt que de supprimer si vous avez un doute.",
        ],
      },
      {
        heading: "Procédure",
        body: [
          "Ouvrez la fiche du client, puis choisissez l’action « Supprimer ». Vous devrez confirmer l’opération.",
        ],
      },
    ],
    commonMistakes: [
      "Supprimer un client avec des factures liées non archivées.",
    ],
    relatedArticleSlugs: ["fusionner-deux-clients", "exporter-une-liste-de-clients"],
  }),
  seed({
    slug: "fusionner-deux-clients",
    title: "Fusionner deux fiches client en doublon",
    categorySlug: "clients-crm",
    excerpt:
      "Consolidez votre CRM en regroupant les doublons sans perdre d’historique.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "Identifier les doublons",
        body: [
          "Les doublons apparaissent souvent quand un même client est créé une fois par e-mail et une fois à la volée depuis une commande.",
        ],
      },
      {
        heading: "Fusionner",
        body: [
          "Depuis une des deux fiches, utilisez l’action « Fusionner » et sélectionnez le doublon. Jestly regroupe les commandes et factures sur la fiche principale.",
        ],
      },
    ],
    relatedArticleSlugs: ["supprimer-un-client", "ajouter-un-client"],
  }),
  seed({
    slug: "exporter-une-liste-de-clients",
    title: "Exporter votre liste de clients",
    categorySlug: "clients-crm",
    excerpt:
      "Téléchargez votre base clients au format CSV pour vos archives ou vos envois en masse.",
    sections: [
      {
        heading: "Lancer l’export",
        body: [
          "Depuis la liste des clients, utilisez l’action d’export. Vous obtenez un fichier CSV avec les champs principaux : nom, e-mail, téléphone, adresse.",
        ],
      },
      {
        heading: "Bonnes pratiques",
        body: [
          "Exportez régulièrement votre base pour disposer d’une sauvegarde hors-ligne. Stockez le fichier dans un dossier sécurisé.",
        ],
      },
    ],
    relatedArticleSlugs: ["importer-clients-csv", "supprimer-un-client"],
  }),
  seed({
    slug: "importer-clients-csv",
    title: "Importer des clients depuis un CSV",
    categorySlug: "clients-crm",
    excerpt:
      "Ajoutez rapidement votre base clients existante sans ressaisie manuelle.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "Préparer le fichier",
        body: [
          "Téléchargez le modèle CSV proposé par Jestly, puis remplissez les colonnes : nom, e-mail, adresse, etc. Respectez l’encodage UTF-8 pour éviter les problèmes d’accents.",
        ],
      },
      {
        heading: "Importer dans Jestly",
        body: [
          "Depuis le module Clients, utilisez l’option d’import et téléchargez votre fichier. Jestly vérifie les doublons avant la création.",
        ],
      },
    ],
    commonMistakes: [
      "Oublier l’encodage UTF-8 et se retrouver avec des accents cassés.",
    ],
    relatedArticleSlugs: ["ajouter-un-client", "exporter-une-liste-de-clients"],
  }),

  /* ── Facturation ── */
  seed({
    slug: "envoyer-un-rappel-de-paiement",
    title: "Envoyer un rappel de paiement",
    categorySlug: "facturation",
    excerpt:
      "Relancez un client en retard poliment et efficacement, sans mettre la relation en péril.",
    popular: true,
    sections: [
      {
        heading: "Quand relancer",
        body: [
          "Relancez dès le premier jour de retard. Un rappel courtois immédiat est beaucoup plus efficace qu’un rappel musclé envoyé trois semaines plus tard.",
        ],
      },
      {
        heading: "Envoyer depuis Jestly",
        body: [
          "Depuis la fiche de la facture en retard, cliquez sur « Relancer ». Un modèle courtois est pré-rempli, vous pouvez le personnaliser avant envoi.",
        ],
      },
    ],
    commonMistakes: [
      "Attendre trop longtemps avant la première relance.",
      "Envoyer un ton agressif dès la première relance.",
    ],
    relatedArticleSlugs: ["suivre-le-statut-de-paiement", "marquer-une-facture-comme-payee"],
  }),
  seed({
    slug: "marquer-une-facture-comme-payee",
    title: "Marquer une facture comme payée",
    categorySlug: "facturation",
    excerpt:
      "Enregistrez un paiement reçu pour garder votre comptabilité à jour.",
    sections: [
      {
        heading: "Lors de la réception du paiement",
        body: [
          "Ouvrez la facture concernée et cliquez sur « Marquer comme payée ». Renseignez la date réelle si elle diffère de la date de validation.",
        ],
      },
      {
        heading: "En cas de paiement partiel",
        body: [
          "Si le client paie en deux fois, enregistrez d’abord un paiement partiel puis le solde quand il arrive. Le statut suit automatiquement.",
        ],
      },
    ],
    relatedArticleSlugs: ["suivre-le-statut-de-paiement", "envoyer-un-rappel-de-paiement"],
  }),
  seed({
    slug: "ajouter-une-remise",
    title: "Ajouter une remise sur une facture",
    categorySlug: "facturation",
    excerpt:
      "Appliquez une remise commerciale en ligne ou globale sur une facture.",
    sections: [
      {
        heading: "Remise ligne par ligne",
        body: [
          "Dans la saisie des lignes de facture, vous pouvez ajuster le prix unitaire pour refléter une remise spécifique à une prestation.",
        ],
      },
      {
        heading: "Remise globale",
        body: [
          "Si la remise s’applique à toute la facture, utilisez le champ dédié en bas du récapitulatif. Précisez si la remise est en pourcentage ou en montant fixe.",
        ],
      },
    ],
    relatedArticleSlugs: ["creer-une-facture", "ajouter-la-tva"],
  }),
  seed({
    slug: "ajouter-la-tva",
    title: "Ajouter et configurer la TVA",
    categorySlug: "facturation",
    excerpt:
      "Paramétrez correctement la TVA selon votre statut fiscal.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "Si vous êtes assujetti",
        body: [
          "Indiquez votre taux de TVA applicable dans les paramètres de facturation. Il sera automatiquement appliqué à chaque nouvelle facture.",
        ],
      },
      {
        heading: "Si vous êtes en franchise en base",
        body: [
          "Activez la mention « TVA non applicable, art. 293 B du CGI » dans vos paramètres. Aucune TVA ne sera appliquée et la mention apparaîtra sur vos factures.",
        ],
      },
    ],
    commonMistakes: [
      "Facturer avec TVA alors qu’on est en franchise en base.",
      "Oublier la mention obligatoire.",
    ],
    relatedArticleSlugs: ["creer-une-facture", "ajouter-une-remise"],
  }),
  seed({
    slug: "numerotation-factures",
    title: "Comprendre la numérotation des factures",
    categorySlug: "facturation",
    excerpt:
      "Assurez-vous que votre numérotation est continue et conforme.",
    difficulty: "Intermédiaire",
    sections: [
      {
        heading: "La règle de continuité",
        body: [
          "La numérotation des factures doit être continue, sans rupture. Jestly gère cette continuité automatiquement pour vous.",
        ],
      },
      {
        heading: "Personnaliser le format",
        body: [
          "Vous pouvez choisir un format comme FACT-2026-001 dans les paramètres de facturation. Une fois défini, restez cohérent sur toute l’année fiscale.",
        ],
      },
    ],
    relatedArticleSlugs: ["creer-une-facture", "corriger-une-facture"],
  }),

  /* ── Site vitrine ── */
  seed({
    slug: "ajouter-un-logo",
    title: "Ajouter votre logo",
    categorySlug: "site-vitrine",
    excerpt:
      "Importez et positionnez votre logo dans l’en-tête de votre site.",
    sections: [
      {
        heading: "Importer le fichier",
        body: [
          "Depuis les paramètres du site, section Branding, téléchargez votre logo au format PNG ou SVG. Privilégiez un fond transparent pour un meilleur rendu.",
        ],
      },
      {
        heading: "Ajuster la taille",
        body: [
          "Après l’import, Jestly redimensionne automatiquement le logo. Vous pouvez ajuster manuellement si besoin.",
        ],
      },
    ],
    relatedArticleSlugs: ["changer-couleurs-typo", "personnaliser-sa-page-daccueil"],
  }),
  seed({
    slug: "modifier-le-menu",
    title: "Modifier le menu de navigation",
    categorySlug: "site-vitrine",
    excerpt:
      "Ajustez l’ordre et le contenu du menu principal de votre site vitrine.",
    sections: [
      {
        heading: "Réorganiser les entrées",
        body: [
          "Dans l’éditeur du site, ouvrez les paramètres de navigation. Utilisez le glisser-déposer pour réorganiser les entrées.",
        ],
      },
      {
        heading: "Ajouter ou retirer une entrée",
        body: [
          "Vous pouvez ajouter des liens vers vos pages internes ou des liens externes (réseaux sociaux, portfolio externe).",
        ],
      },
    ],
    relatedArticleSlugs: ["ajouter-un-logo", "ajouter-ou-modifier-une-section"],
  }),
  seed({
    slug: "ajouter-une-page-contact",
    title: "Ajouter une page contact",
    categorySlug: "site-vitrine",
    excerpt:
      "Donnez à vos prospects un moyen simple de vous joindre depuis votre site.",
    sections: [
      {
        heading: "Créer la page",
        body: [
          "Depuis l’éditeur du site, ajoutez une nouvelle page de type Contact. Elle inclut un formulaire prêt à l’emploi.",
        ],
      },
      {
        heading: "Configurer le formulaire",
        body: [
          "Choisissez les champs à afficher et l’adresse e-mail qui recevra les messages. Limitez le nombre de champs pour ne pas décourager les visiteurs.",
        ],
      },
    ],
    commonMistakes: [
      "Demander 15 champs dans le formulaire : le visiteur abandonne.",
    ],
    relatedArticleSlugs: ["modifier-le-menu", "publier-son-site"],
  }),
  seed({
    slug: "changer-couleurs-typo",
    title: "Changer les couleurs et la typographie",
    categorySlug: "site-vitrine",
    excerpt:
      "Adaptez la charte visuelle de votre site à votre identité en quelques clics.",
    sections: [
      {
        heading: "Choisir les couleurs",
        body: [
          "Dans les paramètres Branding, définissez votre couleur principale et votre couleur secondaire. Restez sur une palette restreinte pour un rendu pro.",
        ],
      },
      {
        heading: "Choisir la typographie",
        body: [
          "Sélectionnez une police pour les titres et une pour le corps de texte. L’association classique : une police forte pour les titres, une lisible pour le texte courant.",
        ],
      },
    ],
    commonMistakes: [
      "Utiliser 4 polices différentes.",
    ],
    relatedArticleSlugs: ["ajouter-un-logo", "personnaliser-sa-page-daccueil"],
  }),

  /* ── Compte ── */
  seed({
    slug: "resilier-abonnement",
    title: "Résilier votre abonnement",
    categorySlug: "compte-parametres",
    excerpt:
      "Arrêtez votre abonnement Pro tout en gardant l’accès à vos données.",
    sections: [
      {
        heading: "Procédure",
        body: [
          "Depuis Paramètres > Abonnement, cliquez sur « Résilier ». La résiliation prend effet à la fin de la période en cours. Vous conservez l’accès jusque-là.",
        ],
      },
      {
        heading: "Après la résiliation",
        body: [
          "Votre compte repasse en formule gratuite. Vos données restent accessibles. Vous pouvez reprendre un abonnement à tout moment.",
        ],
      },
    ],
    relatedArticleSlugs: ["gerer-son-abonnement", "supprimer-son-compte"],
  }),
  seed({
    slug: "supprimer-son-compte",
    title: "Supprimer votre compte Jestly",
    categorySlug: "compte-parametres",
    excerpt:
      "Supprimez définitivement votre compte et toutes vos données dans le respect du RGPD.",
    difficulty: "Avancé",
    sections: [
      {
        heading: "Avant de supprimer",
        body: [
          "La suppression est irréversible. Exportez vos clients, commandes et factures avant de lancer l’opération, pour garder une trace comptable si nécessaire.",
        ],
      },
      {
        heading: "Procédure",
        body: [
          "Depuis Paramètres > Sécurité, ouvrez la section « Supprimer le compte ». Confirmez avec votre mot de passe. Un délai de grâce peut s’appliquer avant effacement définitif.",
        ],
      },
    ],
    commonMistakes: [
      "Supprimer sans avoir exporté ses factures.",
    ],
    relatedArticleSlugs: ["resilier-abonnement", "exporter-ses-factures"],
  }),
);

/* ─────────────────────────────────────────────
 * FAQ homepage
 * ───────────────────────────────────────────── */

export const popularFaq: (HelpFaqItem & { articleSlug: string })[] = [
  {
    question: "Comment créer mon premier projet ?",
    answer:
      "Depuis le module Commandes, cliquez sur « Nouvelle commande », renseignez le client, la description et l’échéance, puis enregistrez.",
    articleSlug: "creer-premier-projet",
  },
  {
    question: "Comment envoyer une facture ?",
    answer:
      "Ouvrez la facture validée et cliquez sur « Envoyer ». Vous pouvez personnaliser le message avant l’envoi par e-mail.",
    articleSlug: "envoyer-une-facture",
  },
  {
    question: "Comment connecter mon domaine ?",
    answer:
      "Renseignez votre domaine dans les paramètres du site, puis ajoutez les enregistrements DNS indiqués chez votre registrar.",
    articleSlug: "connecter-son-domaine",
  },
  {
    question: "Comment exporter mes données ?",
    answer:
      "Chaque module dispose d’un export (PDF ou CSV) disponible depuis la liste principale.",
    articleSlug: "exporter-ses-factures",
  },
  {
    question: "Comment contacter le support ?",
    answer:
      "Écrivez-nous à support@jestly.fr ou via la page /contact. Nous répondons sous 24 h en jours ouvrés.",
    articleSlug: "contacter-le-support",
  },
  {
    question: "Comment modifier mon abonnement ?",
    answer:
      "Rendez-vous dans Paramètres > Abonnement pour changer de formule ou résilier à tout moment.",
    articleSlug: "gerer-son-abonnement",
  },
  {
    question: "Comment relancer un client en retard de paiement ?",
    answer:
      "Ouvrez la facture concernée et cliquez sur « Relancer ». Un modèle poli est pré-rempli, personnalisable avant l’envoi.",
    articleSlug: "envoyer-un-rappel-de-paiement",
  },
  {
    question: "Comment ajouter la TVA à mes factures ?",
    answer:
      "Paramétrez votre taux de TVA dans la configuration facturation. Jestly l’applique automatiquement à chaque nouvelle facture.",
    articleSlug: "ajouter-la-tva",
  },
  {
    question: "Comment organiser ma semaine efficacement ?",
    answer:
      "Listez vos tâches, priorisez-en trois par jour et bloquez un créneau hebdo pour l’administratif. Le guide dédié détaille ce rituel.",
    articleSlug: "organiser-sa-semaine",
  },
  {
    question: "Comment importer mes clients existants ?",
    answer:
      "Utilisez l’import CSV depuis le module Clients avec le modèle fourni par Jestly. L’opération prend moins de 5 minutes.",
    articleSlug: "importer-clients-csv",
  },
];
