"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import GuideStepCard from "@/components/guide/GuideStepCard";
import InteractiveTour from "@/components/guide/InteractiveTour";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Article {
  title: string;
  summary: string;
  steps?: string[];
  tips?: string[];
  troubleshoot?: { cause: string; fix: string }[];
}

interface Category {
  id: string;
  icon: string;
  label: string;
  description: string;
  color: string;
  articles: Article[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "start",
    icon: "\u{1F680}",
    label: "Bien d\u00e9marrer",
    description: "Premiers pas avec Jestly",
    color: "#4F46E5",
    articles: [
      {
        title: "Cr\u00e9er son premier site",
        summary: "Lancez votre site vitrine en quelques clics.",
        steps: [
          "Allez dans Site web depuis le menu lat\u00e9ral.",
          "Cliquez sur Nouveau site.",
          "Choisissez un template qui correspond \u00e0 votre activit\u00e9.",
          "Personnalisez le titre, les couleurs et le contenu.",
          "Cliquez sur Publier pour mettre votre site en ligne.",
        ],
        tips: [
          "Choisissez un template proche de votre activit\u00e9 pour gagner du temps.",
          "Vous pourrez toujours modifier le template apr\u00e8s publication.",
        ],
      },
      {
        title: "Comprendre le dashboard",
        summary: "D\u00e9couvrez l\u2019interface principale de Jestly.",
        steps: [
          "Le dashboard affiche un r\u00e9sum\u00e9 de votre activit\u00e9 : revenus, commandes, clients.",
          "Utilisez le menu lat\u00e9ral gauche pour naviguer entre les sections.",
          "La barre de recherche (Cmd+K) permet de trouver rapidement n\u2019importe quoi.",
          "Les notifications vous alertent des nouvelles commandes et messages.",
        ],
        tips: [
          "Le raccourci Cmd+K (ou Ctrl+K) ouvre la recherche globale depuis n\u2019importe quelle page.",
        ],
      },
      {
        title: "Publier son site",
        summary: "Rendez votre site accessible \u00e0 vos clients.",
        steps: [
          "Ouvrez votre site dans Site web.",
          "V\u00e9rifiez le contenu dans l\u2019\u00e9diteur visuel.",
          "Cliquez sur le bouton Publier en haut \u00e0 droite.",
          "Votre site est maintenant accessible \u00e0 l\u2019adresse prenom.jestly.fr.",
        ],
        tips: [
          "Vous pouvez configurer un domaine personnalis\u00e9 dans les param\u00e8tres du site.",
          "Chaque modification n\u00e9cessite de re-publier pour \u00eatre visible.",
        ],
      },
      {
        title: "Choisir un th\u00e8me",
        summary: "S\u00e9lectionnez le design qui vous correspond.",
        steps: [
          "Allez dans Site web > votre site > Design.",
          "Parcourez les templates disponibles.",
          "Cliquez sur un template pour le pr\u00e9visualiser.",
          "Confirmez pour l\u2019appliquer \u00e0 votre site.",
        ],
      },
      {
        title: "Modifier son premier bloc",
        summary: "Apprenez \u00e0 personnaliser le contenu de votre site.",
        steps: [
          "Ouvrez l\u2019\u00e9diteur de votre site (Site web > \u00c9diteur).",
          "Cliquez sur le bloc que vous souhaitez modifier.",
          "Le panneau d\u2019\u00e9dition s\u2019ouvre \u00e0 droite avec les options du bloc.",
          "Modifiez le texte, les images ou les param\u00e8tres.",
          "Les modifications sont sauvegard\u00e9es automatiquement.",
        ],
      },
    ],
  },
  {
    id: "builder",
    icon: "\u{1F3A8}",
    label: "Utiliser le Builder",
    description: "Construisez votre site bloc par bloc",
    color: "#7C3AED",
    articles: [
      {
        title: "Comment ajouter un bloc",
        summary: "Enrichissez votre site avec de nouveaux contenus.",
        steps: [
          "Ouvrez l\u2019\u00e9diteur de votre site.",
          "Cliquez sur le bouton + Ajouter un bloc.",
          "Parcourez les cat\u00e9gories : Hero, Portfolio, Services, Pricing, etc.",
          "Cliquez sur un bloc pour l\u2019ajouter \u00e0 votre page.",
          "Le bloc appara\u00eet \u00e0 la fin de la page \u2014 vous pouvez le repositionner.",
        ],
      },
      {
        title: "Comment modifier un bloc",
        summary: "Personnalisez chaque \u00e9l\u00e9ment de votre site.",
        steps: [
          "Cliquez sur le bloc dans l\u2019\u00e9diteur.",
          "Le panneau d\u2019\u00e9dition s\u2019ouvre \u00e0 droite.",
          "Modifiez le texte, les images, les couleurs et les options.",
          "Les changements s\u2019affichent en temps r\u00e9el dans la pr\u00e9visualisation.",
        ],
      },
      {
        title: "Comment supprimer un bloc",
        summary: "Retirez les sections dont vous n\u2019avez plus besoin.",
        steps: [
          "Survolez le bloc dans la liste de gauche.",
          "Cliquez sur l\u2019ic\u00f4ne de suppression (corbeille).",
          "Confirmez la suppression.",
        ],
        tips: [
          "La suppression est irr\u00e9versible. En cas de doute, vous pouvez masquer le bloc plut\u00f4t que le supprimer.",
        ],
      },
      {
        title: "Comment r\u00e9organiser les sections",
        summary: "Changez l\u2019ordre des blocs de votre page.",
        steps: [
          "Dans le panneau de gauche, glissez-d\u00e9posez les blocs pour les r\u00e9ordonner.",
          "L\u2019ordre dans le panneau correspond \u00e0 l\u2019ordre sur la page.",
          "Publiez pour appliquer le nouvel ordre.",
        ],
      },
      {
        title: "Blocs disponibles",
        summary: "D\u00e9couvrez tous les types de blocs que vous pouvez utiliser.",
        steps: [
          "Hero \u2014 La premi\u00e8re section visible avec titre, description et CTA.",
          "Portfolio \u2014 Pr\u00e9sentez vos projets et r\u00e9alisations.",
          "Services / Pricing \u2014 Affichez vos offres et tarifs.",
          "Testimonials \u2014 Montrez les avis de vos clients.",
          "Contact \u2014 Formulaire de contact int\u00e9gr\u00e9.",
          "FAQ \u2014 R\u00e9pondez aux questions fr\u00e9quentes.",
          "Gallery \u2014 Galerie d\u2019images de vos travaux.",
          "About \u2014 Pr\u00e9sentez-vous et votre parcours.",
        ],
      },
    ],
  },
  {
    id: "orders",
    icon: "\u{1F4E6}",
    label: "G\u00e9rer les commandes",
    description: "Suivez vos projets de A \u00e0 Z",
    color: "#0891B2",
    articles: [
      {
        title: "Cr\u00e9er une commande",
        summary: "Enregistrez un nouveau projet client.",
        steps: [
          "Allez dans Commandes depuis le menu.",
          "Cliquez sur + Nouvelle commande.",
          "S\u00e9lectionnez un client existant ou cr\u00e9ez-en un nouveau.",
          "Renseignez le titre, le montant et les d\u00e9tails.",
          "La commande est cr\u00e9\u00e9e avec le statut \u00c0 faire.",
        ],
      },
      {
        title: "Comprendre les statuts",
        summary: "Chaque commande suit un workflow clair.",
        steps: [
          "\u00c0 faire \u2014 La commande est accept\u00e9e mais pas encore commenc\u00e9e.",
          "Brief re\u00e7u \u2014 Le client a envoy\u00e9 ses consignes.",
          "En cours \u2014 Vous travaillez activement dessus.",
          "En review \u2014 En attente de validation client.",
          "Valid\u00e9 \u2014 Le client a approuv\u00e9 le livrable.",
          "Livr\u00e9 \u2014 Le projet est termin\u00e9 et envoy\u00e9.",
          "Factur\u00e9 \u2014 La facture a \u00e9t\u00e9 \u00e9mise.",
          "Pay\u00e9 \u2014 Le paiement a \u00e9t\u00e9 re\u00e7u.",
        ],
        tips: [
          "Utilisez le cercle \u00e0 gauche de chaque commande pour avancer rapidement au statut suivant.",
          "Les filtres en haut de la page permettent de voir les commandes par statut.",
        ],
      },
      {
        title: "Modifier une commande",
        summary: "Mettez \u00e0 jour les d\u00e9tails d\u2019une commande existante.",
        steps: [
          "Cliquez sur la commande dans la liste.",
          "Le panneau de d\u00e9tails s\u2019ouvre \u00e0 droite.",
          "Modifiez le titre, le montant, le statut ou les notes.",
          "Les modifications sont sauvegard\u00e9es automatiquement.",
        ],
      },
      {
        title: "Utiliser les filtres et le tri",
        summary: "Retrouvez rapidement vos commandes.",
        steps: [
          "Utilisez la barre de recherche pour chercher par titre ou client.",
          "Les onglets de statut filtrent les commandes par \u00e9tat.",
          "Cliquez sur les en-t\u00eates de colonnes pour trier.",
          "La s\u00e9lection multiple permet des actions group\u00e9es (archiver, supprimer).",
        ],
      },
      {
        title: "Supprimer une commande",
        summary: "Retirez les commandes annul\u00e9es ou en double.",
        steps: [
          "Cliquez sur le menu \u00b7\u00b7\u00b7 \u00e0 droite de la commande.",
          "S\u00e9lectionnez Supprimer.",
          "Confirmez la suppression dans la bo\u00eete de dialogue.",
        ],
        tips: [
          "Pr\u00e9f\u00e9rez le statut Annul\u00e9 \u00e0 la suppression pour garder un historique.",
        ],
      },
    ],
  },
  {
    id: "clients",
    icon: "\u{1F465}",
    label: "G\u00e9rer les clients",
    description: "Centralisez vos contacts",
    color: "#059669",
    articles: [
      {
        title: "Ajouter un client",
        summary: "Cr\u00e9ez une fiche client compl\u00e8te.",
        steps: [
          "Allez dans Clients depuis le menu.",
          "Cliquez sur + Nouveau client.",
          "Renseignez le nom, l\u2019email (optionnel), le t\u00e9l\u00e9phone et l\u2019entreprise.",
          "Ajoutez des tags et une note initiale si n\u00e9cessaire.",
          "Cliquez sur Cr\u00e9er le client.",
        ],
        tips: [
          "L\u2019email est optionnel mais recommand\u00e9 pour \u00e9viter les doublons.",
          "Les tags vous aident \u00e0 segmenter vos clients (vip, design, web...).",
        ],
      },
      {
        title: "Modifier un client",
        summary: "Mettez \u00e0 jour les informations d\u2019un client.",
        steps: [
          "Dans la liste clients, cliquez sur le menu \u00b7\u00b7\u00b7 du client.",
          "S\u00e9lectionnez Modifier.",
          "Modifiez les champs dans le panneau lat\u00e9ral.",
          "Cliquez sur Enregistrer.",
        ],
      },
      {
        title: "Archiver un client",
        summary: "Retirez un client de la liste active sans perdre l\u2019historique.",
        steps: [
          "Dans la liste clients, cliquez sur le menu \u00b7\u00b7\u00b7 du client.",
          "S\u00e9lectionnez Archiver.",
          "Confirmez l\u2019archivage.",
          "Le client est d\u00e9plac\u00e9 dans l\u2019onglet Archiv\u00e9s.",
        ],
        tips: [
          "L\u2019archivage conserve tout l\u2019historique (commandes, factures, notes).",
          "Vous pouvez restaurer un client archiv\u00e9 \u00e0 tout moment.",
        ],
      },
      {
        title: "Supprimer un client",
        summary: "Retirez d\u00e9finitivement un client.",
        steps: [
          "Dans le menu \u00b7\u00b7\u00b7 du client, s\u00e9lectionnez Supprimer.",
          "Tapez SUPPRIMER dans le champ de confirmation.",
          "Cliquez sur Supprimer d\u00e9finitivement.",
        ],
        tips: [
          "Les commandes et factures li\u00e9es sont conserv\u00e9es pour l\u2019historique.",
          "Pr\u00e9f\u00e9rez l\u2019archivage \u00e0 la suppression dans la plupart des cas.",
        ],
      },
      {
        title: "Voir l\u2019historique client",
        summary: "Consultez toute l\u2019activit\u00e9 d\u2019un client.",
        steps: [
          "Cliquez sur un client dans la liste.",
          "L\u2019onglet Vue d\u2019ensemble affiche les KPIs : revenus, commandes, panier moyen.",
          "L\u2019onglet Commandes liste toutes les commandes du client.",
          "L\u2019onglet Notes & Historique affiche la timeline compl\u00e8te.",
        ],
      },
    ],
  },
  {
    id: "payments",
    icon: "\u{1F4B3}",
    label: "Paiements",
    description: "Suivez vos revenus",
    color: "#D97706",
    articles: [
      {
        title: "Recevoir un paiement",
        summary: "Marquez une commande comme pay\u00e9e.",
        steps: [
          "Ouvrez la commande concern\u00e9e.",
          "Passez le statut \u00e0 Pay\u00e9.",
          "Le revenu est automatiquement comptabilis\u00e9 dans vos statistiques.",
        ],
      },
      {
        title: "G\u00e9rer les revenus",
        summary: "Suivez votre chiffre d\u2019affaires.",
        steps: [
          "Le dashboard affiche votre revenu total et mensuel.",
          "La section Analytics donne un d\u00e9tail par p\u00e9riode.",
          "Chaque fiche client montre le revenu g\u00e9n\u00e9r\u00e9 par ce client.",
        ],
      },
      {
        title: "Comprendre les factures",
        summary: "La facturation dans Jestly.",
        steps: [
          "Passez le statut d\u2019une commande \u00e0 Factur\u00e9 pour g\u00e9n\u00e9rer une facture.",
          "Les factures sont accessibles dans la section Facturation.",
          "Vous pouvez exporter vos factures en PDF.",
        ],
        tips: [
          "Renseignez vos informations l\u00e9gales dans Param\u00e8tres > Entreprise avant de facturer.",
        ],
      },
    ],
  },
  {
    id: "analytics",
    icon: "\u{1F4CA}",
    label: "Statistiques",
    description: "Analysez votre activit\u00e9",
    color: "#6366F1",
    articles: [
      {
        title: "Comprendre le dashboard",
        summary: "Les m\u00e9triques cl\u00e9s de votre activit\u00e9.",
        steps: [
          "Revenu total \u2014 Somme de toutes vos commandes pay\u00e9es.",
          "Commandes \u2014 Nombre total de commandes en cours et termin\u00e9es.",
          "Clients \u2014 Nombre de clients actifs.",
          "Panier moyen \u2014 Montant moyen par commande.",
        ],
      },
      {
        title: "Suivre ses revenus",
        summary: "Analysez l\u2019\u00e9volution de vos revenus.",
        steps: [
          "Allez dans Analytics depuis le menu.",
          "Le graphique montre l\u2019\u00e9volution mensuelle de vos revenus.",
          "Comparez avec les p\u00e9riodes pr\u00e9c\u00e9dentes.",
        ],
      },
      {
        title: "Analyser ses commandes",
        summary: "Identifiez les tendances de votre activit\u00e9.",
        steps: [
          "La r\u00e9partition par statut montre o\u00f9 se trouvent vos commandes.",
          "Les top clients affichent vos meilleurs clients par revenu.",
          "Les produits les plus vendus vous aident \u00e0 identifier vos bestsellers.",
        ],
      },
    ],
  },
  {
    id: "settings",
    icon: "\u2699\uFE0F",
    label: "Param\u00e8tres",
    description: "Configurez votre espace",
    color: "#64748B",
    articles: [
      {
        title: "Modifier son profil",
        summary: "Mettez \u00e0 jour vos informations personnelles.",
        steps: [
          "Allez dans Param\u00e8tres depuis le menu.",
          "Section Compte & Profil.",
          "Modifiez votre nom, email, t\u00e9l\u00e9phone, photo.",
          "Cliquez sur Enregistrer.",
        ],
      },
      {
        title: "Param\u00e8tres du site",
        summary: "Configurez les options de votre site vitrine.",
        steps: [
          "Allez dans Site web > votre site > Param\u00e8tres.",
          "Configurez le nom du site, la description SEO, les couleurs.",
          "Configurez un domaine personnalis\u00e9 si vous en avez un.",
        ],
      },
      {
        title: "Changer son abonnement",
        summary: "Passez au plan Pro ou modifiez votre abonnement.",
        steps: [
          "Allez dans Param\u00e8tres > Abonnement.",
          "Consultez votre plan actuel et les options disponibles.",
          "Cliquez sur Passer au Pro pour d\u00e9bloquer toutes les fonctionnalit\u00e9s.",
        ],
        tips: [
          "Le plan Free inclut 10 commandes par mois.",
          "Le plan Pro \u00e0 7\u20ac/mois est illimit\u00e9.",
        ],
      },
      {
        title: "S\u00e9curit\u00e9 du compte",
        summary: "Prot\u00e9gez votre compte Jestly.",
        steps: [
          "Utilisez un mot de passe fort et unique.",
          "Ne partagez jamais vos identifiants.",
          "D\u00e9connectez-vous sur les appareils partag\u00e9s.",
        ],
      },
    ],
  },
  {
    id: "troubleshoot",
    icon: "\u{1F527}",
    label: "Probl\u00e8mes courants",
    description: "Solutions aux probl\u00e8mes fr\u00e9quents",
    color: "#DC2626",
    articles: [
      {
        title: "Mon site ne se met pas \u00e0 jour",
        summary: "Les modifications ne sont pas visibles sur le site public.",
        troubleshoot: [
          { cause: "Vous n\u2019avez pas republi\u00e9 apr\u00e8s vos modifications.", fix: "Allez dans l\u2019\u00e9diteur et cliquez sur Publier pour appliquer les changements." },
          { cause: "Le cache du navigateur affiche l\u2019ancienne version.", fix: "Faites un rafra\u00eechissement forc\u00e9 : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)." },
        ],
      },
      {
        title: "Je ne vois pas mon site",
        summary: "Le site n\u2019est pas accessible \u00e0 l\u2019adresse attendue.",
        troubleshoot: [
          { cause: "Le site n\u2019a pas encore \u00e9t\u00e9 publi\u00e9.", fix: "Ouvrez votre site dans l\u2019\u00e9diteur et cliquez sur Publier." },
          { cause: "Le sous-domaine n\u2019est pas configur\u00e9.", fix: "V\u00e9rifiez dans Param\u00e8tres que votre sous-domaine est bien d\u00e9fini." },
        ],
      },
      {
        title: "Je ne peux pas publier",
        summary: "Le bouton Publier ne fonctionne pas.",
        troubleshoot: [
          { cause: "Votre site n\u2019a pas de contenu.", fix: "Ajoutez au moins un bloc (Hero par exemple) avant de publier." },
          { cause: "Erreur de connexion.", fix: "V\u00e9rifiez votre connexion internet et r\u00e9essayez." },
        ],
      },
      {
        title: "Mes images ne s\u2019affichent pas",
        summary: "Les images apparaissent cass\u00e9es sur le site.",
        troubleshoot: [
          { cause: "Le format d\u2019image n\u2019est pas support\u00e9.", fix: "Utilisez des images au format JPG, PNG ou WebP." },
          { cause: "L\u2019image est trop lourde.", fix: "R\u00e9duisez la taille de l\u2019image (max 5 Mo recommand\u00e9)." },
          { cause: "L\u2019URL de l\u2019image est invalide.", fix: "V\u00e9rifiez que le lien de l\u2019image est correct et accessible." },
        ],
      },
      {
        title: "Je ne peux pas cr\u00e9er de commande",
        summary: "Erreur lors de la cr\u00e9ation d\u2019une commande.",
        troubleshoot: [
          { cause: "Champs obligatoires manquants.", fix: "V\u00e9rifiez que le titre et le montant sont renseign\u00e9s." },
          { cause: "Aucun client s\u00e9lectionn\u00e9.", fix: "S\u00e9lectionnez un client existant ou cr\u00e9ez-en un nouveau." },
        ],
      },
      {
        title: "Je ne vois pas mes clients",
        summary: "La liste clients appara\u00eet vide.",
        troubleshoot: [
          { cause: "Vous \u00eates sur l\u2019onglet Archiv\u00e9s.", fix: "Cliquez sur l\u2019onglet Actifs pour voir vos clients actifs." },
          { cause: "Un filtre de recherche est actif.", fix: "Videz le champ de recherche." },
        ],
      },
    ],
  },
];

const FAQ_ITEMS = [
  { q: "Comment cr\u00e9er mon site ?", a: "Allez dans Site web > Nouveau site, choisissez un template et personnalisez-le. Cliquez sur Publier quand vous \u00eates satisfait." },
  { q: "Comment modifier mon th\u00e8me ?", a: "Allez dans Site web > votre site > Design. Parcourez les templates et cliquez sur celui qui vous pla\u00eet pour l\u2019appliquer." },
  { q: "Comment supprimer un client ?", a: "Dans la liste Clients, cliquez sur le menu \u00b7\u00b7\u00b7 du client > Supprimer. Tapez SUPPRIMER pour confirmer. Pr\u00e9f\u00e9rez l\u2019archivage pour garder l\u2019historique." },
  { q: "Comment recevoir un paiement ?", a: "Ouvrez la commande et passez son statut \u00e0 Pay\u00e9. Le revenu sera automatiquement comptabilis\u00e9 dans vos statistiques." },
  { q: "Comment publier mon site ?", a: "Ouvrez votre site dans l\u2019\u00e9diteur et cliquez sur le bouton Publier en haut \u00e0 droite. Votre site sera accessible sur prenom.jestly.fr." },
  { q: "C\u2019est quoi le plan Pro ?", a: "Le plan Pro \u00e0 7\u20ac/mois vous donne un acc\u00e8s illimit\u00e9 \u00e0 toutes les fonctionnalit\u00e9s : commandes illimit\u00e9es, site personnalis\u00e9, analytics avanc\u00e9s et support prioritaire." },
  { q: "Comment contacter le support ?", a: "Envoyez un email \u00e0 support@jestly.fr ou utilisez le formulaire de contact depuis le menu Support." },
];

const VIDEOS = [
  { title: "Cr\u00e9er son site en 3 minutes", duration: "3:12", category: "D\u00e9marrage" },
  { title: "Cr\u00e9er et g\u00e9rer une commande", duration: "2:45", category: "Commandes" },
  { title: "Personnaliser les blocs du builder", duration: "4:20", category: "Builder" },
  { title: "Publier et partager son site", duration: "1:58", category: "Site web" },
  { title: "G\u00e9rer ses clients efficacement", duration: "3:30", category: "Clients" },
  { title: "Comprendre ses statistiques", duration: "2:15", category: "Analytics" },
];

const QUICK_START_STEPS = [
  {
    icon: "globe",
    title: "Cr\u00e9er votre site",
    description: "Lancez votre vitrine en ligne",
    href: "/site-web/nouveau",
  },
  {
    icon: "package",
    title: "Ajouter une offre",
    description: "Cr\u00e9ez votre premier service",
    href: "/produits",
  },
  {
    icon: "clipboard",
    title: "Cr\u00e9er une commande",
    description: "Enregistrez un projet client",
    href: "/commandes",
  },
  {
    icon: "rocket",
    title: "Publier votre site",
    description: "Rendez votre site accessible",
    href: "/site-web",
  },
];

// Placeholder for future step screenshots — add real screenshots in /public/guide/
// Example: STEP_SCREENSHOTS["Créer son premier site"] = ["/guide/create-site-1.png", "/guide/create-site-2.png"]
const STEP_SCREENSHOTS: Record<string, (string | undefined)[]> = {
};

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function QuickStartIcon({ icon }: { icon: string }) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (icon) {
    case "globe":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "package":
      return (
        <svg {...commonProps}>
          <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...commonProps}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="12" y2="16" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...commonProps}>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const videosRef = useRef<HTMLDivElement>(null);

  // Filter articles by search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      articles: cat.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.steps?.some((s) => s.toLowerCase().includes(q)) ||
          a.troubleshoot?.some(
            (t) =>
              t.cause.toLowerCase().includes(q) ||
              t.fix.toLowerCase().includes(q)
          )
      ),
    })).filter((cat) => cat.articles.length > 0);
  }, [search]);

  const activeData = activeCategory
    ? filteredCategories.find((c) => c.id === activeCategory)
    : null;

  const totalArticles = CATEGORIES.reduce((n, c) => n + c.articles.length, 0);

  const handlePillCommencer = useCallback(() => {
    setActiveCategory("start");
  }, []);

  const handlePillVideos = useCallback(() => {
    videosRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleAiPill = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const tourSteps = [
    {
      title: "Menu lat\u00e9ral",
      description: "Naviguez entre les sections : dashboard, commandes, clients, site web et plus.",
      targetX: 8,
      targetY: 50,
    },
    {
      title: "Barre de recherche",
      description: "Utilisez Cmd+K pour trouver rapidement n\u2019importe quoi dans Jestly.",
      targetX: 50,
      targetY: 8,
    },
    {
      title: "Zone principale",
      description: "C\u2019est ici que s\u2019affiche le contenu de chaque section.",
      targetX: 60,
      targetY: 50,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <InteractiveTour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />

      {/* ── Hero ── */}
      <motion.div
        className="text-center pt-4 pb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[12px] font-semibold text-[#4F46E5] mb-4">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {totalArticles} articles &middot; 6 vid&eacute;os
        </div>

        <h1 className="text-[28px] font-bold text-[#191919] mb-2">
          Guide Jestly
        </h1>
        <p className="text-[15px] text-[#5A5A58] max-w-lg mx-auto mb-8">
          Apprenez &agrave; utiliser Jestly et trouvez la solution &agrave; vos
          probl&egrave;mes.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher dans le guide..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveCategory(null);
            }}
            className="w-full bg-white border border-[#E6E6E4] rounded-xl pl-11 pr-4 py-3 text-[14px] text-[#191919] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all shadow-sm"
          />
        </div>

        {/* Quick action pills */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePillCommencer}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white text-[13px] font-medium rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Commencer
          </button>
          <button
            onClick={handlePillVideos}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#191919] text-[13px] font-medium rounded-lg border border-[#E6E6E4] hover:bg-[#FBFBFA] transition-colors cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
              <line x1="17" y1="17" x2="22" y2="17" />
            </svg>
            Tutoriels vid&eacute;o
          </button>
        </div>
      </motion.div>

      {/* ── Search results mode ── */}
      {search.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <p className="text-[13px] text-[#8A8A88] mb-4">
            {filteredCategories.reduce((n, c) => n + c.articles.length, 0)}{" "}
            r&eacute;sultat(s) pour &quot;{search}&quot;
          </p>
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>{cat.icon}</span> {cat.label}
              </h3>
              <div className="space-y-2">
                {cat.articles.map((article) => (
                  <ArticleCard
                    key={article.title}
                    article={article}
                    expanded={expandedArticle === article.title}
                    onToggle={() =>
                      setExpandedArticle(
                        expandedArticle === article.title
                          ? null
                          : article.title
                      )
                    }
                    accentColor={cat.color}
                  />
                ))}
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[15px] text-[#999] mb-2">
                Aucun r&eacute;sultat trouv&eacute;.
              </p>
              <p className="text-[13px] text-[#BBB]">
                Essayez un autre terme ou contactez le support.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Main content (no search, no category selected) ── */}
      {!search.trim() && !activeCategory && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* ── Quick Start Onboarding ── */}
          <div className="mb-12">
            <h2 className="text-[18px] font-bold text-[#191919] mb-1">
              D&eacute;marrage rapide
            </h2>
            <p className="text-[13px] text-[#8A8A88] mb-5">
              4 &eacute;tapes pour lancer votre activit&eacute; sur Jestly.
            </p>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-1/2 left-[12.5%] right-[12.5%] h-px bg-[#E6E6E4] -translate-y-1/2 z-0" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {QUICK_START_STEPS.map((step, i) => (
                  <motion.button
                    key={step.title}
                    onClick={() => router.push(step.href)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.08 * i,
                      ease: "easeOut" as const,
                    }}
                    className="group relative bg-white border border-[#E6E6E4] rounded-xl p-5 text-left hover:border-[#4F46E5]/40 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    {/* Step number */}
                    <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white text-[13px] font-bold flex items-center justify-center mb-3">
                      {i + 1}
                    </div>

                    {/* Icon */}
                    <div className="text-[#4F46E5] mb-2">
                      <QuickStartIcon icon={step.icon} />
                    </div>

                    <h3 className="text-[14px] font-semibold text-[#191919] mb-0.5 group-hover:text-[#4F46E5] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[12px] text-[#8A8A88]">
                      {step.description}
                    </p>

                    {/* Arrow to next */}
                    {i < QUICK_START_STEPS.length - 1 && (
                      <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-[#E6E6E4] items-center justify-center">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#8A8A88"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Categories Grid ── */}
          <div className="mb-12">
            <h2 className="text-[18px] font-bold text-[#191919] mb-1">
              Cat&eacute;gories
            </h2>
            <p className="text-[13px] text-[#8A8A88] mb-5">
              Explorez le guide par th&egrave;me.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.04 * i,
                    ease: "easeOut" as const,
                  }}
                  className="group text-left bg-white border border-[#E6E6E4] rounded-xl p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all cursor-pointer"
                >
                  {/* Icon area */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-[28px] mb-3"
                    style={{ backgroundColor: cat.color + "12" }}
                  >
                    {cat.icon}
                  </div>

                  <h3 className="text-[14px] font-semibold text-[#191919] mb-0.5 group-hover:text-[#4F46E5] transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-[12px] text-[#8A8A88] mb-2">
                    {cat.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#BBB]">
                      {cat.articles.length} article
                      {cat.articles.length > 1 ? "s" : ""}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-[#4F46E5] group-hover:translate-x-0.5 transition-all"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ── Video Tutorials ── */}
          <div ref={videosRef} className="mb-12">
            <h2 className="text-[18px] font-bold text-[#191919] mb-1">
              Tutoriels vid&eacute;o
            </h2>
            <p className="text-[13px] text-[#8A8A88] mb-5">
              Apprenez visuellement en quelques minutes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VIDEOS.map((video, i) => (
                <motion.div
                  key={video.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * i }}
                  className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden hover:border-[#D1D5DB] hover:shadow-sm transition-all group cursor-pointer"
                >
                  {/* Video placeholder */}
                  <div className="relative bg-[#F7F7F5] aspect-video flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="#4F46E5"
                        stroke="none"
                      >
                        <polygon points="6 3 20 12 6 21" />
                      </svg>
                    </div>
                    <span className="absolute bottom-2 right-2 text-[11px] font-medium text-[#5A5A58] bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <span className="text-[10px] font-semibold text-[#4F46E5] uppercase tracking-wider">
                      {video.category}
                    </span>
                    <h4 className="text-[13px] font-medium text-[#191919] mt-0.5">
                      {video.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="mb-12">
            <h2 className="text-[18px] font-bold text-[#191919] mb-1">
              Questions fr&eacute;quentes
            </h2>
            <p className="text-[13px] text-[#8A8A88] mb-5">
              Les r&eacute;ponses aux questions les plus pos&eacute;es.
            </p>
            <div className="bg-white border border-[#E6E6E4] rounded-xl divide-y divide-[#EFEFEF] overflow-hidden">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i}>
                  <button
                    onClick={() =>
                      setExpandedFaq(expandedFaq === i ? null : i)
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                  >
                    <span className="text-[14px] font-medium text-[#191919] pr-4">
                      {item.q}
                    </span>
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#999"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-[13px] text-[#5A5A58] leading-relaxed">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* ── Guide AI Assistant ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12 bg-white border border-[#E6E6E4] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 7.27 19H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h-1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                  <circle cx="9" cy="13" r="1" fill="#4F46E5" />
                  <circle cx="15" cy="13" r="1" fill="#4F46E5" />
                  <path d="M9 17c.85.63 1.885 1 3 1s2.15-.37 3-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#191919]">
                  Que voulez-vous faire ?
                </h3>
                <p className="text-[12px] text-[#8A8A88]">
                  Acc&eacute;dez rapidement &agrave; la bonne section du guide.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAiPill("start")}
                className="px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] text-[13px] font-medium rounded-lg hover:bg-[#4F46E5] hover:text-white transition-colors cursor-pointer"
              >
                Cr&eacute;er un site
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAiPill("clients")}
                className="px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] text-[13px] font-medium rounded-lg hover:bg-[#4F46E5] hover:text-white transition-colors cursor-pointer"
              >
                G&eacute;rer mes clients
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAiPill("analytics")}
                className="px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] text-[13px] font-medium rounded-lg hover:bg-[#4F46E5] hover:text-white transition-colors cursor-pointer"
              >
                Voir mes stats
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTourOpen(true)}
                className="px-4 py-2 bg-[#F7F7F5] text-[#5A5A58] text-[13px] font-medium rounded-lg border border-[#E6E6E4] hover:bg-[#EFEFEF] transition-colors cursor-pointer"
              >
                Visite guid&eacute;e
              </motion.button>
            </div>
          </motion.div>

          {/* ── Support CTA ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-[#F7F7F5] rounded-xl border border-[#E6E6E4] p-8 text-center"
          >
            <h2 className="text-[18px] font-bold text-[#191919] mb-2">
              Besoin d&apos;aide ?
            </h2>
            <p className="text-[13px] text-[#5A5A58] mb-6 max-w-md mx-auto">
              Vous ne trouvez pas la r&eacute;ponse ? Notre &eacute;quipe est
              l&agrave; pour vous aider.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="mailto:support@jestly.fr"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#191919] text-[13px] font-medium rounded-lg border border-[#E6E6E4] hover:bg-[#FBFBFA] transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                support@jestly.fr
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── Category Detail View ── */}
      {!search.trim() && activeData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Breadcrumb */}
          <button
            onClick={() => {
              setActiveCategory(null);
              setExpandedArticle(null);
            }}
            className="flex items-center gap-1.5 text-[13px] text-[#8A8A88] hover:text-[#4F46E5] transition-colors mb-5 cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Retour au guide
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-[28px]"
              style={{ backgroundColor: activeData.color + "12" }}
            >
              {activeData.icon}
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#191919]">
                {activeData.label}
              </h2>
              <p className="text-[13px] text-[#8A8A88]">
                {activeData.articles.length} article
                {activeData.articles.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {activeData.articles.map((article) => (
              <ArticleCard
                key={article.title}
                article={article}
                expanded={expandedArticle === article.title}
                onToggle={() =>
                  setExpandedArticle(
                    expandedArticle === article.title ? null : article.title
                  )
                }
                accentColor={activeData.color}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Article Card
// ─────────────────────────────────────────────────────────────────────────────

function ArticleCard({
  article,
  expanded,
  onToggle,
  accentColor,
}: {
  article: Article;
  expanded: boolean;
  onToggle: () => void;
  accentColor: string;
}) {
  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden hover:border-[#D1D5DB] transition-colors">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#FBFBFA] transition-colors"
      >
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-[14px] font-medium text-[#191919] mb-0.5">
            {article.title}
          </h4>
          <p className="text-[12px] text-[#8A8A88]">{article.summary}</p>
        </div>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#999"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[#EFEFEF] pt-4">
              {/* Steps — rendered as interactive GuideStepCards */}
              {article.steps && article.steps.length > 0 && !article.troubleshoot && (
                <div className="mb-4">
                  <h5 className="text-[12px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-3">
                    &Eacute;tapes
                  </h5>
                  <div className="space-y-3">
                    {article.steps.map((step, i) => {
                      const screenshots = STEP_SCREENSHOTS[article.title];
                      const screenshot = screenshots?.[i];
                      return (
                        <GuideStepCard
                          key={i}
                          stepNumber={i + 1}
                          text={step}
                          accentColor={accentColor}
                          screenshot={screenshot}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Troubleshoot info steps (plain list) */}
              {article.steps && article.steps.length > 0 && article.troubleshoot && (
                <div className="mb-4">
                  <h5 className="text-[12px] font-semibold text-[#5A5A58] uppercase tracking-wider mb-3">
                    Informations
                  </h5>
                  <ol className="space-y-2.5">
                    {article.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5"
                          style={{ backgroundColor: accentColor }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-[13px] text-[#5A5A58] leading-relaxed pt-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Troubleshoot */}
              {article.troubleshoot && (
                <div className="mb-4 space-y-3">
                  {article.troubleshoot.map((t, i) => (
                    <div key={i}>
                      {/* Cause card */}
                      <div className="bg-[#FEF2F2] border border-red-100 rounded-lg p-4 mb-2">
                        <div className="flex items-start gap-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#DC2626"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 flex-shrink-0"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span className="text-[13px] font-medium text-red-700">
                            {t.cause}
                          </span>
                        </div>
                      </div>
                      {/* Fix card */}
                      <div className="bg-[#F0FDF4] border border-green-100 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 flex-shrink-0"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <span className="text-[13px] text-emerald-700">
                            {t.fix}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {article.tips && article.tips.length > 0 && (
                <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg p-4">
                  <h5 className="text-[12px] font-semibold text-[#4F46E5] mb-2 flex items-center gap-1.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Conseils
                  </h5>
                  <ul className="space-y-1.5">
                    {article.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="text-[13px] text-[#4338CA] flex items-start gap-2"
                      >
                        <span className="text-[#6366F1] mt-1.5">
                          &bull;
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
