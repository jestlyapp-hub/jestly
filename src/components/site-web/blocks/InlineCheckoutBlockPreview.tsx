"use client";

import { memo } from "react";
import { useProductById } from "@/lib/product-context";
import { getProductById as getMockProductById } from "@/lib/mock-data";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

interface InlineCheckoutBlockContent {
  productId: string;
  layout: "compact" | "detailed";
  ctaLabel: string;
}

function InlineCheckoutBlockPreviewInner({ content }: { content: InlineCheckoutBlockContent }) {
  const contextProduct = useProductById(content.productId);
  const product = contextProduct || (content.productId ? getMockProductById(content.productId) : undefined);

  if (!product) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px] text-[#999]">Aucun produit sélectionné</div>
        <div className="text-[11px] text-[#ccc] mt-1">Choisissez un produit depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const isCompact = content.layout === "compact";

  if (isCompact) {
    return (
      <div className="py-6">
        <div className="rounded-xl border border-[#E6E6E4] p-5">
          {/* Product info line */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold text-[#1A1A1A]">{product.name}</div>
              <div className="text-[11px] text-[#999]">{product.shortDescription}</div>
            </div>
            <div className="text-lg font-bold text-[var(--site-primary)] whitespace-nowrap ml-4">{product.price} &euro;</div>
          </div>

          {/* Compact horizontal form */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-medium text-[#999] uppercase tracking-wider block mb-1">Nom</label>
              <div className="h-9 rounded-lg border border-[#E6E6E4] bg-[#F7F7F5] px-3 flex items-center text-[12px] text-[#ccc]">
                Votre nom
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium text-[#999] uppercase tracking-wider block mb-1">Email</label>
              <div className="h-9 rounded-lg border border-[#E6E6E4] bg-[#F7F7F5] px-3 flex items-center text-[12px] text-[#ccc]">
                votre@email.com
              </div>
            </div>
            <span
              className="btn-styled text-[12px] font-semibold px-5 py-2 cursor-pointer whitespace-nowrap"
              style={getButtonInlineStyle()}
            >
              {content.ctaLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Detailed: vertical layout with product details
  return (
    <div className="py-6">
      <div className="rounded-xl border border-[#E6E6E4] p-6 max-w-md mx-auto">
        {/* Product details */}
        <div className="text-center mb-5">
          <div className="text-lg font-bold text-[#1A1A1A] mb-1">{product.name}</div>
          <p className="text-[12px] text-[#999] mb-3">{product.shortDescription}</p>
          <div className="text-2xl font-bold text-[var(--site-primary)]">{product.price} &euro;</div>
        </div>

        {product.features && product.features.length > 0 && (
          <ul className="space-y-1.5 mb-5 border-t border-[#E6E6E4] pt-4">
            {product.features.slice(0, 4).map((f, i) => (
              <li key={i} className="text-[11px] text-[#1A1A1A] opacity-70 flex items-center gap-2">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Vertical form */}
        <div className="space-y-3 border-t border-[#E6E6E4] pt-4">
          <div>
            <label className="text-[10px] font-medium text-[#999] uppercase tracking-wider block mb-1">Nom complet</label>
            <div className="h-9 rounded-lg border border-[#E6E6E4] bg-[#F7F7F5] px-3 flex items-center text-[12px] text-[#ccc]">
              Votre nom
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium text-[#999] uppercase tracking-wider block mb-1">Email</label>
            <div className="h-9 rounded-lg border border-[#E6E6E4] bg-[#F7F7F5] px-3 flex items-center text-[12px] text-[#ccc]">
              votre@email.com
            </div>
          </div>
          <span
            className="btn-styled block text-center text-[13px] font-semibold px-5 py-2.5 cursor-pointer mt-2"
            style={getButtonInlineStyle()}
          >
            {content.ctaLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(InlineCheckoutBlockPreviewInner);
