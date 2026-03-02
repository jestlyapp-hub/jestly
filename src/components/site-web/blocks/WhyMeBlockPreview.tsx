import { memo } from "react";
import type { WhyMeBlockContent } from "@/types";

function WhyMeBlockPreviewInner({ content }: { content: WhyMeBlockContent }) {
  return (
    <div className="py-4">
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">{content.title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {content.reasons.map((r, i) => (
          <div key={i} className="p-3 rounded-lg border border-[#E6E8F0]">
            <div className="w-7 h-7 rounded-lg bg-[#F0EBFF] flex items-center justify-center text-[12px] font-bold text-[#6a18f1] mb-2">
              {i + 1}
            </div>
            <div className="text-[13px] font-semibold text-[#1A1A1A] mb-0.5">{r.title}</div>
            <div className="text-[11px] text-[#999]">{r.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(WhyMeBlockPreviewInner);
