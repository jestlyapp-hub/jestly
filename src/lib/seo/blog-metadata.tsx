import { buildMetadata, SITE_URL, DEFAULT_OG } from "./build-metadata";
import { getBlogArticle } from "./blog-registry";
import JsonLd from "@/components/seo/JsonLd";

/** Construit la metadata Next.js pour un article de blog à partir du registre. */
export function buildBlogMetadata(slug: string) {
  const article = getBlogArticle(slug);
  if (!article) {
    return buildMetadata({
      title: "Article — Blog Jestly",
      description: "Blog Jestly : conseils, méthodes et guides pour freelances créatifs.",
      path: `/blog/${slug}`,
    });
  }
  return buildMetadata({
    title: `${article.title} — Blog Jestly`,
    description: article.description,
    path: `/blog/${article.slug}`,
  });
}

/** JSON-LD BlogPosting + BreadcrumbList injecté dans le layout d'un article. */
export function BlogArticleJsonLd({ slug }: { slug: string }) {
  const article = getBlogArticle(slug);
  if (!article) return null;

  const url = `${SITE_URL}/blog/${article.slug}`;
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.description,
    image: DEFAULT_OG,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    author: {
      "@type": "Organization",
      name: article.author.name,
      url: article.author.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Jestly",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-color.png` },
    },
    articleSection: article.category,
    timeRequired: `PT${article.readingMinutes}M`,
    inLanguage: "fr-FR",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  return <JsonLd data={[blogPosting, breadcrumb]} />;
}
