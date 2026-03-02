import { getSiteBySlug } from "@/lib/site-resolver";
import { getPublicProductBySlug } from "@/lib/product-resolver";
import { getProductBySlug as getMockProductBySlug } from "@/lib/mock-data";
import CheckoutStepper from "@/components/site-public/CheckoutStepper";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function PublicOrderPage({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const site = await getSiteBySlug(slug);

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

  // Try to resolve the site owner for product lookup
  let product = null;
  let siteId = site.id;

  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbSite } = await (supabase.from("sites") as any)
      .select("id, owner_id")
      .eq("slug", slug)
      .single();

    if (dbSite) {
      siteId = dbSite.id;
      product = await getPublicProductBySlug(productSlug, dbSite.owner_id);
    }
  } catch {
    // Fallback to mock
  }

  // Fallback to mock data
  if (!product) {
    const mockProduct = getMockProductBySlug(productSlug);
    if (mockProduct) {
      product = mockProduct;
    }
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
          <a href={`/s/${slug}`} className="inline-block mt-6 text-sm font-medium text-[#4F46E5] hover:underline">&larr; Retour au site</a>
        </div>
      </div>
    );
  }

  return <CheckoutStepper product={product} siteId={siteId} siteSlug={slug} />;
}
