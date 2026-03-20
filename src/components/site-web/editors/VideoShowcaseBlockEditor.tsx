"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block, BlockLink } from "@/types";
import LinkEditor from "./LinkEditor";
import ImageUploader from "./ImageUploader";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

type VideoShowcaseBlock = Extract<Block, { type: "video-showcase" }>;

export default function VideoShowcaseBlockEditor({ block }: { block: VideoShowcaseBlock }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) =>
    dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const c = block.content as {
    title?: string;
    subtitle?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    stats?: { value: string; label: string }[];
    ctaLabel?: string;
    blockLink?: BlockLink;
  };

  const stats = c.stats ?? [];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Titre</label>
        <input
          className={inputClass}
          value={c.title ?? ""}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="Titre de la section"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Sous-titre</label>
        <textarea
          className={inputClass + " resize-none"}
          rows={2}
          value={c.subtitle ?? ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="Description courte"
        />
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">URL de la vidéo</label>
        <input
          className={inputClass}
          value={c.videoUrl ?? ""}
          onChange={(e) => update({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/..."
        />
      </div>

      {/* Thumbnail */}
      <ImageUploader
        value={c.thumbnailUrl ?? ""}
        onChange={(url) => update({ thumbnailUrl: url })}
        label="Miniature"
      />

      {/* CTA Label */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Texte du bouton</label>
        <input
          className={inputClass}
          value={c.ctaLabel ?? ""}
          onChange={(e) => update({ ctaLabel: e.target.value })}
          placeholder="Voir la démo"
        />
      </div>

      {/* Link */}
      <LinkEditor
        label="Lien du bouton"
        value={c.blockLink}
        onChange={(link) => update({ blockLink: link })}
      />

      {/* Glow Color */}
      <div>
        <label className="block text-[12px] font-medium text-[#5A5A58] mb-1">Couleur du glow</label>
        <input
          type="color"
          className="h-9 w-full rounded-lg border border-[#E6E6E4] bg-[#F7F7F5] cursor-pointer"
          value={(c as { glowColor?: string }).glowColor ?? "#4F46E5"}
          onChange={(e) => update({ glowColor: e.target.value })}
        />
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[12px] font-medium text-[#5A5A58]">Statistiques</label>
          <button
            type="button"
            className="text-[12px] text-[#4F46E5] hover:text-[#4338CA] font-medium"
            onClick={() =>
              update({ stats: [...stats, { value: "", label: "" }] })
            }
          >
            + Ajouter
          </button>
        </div>
        <div className="space-y-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <input
                  className={inputClass}
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], value: e.target.value };
                    update({ stats: next });
                  }}
                  placeholder="Valeur (ex: 10k+)"
                />
                <input
                  className={inputClass}
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...stats];
                    next[i] = { ...next[i], label: e.target.value };
                    update({ stats: next });
                  }}
                  placeholder="Label (ex: Vues)"
                />
              </div>
              <button
                type="button"
                className="mt-1 text-[12px] text-red-500 hover:text-red-700"
                onClick={() => {
                  const next = stats.filter((_, j) => j !== i);
                  update({ stats: next });
                }}
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
