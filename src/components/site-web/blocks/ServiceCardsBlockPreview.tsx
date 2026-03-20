import { memo } from "react";
import type { ServiceCardsBlockContent } from "@/types";
import { useProductsByIds } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";
import { getIcon } from "@/lib/icons";

function ServiceCardsBlockPreviewInner({ content }: { content: ServiceCardsBlockContent }) {
  const mode = content.mode || "static";
  const products = useProductsByIds(mode === "product_reference" ? (content.productIds || []) : []);
  const cols =
    content.columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : content.columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  const ctaMode = content.ctaMode || "product_checkout";
  const showPrice = content.showPrice ?? true;

  // Product reference mode
  if (mode === "product_reference") {
    if (products.length === 0) {
      return (
        <div className="py-8 text-center">
          <div className="text-[13px]" style={{ color: "var(--site-muted, #999)" }}>Aucun produit sélectionné</div>
          <div className="text-[11px] mt-1" style={{ color: "var(--site-muted, #ccc)" }}>Ajoutez des produits depuis l&apos;onglet Contenu</div>
        </div>
      );
    }

    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-6">
          {content.title && <h3 className="text-lg font-bold text-center mb-6" style={{ color: "var(--site-text, #191919)" }}>{content.title}</h3>}
          <div className={`grid ${cols} gap-4`}>
            {products.map((product) => (
              <div key={product.id} className="rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col" style={{ border: "1px solid var(--site-border, #E6E6E4)", background: "var(--site-surface, #fff)" }}>
                {product.thumbnailUrl && (
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--site-primary-light, #EEF2FF)", color: "var(--site-primary, #4F46E5)" }}>
                  {getIcon("star")}
                </div>
                <div className="text-[14px] font-bold mb-1" style={{ color: "var(--site-text, #191919)" }}>{product.name}</div>
                <div className="text-[11px] opacity-50 mb-3" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</div>
                {product.features && product.features.length > 0 && (
                  <ul className="space-y-1 mb-4 flex-1">
                    {product.features.map((f, fi) => (
                      <li key={fi} className="text-[11px] opacity-60 flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {showPrice && <div className="text-lg font-bold mb-3" style={{ color: "var(--site-primary, #4F46E5)" }}>{formatPrice(product.priceCents)}</div>}
                <SmartLinkButton
                  link={{
                    type: "product",
                    productId: product.id,
                    mode: ctaMode === "product_page" ? "page" : "checkout",
                    briefTemplateId: content.briefTemplateId ?? undefined,
                  }}
                  label={product.ctaLabel || "Commander"}
                  className="block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer mt-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Static mode (original behavior)
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        {content.title && <h3 className="text-lg font-bold text-center mb-6" style={{ color: "var(--site-text, #191919)" }}>{content.title}</h3>}
        <div className={`grid ${cols} gap-4`}>
          {content.services.map((s, i) => (
            <div key={i} className="rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col" style={{ border: "1px solid var(--site-border, #E6E6E4)", background: "var(--site-surface, #fff)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--site-primary-light, #EEF2FF)", color: "var(--site-primary, #4F46E5)" }}>
                {getIcon(s.icon)}
              </div>
              <div className="text-[14px] font-bold mb-1" style={{ color: "var(--site-text, #191919)" }}>{s.name}</div>
              <div className="text-[11px] opacity-50 mb-3" style={{ color: "var(--site-muted, #999)" }}>{s.description}</div>
              {s.features.length > 0 && (
                <ul className="space-y-1 mb-4 flex-1">
                  {s.features.map((f, fi) => (
                    <li key={fi} className="text-[11px] opacity-60 flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {s.price != null && <div className="text-lg font-bold mb-3" style={{ color: "var(--site-primary, #4F46E5)" }}>{s.price} &euro;</div>}
              <SmartLinkButton
                link={s.productId ? { type: "product", productId: s.productId, mode: "checkout" } : { type: "none" }}
                label={s.ctaLabel}
                className="block text-center text-[12px] font-semibold px-4 py-2 cursor-pointer mt-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(ServiceCardsBlockPreviewInner);
