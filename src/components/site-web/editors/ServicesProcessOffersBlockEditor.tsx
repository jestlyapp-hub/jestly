"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductModeEditor from "./shared/ProductModeEditor";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ServicesProcessOffersBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "services-process-offers" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const offers: {
    title: string;
    description: string;
    steps: string[];
  }[] = block.content.offers ?? [];

  const updateOffer = (
    index: number,
    field: string,
    value: string | string[]
  ) => {
    const updated = offers.map((o, i) =>
      i === index ? { ...o, [field]: value } : o
    );
    update({ offers: updated });
  };

  const addOffer = () => {
    update({
      offers: [...offers, { title: "", description: "", steps: [] }],
    });
  };

  const removeOffer = (index: number) => {
    update({ offers: offers.filter((_, i) => i !== index) });
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
          placeholder="Nos offres"
        />
      </div>

      {/* Offers array */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <label className="block text-[12px] font-semibold text-[#191919] mb-2">
          Offres
        </label>

        {offers.map((offer, index) => (
          <div
            key={index}
            className="mb-3 p-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5A5A58]">
                Offre {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeOffer(index)}
                className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>

            <input
              className={inputClass}
              value={offer.title}
              onChange={(e) => updateOffer(index, "title", e.target.value)}
              placeholder="Titre de l'offre"
            />

            <textarea
              className={inputClass}
              rows={2}
              value={offer.description}
              onChange={(e) =>
                updateOffer(index, "description", e.target.value)
              }
              placeholder="Description de l'offre"
            />

            <div>
              <label className="block text-[11px] text-[#5A5A58] mb-1">
                Étapes (une par ligne)
              </label>
              <textarea
                className={inputClass}
                rows={3}
                value={(offer.steps ?? []).join("\n")}
                onChange={(e) =>
                  updateOffer(
                    index,
                    "steps",
                    e.target.value.split("\n")
                  )
                }
                placeholder={"Étape 1\nÉtape 2\nÉtape 3"}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addOffer}
          className="w-full py-2 text-[12px] font-medium text-[#4F46E5] border border-dashed border-[#4F46E5]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
        >
          + Ajouter une offre
        </button>
      </div>
    </div>
  );
}
