import { memo } from "react";
import type { ServicesListBlockContent } from "@/types";
import { getProductsByIds } from "@/lib/mock-data";

function ServicesListBlockPreviewInner({ content }: { content: ServicesListBlockContent }) {
  const products = getProductsByIds(content.productIds);

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px] text-[#999]">Aucun produit sélectionné</div>
        <div className="text-[11px] text-[#ccc] mt-1">Ajoutez des produits depuis l&apos;onglet Contenu</div>
      </div>
    );
  }

  const isGrid = content.layout === "grid";

  return (
    <div className="py-4">
      {content.title && (
        <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">{content.title}</h3>
      )}
      <div className={isGrid ? "grid grid-cols-2 gap-3" : "space-y-3"}>
        {products.map((product) => (
          <div
            key={product.id}
            className={`p-3 rounded-lg border border-[#E6E8F0] ${isGrid ? "" : "flex items-start justify-between"}`}
          >
            <div className={isGrid ? "" : "flex-1"}>
              <div className="text-[13px] font-semibold text-[#1A1A1A]">{product.name}</div>
              <div className="text-[11px] text-[#999] mt-0.5">{product.shortDescription}</div>
              {content.showCategory && (
                <span className="inline-block text-[10px] font-medium text-[#999] bg-[#F8F9FC] px-1.5 py-0.5 rounded mt-1.5">
                  {product.category}
                </span>
              )}
            </div>
            {content.showPrice && (
              <span className={`text-[12px] font-medium text-[#6a18f1] whitespace-nowrap ${isGrid ? "block mt-2" : "ml-4"}`}>
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
