"use client";

import { memo } from "react";
import type { ServicesListBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function ServicesListBlockPreviewInner({ content }: { content: ServicesListBlockContent }) {
  const products = useProductsByIds(content.productIds);

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px]" style={{ color: "var(--site-muted, #999)" }}>Aucun produit sélectionné</div>
        <div className="text-[11px] mt-1" style={{ color: "var(--site-muted, #ccc)" }}>Ajoutez des produits depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const isGrid = content.layout === "grid";
  const ctaMode = content.ctaMode || "product_checkout";

  // Pin featured products first
  const sorted = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto px-6">
      {content.title && (
        <h3 className="text-lg font-bold mb-4" style={{ color: "var(--site-text, #1A1A1A)" }}>{content.title}</h3>
      )}
      <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "space-y-3"}>
        {sorted.map((product) => (
          <div
            key={product.id}
            className={`p-3 rounded-lg ${isGrid ? "" : "flex items-start justify-between"}`}
            style={{ border: "1px solid var(--site-border, #E6E6E4)" }}
          >
            <div className={isGrid ? "" : "flex-1"}>
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-semibold" style={{ color: "var(--site-text, #1A1A1A)" }}>{product.name}</div>
                {product.featured && (
                  <span className="text-white text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--site-primary)" }}>En vedette</span>
                )}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</div>
              {content.showCategory && (
                <span className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-1.5" style={{ color: "var(--site-muted, #999)", background: "var(--site-surface, #F7F7F5)" }}>
                  {product.category}
                </span>
              )}
            </div>
            <div className={`flex items-center gap-3 ${isGrid ? "mt-3" : "ml-4 flex-shrink-0"}`}>
              {content.showPrice && (
                <span className="text-[12px] font-medium whitespace-nowrap" style={{ color: "var(--site-primary)" }}>
                  {formatPrice(product.priceCents)}
                </span>
              )}
              <SmartLinkButton
                link={{
                  type: "product",
                  productId: product.id,
                  mode: ctaMode === "product_page" ? "page" : "checkout",
                  briefTemplateId: content.briefTemplateId ?? undefined,
                }}
                label={product.ctaLabel || "Commander"}
                className="text-[11px] font-semibold px-3 py-1.5 cursor-pointer whitespace-nowrap"
              />
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default memo(ServicesListBlockPreviewInner);
