"use client";

import { memo, useState } from "react";
import { useProductsByIds } from "@/lib/product-context";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

interface ProductCardsGridBlockContent {
  productIds: string[];
  columns: 2 | 3 | 4;
  showFilter: boolean;
  ctaLabel: string;
}

function ProductCardsGridBlockPreviewInner({ content }: { content: ProductCardsGridBlockContent }) {
  const products = useProductsByIds(content.productIds);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px] text-[#999]">Aucun produit sélectionné</div>
        <div className="text-[11px] text-[#ccc] mt-1">Ajoutez des produits depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : products;

  const cols =
    content.columns === 2
      ? "grid-cols-2"
      : content.columns === 4
        ? "grid-cols-4"
        : "grid-cols-3";

  return (
    <div className="py-6">
      {content.showFilter && categories.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-colors ${
              activeCategory === null
                ? "bg-[var(--site-primary)] text-white border-[var(--site-primary)]"
                : "bg-white text-[#999] border-[#E6E6E4] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--site-primary)] text-white border-[var(--site-primary)]"
                  : "bg-white text-[#999] border-[#E6E6E4] hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className={`grid ${cols} gap-4`}>
        {filtered.map((product) => (
          <div
            key={product.id}
            className="rounded-xl border border-[#E6E6E4] p-4 flex flex-col"
          >
            {/* Category badge */}
            <span className="inline-block self-start text-[9px] font-bold text-[var(--site-primary)] bg-[var(--site-primary-light)] px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
              {product.category}
            </span>

            <div className="text-[13px] font-semibold text-[#1A1A1A] mb-1">{product.name}</div>
            <p className="text-[11px] text-[#999] mb-3 flex-1">{product.shortDescription}</p>

            <div className="text-lg font-bold text-[#1A1A1A] mb-3">{product.price} &euro;</div>

            <SmartLinkButton link={{ type: "product", productId: product.id, mode: "checkout" }} label={content.ctaLabel} className="block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ProductCardsGridBlockPreviewInner);
