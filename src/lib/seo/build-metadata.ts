import type { Metadata } from "next";

export const SITE_URL = "https://jestly.fr";
export const SITE_NAME = "Jestly";
export const DEFAULT_OG = `${SITE_URL}/opengraph-image`;

interface BuildMetadataArgs {
  title: string;
  description: string;
  /** Chemin absolu commençant par "/" — ex: "/tarifs" */
  path: string;
  image?: string;
  /** Mettre `true` pour empêcher l'indexation (ex: pages auth) */
  noIndex?: boolean;
}

/**
 * Helper unique pour générer la metadata d'une page publique.
 * Garantit canonical, OG complet, Twitter card, et fallback og:image cohérents.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: BuildMetadataArgs): Metadata {
  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? DEFAULT_OG;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
