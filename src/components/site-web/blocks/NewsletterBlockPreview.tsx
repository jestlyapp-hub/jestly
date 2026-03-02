import { memo } from "react";
import type { NewsletterBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

function NewsletterBlockPreviewInner({ content }: { content: NewsletterBlockContent }) {
  return (
    <div className="py-6 text-center max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-1">{content.title}</h3>
      <p className="text-[12px] opacity-60 mb-4">{content.description}</p>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg flex items-center px-3">
          <span className="text-[12px] text-[#BBB]">{content.placeholder}</span>
        </div>
        <span className="btn-styled text-[12px] font-semibold px-4 rounded-lg flex items-center cursor-pointer" style={getButtonInlineStyle()}>
          {content.buttonLabel}
        </span>
      </div>
    </div>
  );
}

export default memo(NewsletterBlockPreviewInner);
