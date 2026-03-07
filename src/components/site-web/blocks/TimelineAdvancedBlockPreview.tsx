import { memo } from "react";
import type { TimelineAdvancedBlockContent } from "@/types";

function TimelineAdvancedBlockPreviewInner({ content }: { content: TimelineAdvancedBlockContent }) {
  const isHorizontal = content.orientation === "horizontal";

  return (
    <div className="py-6">
      {content.title && <h3 className="text-lg font-bold text-center mb-6" style={{ color: "var(--site-text)" }}>{content.title}</h3>}
      {isHorizontal ? (
        <div className="flex items-start gap-2 overflow-x-auto">
          {content.steps.map((step, i) => (
            <div key={i} className="flex-1 min-w-[140px] text-center relative">
              <div className="w-8 h-8 rounded-full bg-[var(--site-primary)] flex items-center justify-center text-[11px] font-bold mx-auto mb-2" style={{ color: "var(--btn-text, #fff)" }}>{i + 1}</div>
              {i < content.steps.length - 1 && (
                <div className="absolute top-4 left-[calc(50%+16px)] right-0 h-[2px]" style={{ background: "var(--site-border, #E6E6E4)" }} />
              )}
              <div className="text-[12px] font-semibold mb-0.5" style={{ color: "var(--site-text)" }}>{step.title}</div>
              <div className="text-[10px]" style={{ color: "var(--site-muted)" }}>{step.description}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {content.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[var(--site-primary)] flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ color: "var(--btn-text, #fff)" }}>{i + 1}</div>
                {i < content.steps.length - 1 && <div className="w-[2px] h-8" style={{ background: "var(--site-border, #E6E6E4)" }} />}
              </div>
              <div className="pb-4">
                <div className="text-[13px] font-semibold" style={{ color: "var(--site-text)" }}>{step.title}</div>
                <div className="text-[11px]" style={{ color: "var(--site-muted)" }}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(TimelineAdvancedBlockPreviewInner);
