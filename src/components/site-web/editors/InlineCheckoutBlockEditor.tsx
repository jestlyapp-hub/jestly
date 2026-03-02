"use client";

import ProductSingleSelect from "@/components/site-web/editors/ProductSingleSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface InlineCheckoutContent {
  productId: string;
  layout: "compact" | "detailed";
  ctaLabel: string;
}

interface InlineCheckoutBlockEditorProps {
  content: InlineCheckoutContent;
  onChange: (content: InlineCheckoutContent) => void;
}

export default function InlineCheckoutBlockEditor({ content, onChange }: InlineCheckoutBlockEditorProps) {
  const update = (patch: Partial<InlineCheckoutContent>) => onChange({ ...content, ...patch });

  return (
    <div className="space-y-4">
      {/* Product */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1.5">Produit</label>
        <ProductSingleSelect
          selectedId={content.productId}
          onChange={(productId) => update({ productId })}
        />
      </div>

      {/* Layout */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Disposition</label>
        <div className="flex gap-1.5">
          {(["compact", "detailed"] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => update({ layout })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                content.layout === layout
                  ? "bg-[#4F46E5] text-white"
                  : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
              }`}
            >
              {layout === "compact" ? "Compact" : "Détaillé"}
            </button>
          ))}
        </div>
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Commander"
          className={inputClass}
        />
      </div>
    </div>
  );
}
