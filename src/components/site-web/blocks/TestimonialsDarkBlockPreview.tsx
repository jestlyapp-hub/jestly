"use client";

import { memo } from "react";
import type { TestimonialsDarkBlockContent } from "@/types";

function TestimonialsDarkBlockPreviewInner({ content }: { content: TestimonialsDarkBlockContent }) {
  const testimonials = content.testimonials ?? [];

  if (testimonials.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-[13px]" style={{ color: "var(--site-muted)" }}>Aucun témoignage configuré</div>
      </div>
    );
  }

  const cols =
    testimonials.length === 1
      ? "grid-cols-1 max-w-lg mx-auto"
      : testimonials.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto";

  return (
    <section className="py-16 px-4">
      {/* Title */}
      {content.title && (
        <h2
          className="text-3xl font-bold tracking-tight text-center mb-12"
          style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
        >
          {content.title}
        </h2>
      )}

      {/* Grid */}
      <div className={`grid ${cols} gap-6`}>
        {testimonials.map((t, index) => (
          <div
            key={index}
            className="relative flex flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 group overflow-hidden"
            style={{
              backgroundColor: "var(--site-surface)",
              border: "1px solid var(--site-border)",
              boxShadow: "0 4px 24px -4px rgba(0,0,0,0.12)",
            }}
          >
            {/* Decorative quote mark */}
            <span
              className="absolute top-4 right-5 text-6xl font-serif leading-none pointer-events-none select-none"
              style={{ color: "var(--site-primary)", opacity: 0.1 }}
            >
              &ldquo;
            </span>

            {/* Star rating */}
            {t.rating != null && t.rating > 0 && (
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg
                    key={si}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={si < t.rating! ? "var(--site-primary)" : "none"}
                    stroke="var(--site-primary)"
                    strokeWidth="1.5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            )}

            {/* Quote text */}
            <p
              className="text-[14px] leading-relaxed italic flex-1 mb-6 relative z-10"
              style={{ color: "var(--site-text)", opacity: 0.85 }}
            >
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Separator */}
            <div className="mb-4" style={{ borderBottom: "1px solid var(--site-border)" }} />

            {/* Author */}
            <div className="flex items-center gap-3">
              {/* Avatar or initials */}
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover"
                  style={{ border: "2px solid var(--site-border)" }}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: "var(--site-primary-light)",
                    color: "var(--site-primary)",
                    border: "1px solid var(--site-border)",
                  }}
                >
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="text-[13px] font-semibold truncate" style={{ color: "var(--site-text)" }}>
                  {t.name}
                </div>
                <div className="text-[11px] truncate" style={{ color: "var(--site-muted)" }}>
                  {t.role}
                  {t.company && <span> · {t.company}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(TestimonialsDarkBlockPreviewInner);
