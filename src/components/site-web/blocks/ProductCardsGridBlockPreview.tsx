"use client";

import { memo, useState, useContext } from "react";
import { useProductsByIds, ProductContext } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

interface ProductCardsGridBlockContent {
  productIds: string[];
  columns: 2 | 3 | 4;
  showFilter: boolean;
  ctaLabel: string;
  briefTemplateId?: string | null;
}

function ProductCardsGridBlockPreviewInner({ content }: { content: ProductCardsGridBlockContent }) {
  const products = useProductsByIds(content.productIds);
  const { isPublic } = useContext(ProductContext);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (products.length === 0) {
    // Public site: friendly "coming soon" message
    if (isPublic) {
      return (
        <div className="py-12 text-center">
          <div className="text-[15px] font-medium" style={{ color: "var(--site-text, #191919)" }}>Offres bientôt disponibles</div>
          <div className="text-[13px] mt-1.5" style={{ color: "var(--site-muted, #999)" }}>Nous préparons actuellement nos offres. Revenez bientôt.</div>
        </div>
      );
    }
    // Builder: warning with guidance
    const hasDraftIds = content.productIds.length > 0;
    return (
      <div className="py-8 text-center">
        {hasDraftIds ? (
          <>
            <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              Aucune offre publiée dans ce bloc
            </div>
            <div className="text-[11px]" style={{ color: "var(--site-muted, #999)" }}>Les produits en brouillon ne sont pas visibles sur votre site public.</div>
          </>
        ) : (
          <>
            <div className="text-[13px]" style={{ color: "var(--site-muted, #999)" }}>Aucun produit sélectionné</div>
            <div className="text-[11px] mt-1" style={{ color: "var(--site-muted, #ccc)" }}>Ajoutez des produits depuis l&apos;onglet Contenu</div>
          </>
        )}
      </div>
    );
  }

  const categories = [...new Set(products.map((p) => p.category))];
  const filtered = activeCategory ? products.filter((p) => p.category === activeCategory) : products;

  const cols =
    content.columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : content.columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="py-6">
      {content.showFilter && categories.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-colors ${
              activeCategory === null
                ? "bg-[var(--site-primary)] border-[var(--site-primary)]"
                : "border hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]"
            }`}
            style={activeCategory === null ? { color: "var(--btn-text, #fff)" } : { background: "var(--site-bg, #fff)", color: "var(--site-muted, #999)", borderColor: "var(--site-border, #E6E6E4)" }}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-[var(--site-primary)] border-[var(--site-primary)]"
                  : "border hover:border-[var(--site-primary)] hover:text-[var(--site-primary)]"
              }`}
              style={activeCategory === cat ? { color: "var(--btn-text, #fff)" } : { background: "var(--site-bg, #fff)", color: "var(--site-muted, #999)", borderColor: "var(--site-border, #E6E6E4)" }}
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
            className="rounded-xl border p-4 flex flex-col"
            style={{ borderColor: "var(--site-border, #E6E6E4)" }}
          >
            {/* Category badge */}
            <span className="inline-block self-start text-[9px] font-bold text-[var(--site-primary)] bg-[var(--site-primary-light)] px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
              {product.category}
            </span>

            <div className="text-[13px] font-semibold mb-1 line-clamp-2" style={{ color: "var(--site-text, #191919)" }}>{product.name}</div>
            <p className="text-[11px] mb-3 flex-1 line-clamp-2" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</p>

            <div className="text-lg font-bold mb-3" style={{ color: "var(--site-text, #191919)" }}>{formatPrice(product.priceCents)}</div>

            <SmartLinkButton link={{ type: "product", productId: product.id, mode: "checkout", briefTemplateId: content.briefTemplateId || undefined }} label={content.ctaLabel} className="block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(ProductCardsGridBlockPreviewInner);
