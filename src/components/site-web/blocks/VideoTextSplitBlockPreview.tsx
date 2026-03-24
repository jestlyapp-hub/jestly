import { memo } from "react";
import type { VideoTextSplitBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function parseVideoEmbed(url: string): { type: "youtube" | "vimeo" | "mp4"; embedUrl: string } | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i)) return { type: "mp4", embedUrl: url };
  return null;
}

function VideoTextSplitBlockPreviewInner({ content }: { content: VideoTextSplitBlockContent }) {
  const video = parseVideoEmbed(content.videoUrl);
  const isLeft = content.videoPosition === "left";

  const videoEl = video ? (
    video.type === "mp4" ? (
      <video src={video.embedUrl} className="w-full rounded-xl" controls />
    ) : (
      <iframe src={video.embedUrl} className="w-full aspect-video rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    )
  ) : (
    <div className="w-full aspect-video rounded-xl bg-[var(--site-primary-light)] flex items-center justify-center text-[11px] text-[var(--site-primary)]">Vidéo</div>
  );

  const textEl = (
    <div className="flex flex-col justify-center">
      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--site-text)" }}>{content.title}</h3>
      <p className="text-[13px] mb-4" style={{ color: "var(--site-muted)" }}>{content.description}</p>
      {content.ctaLabel && (
        <SmartLinkButton link={content.blockLink} label={content.ctaLabel!} className="inline-block text-[13px] font-semibold px-5 py-2 cursor-pointer self-start" />
      )}
    </div>
  );

  return (
    <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      {isLeft ? <>{videoEl}{textEl}</> : <>{textEl}{videoEl}</>}
    </div>
  );
}

export default memo(VideoTextSplitBlockPreviewInner);
