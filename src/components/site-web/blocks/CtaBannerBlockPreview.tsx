"use client";

import { memo } from "react";
import type { CtaBannerBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function CtaBannerBlockPreviewInner({ content }: { content: CtaBannerBlockContent }) {
  return (
    <section className="py-16 px-4">
      <div
        className="relative rounded-2xl overflow-hidden px-4 sm:px-8 py-16 sm:py-20 text-center"
        style={{
          background: "linear-gradient(135deg, var(--site-primary), var(--site-primary) 40%, color-mix(in srgb, var(--site-primary) 60%, #000))",
        }}
      >
        {/* Radial glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: "#fff", fontFamily: "var(--site-heading-font)" }}
          >
            {content.title}
          </h2>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            {content.description}
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Primary CTA — white button */}
            <SmartLinkButton
              link={content.blockLink}
              label={content.ctaLabel}
              className="inline-block text-[14px] font-semibold px-7 py-3 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-white/20"
              style={{
                backgroundColor: "#fff",
                color: "var(--site-primary)",
                borderRadius: "var(--site-btn-radius)",
              }}
            />

            {/* Secondary CTA — white outline */}
            {content.secondaryLabel && (
              <SmartLinkButton
                link={content.secondaryBlockLink}
                label={content.secondaryLabel}
                className="inline-block text-[14px] font-semibold px-7 py-3 cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "var(--site-btn-radius)",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(CtaBannerBlockPreviewInner);
