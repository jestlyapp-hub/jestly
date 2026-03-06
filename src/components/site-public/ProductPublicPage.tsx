"use client";

import type { Product } from "@/types";

interface ProductPublicPageProps {
  product: Product;
  siteSlug: string;
  siteName: string;
}

import { formatPrice } from "@/lib/productTypes";

export default function ProductPublicPage({ product, siteSlug, siteName }: ProductPublicPageProps) {
  const checkoutUrl = `/s/${siteSlug}/order/${product.slug}`;
  const isFree = product.type === "lead_magnet" || product.priceCents === 0;
  const ctaLabel = product.ctaLabel || (isFree ? "Obtenir gratuitement" : "Commander");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#E6E6E4] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href={`/s/${siteSlug}`} className="text-sm font-medium text-[#191919] hover:text-[#4F46E5] transition-colors">
            {siteName}
          </a>
          <a href={`/s/${siteSlug}`} className="text-sm text-[#8A8A88] hover:text-[#191919] transition-colors">
            &larr; Retour au site
          </a>
        </div>
      </header>

      {/* Cover image */}
      {product.coverImageUrl && (
        <div className="w-full max-h-[400px] overflow-hidden bg-[#F7F7F5]">
          <img
            src={product.coverImageUrl}
            alt={product.name}
            className="w-full h-full object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Type badge */}
        <div className="mb-4">
          <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[#F7F7F5] text-[#5A5A58] border border-[#E6E6E4]">
            {product.type === "service" && "Service"}
            {product.type === "digital" && "Produit digital"}
            {product.type === "lead_magnet" && "Ressource gratuite"}
            {product.type === "pack" && "Pack"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-[#191919] mb-4">{product.name}</h1>

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-lg text-[#5A5A58] mb-8 leading-relaxed">{product.shortDescription}</p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center gap-6 mb-10 pb-10 border-b border-[#E6E6E4]">
          <div className="text-2xl font-bold text-[#191919]">
            {isFree ? "Gratuit" : formatPrice(product.priceCents)}
          </div>
          <a
            href={checkoutUrl}
            className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white rounded-md transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--site-primary, #4F46E5)" }}
          >
            {ctaLabel}
          </a>
        </div>

        {/* Features */}
        {product.features && product.features.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-[#191919] mb-4">Ce qui est inclus</h2>
            <ul className="space-y-3">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-[#5A5A58]">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Long description */}
        {product.longDescription && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-[#191919] mb-4">Description</h2>
            <div className="text-[#5A5A58] leading-relaxed whitespace-pre-line">
              {product.longDescription}
            </div>
          </div>
        )}

        {/* Delivery time */}
        {product.deliveryTimeDays && product.deliveryTimeDays > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#F7F7F5] border border-[#E6E6E4] mb-10">
            <svg className="w-5 h-5 text-[#5A5A58]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm text-[#5A5A58]">
              Livraison sous {product.deliveryTimeDays} jour{product.deliveryTimeDays > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-8 border-t border-[#E6E6E4]">
          <a
            href={checkoutUrl}
            className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white rounded-md transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--site-primary, #4F46E5)" }}
          >
            {ctaLabel}
          </a>
          {!isFree && (
            <p className="text-xs text-[#8A8A88] mt-3">Paiement sécurisé</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6E6E4] bg-[#F7F7F5] mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <a href={`/s/${siteSlug}`} className="text-sm text-[#8A8A88] hover:text-[#191919] transition-colors">
            {siteName}
          </a>
        </div>
      </footer>
    </div>
  );
}
