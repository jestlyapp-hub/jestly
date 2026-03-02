import { memo } from "react";
import type { TimelineProcessBlockContent } from "@/types";

function TimelineProcessBlockPreviewInner({ content }: { content: TimelineProcessBlockContent }) {
  return (
    <div className="py-4 space-y-3">
      {content.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[#6a18f1] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-[#1A1A1A]">{step.title}</div>
            <div className="text-[11px] text-[#999]">{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(TimelineProcessBlockPreviewInner);
