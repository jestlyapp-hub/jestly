import type { Site, Block, BlockLink } from "@/types";

export interface ValidationError {
  blockId: string;
  blockType: string;
  pageName: string;
  message: string;
  severity: "error" | "warning";
}

/**
 * Block types that require a valid product selection to function.
 * These are "sale" blocks — their entire purpose is to sell a product.
 */
const SALE_BLOCKS_SINGLE: Set<string> = new Set([
  "product-hero-checkout",
  "inline-checkout",
  "pack-premium",
  "lead-magnet",
]);

const SALE_BLOCKS_MULTI: Set<string> = new Set([
  "services-list",
  "product-cards-grid",
  "bundle-builder",
  "pricing-table-real",
]);

/**
 * Recursively extract all BlockLink values from a block content object.
 */
function extractBlockLinks(obj: unknown): BlockLink[] {
  if (!obj || typeof obj !== "object") return [];
  const links: BlockLink[] = [];

  if ("type" in (obj as Record<string, unknown>)) {
    const t = (obj as Record<string, unknown>).type;
    if (t === "product" || t === "none" || t === "internal" || t === "external") {
      links.push(obj as BlockLink);
    }
  }

  for (const val of Object.values(obj as Record<string, unknown>)) {
    if (Array.isArray(val)) {
      for (const item of val) links.push(...extractBlockLinks(item));
    } else if (val && typeof val === "object") {
      links.push(...extractBlockLinks(val));
    }
  }

  return links;
}

/**
 * Validate a full site for publishing readiness.
 * Returns a list of errors/warnings.
 */
export function validateSite(site: Site): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const page of site.pages) {
    for (const block of page.blocks) {
      if (!block.visible) continue;

      const ctx = { blockId: block.id, blockType: block.type, pageName: page.name };
      const content = block.content as unknown as Record<string, unknown>;

      // 1) Sale blocks (single product) — productId must be set
      if (SALE_BLOCKS_SINGLE.has(block.type)) {
        const productId = content.productId as string | undefined;
        if (!productId) {
          errors.push({
            ...ctx,
            message: "Produit obligatoire — selectionnez un produit pour ce bloc",
            severity: "error",
          });
        }
      }

      // 2) Sale blocks (multi product) — productIds must have at least one
      if (SALE_BLOCKS_MULTI.has(block.type)) {
        const productIds = content.productIds as string[] | undefined;
        if (!productIds || productIds.length === 0) {
          errors.push({
            ...ctx,
            message: "Aucun produit selectionne — ajoutez au moins un produit",
            severity: "error",
          });
        }
      }

      // 3) service-cards in product_reference mode needs productIds
      if (block.type === "service-cards") {
        const mode = content.mode as string | undefined;
        const productIds = content.productIds as string[] | undefined;
        if (mode === "product_reference" && (!productIds || productIds.length === 0)) {
          errors.push({
            ...ctx,
            message: "Mode Produit actif mais aucun produit selectionne",
            severity: "error",
          });
        }
      }

      // 4) pricing-modern in product mode needs productIds
      if (block.type === "pricing-modern") {
        const mode = content.mode as string | undefined;
        const productIds = content.productIds as string[] | undefined;
        if (mode === "product" && (!productIds || productIds.length === 0)) {
          errors.push({
            ...ctx,
            message: "Mode Produit actif mais aucun produit selectionne",
            severity: "error",
          });
        }
      }

      // 5) Any blockLink of type "product" without productId
      const links = extractBlockLinks(content);
      for (const link of links) {
        if (link.type === "product" && !(link as { productId?: string }).productId) {
          errors.push({
            ...ctx,
            message: "Un lien CTA est de type Produit mais aucun produit n'est selectionne",
            severity: "error",
          });
          break; // one error per block is enough
        }
      }
    }
  }

  return errors;
}

/**
 * Get validation errors for a specific block.
 */
export function getBlockErrors(site: Site, blockId: string): ValidationError[] {
  return validateSite(site).filter((e) => e.blockId === blockId);
}

/**
 * Check if site has any blocking errors (prevents publication).
 */
export function canPublish(site: Site): boolean {
  return validateSite(site).filter((e) => e.severity === "error").length === 0;
}
