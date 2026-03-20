"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function CtaBannerBlockEditor({ block }: { block: Extract<Block, { type: "cta-banner" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    title?: string;
    description?: string;
    ctaLabel?: string;
    blockLink?: BlockLink;
    secondaryLabel?: string;
    secondaryBlockLink?: BlockLink;
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Titre</label>
        <input
          type="text"
          value={c.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Passez a l'action"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Description</label>
        <textarea
          value={c.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          placeholder="Texte d'accroche..."
          className={inputClass}
        />
      </div>

      {/* CTA Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton principal</label>
        <input
          type="text"
          value={c.ctaLabel ?? ""}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Commencer maintenant"
          className={inputClass}
        />
      </div>

      {/* Primary Link */}
      <LinkEditor
        label="Lien du bouton principal"
        value={c.blockLink}
        onChange={(link) => update({ blockLink: link })}
      />

      {/* Secondary Label */}
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Texte du bouton secondaire (optionnel)</label>
        <input
          type="text"
          value={c.secondaryLabel ?? ""}
          onChange={(e) => update({ secondaryLabel: e.target.value })}
          placeholder="En savoir plus"
          className={inputClass}
        />
      </div>

      {/* Secondary Link — shown only if secondaryLabel is not empty */}
      {(c.secondaryLabel ?? "").trim() !== "" && (
        <LinkEditor
          label="Lien du bouton secondaire"
          value={c.secondaryBlockLink}
          onChange={(link) => update({ secondaryBlockLink: link })}
        />
      )}
    </div>
  );
}
