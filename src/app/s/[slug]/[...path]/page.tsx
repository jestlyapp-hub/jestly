import { getSiteBySlug, getPageByPath } from "@/lib/site-resolver";
import { getPublicProductsByIds } from "@/lib/product-resolver";
import { extractProductIdsFromBlocks } from "@/lib/product-context-utils";
import SitePublicRenderer from "@/components/site-public/SitePublicRenderer";
import NotFoundPage from "@/components/site-public/NotFoundPage";

export const revalidate = 60;

export default async function PublicSiteSubPage({
  params,
}: {
  params: Promise<{ slug: string; path: string[] }>;
}) {
  const { slug, path } = await params;
  const site = await getSiteBySlug(slug);

  if (!site) {
    return <NotFoundPage type="site" />;
  }

  const pathString = path.join("/");
  const page = getPageByPath(site, pathString);

  if (!page) {
    return <NotFoundPage type="page" />;
  }

  // Prefetch products referenced in blocks
  const productIds = extractProductIdsFromBlocks(page.blocks);
  const products = productIds.length > 0 ? await getPublicProductsByIds(productIds) : [];

  return <SitePublicRenderer site={site} page={page} products={products} />;
}
