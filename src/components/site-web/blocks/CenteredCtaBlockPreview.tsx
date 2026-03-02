import { memo } from "react";
import type { CenteredCtaBlockContent } from "@/types";
import { getProductById } from "@/lib/mock-data";

function CenteredCtaBlockPreviewInner({ content }: { content: CenteredCtaBlockContent }) {
  const product = content.productId ? getProductById(content.productId) : undefined;

  return (
    <div className="text-center py-8">
      <h3 className="text-xl font-bold mb-2">{content.title}</h3>
      <p className="text-[13px] opacity-70 mb-4 max-w-md mx-auto">{content.description}</p>
      <span className="inline-block bg-white text-[#6a18f1] text-[13px] font-semibold px-5 py-2.5 rounded-lg">
        {content.ctaLabel}
      </span>
      {product && (
        <div className="mt-2 text-[10px] text-[#999]">
          Lié au produit : {product.name} — {product.price} €
        </div>
      )}
    </div>
  );
}

export default memo(CenteredCtaBlockPreviewInner);
