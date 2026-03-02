"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductMultiSelect from "./ProductMultiSelect";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function ServicesListBlockEditor({ block }: { block: Extract<Block, { type: "services-list" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre de section</label>
        <input
          type="text"
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Ex: Mes services"
          className={inputClass}
        />
      </div>

      {/* Products */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1.5">Produits affichés</label>
        <ProductMultiSelect
          selectedIds={block.content.productIds}
          onChange={(productIds) => update({ productIds })}
        />
      </div>

      {/* Layout */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Disposition</label>
        <div className="flex gap-1.5">
          {(["list", "grid"] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => update({ layout })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                (block.content.layout ?? "list") === layout
                  ? "bg-[#6a18f1] text-white"
                  : "bg-[#F8F9FC] text-[#999] border border-[#E6E8F0] hover:border-[#6a18f1]/30"
              }`}
            >
              {layout === "list" ? "Liste" : "Grille"}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Afficher les prix</span>
          <button
            onClick={() => update({ showPrice: !block.content.showPrice })}
            className={`${toggleClass} ${block.content.showPrice ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"}`}
          >
            <div className={`${toggleDotClass} ${block.content.showPrice ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Afficher les catégories</span>
          <button
            onClick={() => update({ showCategory: !block.content.showCategory })}
            className={`${toggleClass} ${block.content.showCategory ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"}`}
          >
            <div className={`${toggleDotClass} ${block.content.showCategory ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* CTA Mode */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Mode CTA</label>
        <select
          value={block.content.ctaMode}
          onChange={(e) => update({ ctaMode: e.target.value })}
          className={inputClass}
        >
          <option value="product_page">Page produit</option>
          <option value="product_checkout">Checkout direct</option>
          <option value="modal">Modal</option>
        </select>
      </div>
    </div>
  );
}
