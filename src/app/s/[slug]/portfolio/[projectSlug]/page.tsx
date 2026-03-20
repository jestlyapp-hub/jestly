import { headers } from "next/headers";
import { getSiteBySlug } from "@/lib/site-resolver";
import { createAdminClient } from "@/lib/supabase/admin";
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

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Resolve portfolio data directly via Supabase (no HTTP fetch).
 * This avoids VERCEL_URL routing issues and is faster on the server.
 */
async function resolvePortfolio(siteSlug: string, projectSlug: string) {
  const site = await getSiteBySlug(siteSlug);
  if (!site) return { site: null, portfolio: null };

  try {
    const supabase = createAdminClient();

    // Get site owner from slug
    const { data: siteRow } = await (supabase.from("sites") as any)
      .select("owner_id")
      .eq("slug", siteSlug)
      .eq("status", "published")
      .single();

    if (!siteRow) return { site, portfolio: null };

    // Find the project
    const { data: project, error } = await (supabase.from("projects") as any)
      .select(`
        id, name, description, project_type, color, status, cover_url, tags,
        is_portfolio, portfolio_description, portfolio_display_title, portfolio_subtitle,
        portfolio_result, portfolio_summary, portfolio_cover_url, portfolio_cover_item_id,
        portfolio_category, portfolio_images, portfolio_external_url, portfolio_slug,
        portfolio_cta_label, portfolio_cta_url, portfolio_featured,
        portfolio_intro_text, portfolio_challenge_text, portfolio_solution_text,
        portfolio_result_text, portfolio_gallery_item_ids,
        portfolio_seo_title, portfolio_seo_description,
        portfolio_visibility,
        clients(name, company),
        project_items!project_items_project_id_fkey(id, item_type, file_path, thumbnail_url, mime_type, title, url)
      `)
      .eq("user_id", siteRow.owner_id)
      .eq("portfolio_slug", projectSlug)
      .eq("is_portfolio", true)
      .eq("portfolio_visibility", "public")
      .single();

    if (error || !project) return { site, portfolio: null };

    // Resolve gallery
    const allItems = project.project_items || [];
    const imageItems = allItems.filter((it: any) => it.item_type === "image" || it.item_type === "video");
    const galleryIds: string[] = project.portfolio_gallery_item_ids || [];

    let gallery: any[];
    if (galleryIds.length > 0) {
      gallery = galleryIds.map((gid: string) => imageItems.find((it: any) => it.id === gid)).filter(Boolean);
    } else {
      gallery = imageItems.slice(0, 12);
    }

    // Cover fallback
    const coverUrl =
      project.portfolio_cover_url ||
      project.cover_url ||
      (project.portfolio_cover_item_id ? imageItems.find((it: any) => it.id === project.portfolio_cover_item_id)?.url : null) ||
      imageItems[0]?.url ||
      null;

    const portfolio: PortfolioData = {
      id: project.id,
      title: project.portfolio_display_title || project.name,
      subtitle: project.portfolio_subtitle || null,
      category: project.portfolio_category || project.project_type || null,
      result: project.portfolio_result || null,
      summary: project.portfolio_summary || project.portfolio_description || project.description || null,
      coverUrl,
      introText: project.portfolio_intro_text || null,
      challengeText: project.portfolio_challenge_text || null,
      solutionText: project.portfolio_solution_text || null,
      resultText: project.portfolio_result_text || null,
      ctaLabel: project.portfolio_cta_label || null,
      ctaUrl: project.portfolio_cta_url || null,
      clientName: project.clients?.name || null,
      clientCompany: project.clients?.company || null,
      color: project.color,
      tags: project.tags || [],
      gallery: gallery.map((it: any) => ({
        id: it.id,
        type: it.item_type,
        url: it.url || it.file_path || it.thumbnail_url,
        title: it.title || null,
      })),
      seo: {
        title: project.portfolio_seo_title || project.portfolio_display_title || project.name,
        description: project.portfolio_seo_description || project.portfolio_summary || project.description || null,
        ogImage: coverUrl,
      },
    };

    return { site, portfolio };
  } catch (err) {
    console.error("[portfolio-page] resolve error:", err);
    return { site, portfolio: null };
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

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
  const hdrs = await headers();
  const isSubdomain = hdrs.get("x-subdomain-mode") === "1";
  const backHref = isSubdomain ? "/" : `/s/${slug}`;
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

  if (site.settings.maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#191919] mb-2">Site en maintenance</h1>
          <p className="text-[#5A5A58]">Ce site est temporairement indisponible. Revenez bientôt !</p>
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
          <a href={backHref} className="inline-block mt-6 text-sm font-medium text-[#4F46E5] hover:underline">&larr; Retour au site</a>
        </div>
      </div>
    );
  }

  return (
    <PortfolioCaseStudyPage
      portfolio={portfolio}
      site={site}
      siteSlug={slug}
      basePath={isSubdomain ? "" : undefined}
    />
  );
}
