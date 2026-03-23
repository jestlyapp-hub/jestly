import type { Metadata } from "next";
import { getSiteBySlug } from "@/lib/site-resolver";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    return { title: "Site introuvable" };
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr";
  const canonicalUrl = `https://${slug}.${baseDomain}`;

  // Dynamic favicon — always set icons to override root-level icon.png
  const faviconUrl = site.settings.faviconUrl || "/icon.png";
  const icons: Metadata["icons"] = {
    icon: [{ url: faviconUrl }],
    shortcut: [{ url: faviconUrl }],
    apple: [{ url: site.settings.faviconUrl || "/apple-icon.png" }],
  };

  return {
    title: site.seo.globalTitle || site.settings.name,
    description: site.seo.globalDescription || site.settings.description,
    icons,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: site.seo.globalTitle || site.settings.name,
      description: site.seo.globalDescription || site.settings.description,
      url: canonicalUrl,
      ...(site.seo.ogImageUrl ? { images: [site.seo.ogImageUrl] } : {}),
    },
    robots: site.settings.maintenanceMode ? "noindex, nofollow" : undefined,
  };
}

export default function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
