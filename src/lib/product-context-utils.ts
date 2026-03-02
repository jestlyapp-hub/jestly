import type { Block } from "@/types";

/**
 * Extract all product IDs referenced in blocks.
 * Used on the server to prefetch products before rendering.
 */
export function extractProductIdsFromBlocks(blocks: Block[]): string[] {
  const ids = new Set<string>();

  for (const block of blocks) {
    const content = block.content as unknown as Record<string, unknown>;

    // services-list: productIds[]
    if (Array.isArray(content.productIds)) {
      for (const id of content.productIds) {
        if (typeof id === "string" && id) ids.add(id);
      }
    }

    // pack-premium, centered-cta, inline-checkout, product-hero-checkout: productId
    if (typeof content.productId === "string" && content.productId) {
      ids.add(content.productId);
    }

    // pricing-table, comparison-table: plans[].productId
    if (Array.isArray(content.plans)) {
      for (const plan of content.plans) {
        if (typeof plan === "object" && plan && typeof (plan as Record<string, unknown>).productId === "string") {
          ids.add((plan as Record<string, string>).productId);
        }
      }
    }

    // service-cards: services[].productId
    if (Array.isArray(content.services)) {
      for (const svc of content.services) {
        if (typeof svc === "object" && svc && typeof (svc as Record<string, unknown>).productId === "string") {
          ids.add((svc as Record<string, string>).productId);
        }
      }
    }
  }

  return Array.from(ids);
}
