import { memo } from "react";
import type { VideoBlockContent } from "@/types";

function VideoBlockPreviewInner({ content }: { content: VideoBlockContent }) {
  return (
    <div className="py-4">
      <div className="h-48 bg-[#0a0a12] rounded-lg flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>
      {content.caption && (
        <p className="text-[12px] text-[#999] text-center mt-2">{content.caption}</p>
      )}
    </div>
  );
}

export default memo(VideoBlockPreviewInner);
