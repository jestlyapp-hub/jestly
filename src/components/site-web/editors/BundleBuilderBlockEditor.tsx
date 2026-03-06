"use client";

import ProductMultiSelect from "@/components/site-web/editors/ProductMultiSelect";
import BriefSelect from "@/components/site-web/editors/BriefSelect";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

interface BundleBuilderContent {
  productIds: string[];
  title: string;
  description: string;
  ctaLabel: string;
  discountPercent: number;
  briefTemplateId?: string | null;
  useProductDefaultBrief?: boolean;
  briefRequired?: boolean;
}

interface BundleBuilderBlockEditorProps {
  content: BundleBuilderContent;
  onChange: (content: BundleBuilderContent) => void;
}

export default function BundleBuilderBlockEditor({ content, onChange }: BundleBuilderBlockEditorProps) {
  const update = (patch: Partial<BundleBuilderContent>) => onChange({ ...content, ...patch });

  return (
    <div className="space-y-4">
      {/* Products */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1.5">Produits du bundle</label>
        <ProductMultiSelect
          selectedIds={content.productIds}
          onChange={(productIds) => update({ productIds })}
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input
          type="text"
          value={content.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Pack complet"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea
          value={content.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          placeholder="Décrivez votre bundle..."
          className={inputClass}
        />
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Acheter le bundle"
          className={inputClass}
        />
      </div>

      {/* Discount percent */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Réduction (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={content.discountPercent}
          onChange={(e) => update({ discountPercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
          className={`${inputClass} w-24`}
        />
        <p className="text-[10px] text-[#BBB] mt-0.5">Pourcentage de réduction appliqué au bundle (0-100)</p>
      </div>
      {/* Brief */}
      <BriefSelect
        briefTemplateId={content.briefTemplateId}
        useProductDefaultBrief={content.useProductDefaultBrief}
        briefRequired={content.briefRequired}
        onChange={(s) => update(s as Partial<BundleBuilderContent>)}
      />
    </div>
  );
}
