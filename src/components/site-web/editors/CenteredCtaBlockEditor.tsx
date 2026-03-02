"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, Link } from "@/types";
import ProductSingleSelect from "./ProductSingleSelect";
import LinkPicker from "./LinkPicker";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";
const toggleClass = "relative w-9 h-5 rounded-full transition-colors cursor-pointer";
const toggleDotClass = "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform";

export default function CenteredCtaBlockEditor({ block }: { block: Extract<Block, { type: "centered-cta" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const hasProduct = !!block.content.productId;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input type="text" value={block.content.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea value={block.content.description} onChange={(e) => update({ description: e.target.value })} rows={2} className={inputClass} />
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton</label>
        <input type="text" value={block.content.ctaLabel} onChange={(e) => update({ ctaLabel: e.target.value })} className={inputClass} />
      </div>

      {/* Product link toggle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#666]">Lier à un produit</span>
          <button
            onClick={() => update({ productId: hasProduct ? undefined : "" })}
            className={`${toggleClass} ${hasProduct ? "bg-[#4F46E5]" : "bg-[#E6E6E4]"}`}
          >
            <div className={`${toggleDotClass} ${hasProduct ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </button>
        </div>

        {hasProduct ? (
          <div className="space-y-2">
            <ProductSingleSelect
              selectedId={block.content.productId!}
              onChange={(productId) => update({ productId })}
            />
            <div className="text-[10px] text-[#999] bg-[#F7F7F5] rounded-lg px-2.5 py-1.5">
              Le bouton CTA redirigera vers la page de commande du produit.
            </div>
          </div>
        ) : (
          <LinkPicker
            label="Lien du bouton"
            value={block.content.link}
            onChange={(link: Link) => update({ link })}
          />
        )}
      </div>
    </div>
  );
}
