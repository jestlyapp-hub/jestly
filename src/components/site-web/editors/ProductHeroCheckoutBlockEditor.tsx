"use client";

import ProductSingleSelect from "@/components/site-web/editors/ProductSingleSelect";
import BriefSelect from "@/components/site-web/editors/BriefSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

interface ProductHeroCheckoutContent {
  productId: string;
  benefits: string[];
  ctaLabel: string;
  showFeatures: boolean;
  layout: "left" | "center";
  briefTemplateId?: string | null;
  useProductDefaultBrief?: boolean;
  briefRequired?: boolean;
}

interface ProductHeroCheckoutBlockEditorProps {
  content: ProductHeroCheckoutContent;
  onChange: (content: ProductHeroCheckoutContent) => void;
}

export default function ProductHeroCheckoutBlockEditor({ content, onChange }: ProductHeroCheckoutBlockEditorProps) {
  const update = (patch: Partial<ProductHeroCheckoutContent>) => onChange({ ...content, ...patch });

  const updateBenefit = (index: number, value: string) => {
    const next = content.benefits.map((b, i) => (i === index ? value : b));
    update({ benefits: next });
  };

  const addBenefit = () => update({ benefits: [...content.benefits, ""] });

  const removeBenefit = (index: number) => update({ benefits: content.benefits.filter((_, i) => i !== index) });

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

      {/* Benefits list */}
      <div className="space-y-2">
        <label className="block text-[11px] font-medium text-[#999]">Avantages ({content.benefits.length})</label>
        {content.benefits.map((benefit, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <input
              type="text"
              value={benefit}
              onChange={(e) => updateBenefit(i, e.target.value)}
              placeholder={`Avantage ${i + 1}`}
              className={inputClass}
            />
            <button
              onClick={() => removeBenefit(i)}
              className="shrink-0 text-[#999] hover:text-red-500 transition-colors text-[16px] leading-none"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          onClick={addBenefit}
          className="w-full py-2 rounded-lg border border-dashed border-[#E6E6E4] text-[12px] text-[#999] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors"
        >
          + Ajouter un avantage
        </button>
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Acheter maintenant"
          className={inputClass}
        />
      </div>

      {/* Show features toggle */}
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#666]">Afficher les caractéristiques</span>
        <button
          onClick={() => update({ showFeatures: !content.showFeatures })}
          className={`${toggleClass} ${content.showFeatures ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
        >
          <div className={`${toggleDotClass} ${content.showFeatures ? "translate-x-[18px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      {/* Layout */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Disposition</label>
        <div className="flex gap-1.5">
          {(["left", "center"] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => update({ layout })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                content.layout === layout
                  ? "bg-[#4F46E5] text-white"
                  : "bg-[#F7F7F5] text-[#999] border border-[#E6E6E4] hover:border-[#4F46E5]/30"
              }`}
            >
              {layout === "left" ? "Gauche" : "Centré"}
            </button>
          ))}
        </div>
      </div>
      {/* Brief */}
      <BriefSelect
        briefTemplateId={content.briefTemplateId}
        useProductDefaultBrief={content.useProductDefaultBrief}
        briefRequired={content.briefRequired}
        onChange={(s) => update(s as Partial<ProductHeroCheckoutContent>)}
      />
    </div>
  );
}
