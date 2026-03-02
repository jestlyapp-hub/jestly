import { memo } from "react";
import type { NewsletterBlockContent } from "@/types";

function NewsletterBlockPreviewInner({ content }: { content: NewsletterBlockContent }) {
  return (
    <div className="py-6 text-center max-w-md mx-auto">
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">{content.title}</h3>
      <p className="text-[12px] text-[#999] mb-4">{content.description}</p>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg flex items-center px-3">
          <span className="text-[12px] text-[#BBB]">{content.placeholder}</span>
        </div>
        <span className="bg-[#6a18f1] text-white text-[12px] font-semibold px-4 rounded-lg flex items-center">
          {content.buttonLabel}
        </span>
      </div>
    </div>
  );
}

export default memo(NewsletterBlockPreviewInner);
