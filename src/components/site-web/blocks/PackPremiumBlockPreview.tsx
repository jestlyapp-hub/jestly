"use client";

import { memo } from "react";
import type { PackPremiumBlockContent } from "@/types";
import { useProductById } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function PackPremiumBlockPreviewInner({ content }: { content: PackPremiumBlockContent }) {
  const product = useProductById(content.productId);

  if (!product) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px] text-[#999]">Aucun produit sélectionné</div>
        <div className="text-[11px] text-[#ccc] mt-1">Choisissez un pack depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  return (
    <div className={`text-center py-6 ${content.highlight ? "relative" : ""}`}>
      {content.highlight && (
        <div className="absolute inset-0 rounded-xl bg-[var(--site-primary)]/5 border border-[var(--site-primary)]/20" />
      )}
      <div className="relative">
        <h3 className="text-xl font-bold mb-1">{product.name}</h3>
        <p className="text-[13px] opacity-60 mb-2">{product.shortDescription}</p>
        {content.showPrice && (
          <div className="text-2xl font-bold text-[var(--site-primary)] mb-4">{formatPrice(product.priceCents)}</div>
        )}
        {content.showFeatures && product.features && (
          <ul className="space-y-1.5 mb-4 max-w-xs mx-auto">
            {product.features.map((f, i) => (
              <li key={i} className="text-[12px] opacity-70 flex items-center gap-2 justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </li>
            ))}
          </ul>
        )}
        <SmartLinkButton link={{ type: "product", productId: content.productId, mode: "checkout" }} label={content.ctaLabel} className="inline-block text-[13px] font-semibold px-5 py-2 cursor-pointer" />
      </div>
    </div>
  );
}

export default memo(PackPremiumBlockPreviewInner);
