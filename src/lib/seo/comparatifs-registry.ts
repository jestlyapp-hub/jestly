/**
 * Registre central des pages comparatives.
 * Source unique pour metadata + JSON-LD.
 */

export interface ComparatifMeta {
  slug: string;
  competitor: string;
  title: string;
  description: string;
}

export const COMPARATIFS: ComparatifMeta[] = [
  {
    slug: "jestly-vs-notion",
    competitor: "Notion",
    title: "Jestly vs Notion — Lequel choisir pour un freelance créatif ?",
    description:
      "Comparatif Jestly vs Notion : fonctionnalités, facturation, CRM, site vitrine, prise en main et tarifs. Le cockpit pensé freelance vs l'outil générique.",
  },
  {
    slug: "jestly-vs-trello",
    competitor: "Trello",
    title: "Jestly vs Trello — Au-delà du kanban pour freelances",
    description:
      "Trello gère des tableaux, Jestly gère tout votre business freelance : devis, factures, CRM, site, agenda. Comparatif complet pour choisir.",
  },
  {
    slug: "jestly-vs-clickup",
    competitor: "ClickUp",
    title: "Jestly vs ClickUp — Lequel pour un freelance créatif ?",
    description:
      "ClickUp est puissant mais complexe. Jestly est livré préconfiguré pour les freelances créatifs. Comparatif des fonctionnalités, UX et tarifs.",
  },
  {
    slug: "jestly-vs-google-sheets",
    competitor: "Google Sheets",
    title: "Jestly vs Google Sheets — Sortir du tableur pour gérer son freelance",
    description:
      "Pourquoi remplacer vos Google Sheets clients/factures/planning par un vrai cockpit freelance : automatisations, UI dédiée, paiements et CRM inclus.",
  },
  {
    slug: "jestly-vs-google-agenda",
    competitor: "Google Agenda",
    title: "Jestly vs Google Agenda — Au-delà du calendrier pour freelances",
    description:
      "Google Agenda planifie, Jestly exécute : deadlines, briefs, facturation et suivi client intégrés à votre calendrier. Comparatif complet.",
  },
  {
    slug: "jestly-vs-hubspot",
    competitor: "HubSpot",
    title: "Jestly vs HubSpot — Le cockpit freelance vs le CRM entreprise",
    description:
      "HubSpot est un CRM entreprise puissant mais cher. Jestly est 100 % freelance, gratuit en bêta et intègre facturation, site et commandes. Comparatif.",
  },
];

export function getComparatif(slug: string): ComparatifMeta | undefined {
  return COMPARATIFS.find((c) => c.slug === slug);
}
