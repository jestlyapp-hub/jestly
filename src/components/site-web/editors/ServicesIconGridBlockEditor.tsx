"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ProductModeEditor from "./shared/ProductModeEditor";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function ServicesIconGridBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "services-icon-grid" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const services: {
    icon: string;
    title: string;
    description: string;
  }[] = block.content.services ?? [];

  const updateService = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = services.map((svc, i) =>
      i === index ? { ...svc, [field]: value } : svc
    );
    update({ services: updated });
  };

  const addService = () => {
    update({
      services: [...services, { icon: "", title: "", description: "" }],
    });
  };

  const removeService = (index: number) => {
    update({ services: services.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <ProductModeEditor
        mode={block.content.mode || "static"}
        onModeChange={(mode) => update({ mode })}
        productIds={block.content.productIds || []}
        onProductIdsChange={(productIds) => update({ productIds })}
        manualLabel="Statique"
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
          placeholder="Nos services"
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

      {/* Services array */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2">
          Services
        </label>

        {services.map((svc, index) => (
          <div
            key={index}
            className="mb-3 p-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5A5A58]">
                Service {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeService(index)}
                className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>

            <input
              className={inputClass}
              value={svc.icon}
              onChange={(e) => updateService(index, "icon", e.target.value)}
              placeholder="Icône (ex: star, heart, zap)"
            />

            <input
              className={inputClass}
              value={svc.title}
              onChange={(e) => updateService(index, "title", e.target.value)}
              placeholder="Titre du service"
            />

            <textarea
              className={inputClass}
              rows={2}
              value={svc.description}
              onChange={(e) =>
                updateService(index, "description", e.target.value)
              }
              placeholder="Description du service"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addService}
          className="w-full py-2 text-[12px] font-medium text-[#4F46E5] border border-dashed border-[#4F46E5]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
        >
          + Ajouter un service
        </button>
      </div>
    </div>
  );
}
