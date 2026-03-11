import { getSiteBySlug } from "@/lib/site-resolver";
import type { Metadata } from "next";
import PortfolioCaseStudyPage from "@/components/site-public/PortfolioCaseStudyPage";

export const revalidate = 60;

export interface PortfolioData {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  result: string | null;
  summary: string | null;
  coverUrl: string | null;
  introText: string | null;
  challengeText: string | null;
  solutionText: string | null;
  resultText: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  clientName: string | null;
  clientCompany: string | null;
  color: string;
  tags: string[];
  gallery: { id: string; type: string; url: string; title: string | null }[];
  seo: { title: string; description: string | null; ogImage: string | null };
}

async function resolvePortfolio(siteSlug: string, projectSlug: string) {
  const site = await getSiteBySlug(siteSlug);
  if (!site) return { site: null, portfolio: null };

  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const url = `${base}/api/public/portfolio/${encodeURIComponent(projectSlug)}?site=${encodeURIComponent(siteSlug)}`;
    const res = await fetch(url, { next: { revalidate: 60 } });

    if (!res.ok) return { site, portfolio: null };
    const portfolio: PortfolioData = await res.json();
    return { site, portfolio };
  } catch {
    return { site, portfolio: null };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const { site, portfolio } = await resolvePortfolio(slug, projectSlug);

  if (!site || !portfolio) {
    return { title: "Projet introuvable" };
  }

  return {
    title: `${portfolio.seo.title} — ${site.settings.name}`,
    description: portfolio.seo.description || portfolio.title,
    openGraph: {
      title: portfolio.seo.title,
      description: portfolio.seo.description || portfolio.title,
      ...(portfolio.seo.ogImage ? { images: [portfolio.seo.ogImage] } : {}),
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string; projectSlug: string }>;
}) {
  const { slug, projectSlug } = await params;
  const { site, portfolio } = await resolvePortfolio(slug, projectSlug);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#191919] mb-2">Site introuvable</h1>
          <p className="text-sm text-[#8A8A88]">Ce site n&apos;existe pas.</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F7F7F5] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#191919] mb-2">Projet introuvable</h1>
          <p className="text-sm text-[#8A8A88]">Ce projet n&apos;existe pas ou n&apos;est pas encore publié.</p>
          <a href={`/s/${slug}`} className="inline-block mt-6 text-sm font-medium text-[#4F46E5] hover:underline">&larr; Retour au site</a>
        </div>
      </div>
    );
  }

  return (
    <PortfolioCaseStudyPage
      portfolio={portfolio}
      site={site}
      siteSlug={slug}
    />
  );
}
