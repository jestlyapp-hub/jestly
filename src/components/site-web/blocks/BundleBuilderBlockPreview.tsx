"use client";

import { memo, useState } from "react";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

interface BundleBuilderBlockContent {
  productIds: string[];
  title: string;
  description: string;
  ctaLabel: string;
  discountPercent: number;
  briefTemplateId?: string | null;
}

function BundleBuilderBlockPreviewInner({ content }: { content: BundleBuilderBlockContent }) {
  const products = useProductsByIds(content.productIds);
  const [checked, setChecked] = useState<Set<string>>(() => new Set(products.map((p) => p.id)));

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px] text-[#999]">Aucun produit sélectionné</div>
        <div className="text-[11px] text-[#ccc] mt-1">Ajoutez des produits depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const toggleProduct = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalPrice = products
    .filter((p) => checked.has(p.id))
    .reduce((sum, p) => sum + p.priceCents, 0);

  const discountedPrice = Math.round(totalPrice * (1 - content.discountPercent / 100));
  const savings = totalPrice - discountedPrice;

  return (
    <div className="py-6">
      {/* Header */}
      <div className="text-center mb-5">
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{content.title}</h3>
        {content.description && (
          <p className="text-[12px] text-[#999] max-w-md mx-auto">{content.description}</p>
        )}
      </div>

      {/* Product list with checkboxes */}
      <div className="rounded-xl border border-[#E6E6E4] divide-y divide-[#E6E6E4] mb-5">
        {products.map((product) => {
          const isChecked = checked.has(product.id);
          return (
            <div
              key={product.id}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isChecked ? "bg-white" : "bg-[#F7F7F5] opacity-60"}`}
              onClick={() => toggleProduct(product.id)}
            >
              {/* Checkbox */}
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? "bg-[var(--site-primary)] border-[var(--site-primary)]" : "border-[#E6E6E4] bg-white"}`}>
                {isChecked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A1A1A]">{product.name}</div>
                <div className="text-[11px] text-[#999] truncate">{product.shortDescription}</div>
              </div>

              <div className="text-[13px] font-medium text-[#1A1A1A] whitespace-nowrap">{formatPrice(product.priceCents)}</div>
            </div>
          );
        })}
      </div>

      {/* Price summary */}
      <div className="rounded-xl border border-[#E6E6E4] p-4 mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] text-[#999]">Sous-total</span>
          <span className="text-[12px] text-[#999] line-through">{formatPrice(totalPrice)}</span>
        </div>
        {content.discountPercent > 0 && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-[var(--site-primary)] font-medium">Remise pack -{content.discountPercent}%</span>
            <span className="text-[12px] text-[var(--site-primary)] font-medium">-{formatPrice(savings)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-[#E6E6E4]">
          <span className="text-[14px] font-bold text-[#1A1A1A]">Total</span>
          <span className="text-xl font-bold text-[var(--site-primary)]">{formatPrice(discountedPrice)}</span>
        </div>
      </div>

      {/* CTA — link to first checked product's checkout */}
      <div className="text-center">
        {(() => {
          const firstChecked = products.find((p) => checked.has(p.id));
          return (
            <SmartLinkButton
              link={firstChecked ? { type: "product", productId: firstChecked.id, mode: "checkout", briefTemplateId: content.briefTemplateId ?? undefined } : { type: "none" }}
              label={content.ctaLabel}
              className="inline-block text-[13px] font-semibold px-6 py-2.5 cursor-pointer"
            />
          );
        })()}
      </div>
    </div>
  );
}

export default memo(BundleBuilderBlockPreviewInner);
