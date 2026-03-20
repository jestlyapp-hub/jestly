"use client";
import { memo } from "react";
import type { ProcessDetailedTimelineBlockContent } from "@/types";

function ProcessDetailedTimelineBlockPreview({ content }: { content: ProcessDetailedTimelineBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-12 max-w-2xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[139px] top-0 bottom-0 w-[2px]"
            style={{ backgroundColor: "var(--site-border, #E6E6E4)" }}
          />

          <div className="space-y-10">
            {content.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-8">
                {/* Left: tag badge */}
                <div className="w-[120px] flex-shrink-0 flex justify-end pt-1">
                  {step.tag && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-[12px] font-medium"
                      style={{
                        backgroundColor: "var(--site-primary-light, #EEF2FF)",
                        color: "var(--site-primary, #4F46E5)",
                      }}
                    >
                      {step.tag}
                    </span>
                  )}
                </div>

                {/* Dot */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-[14px] h-[14px] rounded-full border-[3px]"
                    style={{
                      borderColor: "var(--site-primary, #4F46E5)",
                      backgroundColor: "var(--site-surface, #F7F7F5)",
                    }}
                  />
                </div>

                {/* Right: content */}
                <div className="flex-1 pb-2">
                  <h3
                    className="text-[16px] font-semibold mb-1"
                    style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[14px] mb-2" style={{ color: "var(--site-muted, #666)" }}>
                    {step.description}
                  </p>
                  {step.details && (
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--site-muted, #666)", opacity: 0.8 }}>
                      {step.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ProcessDetailedTimelineBlockPreview);
