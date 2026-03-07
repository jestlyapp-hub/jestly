"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function HeroCenteredMeshBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "hero-centered-mesh" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const logos: { name: string; imageUrl?: string }[] =
    block.content.trustLogos ?? [];

  const updateLogo = (index: number, field: string, value: string) => {
    const updated = logos.map((logo, i) =>
      i === index ? { ...logo, [field]: value } : logo
    );
    update({ trustLogos: updated });
  };

  const addLogo = () => {
    update({ trustLogos: [...logos, { name: "", imageUrl: "" }] });
  };

  const removeLogo = (index: number) => {
    update({ trustLogos: logos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Badge */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Badge
        </label>
        <input
          className={inputClass}
          value={block.content.badge ?? ""}
          onChange={(e) => update({ badge: e.target.value })}
          placeholder="Ex: Nouveau"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Titre
        </label>
        <input
          className={inputClass}
          value={block.content.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre principal"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Sous-titre
        </label>
        <textarea
          className={inputClass}
          rows={3}
          value={block.content.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Description courte"
        />
      </div>

      {/* CTA */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Bouton — Libellé
        </label>
        <input
          className={inputClass}
          value={block.content.ctaLabel}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Commencer"
        />
      </div>
      <LinkEditor
        label="Bouton — Lien"
        value={block.content.blockLink}
        onChange={(link: BlockLink) => update({ blockLink: link })}
      />

      {/* Glow Color */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Couleur du glow
        </label>
        <input
          type="color"
          className="h-9 w-full rounded-lg border border-[#E6E6E4] bg-[#F7F7F5] cursor-pointer"
          value={block.content.glowColor ?? "#4F46E5"}
          onChange={(e) => update({ glowColor: e.target.value })}
        />
      </div>

      {/* Trust Logos */}
      <div className="pt-2 border-t border-[#E6E6E4]">
        <label className="block text-[12px] font-semibold text-[#1A1A1A] mb-2">
          Logos de confiance
        </label>

        {logos.map((logo, index) => (
          <div
            key={index}
            className="mb-3 p-3 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5A5A58]">
                Logo {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeLogo(index)}
                className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
            <input
              className={inputClass}
              value={logo.name}
              onChange={(e) => updateLogo(index, "name", e.target.value)}
              placeholder="Nom du logo"
            />
            <input
              className={inputClass}
              value={logo.imageUrl ?? ""}
              onChange={(e) => updateLogo(index, "imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addLogo}
          className="w-full py-2 text-[12px] font-medium text-[#4F46E5] border border-dashed border-[#4F46E5]/30 rounded-lg hover:bg-[#EEF2FF] transition-colors"
        >
          + Ajouter un logo
        </button>
      </div>
    </div>
  );
}
