import { memo } from "react";
import type { VideoBlockContent } from "@/types";

function parseVideoProvider(url: string): { type: "youtube" | "vimeo" | "mp4" | "unknown"; embedUrl?: string } {
  if (!url) return { type: "unknown" };

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // MP4 / direct video
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) {
    return { type: "mp4" };
  }

  return { type: "unknown" };
}

function VideoBlockPreviewInner({ content }: { content: VideoBlockContent }) {
  const { type, embedUrl } = parseVideoProvider(content.videoUrl);

  return (
    <div className="py-4">
      {type === "youtube" || type === "vimeo" ? (
        <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        </div>
      ) : type === "mp4" ? (
        <video
          src={content.videoUrl}
          controls
          playsInline
          className="w-full rounded-lg"
        />
      ) : (
        <div className="h-48 bg-[#191919] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className="text-[11px] text-white/50">
              {content.videoUrl ? "Format non reconnu" : "Ajoutez une URL YouTube, Vimeo ou MP4"}
            </p>
          </div>
        </div>
      )}
      {content.caption && (
        <p className="text-[12px] opacity-60 text-center mt-2">{content.caption}</p>
      )}
    </div>
  );
}

export default memo(VideoBlockPreviewInner);
