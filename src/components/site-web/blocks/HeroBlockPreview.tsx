import { memo } from "react";
import type { HeroBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function HeroBlockPreviewInner({ content }: { content: HeroBlockContent }) {
  return (
    <div className="text-center py-8">
      <h2 className="text-2xl font-bold mb-2">{content.title}</h2>
      {content.subtitle && <p className="text-[14px] opacity-70 mb-4 max-w-lg mx-auto">{content.subtitle}</p>}
      {content.ctaLabel && (
        <SmartLinkButton link={content.blockLink} label={content.ctaLabel} className="inline-block text-[13px] font-semibold px-5 py-2.5 cursor-pointer" />
      )}
    </div>
  );
}

export default memo(HeroBlockPreviewInner);
