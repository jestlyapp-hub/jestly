"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProductFeaturedCardBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "product-featured-card" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Titre
        </label>
        <input
          className={inputClass}
          value={block.content.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Nom du produit"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Description
        </label>
        <textarea
          className={inputClass}
          rows={3}
          value={block.content.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Description du produit"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Prix
        </label>
        <input
          className={inputClass}
          value={block.content.price ?? ""}
          onChange={(e) => update({ price: e.target.value })}
          placeholder="49€"
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
          placeholder="Acheter maintenant"
        />
      </div>

      {/* Image URL */}
      <ImageUploader value={block.content.imageUrl} onChange={(url) => update({ imageUrl: url })} label="Image" />

      {/* Trust Note */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Note de confiance
        </label>
        <input
          className={inputClass}
          value={block.content.trustNote ?? ""}
          onChange={(e) => update({ trustNote: e.target.value })}
          placeholder="Satisfait ou remboursé sous 30 jours"
        />
      </div>
    </div>
  );
}
