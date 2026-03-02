import { memo } from "react";
import type { HeroBlockContent } from "@/types";

function HeroBlockPreviewInner({ content }: { content: HeroBlockContent }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
      {content.subtitle && <p className="text-[14px] opacity-70 mb-4 max-w-lg mx-auto">{content.subtitle}</p>}
      {content.ctaLabel && (
        <span className="inline-block bg-[#6a18f1] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg">
          {content.ctaLabel}
        </span>
      )}
    </div>
  );
}

export default memo(HeroBlockPreviewInner);
