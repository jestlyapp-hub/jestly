"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductModeEditor from "./shared/ProductModeEditor";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ProductBundleCompareBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "product-bundle-compare" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const bundles: {
    name: string;
    price: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    ctaLabel: string;
  }[] = block.content.bundles ?? [];

  const updateBundle = (
    index: number,
    field: string,
    value: string | string[] | boolean
  ) => {
    const updated = bundles.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    update({ bundles: updated });
  };

  const addBundle = () => {
    update({
      bundles: [
        ...bundles,
        {
          name: "",
          price: "",
          description: "",
          features: [],
          isPopular: false,
          ctaLabel: "",
        },
      ],
    });
  };

  const removeBundle = (index: number) => {
    update({ bundles: bundles.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <ProductModeEditor
        mode={block.content.mode || "manual"}
        onModeChange={(mode) => update({ mode })}
        productIds={block.content.productIds || []}
        onProductIdsChange={(productIds) => update({ productIds })}
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
          placeholder="Comparez nos offres"
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

      {/* Bundles array */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2">
          Bundles
        </label>

        {bundles.map((bundle, index) => (
          <div
            key={index}
            className="mb-3 p-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5A5A58]">
                Bundle {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeBundle(index)}
                className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>

            <input
              className={inputClass}
              value={bundle.name}
              onChange={(e) => updateBundle(index, "name", e.target.value)}
              placeholder="Nom du bundle"
            />

            <input
              className={inputClass}
              value={bundle.price}
              onChange={(e) => updateBundle(index, "price", e.target.value)}
              placeholder="Prix (ex: 99€)"
            />

            <textarea
              className={inputClass}
              rows={2}
              value={bundle.description}
              onChange={(e) =>
                updateBundle(index, "description", e.target.value)
              }
              placeholder="Description du bundle"
            />

            <div>
              <label className="block text-[11px] text-[#5A5A58] mb-1">
                Features (une par ligne)
              </label>
              <textarea
                className={inputClass}
                rows={3}
                value={(bundle.features ?? []).join("\n")}
                onChange={(e) =>
                  updateBundle(
                    index,
                    "features",
                    e.target.value.split("\n")
                  )
                }
                placeholder={"Feature 1\nFeature 2\nFeature 3"}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bundle.isPopular ?? false}
                onChange={(e) =>
                  updateBundle(index, "isPopular", e.target.checked)
                }
                className="rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
              />
              <label className="text-[12px] text-[#5A5A58]">
                Populaire
              </label>
            </div>

            <input
              className={inputClass}
              value={bundle.ctaLabel}
              onChange={(e) =>
                updateBundle(index, "ctaLabel", e.target.value)
              }
              placeholder="Texte du bouton"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addBundle}
          className="w-full py-2 text-[12px] font-medium text-[#4F46E5] border border-dashed border-[#4F46E5]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
        >
          + Ajouter un bundle
        </button>
      </div>
    </div>
  );
}
