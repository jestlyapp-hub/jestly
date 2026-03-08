"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";
import ImageUploader from "./ImageUploader";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function HeroDarkSaasBlockEditor({ block }: { block: Extract<Block, { type: "hero-dark-saas" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const features = block.content.features ?? [];

  const updateFeature = (index: number, field: string, value: unknown) => {
    const updated = features.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    update({ features: updated });
  };

  const addFeature = () => {
    update({ features: [...features, { title: "", description: "" }] });
  };

  const removeFeature = (index: number) => {
    update({ features: features.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={block.content.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre principal"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea
          className={inputClass}
          rows={3}
          value={block.content.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Description courte"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Bouton principal — Libellé</label>
        <input
          className={inputClass}
          value={block.content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Commencer maintenant"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Bouton secondaire — Libellé</label>
        <input
          className={inputClass}
          value={block.content.secondaryCtaLabel ?? ""}
          onChange={(e) => update({ secondaryCtaLabel: e.target.value })}
          placeholder="Voir la démo (laisser vide pour masquer)"
        />
      </div>

      <ImageUploader value={block.content.imageUrl} onChange={(url) => update({ imageUrl: url })} label="Image" />

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Fonctionnalités</label>
        {features.map((feature, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Fonctionnalité {index + 1}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={feature.title}
              onChange={(e) => updateFeature(index, "title", e.target.value)}
              placeholder="Titre"
            />
            <input
              className={inputClass}
              value={feature.description}
              onChange={(e) => updateFeature(index, "description", e.target.value)}
              placeholder="Description"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addFeature}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter une fonctionnalité
        </button>
      </div>
    </div>
  );
}
