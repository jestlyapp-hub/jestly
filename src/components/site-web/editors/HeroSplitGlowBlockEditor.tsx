"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";
import ImageUploader from "./ImageUploader";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function HeroSplitGlowBlockEditor({
  block,
}: {
  block: Extract<Block, { type: "hero-split-glow" }>;
}) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

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

      <ImageUploader
        value={block.content.imageUrl}
        onChange={(url) => update({ imageUrl: url })}
        label="Image"
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

      {/* Primary CTA */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Bouton principal — Libellé
        </label>
        <input
          className={inputClass}
          value={block.content.primaryCtaLabel}
          onChange={(e) => update({ primaryCtaLabel: e.target.value })}
          placeholder="Commencer"
        />
      </div>
      <LinkEditor
        label="Bouton principal — Lien"
        value={block.content.primaryBlockLink}
        onChange={(link: BlockLink) => update({ primaryBlockLink: link })}
      />

      {/* Secondary CTA */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">
          Bouton secondaire — Libellé
        </label>
        <input
          className={inputClass}
          value={block.content.secondaryCtaLabel ?? ""}
          onChange={(e) => update({ secondaryCtaLabel: e.target.value })}
          placeholder="En savoir plus (laisser vide pour masquer)"
        />
      </div>
      {block.content.secondaryCtaLabel && (
        <LinkEditor
          label="Bouton secondaire — Lien"
          value={block.content.secondaryBlockLink}
          onChange={(link: BlockLink) => update({ secondaryBlockLink: link })}
        />
      )}
    </div>
  );
}
