"use client";

import { memo } from "react";
import type { ServicesListBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";

function ServicesListBlockPreviewInner({ content }: { content: ServicesListBlockContent }) {
  const products = useProductsByIds(content.productIds);

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px] text-[#999]">Aucun produit sélectionné</div>
        <div className="text-[11px] text-[#ccc] mt-1">Ajoutez des produits depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const isGrid = content.layout === "grid";

  // Pin featured products first
  const sorted = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="py-4">
      {content.title && (
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">{content.title}</h3>
      )}
      <div className={isGrid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
        {sorted.map((product) => (
          <div
            key={product.id}
            className={`p-3 rounded-lg border border-[#E6E6E4] ${isGrid ? "" : "flex items-start justify-between"}`}
          >
            <div className={isGrid ? "" : "flex-1"}>
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-semibold text-[#1A1A1A]">{product.name}</div>
                {product.featured && (
                  <span className="bg-[var(--site-primary)] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">En vedette</span>
                )}
              </div>
              <div className="text-[11px] text-[#999] mt-0.5">{product.shortDescription}</div>
              {content.showCategory && (
                <span className="inline-block text-[10px] font-medium text-[#999] bg-[#F7F7F5] px-1.5 py-0.5 rounded mt-1.5">
                  {product.category}
                </span>
              )}
            </div>
            {content.showPrice && (
              <span className={`text-[12px] font-medium text-[var(--site-primary)] whitespace-nowrap ${isGrid ? "block mt-2" : "ml-4"}`}>
                {product.price} €
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ServicesListBlockPreviewInner);
