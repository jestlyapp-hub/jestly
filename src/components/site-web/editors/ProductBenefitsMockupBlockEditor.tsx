"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";
import ProductModeEditor from "./shared/ProductModeEditor";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProductBenefitsMockupBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "product-benefits-mockup" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-4">
      <ProductModeEditor
        mode={block.content.mode || "manual"}
        onModeChange={(mode) => update({ mode })}
        productId={block.content.productId || ""}
        onProductIdChange={(productId) => update({ productId })}
        single
      />
      <div className="border-t border-[#E6E6E4] my-3" />
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Titre
        </label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre du produit"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Sous-titre
        </label>
        <textarea
          className={inputClass}
          rows={2}
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Sous-titre descriptif"
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Avantages (un par ligne)
        </label>
        <textarea
          className={inputClass}
          rows={4}
          value={(block.content.benefits ?? []).join("\n")}
          onChange={(e) =>
            update({ benefits: e.target.value.split("\n") })
          }
          placeholder={"Avantage 1\nAvantage 2\nAvantage 3"}
        />
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Texte du bouton
        </label>
        <input
          className={inputClass}
          value={block.content.ctaLabel ?? ""}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Découvrir"
        />
      </div>

      {/* Image URL */}
      <ImageUploader value={block.content.imageUrl} onChange={(url) => update({ imageUrl: url })} label="Image" />
    </div>
  );
}
