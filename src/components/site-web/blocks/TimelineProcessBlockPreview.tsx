import { memo } from "react";
import type { TimelineProcessBlockContent } from "@/types";

function TimelineProcessBlockPreviewInner({ content }: { content: TimelineProcessBlockContent }) {
  return (
    <div className="py-4 space-y-3">
      {content.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--site-primary)] flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5" style={{ color: "var(--btn-text, #fff)" }}>
            {i + 1}
          </div>
          <div>
            <div className="text-[13px] font-semibold" style={{ color: "var(--site-text, #191919)" }}>{step.title}</div>
            <div className="text-[11px]" style={{ color: "var(--site-muted, #999)" }}>{step.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(TimelineProcessBlockPreviewInner);
