"use client";

import { memo } from "react";
import type { Process4StepsBlockContent } from "@/types";

function Process4StepsBlockPreviewInner({ content }: { content: Process4StepsBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-2xl font-bold text-center mb-2"
          style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p className="text-sm text-center mb-12" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="relative">
          {/* Connecting line (hidden on mobile) */}
          <div
            className="absolute top-8 left-[10%] right-[10%] h-0.5 hidden md:block"
            style={{ backgroundColor: "var(--site-border, #E6E6E4)" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {content.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                {/* Numbered circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{
                    backgroundColor: "var(--site-primary, #4F46E5)",
                    color: "var(--btn-text, #fff)",
                  }}
                >
                  {step.icon || (i + 1)}
                </div>

                <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--site-text, #191919)" }}>
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Process4StepsBlockPreviewInner);
