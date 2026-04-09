import type { MetadataRoute } from "next";

const SITE = "https://jestly.fr";

/**
 * Sitemap dynamique — toutes les routes publiques user-facing.
 * Les chemins reflètent les rewrites configurés dans next.config.ts
 * (pas les chemins internes /landing/...).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const route = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    // ── Core ──
    route("/", 1.0, "daily"),
    route("/tarifs", 0.9, "weekly"),
    route("/demo", 0.8, "weekly"),
    route("/contact", 0.7, "monthly"),

    // ── Hubs ──
    route("/fonctionnalites", 0.9),
    route("/pour-qui", 0.9),
    route("/comparatifs", 0.9),
    route("/ressources", 0.7),
    route("/centre-aide", 0.7),
    route("/integrations", 0.7),
    route("/templates", 0.7),
    route("/blog", 0.8, "daily"),
    route("/faq", 0.8),
    route("/a-propos", 0.6, "monthly"),
    route("/roadmap", 0.6, "weekly"),

    // ── Fonctionnalités ──
    route("/fonctionnalites/site-vitrine", 0.8),
    route("/fonctionnalites/crm", 0.8),
    route("/fonctionnalites/calendrier", 0.8),
    route("/fonctionnalites/facturation", 0.8),
    route("/fonctionnalites/commandes", 0.8),
    route("/fonctionnalites/analytics", 0.8),
    route("/fonctionnalites/portfolio", 0.8),
    route("/fonctionnalites/paiements", 0.8),
    route("/fonctionnalites/briefs", 0.8),

    // ── Personas ──
    route("/pour-qui/createurs", 0.8),
    route("/pour-qui/developpeurs", 0.8),
    route("/pour-qui/designers", 0.8),
    route("/pour-qui/agences", 0.8),
    route("/pour-qui/consultants", 0.8),

    // ── Comparatifs ──
    route("/comparatifs/jestly-vs-notion", 0.8),
    route("/comparatifs/jestly-vs-trello", 0.8),
    route("/comparatifs/jestly-vs-clickup", 0.8),
    route("/comparatifs/jestly-vs-google-sheets", 0.8),
    route("/comparatifs/jestly-vs-google-agenda", 0.8),
    route("/comparatifs/jestly-vs-hubspot", 0.8),

    // ── Blog ──
    route("/blog/comment-arreter-de-gerer-son-business-dans-6-outils", 0.7),
    route("/blog/la-methode-pour-suivre-ses-clients-sans-crm-complexe", 0.7),
    route("/blog/5-erreurs-de-facturation-qui-vous-coutent-cher", 0.7),
    route("/blog/gagner-3-heures-par-semaine-en-automatisant-sa-gestion", 0.7),
    route("/blog/comment-creer-un-site-freelance-qui-convertit", 0.7),
    route("/blog/le-guide-complet-du-brief-client-reussi", 0.7),
    route("/blog/comment-facturer-en-freelance-guide-complet", 0.8),
    route("/blog/quel-crm-choisir-quand-on-est-freelance", 0.8),
    route("/blog/comment-creer-un-portfolio-freelance", 0.8),

    // ── Légal ──
    route("/mentions-legales", 0.3, "yearly"),
    route("/confidentialite", 0.3, "yearly"),
    route("/cgu", 0.3, "yearly"),
    route("/cookies", 0.3, "yearly"),
  ];
}
