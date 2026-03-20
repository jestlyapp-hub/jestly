"use client";

import ProductMultiSelect from "@/components/site-web/editors/ProductMultiSelect";
import BriefSelect from "@/components/site-web/editors/BriefSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

interface PricingTableRealContent {
  productIds: string[];
  columns: 2 | 3;
  showFeatures: boolean;
  highlightIndex: number;
  ctaLabel: string;
  briefTemplateId?: string | null;
  useProductDefaultBrief?: boolean;
  briefRequired?: boolean;
}

interface PricingTableRealBlockEditorProps {
  content: PricingTableRealContent;
  onChange: (content: PricingTableRealContent) => void;
}

export default function PricingTableRealBlockEditor({ content, onChange }: PricingTableRealBlockEditorProps) {
  const update = (patch: Partial<PricingTableRealContent>) => onChange({ ...content, ...patch });

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
          {([2, 3] as const).map((n) => (
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

      {/* Highlight index */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Index mis en avant</label>
        <input
          type="number"
          min={0}
          value={content.highlightIndex}
          onChange={(e) => update({ highlightIndex: Math.max(0, Number(e.target.value)) })}
          className={`${inputClass} w-24`}
        />
        <p className="text-[10px] text-[#BBB] mt-0.5">Position du produit à mettre en avant (commence à 0)</p>
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Choisir"
          className={inputClass}
        />
      </div>
      {/* Brief */}
      <BriefSelect
        briefTemplateId={content.briefTemplateId}
        useProductDefaultBrief={content.useProductDefaultBrief}
        briefRequired={content.briefRequired}
        onChange={(s) => update(s as Partial<PricingTableRealContent>)}
      />
    </div>
  );
}
