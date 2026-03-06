"use client";

import { memo } from "react";
import type { HeroCenteredMeshBlockContent } from "@/types";
import SmartLinkButton from "@/components/site-public/SmartLinkButton";

function HeroCenteredMeshBlockPreviewInner({ content }: { content: HeroCenteredMeshBlockContent }) {
  return (
    <section
      className="relative overflow-hidden py-24 px-8"
      style={{ background: "var(--site-surface, #0a0a0a)" }}
    >
      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 50% 40% at 20% 20%, color-mix(in srgb, var(--site-primary) 12%, transparent) 0%, transparent 100%),
            radial-gradient(ellipse 40% 50% at 80% 30%, color-mix(in srgb, var(--site-primary) 8%, transparent) 0%, transparent 100%),
            radial-gradient(ellipse 60% 30% at 50% 80%, color-mix(in srgb, var(--site-primary) 6%, transparent) 0%, transparent 100%)
          `,
        }}
      />

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(var(--site-text, #fff) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {content.badge && (
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6"
            style={{
              background: "var(--site-primary-light, rgba(79,70,229,0.1))",
              color: "var(--site-primary)",
              border: "1px solid color-mix(in srgb, var(--site-primary) 25%, transparent)",
            }}
          >
            {content.badge}
          </span>
        )}

        <h1
          className="text-5xl sm:text-6xl font-bold leading-[1.08] mb-6"
          style={{
            color: "var(--site-text, #fafafa)",
            fontFamily: "var(--site-heading-font, inherit)",
          }}
        >
          {content.title}
        </h1>

        <p
          className="text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "var(--site-muted, #a1a1a1)" }}
        >
          {content.subtitle}
        </p>

        <SmartLinkButton
          link={content.blockLink}
          label={content.ctaLabel}
          className="inline-flex items-center justify-center text-[14px] font-semibold px-8 py-3.5 rounded-[var(--site-btn-radius,8px)] transition-all duration-200 hover:brightness-110 hover:shadow-lg"
          style={{
            background: "var(--site-primary)",
            color: "#fff",
            boxShadow: "0 0 30px color-mix(in srgb, var(--site-primary) 30%, transparent)",
          }}
        />

        {/* Trust logos */}
        {content.trustLogos && content.trustLogos.length > 0 && (
          <div className="mt-16">
            <p
              className="text-[11px] font-medium uppercase tracking-widest mb-6"
              style={{ color: "var(--site-muted, #a1a1a1)", opacity: 0.5 }}
            >
              Ils nous font confiance
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {content.trustLogos.map((logo, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity duration-300"
                >
                  {logo.imageUrl ? (
                    <img
                      src={logo.imageUrl}
                      alt={logo.name}
                      className="h-6 object-contain grayscale brightness-200"
                    />
                  ) : (
                    <span
                      className="text-[13px] font-semibold tracking-wide"
                      style={{ color: "var(--site-text, #fafafa)" }}
                    >
                      {logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(HeroCenteredMeshBlockPreviewInner);
