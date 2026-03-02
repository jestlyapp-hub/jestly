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

  return {
    title: site.seo.globalTitle || site.settings.name,
    description: site.seo.globalDescription || site.settings.description,
    openGraph: {
      title: site.seo.globalTitle || site.settings.name,
      description: site.seo.globalDescription || site.settings.description,
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
