"use client";

import ProductMultiSelect from "../ProductMultiSelect";
import ProductSingleSelect from "../ProductSingleSelect";

type Mode = "manual" | "product" | "static";

interface ProductModeEditorProps {
  /** Current mode — "manual" = static content, "product" = bound to real products */
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  /** For single-product blocks */
  productId?: string;
  onProductIdChange?: (id: string) => void;
  /** For multi-product blocks */
  productIds?: string[];
  onProductIdsChange?: (ids: string[]) => void;
  /** If true, only show single select */
  single?: boolean;
  /** Label for the manual mode button (default: "Manuel") */
  manualLabel?: string;
}

export default function ProductModeEditor({
  mode,
  onModeChange,
  productId,
  onProductIdChange,
  productIds,
  onProductIdsChange,
  single = false,
  manualLabel = "Manuel",
}: ProductModeEditorProps) {
  const isProduct = mode === "product";

  return (
    <div className="space-y-3">
      {/* Source toggle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Source de données</label>
        <div className="flex rounded-lg border border-[#E6E6E4] overflow-hidden">
          <button
            onClick={() => onModeChange(manualLabel === "Statique" ? "static" as Mode : "manual")}
            className={`flex-1 py-2 text-[12px] font-medium transition-all ${
              !isProduct
                ? "bg-[#191919] text-white"
                : "bg-[#F7F7F5] text-[#5A5A58] hover:bg-[#EFEFEF]"
            }`}
          >
            {manualLabel}
          </button>
          <button
            onClick={() => onModeChange("product")}
            className={`flex-1 py-2 text-[12px] font-medium transition-all ${
              isProduct
                ? "bg-[#191919] text-white"
                : "bg-[#F7F7F5] text-[#5A5A58] hover:bg-[#EFEFEF]"
            }`}
          >
            Produits Jestly
          </button>
        </div>
        {isProduct && (
          <p className="text-[10px] text-[#8A8A88] mt-1">
            Les données réelles du produit remplaceront le contenu manuel.
          </p>
        )}
      </div>

      {/* Product selector */}
      {isProduct && (
        <div className="space-y-2">
          {single ? (
            <ProductSingleSelect
              selectedId={productId || ""}
              onChange={(id) => onProductIdChange?.(id)}
              label="Produit lié"
            />
          ) : (
            <ProductMultiSelect
              selectedIds={productIds || []}
              onChange={(ids) => onProductIdsChange?.(ids)}
            />
          )}

          {/* Empty state warning */}
          {single && !productId && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-[11px] text-amber-700">
                Aucun produit sélectionné. Le contenu manuel sera utilisé comme fallback.
              </p>
            </div>
          )}
          {!single && (!productIds || productIds.length === 0) && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-[11px] text-amber-700">
                Aucun produit sélectionné. Le contenu manuel sera utilisé comme fallback.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
