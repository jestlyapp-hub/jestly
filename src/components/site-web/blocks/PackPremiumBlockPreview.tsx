import { memo } from "react";
import type { PackPremiumBlockContent } from "@/types";
import { getProductById } from "@/lib/mock-data";

function PackPremiumBlockPreviewInner({ content }: { content: PackPremiumBlockContent }) {
  const product = content.productId ? getProductById(content.productId) : undefined;

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
        <div className="absolute inset-0 rounded-xl bg-[#6a18f1]/5 border border-[#6a18f1]/20" />
      )}
      <div className="relative">
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{product.name}</h3>
        <p className="text-[13px] text-[#999] mb-2">{product.shortDescription}</p>
        {content.showPrice && (
          <div className="text-2xl font-bold text-[#6a18f1] mb-4">{product.price} €</div>
        )}
        {content.showFeatures && product.features && (
          <ul className="space-y-1.5 mb-4 max-w-xs mx-auto">
            {product.features.map((f, i) => (
              <li key={i} className="text-[12px] text-[#666] flex items-center gap-2 justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {f}
              </li>
            ))}
          </ul>
        )}
        <span className="inline-block bg-[#6a18f1] text-white text-[13px] font-semibold px-5 py-2 rounded-lg">
          {content.ctaLabel}
        </span>
      </div>
    </div>
  );
}

export default memo(PackPremiumBlockPreviewInner);
