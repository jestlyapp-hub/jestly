"use client";

import ProductMultiSelect from "@/components/site-web/editors/ProductMultiSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

interface ProductCardsGridContent {
  productIds: string[];
  columns: 2 | 3 | 4;
  showFilter: boolean;
  ctaLabel: string;
}

interface ProductCardsGridBlockEditorProps {
  content: ProductCardsGridContent;
  onChange: (content: ProductCardsGridContent) => void;
}

export default function ProductCardsGridBlockEditor({ content, onChange }: ProductCardsGridBlockEditorProps) {
  const update = (patch: Partial<ProductCardsGridContent>) => onChange({ ...content, ...patch });

  return (
    <div className="space-y-4">
      {/* Products */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1.5">Produits affichés</label>
        <ProductMultiSelect
          selectedIds={content.productIds}
          onChange={(productIds) => update({ productIds })}
        />
      </div>

      {/* Columns */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Colonnes</label>
        <div className="flex gap-1.5">
          {([2, 3, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => update({ columns: n })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                content.columns === n
                  ? "bg-[#4F46E5] text-white"
                  : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Show filter toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Afficher le filtre</span>
        <button
          onClick={() => update({ showFilter: !content.showFilter })}
          className={`${toggleClass} ${content.showFilter ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
        >
          <div className={`${toggleDotClass} ${content.showFilter ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Voir le produit"
          className={inputClass}
        />
      </div>
    </div>
  );
}
