/**
 * Mapping item_id Google Ads ↔ produit Shopify (Partie A2).
 *
 * Le product_item_id du flux Shopping dépend de la config Merchant Center. Deux
 * grandes familles rencontrées en prod :
 *  - ID numérique nu → ID de VARIANTE Shopify (défaut du flux « Shopify » — LHM).
 *  - shopify_{PAYS}_{product_id}_{variant_id} / shopify_{PAYS}_{product_id}.
 *  - SKU de variante = item_id (flux dont l'attribut `id` est mappé sur le SKU —
 *    Mignou, dont les SKU sont au format fournisseur type `14:29#a1`,
 *    `14:175;200007763:201336342;5:4182`). Google renvoie l'item_id en minuscules
 *    → le matching SKU est INSENSIBLE À LA CASSE.
 *
 * Un item non mappable reste visible avec un libellé lisible (product_title du
 * flux, ou label extrait de l'item_id), jamais ignoré ni réduit à un id brut.
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

/**
 * Libellé lisible extrait d'un item_id non mappé (fallback honnête). Les item_id
 * de flux fournisseur encodent des attributs après `#` (`14:29#a gray` → « a gray »,
 * `14:193#green;5:100014064#s 41×31×17cm` → « green · s 41×31×17cm »). On extrait
 * ces segments humains ; à défaut on renvoie l'item_id brut.
 */
export function readableItemLabel(itemId: string): string {
  const labels: string[] = [];
  for (const seg of itemId.split(";")) {
    const hash = seg.indexOf("#");
    if (hash >= 0) {
      const label = seg.slice(hash + 1).trim();
      if (label) labels.push(label);
    }
  }
  return labels.length > 0 ? labels.join(" · ") : itemId.trim();
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
  /** SKU de variante (minuscules) → produit. Pont pour les flux où item_id = SKU. */
  bySku: Map<string, ShopifyProductRef>;
}

/** Index produit/variante/SKU depuis le cache shopify_products (variants jsonb). */
export function buildProductIndex(products: Array<{
  shopify_product_id: string;
  title: string;
  featured_image_url?: string | null;
  price_min?: number | null;
  variants?: Array<{ id?: string | number | null; sku?: string | null }> | null;
}>): ProductIndex {
  const byProductId = new Map<string, ShopifyProductRef>();
  const byVariantId = new Map<string, ShopifyProductRef>();
  const bySku = new Map<string, ShopifyProductRef>();
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
      const sku = v?.sku != null ? String(v.sku).trim().toLowerCase() : "";
      // Premier gagnant : un SKU dupliqué entre variantes reste rattaché à son
      // 1er produit (jamais écrasé silencieusement par une autre boutique — l'index
      // est de toute façon construit par boutique).
      if (sku && !bySku.has(sku)) bySku.set(sku, ref);
    }
  }
  return { byProductId, byVariantId, bySku };
}

/**
 * Résout un item_id vers son produit Shopify, ou null (→ libellé de repli).
 * Priorité : variante numérique > product_id > SKU (insensible à la casse).
 * L'ordre garantit la non-régression des flux numériques (LHM) tout en couvrant
 * les flux où l'item_id est le SKU (Mignou).
 */
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
  const bySku = index.bySku.get(itemId.trim().toLowerCase());
  if (bySku) return bySku;
  return null;
}
