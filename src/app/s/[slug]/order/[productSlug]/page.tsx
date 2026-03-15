import { headers } from "next/headers";
import { getSiteBySlug } from "@/lib/site-resolver";
import { getPublicProductBySlug } from "@/lib/product-resolver";
import CheckoutStepper from "@/components/site-public/CheckoutStepper";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function PublicOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
  searchParams: Promise<{ brief?: string }>;
}) {
  const { slug, productSlug } = await params;
  const { brief: briefTemplateId } = await searchParams;
  const hdrs = await headers();
  const isSubdomain = hdrs.get("x-subdomain-mode") === "1";
  const backHref = isSubdomain ? "/" : `/s/${slug}`;
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

  if (site.settings.maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Site en maintenance</h1>
          <p className="text-[#5A5A58]">Ce site est temporairement indisponible. Revenez bientôt !</p>
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
    // Product not found
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

  return (
    <CheckoutStepper
      product={product}
      siteId={siteId}
      siteSlug={slug}
      basePath={isSubdomain ? "" : undefined}
      briefTemplateId={briefTemplateId || null}
      useProductDefaultBrief={!briefTemplateId}
    />
  );
}
