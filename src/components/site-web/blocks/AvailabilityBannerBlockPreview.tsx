import { memo } from "react";
import type { AvailabilityBannerBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

const statusColors: Record<string, { bg: string; ring: string }> = {
  open: { bg: "bg-emerald-400", ring: "ring-emerald-400/30" },
  limited: { bg: "bg-amber-400", ring: "ring-amber-400/30" },
  closed: { bg: "bg-red-400", ring: "ring-red-400/30" },
};

function AvailabilityBannerBlockPreviewInner({ content }: { content: AvailabilityBannerBlockContent }) {
  const color = statusColors[content.status] ?? statusColors.open;

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4 px-5 py-3 rounded-xl border" style={{ borderColor: "var(--site-border, #E6E6E4)", background: "var(--site-surface, #FBFBFA)" }}>
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${color.bg} ring-4 ${color.ring} flex-shrink-0`} />
          <span className="text-[13px] font-medium" style={{ color: "var(--site-text)" }}>{content.message}</span>
        </div>
        {content.ctaLabel && (
          <SmartLinkButton link={content.blockLink} label={content.ctaLabel!} className="px-3 py-1.5 text-[12px] font-semibold cursor-pointer whitespace-nowrap flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

export default memo(AvailabilityBannerBlockPreviewInner);
