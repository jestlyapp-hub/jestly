import { headers } from "next/headers";
import { getSiteBySlug } from "@/lib/site-resolver";
import { getPublicProductBySlug } from "@/lib/product-resolver";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ProductPublicPage from "@/components/site-public/ProductPublicPage";

export const revalidate = 60;

async function resolveProduct(slug: string, productSlug: string) {
  const site = await getSiteBySlug(slug);
  if (!site) return { site: null, product: null };

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbSite } = await (supabase.from("sites") as any)
      .select("id, owner_id")
      .eq("slug", slug)
      .single();

    if (!dbSite) return { site, product: null };

    const product = await getPublicProductBySlug(productSlug, dbSite.owner_id);
    return { site, product };
  } catch {
    return { site, product: null };
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
  const { site, product } = await resolveProduct(slug, productSlug);

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

  if (!product) {
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
          <h1 className="text-xl font-semibold text-[#191919] mb-2">Offre introuvable</h1>
          <p className="text-sm text-[#8A8A88]">Cette offre n&apos;existe pas ou n&apos;est plus disponible.</p>
          <a href={backHref} className="inline-block mt-6 text-sm font-medium text-[#4F46E5] hover:underline">&larr; Retour au site</a>
        </div>
      </div>
    );
  }

  return <ProductPublicPage product={product} siteSlug={slug} siteName={site.settings.name} basePath={isSubdomain ? "" : undefined} />;
}
