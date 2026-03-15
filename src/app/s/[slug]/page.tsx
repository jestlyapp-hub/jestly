import { headers } from "next/headers";
import { getSiteBySlug, getPageByPath } from "@/lib/site-resolver";
import { getPublicProductsByIds } from "@/lib/product-resolver";
import { extractProductIdsFromBlocks } from "@/lib/product-context-utils";
import SitePublicRenderer from "@/components/site-public/SitePublicRenderer";
import NotFoundPage from "@/components/site-public/NotFoundPage";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function PublicSiteHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    return <NotFoundPage type="site" />;
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

  // Detect subdomain mode (set by middleware rewrite)
  const hdrs = await headers();
  const isSubdomain = hdrs.get("x-subdomain-mode") === "1";
  const siteWithBasePath = { ...site, basePath: isSubdomain ? "" : `/s/${slug}` };

  const page = getPageByPath(siteWithBasePath, "/");

  if (!page) {
    return <NotFoundPage type="page" />;
  }

  // Prefetch products referenced in blocks
  const productIds = extractProductIdsFromBlocks(page.blocks);
  const products = productIds.length > 0 ? await getPublicProductsByIds(productIds) : [];

  return <SitePublicRenderer site={siteWithBasePath} page={page} products={products} />;
}
