/**
 * Mapping item_id Google Ads ↔ produit Shopify (Partie A2).
 *
 * Le product_item_id du flux Shopping dépend de la config Merchant Center :
 *  - ID numérique nu → ID de VARIANTE Shopify (défaut du flux Shopify)
 *  - shopify_{PAYS}_{product_id}_{variant_id} (flux « Shopify » historique)
 *  - shopify_{PAYS}_{product_id}
 * Google renvoie l'item_id en minuscules — le parsing est insensible à la casse.
 * Un item non mappable reste visible en « Produit inconnu (item_id) »,
 * jamais ignoré en silence.
 */

export interface ParsedItemId {
  product_id: string | null;
  variant_id: string | null;
}

export function parseItemId(itemId: string): ParsedItemId {
  const raw = itemId.trim();
  // shopify_FR_1234567_8901234 ou shopify_fr_1234567
  const m = /^shopify_[a-z]{2}_(\d+)(?:_(\d+))?$/i.exec(raw);
  if (m) return { product_id: m[1], variant_id: m[2] ?? null };
  // ID numérique nu = variante Shopify (défaut)
  if (/^\d{5,20}$/.test(raw)) return { product_id: null, variant_id: raw };
  return { product_id: null, variant_id: null };
}

export interface ShopifyProductRef {
  shopify_product_id: string;
  title: string;
  image_url: string | null;
  price_cents: number | null;
}

export interface ProductIndex {
  byProductId: Map<string, ShopifyProductRef>;
  byVariantId: Map<string, ShopifyProductRef>;
}

/** Index produit/variante depuis le cache shopify_products (variants jsonb). */
export function buildProductIndex(products: Array<{
  shopify_product_id: string;
  title: string;
  featured_image_url?: string | null;
  price_min?: number | null;
  variants?: Array<{ id?: string | number | null }> | null;
}>): ProductIndex {
  const byProductId = new Map<string, ShopifyProductRef>();
  const byVariantId = new Map<string, ShopifyProductRef>();
  for (const p of products) {
    const ref: ShopifyProductRef = {
      shopify_product_id: p.shopify_product_id,
      title: p.title,
      image_url: p.featured_image_url ?? null,
      price_cents: p.price_min != null ? Math.round(p.price_min * 100) : null,
    };
    byProductId.set(p.shopify_product_id, ref);
    for (const v of p.variants ?? []) {
      if (v?.id != null) byVariantId.set(String(v.id), ref);
    }
  }
  return { byProductId, byVariantId };
}

/** Résout un item_id vers son produit Shopify, ou null (→ « Produit inconnu »). */
export function mapItemToProduct(itemId: string, index: ProductIndex): ShopifyProductRef | null {
  const parsed = parseItemId(itemId);
  if (parsed.variant_id) {
    const byVariant = index.byVariantId.get(parsed.variant_id);
    if (byVariant) return byVariant;
  }
  if (parsed.product_id) {
    const byProduct = index.byProductId.get(parsed.product_id);
    if (byProduct) return byProduct;
  }
  return null;
}
