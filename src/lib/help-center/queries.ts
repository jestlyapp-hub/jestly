import { articles, categories, guides, parcours, popularFaq } from "./data";
import type {
  HelpArticle,
  HelpCategory,
  HelpGuide,
  HelpSearchResult,
} from "./types";

export function getAllCategories(): HelpCategory[] {
  return categories;
}

export function getCategoryBySlug(slug: string): HelpCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllGuides(): HelpGuide[] {
  return guides;
}

export function getGuideBySlug(slug: string): HelpGuide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getAllArticles(): HelpArticle[] {
  return articles;
}

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(slug: string): HelpArticle[] {
  return articles.filter((a) => a.categorySlug === slug);
}

export function getGuidesByCategory(slug: string): HelpGuide[] {
  const cat = getCategoryBySlug(slug);
  if (!cat?.guideSlugs) return [];
  return cat.guideSlugs
    .map((gs) => getGuideBySlug(gs))
    .filter((g): g is HelpGuide => Boolean(g));
}

export function getPopularArticles(limit = 6): HelpArticle[] {
  return articles.filter((a) => a.popular).slice(0, limit);
}

export function getFeaturedArticles(limit = 6): HelpArticle[] {
  return articles.filter((a) => a.featured).slice(0, limit);
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  if (article.relatedArticleSlugs?.length) {
    return article.relatedArticleSlugs
      .map((s) => getArticleBySlug(s))
      .filter((a): a is HelpArticle => Boolean(a));
  }
  // fallback : autres articles de la même catégorie
  return articles
    .filter((a) => a.categorySlug === article.categorySlug && a.slug !== article.slug)
    .slice(0, 3);
}

export function getRelatedGuidesForArticle(article: HelpArticle): HelpGuide[] {
  if (!article.relatedGuideSlugs?.length) return [];
  return article.relatedGuideSlugs
    .map((s) => getGuideBySlug(s))
    .filter((g): g is HelpGuide => Boolean(g));
}

export function getPopularFaq() {
  return popularFaq;
}

export function getAllParcours() {
  return parcours;
}

/* ── Recherche ──────────────────────────────── */

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchHelp(query: string, limit = 20): HelpSearchResult[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];

  const results: HelpSearchResult[] = [];

  for (const article of articles) {
    const cat = getCategoryBySlug(article.categorySlug);
    const title = normalize(article.title);
    const excerpt = normalize(article.excerpt);
    const keywords = (article.searchKeywords ?? []).map(normalize).join(" ");
    let score = 0;
    if (title.startsWith(q)) score += 100;
    if (title.includes(q)) score += 50;
    if (excerpt.includes(q)) score += 20;
    if (keywords.includes(q)) score += 15;
    if (cat && normalize(cat.title).includes(q)) score += 10;
    if (score > 0) {
      results.push({
        type: "article",
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        href: `/centre-aide/article/${article.slug}`,
        categoryTitle: cat?.title,
        score,
      });
    }
  }

  for (const guide of guides) {
    const title = normalize(guide.title);
    const excerpt = normalize(guide.excerpt);
    let score = 0;
    if (title.startsWith(q)) score += 90;
    if (title.includes(q)) score += 45;
    if (excerpt.includes(q)) score += 18;
    if (score > 0) {
      results.push({
        type: "guide",
        slug: guide.slug,
        title: guide.title,
        excerpt: guide.excerpt,
        href: `/centre-aide/guide/${guide.slug}`,
        categoryTitle: "Guide de démarrage",
        score,
      });
    }
  }

  for (const cat of categories) {
    const title = normalize(cat.title);
    if (title.includes(q)) {
      results.push({
        type: "category",
        slug: cat.slug,
        title: cat.title,
        excerpt: cat.description,
        href: `/centre-aide/categorie/${cat.slug}`,
        score: 30,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
