import { memo } from "react";
import type { CenteredCtaBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

function CenteredCtaBlockPreviewInner({ content }: { content: CenteredCtaBlockContent }) {

  return (
    <div className="text-center py-8">
      <h3 className="text-xl font-bold mb-2">{content.title}</h3>
      <p className="text-[13px] opacity-70 mb-4 max-w-md mx-auto">{content.description}</p>
      <span className="btn-styled inline-block text-[13px] font-semibold px-5 py-2.5 cursor-pointer" style={getButtonInlineStyle()}>
        {content.ctaLabel}
      </span>
    </div>
  );
}

export default memo(CenteredCtaBlockPreviewInner);
