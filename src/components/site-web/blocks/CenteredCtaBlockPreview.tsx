import { memo } from "react";
import type { CenteredCtaBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function CenteredCtaBlockPreviewInner({ content }: { content: CenteredCtaBlockContent }) {
  return (
    <div className="text-center py-8">
      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--site-text)" }}>{content.title}</h3>
      <p className="text-[13px] mb-4 max-w-md mx-auto" style={{ color: "var(--site-muted)" }}>{content.description}</p>
      <SmartLinkButton link={content.blockLink} label={content.ctaLabel} className="inline-block text-[13px] font-semibold px-5 py-2.5 cursor-pointer" />
    </div>
  );
}

export default memo(CenteredCtaBlockPreviewInner);
