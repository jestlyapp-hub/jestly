"use client";

import { useBuilder } from "@/lib/site-builder-context";
import type { Block } from "@/types";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all";

function detectProvider(url: string): string {
  if (!url) return "";
  if (url.match(/youtube\.com|youtu\.be/)) return "YouTube";
  if (url.match(/vimeo\.com/)) return "Vimeo";
  if (url.match(/\.(mp4|webm|ogg)/i)) return "MP4";
  return "Inconnu";
}

export default function VideoBlockEditor({ block }: { block: Extract<Block, { type: "video" }> }) {
  const { dispatch } = useBuilder();
  const update = (content: Record<string, unknown>) => dispatch({ type: "UPDATE_BLOCK_CONTENT", blockId: block.id, content });

  const provider = detectProvider(block.content.videoUrl);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">URL de la vidéo</label>
        <input type="text" value={block.content.videoUrl} onChange={(e) => update({ videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className={inputClass} />
        {provider && (
          <div className="flex items-center gap-1.5 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${provider === "Inconnu" ? "bg-amber-400" : "bg-emerald-400"}`} />
            <span className="text-[10px] text-[#999]">{provider} détecté</span>
          </div>
        )}
        <p className="text-[10px] text-[#BBB] mt-1">Supporte YouTube, Vimeo et vidéos MP4 directes.</p>
      </div>
      <div>
        <label className="block text-[11px] font-medium text-[#999] mb-1">Légende</label>
        <input type="text" value={block.content.caption || ""} onChange={(e) => update({ caption: e.target.value })} className={inputClass} />
      </div>
    </div>
  );
}
