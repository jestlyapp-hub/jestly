import { memo } from "react";
import type { FaqAccordionBlockContent } from "@/types";

function FaqAccordionBlockPreviewInner({ content }: { content: FaqAccordionBlockContent }) {
  return (
    <div className="py-4 space-y-2">
      {content.items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg border border-[#E6E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#1A1A1A]">{item.question}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          <p className="text-[11px] text-[#999] mt-1.5">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export default memo(FaqAccordionBlockPreviewInner);
