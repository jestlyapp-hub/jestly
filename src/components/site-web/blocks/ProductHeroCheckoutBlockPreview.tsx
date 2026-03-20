"use client";

import { memo } from "react";
import { useProductById } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

interface ProductHeroCheckoutBlockContent {
  productId: string;
  benefits: string[];
  ctaLabel: string;
  showFeatures: boolean;
  layout: "left" | "center";
  briefTemplateId?: string | null;
}

function ProductHeroCheckoutBlockPreviewInner({ content }: { content: ProductHeroCheckoutBlockContent }) {
  const product = useProductById(content.productId);

  if (!product) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px]" style={{ color: "var(--site-muted, #999)" }}>Aucun produit sélectionné</div>
        <div className="text-[11px] mt-1" style={{ color: "var(--site-muted, #ccc)" }}>Choisissez un produit depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const isCenter = content.layout === "center";

  if (isCenter) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--site-text, #191919)" }}>{product.name}</h2>
        <p className="text-[13px] mb-4 max-w-md mx-auto" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</p>
        <div className="text-3xl font-bold text-[var(--site-primary)] mb-5">{formatPrice(product.priceCents)}</div>

        {content.benefits.length > 0 && (
          <ul className="space-y-2 mb-5 max-w-sm mx-auto">
            {content.benefits.map((b, i) => (
              <li key={i} className="text-[12px] flex items-center gap-2 justify-center" style={{ color: "var(--site-text, #191919)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {b}
              </li>
            ))}
          </ul>
        )}

        {content.showFeatures && product.features && product.features.length > 0 && (
          <div className="border-t pt-4 mt-4 max-w-sm mx-auto" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--site-muted, #999)" }}>Inclus</div>
            <ul className="space-y-1.5">
              {product.features.map((f, i) => (
                <li key={i} className="text-[11px] opacity-70 flex items-center gap-2 justify-center" style={{ color: "var(--site-text, #191919)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <SmartLinkButton link={{ type: "product", productId: content.productId, mode: "checkout", briefTemplateId: content.briefTemplateId || undefined }} label={content.ctaLabel} className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer" />
        </div>
      </div>
    );
  }

  // Layout: left — text on left, image placeholder on right
  return (
    <div className="py-8 flex gap-8 items-center">
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--site-text, #191919)" }}>{product.name}</h2>
        <p className="text-[13px] mb-3" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</p>
        <div className="text-3xl font-bold text-[var(--site-primary)] mb-4">{formatPrice(product.priceCents)}</div>

        {content.benefits.length > 0 && (
          <ul className="space-y-2 mb-4">
            {content.benefits.map((b, i) => (
              <li key={i} className="text-[12px] flex items-center gap-2" style={{ color: "var(--site-text, #191919)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {b}
              </li>
            ))}
          </ul>
        )}

        {content.showFeatures && product.features && product.features.length > 0 && (
          <div className="border-t pt-3 mt-3" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--site-muted, #999)" }}>Inclus</div>
            <ul className="space-y-1.5">
              {product.features.map((f, i) => (
                <li key={i} className="text-[11px] opacity-70 flex items-center gap-2" style={{ color: "var(--site-text, #191919)" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5">
          <SmartLinkButton link={{ type: "product", productId: content.productId, mode: "checkout", briefTemplateId: content.briefTemplateId || undefined }} label={content.ctaLabel} className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer" />
        </div>
      </div>

      {/* Image placeholder */}
      <div className="flex-1 aspect-square rounded-xl border flex items-center justify-center" style={{ background: "var(--site-surface, #F7F7F5)", borderColor: "var(--site-border, #E6E6E4)" }}>
        <div className="text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #ccc)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <div className="text-[11px]" style={{ color: "var(--site-muted, #ccc)" }}>Image produit</div>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductHeroCheckoutBlockPreviewInner);
