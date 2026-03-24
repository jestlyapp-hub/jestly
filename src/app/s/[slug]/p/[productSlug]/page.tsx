import { headers } from "next/headers";
import { getSiteBySlug } from "@/lib/site-resolver";
import { getPublicProductBySlug, getProductStatusBySlug } from "@/lib/product-resolver";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ProductPublicPage from "@/components/site-public/ProductPublicPage";

export const revalidate = 60;

async function resolveProduct(slug: string, productSlug: string) {
  const site = await getSiteBySlug(slug);
  if (!site) return { site: null, product: null, existsButNotActive: false };

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbSite } = await (supabase.from("sites") as any)
      .select("id, owner_id")
      .eq("slug", slug)
      .single();

    if (!dbSite) return { site, product: null, existsButNotActive: false };

    const product = await getPublicProductBySlug(productSlug, dbSite.owner_id);
    if (product) return { site, product, existsButNotActive: false };

    // Product not active — check if it exists with another status
    const status = await getProductStatusBySlug(productSlug, dbSite.owner_id);
    if (status && status !== "active") {
      console.log(`[product-public] slug=${productSlug} status=${status} reason=not_active`);
      return { site, product: null, existsButNotActive: true };
    }

    console.log(`[product-public] slug=${productSlug} reason=not_found`);
    return { site, product: null, existsButNotActive: false };
  } catch {
    return { site, product: null, existsButNotActive: false };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const { site, product } = await resolveProduct(slug, productSlug);

  if (!site || !product) {
    return { title: "Produit introuvable" };
  }

  return {
    title: `${product.name} — ${site.settings.name}`,
    description: product.shortDescription || product.name,
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.name,
      ...(product.coverImageUrl ? { images: [product.coverImageUrl] } : {}),
    },
  };
}

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const hdrs = await headers();
  const isSubdomain = hdrs.get("x-subdomain-mode") === "1";
  const backHref = isSubdomain ? "/" : `/s/${slug}`;
  const { site, product, existsButNotActive } = await resolveProduct(slug, productSlug);

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

  // ── Offre non disponible (existe en draft/archived) ──
  if (!product && existsButNotActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#191919] mb-2">Offre non disponible</h1>
          <p className="text-sm text-[#5A5A58] leading-relaxed mb-6">
            Cette offre existe mais n&apos;est pas encore disponible publiquement.
            <br />
            Elle sera accessible dès sa publication par le créateur.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4F46E5] hover:underline">
              &larr; Retour au site
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Offre introuvable (slug invalide / supprimée) ──
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#F7F7F5] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#191919] mb-2">Offre introuvable</h1>
          <p className="text-sm text-[#8A8A88] mb-6">
            Cette offre n&apos;existe pas ou a été supprimée.
          </p>
          <a href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4F46E5] hover:underline">
            &larr; Retour au site
          </a>
        </div>
      </div>
    );
  }

  return <ProductPublicPage product={product} siteSlug={slug} siteName={site.settings.name} basePath={isSubdomain ? "" : undefined} />;
}
