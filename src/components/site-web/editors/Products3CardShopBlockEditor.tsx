"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function Products3CardShopBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "products-3card-shop" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const products: {
    imageUrl?: string;
    title: string;
    price: string;
    description: string;
    ctaLabel: string;
  }[] = block.content.products ?? [];

  const updateProduct = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = products.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    update({ products: updated });
  };

  const addProduct = () => {
    update({
      products: [
        ...products,
        { imageUrl: "", title: "", price: "", description: "", ctaLabel: "" },
      ],
    });
  };

  const removeProduct = (index: number) => {
    update({ products: products.filter((_, i) => i !== index) });
  };

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
          placeholder="Nos produits"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Sous-titre
        </label>
        <input
          className={inputClass}
          value={block.content.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Sous-titre de la section"
        />
      </div>

      {/* Products array */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2">
          Produits
        </label>

        {products.map((product, index) => (
          <div
            key={index}
            className="mb-3 p-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5A5A58]">
                Produit {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>

            <ImageUploader value={product.imageUrl} onChange={(url) => updateProduct(index, "imageUrl", url)} label="Image" />

            <input
              className={inputClass}
              value={product.title}
              onChange={(e) =>
                updateProduct(index, "title", e.target.value)
              }
              placeholder="Titre du produit"
            />

            <input
              className={inputClass}
              value={product.price}
              onChange={(e) =>
                updateProduct(index, "price", e.target.value)
              }
              placeholder="Prix (ex: 29€)"
            />

            <textarea
              className={inputClass}
              rows={2}
              value={product.description}
              onChange={(e) =>
                updateProduct(index, "description", e.target.value)
              }
              placeholder="Description du produit"
            />

            <input
              className={inputClass}
              value={product.ctaLabel}
              onChange={(e) =>
                updateProduct(index, "ctaLabel", e.target.value)
              }
              placeholder="Texte du bouton"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addProduct}
          className="w-full py-2 text-[12px] font-medium text-[#4F46E5] border border-dashed border-[#4F46E5]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
        >
          + Ajouter un produit
        </button>
      </div>
    </div>
  );
}
