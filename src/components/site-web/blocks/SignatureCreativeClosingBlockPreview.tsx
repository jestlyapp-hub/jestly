"use client";
import { memo } from "react";
import type { SignatureCreativeClosingBlockContent } from "@/types";

function SignatureCreativeClosingBlockPreviewInner({ content }: { content: SignatureCreativeClosingBlockContent }) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2
          className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight"
          style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
        >
          {content.title}
        </h2>
        <p
          className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
          style={{ color: "var(--site-muted, #666)" }}
        >
          {content.subtitle}
        </p>

        {/* CTA with glow */}
        <div className="relative inline-block">
          <div
            className="absolute inset-0 rounded-xl blur-xl opacity-30"
            style={{ backgroundColor: "var(--site-primary, #4F46E5)" }}
          />
          <span
            className="relative inline-block text-base font-bold px-10 py-4 cursor-pointer"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {content.ctaLabel}
          </span>
        </div>

        {content.signatureNote && (
          <p
            className="mt-12 text-xs italic"
            style={{ color: "var(--site-muted, #666)" }}
          >
            {content.signatureNote}
          </p>
        )}
      </div>
    </section>
  );
}

export default memo(SignatureCreativeClosingBlockPreviewInner);
