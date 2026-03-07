"use client";

import { memo } from "react";
import { useProductById } from "@/lib/product-context";
import { formatPrice } from "@/lib/productTypes";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

interface InlineCheckoutBlockContent {
  productId: string;
  layout: "compact" | "detailed";
  ctaLabel: string;
  briefTemplateId?: string | null;
}

function InlineCheckoutBlockPreviewInner({ content }: { content: InlineCheckoutBlockContent }) {
  const product = useProductById(content.productId);

  if (!product) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px]" style={{ color: "var(--site-muted, #999)" }}>Aucun produit sélectionné</div>
        <div className="text-[11px] mt-1" style={{ color: "var(--site-muted, #ccc)" }}>Choisissez un produit depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const isCompact = content.layout === "compact";

  if (isCompact) {
    return (
      <div className="py-6">
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
          {/* Product info line */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[13px] font-semibold" style={{ color: "var(--site-text, #1A1A1A)" }}>{product.name}</div>
              <div className="text-[11px]" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</div>
            </div>
            <div className="text-lg font-bold text-[var(--site-primary)] whitespace-nowrap ml-4">{formatPrice(product.priceCents)}</div>
          </div>

          {/* Compact horizontal form */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--site-muted, #999)" }}>Nom</label>
              <div className="h-9 rounded-lg border px-3 flex items-center text-[12px]" style={{ borderColor: "var(--site-border, #E6E6E4)", background: "var(--site-surface, #F7F7F5)", color: "var(--site-muted, #ccc)" }}>
                Votre nom
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--site-muted, #999)" }}>Email</label>
              <div className="h-9 rounded-lg border px-3 flex items-center text-[12px]" style={{ borderColor: "var(--site-border, #E6E6E4)", background: "var(--site-surface, #F7F7F5)", color: "var(--site-muted, #ccc)" }}>
                votre@email.com
              </div>
            </div>
            <SmartLinkButton link={{ type: "product", productId: content.productId, mode: "checkout", briefTemplateId: content.briefTemplateId || undefined }} label={content.ctaLabel} className="text-[12px] font-semibold px-5 py-2 cursor-pointer whitespace-nowrap" />
          </div>
        </div>
      </div>
    );
  }

  // Detailed: vertical layout with product details
  return (
    <div className="py-6">
      <div className="rounded-xl border p-6 max-w-md mx-auto" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
        {/* Product details */}
        <div className="text-center mb-5">
          <div className="text-lg font-bold mb-1" style={{ color: "var(--site-text, #1A1A1A)" }}>{product.name}</div>
          <p className="text-[12px] mb-3" style={{ color: "var(--site-muted, #999)" }}>{product.shortDescription}</p>
          <div className="text-2xl font-bold text-[var(--site-primary)]">{formatPrice(product.priceCents)}</div>
        </div>

        {product.features && product.features.length > 0 && (
          <ul className="space-y-1.5 mb-5 border-t pt-4" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
            {product.features.slice(0, 4).map((f, i) => (
              <li key={i} className="text-[11px] opacity-70 flex items-center gap-2" style={{ color: "var(--site-text, #1A1A1A)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Vertical form */}
        <div className="space-y-3 border-t pt-4" style={{ borderColor: "var(--site-border, #E6E6E4)" }}>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--site-muted, #999)" }}>Nom complet</label>
            <div className="h-9 rounded-lg border px-3 flex items-center text-[12px]" style={{ borderColor: "var(--site-border, #E6E6E4)", background: "var(--site-surface, #F7F7F5)", color: "var(--site-muted, #ccc)" }}>
              Votre nom
            </div>
          </div>
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--site-muted, #999)" }}>Email</label>
            <div className="h-9 rounded-lg border px-3 flex items-center text-[12px]" style={{ borderColor: "var(--site-border, #E6E6E4)", background: "var(--site-surface, #F7F7F5)", color: "var(--site-muted, #ccc)" }}>
              votre@email.com
            </div>
          </div>
          <SmartLinkButton link={{ type: "product", productId: content.productId, mode: "checkout", briefTemplateId: content.briefTemplateId || undefined }} label={content.ctaLabel} className="block text-center text-[13px] font-semibold px-5 py-2.5 cursor-pointer mt-2" />
        </div>
      </div>
    </div>
  );
}

export default memo(InlineCheckoutBlockPreviewInner);
