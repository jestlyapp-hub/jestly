import { memo } from "react";
import type { FullImageBlockContent } from "@/types";

function FullImageBlockPreviewInner({ content }: { content: FullImageBlockContent }) {
  return (
    <div className="py-4">
      <div className="h-48 bg-gradient-to-br from-[var(--site-primary-light)] to-[var(--site-border,#E6E6E4)] rounded-lg flex items-center justify-center relative">
        {content.overlayText && (
          <span className="text-[16px] font-bold" style={{ color: "var(--site-text, #191919)" }}>{content.overlayText}</span>
        )}
        {!content.overlayText && (
          <div className="text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--site-muted, #BBB)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[11px]" style={{ color: "var(--site-muted, #BBB)" }}>{content.alt}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(FullImageBlockPreviewInner);
