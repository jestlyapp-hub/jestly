"use client";
import { memo } from "react";
import type { FormNewsletterLeadBlockContent } from "@/types";

function FormNewsletterLeadBlockPreview({ content }: { content: FormNewsletterLeadBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        {content.title && (
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-[15px] mb-8" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
          <input
            type="email"
            placeholder={content.placeholder || "votre@email.com"}
            className="flex-1 rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
            style={{
              backgroundColor: "var(--site-surface, #F7F7F5)",
              border: "1px solid var(--site-border, #E6E6E4)",
              color: "var(--site-text, #1A1A1A)",
            }}
          />
          <button
            type="submit"
            className="px-6 py-3 text-[14px] font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {content.ctaLabel}
          </button>
        </form>

        {content.privacyNote && (
          <p className="text-[12px] mt-4" style={{ color: "var(--site-muted, #666)" }}>
            {content.privacyNote}
          </p>
        )}
      </div>
    </section>
  );
}

export default memo(FormNewsletterLeadBlockPreview);
