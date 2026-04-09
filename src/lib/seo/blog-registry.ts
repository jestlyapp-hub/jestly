/**
 * Registre central des articles de blog.
 * Source unique pour :
 *  - metadata (title, description, canonical, OG)
 *  - JSON-LD BlogPosting
 *  - rendu UI (reading time, date, author, related posts)
 *
 * Ajouter un nouvel article = une entrée ici + une page + un layout qui appelle buildBlogMetadata(slug).
 */

export interface BlogArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** ISO YYYY-MM-DD */
  datePublished: string;
  dateModified?: string;
  /** Nombre de minutes de lecture */
  readingMinutes: number;
  author: {
    name: string;
    url?: string;
  };
}

export const BLOG_AUTHOR = {
  name: "L'équipe Jestly",
  url: "https://jestly.fr/a-propos",
};

export const BLOG_ARTICLES: BlogArticleMeta[] = [
  {
    slug: "comment-arreter-de-gerer-son-business-dans-6-outils",
    title: "Comment arrêter de gérer son business dans 6 outils",
    description:
      "Notion, Trello, Google Sheets, Agenda, Drive, Calendly… Centralisez votre activité freelance dans un seul cockpit et arrêtez de payer 10 abonnements.",
    category: "Organisation",
    datePublished: "2026-03-15",
    readingMinutes: 5,
    author: BLOG_AUTHOR,
  },
  {
    slug: "la-methode-pour-suivre-ses-clients-sans-crm-complexe",
    title: "La méthode pour suivre ses clients sans CRM complexe",
    description:
      "Un CRM simple, visuel et adapté aux freelances créatifs : la méthode concrète pour ne plus perdre un lead et relancer au bon moment.",
    category: "CRM",
    datePublished: "2026-03-08",
    readingMinutes: 6,
    author: BLOG_AUTHOR,
  },
  {
    slug: "5-erreurs-de-facturation-qui-vous-coutent-cher",
    title: "5 erreurs de facturation qui vous coûtent cher en freelance",
    description:
      "Numérotation, TVA, délais, relances, mentions obligatoires : les 5 erreurs de facturation qui plombent le cash-flow des freelances et comment les éviter.",
    category: "Facturation",
    datePublished: "2026-02-28",
    readingMinutes: 7,
    author: BLOG_AUTHOR,
  },
  {
    slug: "gagner-3-heures-par-semaine-en-automatisant-sa-gestion",
    title: "Gagner 3 heures par semaine en automatisant sa gestion freelance",
    description:
      "Devis, factures, relances, briefs, planification : les automatisations simples qui rendent 3 heures par semaine à un freelance créatif.",
    category: "Productivité",
    datePublished: "2026-02-18",
    readingMinutes: 6,
    author: BLOG_AUTHOR,
  },
  {
    slug: "comment-creer-un-site-freelance-qui-convertit",
    title: "Comment créer un site freelance qui convertit vraiment",
    description:
      "La structure d'un site freelance qui transforme les visiteurs en clients : hero, preuve, offre, CTA, FAQ. Exemples concrets et checklist.",
    category: "Site vitrine",
    datePublished: "2026-02-06",
    readingMinutes: 8,
    author: BLOG_AUTHOR,
  },
  {
    slug: "le-guide-complet-du-brief-client-reussi",
    title: "Le guide complet du brief client réussi",
    description:
      "Le brief client qui cadre un projet en 10 minutes au lieu de 2 jours : questions clés, template et bonnes pratiques pour freelances créatifs.",
    category: "Briefs",
    datePublished: "2026-01-28",
    readingMinutes: 7,
    author: BLOG_AUTHOR,
  },
  {
    slug: "comment-facturer-en-freelance-guide-complet",
    title: "Comment facturer en freelance — Le guide complet 2026",
    description:
      "Tout ce qu'un freelance doit savoir sur la facturation : mentions obligatoires, numérotation, TVA, relances, outils. Guide pratique avec exemples concrets.",
    category: "Facturation",
    datePublished: "2026-04-09",
    readingMinutes: 10,
    author: BLOG_AUTHOR,
  },
  {
    slug: "quel-crm-choisir-quand-on-est-freelance",
    title: "Quel CRM choisir quand on est freelance ?",
    description:
      "Comparatif des CRM adaptés aux freelances : HubSpot, Notion, Jestly. Comment choisir le bon outil pour suivre vos clients sans usine à gaz.",
    category: "CRM",
    datePublished: "2026-04-07",
    readingMinutes: 8,
    author: BLOG_AUTHOR,
  },
  {
    slug: "comment-creer-un-portfolio-freelance",
    title: "Comment créer un portfolio freelance qui attire des clients",
    description:
      "Guide pratique pour créer un portfolio freelance professionnel : structure, contenu, outils, erreurs à éviter. Attirer des clients avec votre travail.",
    category: "Site vitrine",
    datePublished: "2026-04-05",
    readingMinutes: 9,
    author: BLOG_AUTHOR,
  },
];

export function getBlogArticle(slug: string): BlogArticleMeta | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 3): BlogArticleMeta[] {
  const current = getBlogArticle(slug);
  if (!current) return BLOG_ARTICLES.slice(0, limit);
  // Priorité aux articles de la même catégorie, puis les plus récents
  const sameCategory = BLOG_ARTICLES.filter(
    (a) => a.slug !== slug && a.category === current.category,
  );
  const others = BLOG_ARTICLES.filter(
    (a) => a.slug !== slug && a.category !== current.category,
  ).sort((a, b) => b.datePublished.localeCompare(a.datePublished));
  return [...sameCategory, ...others].slice(0, limit);
}
