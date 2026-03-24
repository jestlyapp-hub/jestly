"use client";

import { memo } from "react";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

interface PricingTableRealBlockContent {
  productIds: string[];
  columns: 2 | 3;
  showFeatures: boolean;
  highlightIndex: number;
  ctaLabel: string;
  briefTemplateId?: string | null;
}

function PricingTableRealBlockPreviewInner({ content }: { content: PricingTableRealBlockContent }) {
  const products = useProductsByIds(content.productIds);

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px]" style={{ color: "var(--site-muted, #999)" }}>Aucun produit sélectionné</div>
        <div className="text-[11px] mt-1" style={{ color: "var(--site-muted, #ccc)" }}>Ajoutez des produits depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const cols = content.columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="py-6">
      <div className={`grid ${cols} gap-4`}>
        {products.map((product, index) => {
          const isHighlighted = index === content.highlightIndex;

          return (
            <div
              key={product.id}
              className={`rounded-xl border p-5 flex flex-col relative ${
                isHighlighted
                  ? "border-[var(--site-primary)] border-2 shadow-lg"
                  : "border"
              }`}
              style={isHighlighted ? undefined : { borderColor: "var(--site-border, #E6E6E4)" }}
            >
              {isHighlighted && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[var(--site-primary)] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ color: "var(--btn-text, #fff)" }}>
                  Populaire
                </span>
              )}

              {/* Product name */}
              <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--site-text, #191919)" }}>{product.name}</div>
              <div className="text-[11px] mb-3" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</div>

              {/* Price */}
              <div className="text-2xl font-bold mb-4" style={{ color: "var(--site-text, #191919)" }}>{formatPrice(product.priceCents)}</div>

              {/* Features */}
              {content.showFeatures && product.features && product.features.length > 0 && (
                <ul className="space-y-1.5 mb-5 flex-1">
                  {product.features.map((f, fi) => (
                    <li key={fi} className="text-[11px] opacity-70 flex items-center gap-1.5" style={{ color: "var(--site-text, #191919)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* CTA */}
              <SmartLinkButton link={{ type: "product", productId: product.id, mode: "checkout", briefTemplateId: content.briefTemplateId || undefined }} label={content.ctaLabel} className="block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer mt-auto" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(PricingTableRealBlockPreviewInner);
