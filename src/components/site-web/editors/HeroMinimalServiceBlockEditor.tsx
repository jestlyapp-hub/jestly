"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function HeroMinimalServiceBlockEditor({ block }: { block: Extract<Block, { type: "hero-minimal-service" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const proofItems = block.content.proofItems ?? [];

  const updateProofItem = (index: number, field: string, value: unknown) => {
    const updated = proofItems.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    update({ proofItems: updated });
  };

  const addProofItem = () => {
    update({ proofItems: [...proofItems, { icon: "", text: "" }] });
  };

  const removeProofItem = (index: number) => {
    update({ proofItems: proofItems.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Badge de confiance</label>
        <input
          className={inputClass}
          value={block.content.trustBadge ?? ""}
          onChange={(e) => update({ trustBadge: e.target.value })}
          placeholder="Ex: Certifié expert"
        />
      </div>

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
          placeholder="Découvrir mes services"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Bouton secondaire — Libellé</label>
        <input
          className={inputClass}
          value={block.content.secondaryCtaLabel ?? ""}
          onChange={(e) => update({ secondaryCtaLabel: e.target.value })}
          placeholder="En savoir plus (laisser vide pour masquer)"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[12px] font-medium text-[#5A5A58]">Preuves sociales</label>
        {proofItems.map((item, index) => (
          <div key={index} className="border border-[#E6E6E4] rounded-lg p-3 space-y-2 bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[#5A5A58]">Preuve {index + 1}</span>
              <button
                type="button"
                onClick={() => removeProofItem(index)}
                className="text-[12px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={item.icon}
              onChange={(e) => updateProofItem(index, "icon", e.target.value)}
              placeholder="Icône (ex: ⭐)"
            />
            <input
              className={inputClass}
              value={item.text}
              onChange={(e) => updateProofItem(index, "text", e.target.value)}
              placeholder="Texte (ex: 5 ans d'expérience)"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addProofItem}
          className="w-full border border-dashed border-[#E6E6E4] rounded-lg py-2 text-[13px] text-[#5A5A58] hover:border-[#4F46E5]/40 hover:text-[#4F46E5] transition-all"
        >
          + Ajouter une preuve
        </button>
      </div>
    </div>
  );
}
