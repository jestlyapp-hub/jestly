import { buildMetadata, SITE_URL } from "./build-metadata";
import { getComparatif } from "./comparatifs-registry";
import JsonLd from "@/components/seo/JsonLd";

export function buildComparatifMetadata(slug: string) {
  const c = getComparatif(slug);
  if (!c) {
    return buildMetadata({
      title: "Comparatif — Jestly",
      description: "Comparez Jestly aux autres outils pour freelances.",
      path: `/comparatifs/${slug}`,
    });
  }
  return buildMetadata({
    title: c.title,
    description: c.description,
    path: `/comparatifs/${c.slug}`,
  });
}

export function ComparatifJsonLd({ slug }: { slug: string }) {
  const c = getComparatif(slug);
  if (!c) return null;
  const url = `${SITE_URL}/comparatifs/${c.slug}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Comparatifs", item: `${SITE_URL}/comparatifs` },
      { "@type": "ListItem", position: 3, name: `Jestly vs ${c.competitor}`, item: url },
    ],
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.description,
    author: { "@type": "Organization", name: "Jestly", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Jestly",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-color.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "fr-FR",
  };
  return <JsonLd data={[breadcrumb, article]} />;
}
