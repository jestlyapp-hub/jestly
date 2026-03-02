"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductSingleSelect from "./ProductSingleSelect";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function PackPremiumBlockEditor({ block }: { block: Extract<Block, { type: "pack-premium" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-4">
      {/* Product selector */}
      <ProductSingleSelect
        selectedId={block.content.productId}
        onChange={(productId) => update({ productId })}
        filterType="pack"
        label="Produit (pack)"
      />

      {/* Toggles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Mise en avant</span>
          <button
            onClick={() => update({ highlight: !block.content.highlight })}
            className={`${toggleClass} ${block.content.highlight ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"}`}
          >
            <div className={`${toggleDotClass} ${block.content.highlight ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Afficher les features</span>
          <button
            onClick={() => update({ showFeatures: !block.content.showFeatures })}
            className={`${toggleClass} ${block.content.showFeatures ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"}`}
          >
            <div className={`${toggleDotClass} ${block.content.showFeatures ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Afficher le prix</span>
          <button
            onClick={() => update({ showPrice: !block.content.showPrice })}
            className={`${toggleClass} ${block.content.showPrice ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"}`}
          >
            <div className={`${toggleDotClass} ${block.content.showPrice ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input
          type="text"
          value={block.content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          className={inputClass}
        />
      </div>
    </div>
  );
}
