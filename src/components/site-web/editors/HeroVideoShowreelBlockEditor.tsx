"use client";
import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

export default function HeroVideoShowreelBlockEditor({ block }: { block: Extract<Block, { type: "hero-video-showreel" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

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
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Bouton — Libellé</label>
        <input
          className={inputClass}
          value={block.content.ctaLabel ?? ""}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Voir mon showreel (laisser vide pour masquer)"
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">URL de la vidéo</label>
        <input
          className={inputClass}
          value={block.content.videoUrl ?? ""}
          onChange={(e) => update({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/... ou https://vimeo.com/..."
        />
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Tags (un par ligne)</label>
        <textarea
          className={inputClass}
          rows={3}
          value={(block.content.tags ?? []).join("\n")}
          onChange={(e) => update({ tags: e.target.value.split("\n").filter((l) => l.trim() !== "") })}
          placeholder="Motion Design&#10;3D Animation&#10;Branding"
        />
      </div>
    </div>
  );
}
