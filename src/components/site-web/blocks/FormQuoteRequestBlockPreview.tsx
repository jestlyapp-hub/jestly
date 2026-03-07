"use client";
import { memo } from "react";
import type { FormQuoteRequestBlockContent } from "@/types";

function FormQuoteRequestBlockPreview({ content }: { content: FormQuoteRequestBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-10 max-w-2xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.fields.map((field, i) => {
                const isFullWidth = field.type === "textarea";
                return (
                  <div key={i} className={isFullWidth ? "md:col-span-2" : ""}>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--site-text, #1A1A1A)" }}>
                      {field.label}
                      {field.required && <span style={{ color: "var(--site-primary, #4F46E5)" }}> *</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        placeholder={field.placeholder || ""}
                        rows={4}
                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                        style={{
                          backgroundColor: "var(--site-surface, #F7F7F5)",
                          border: "1px solid var(--site-border, #E6E6E4)",
                          color: "var(--site-text, #1A1A1A)",
                        }}
                      />
                    ) : field.type === "select" && field.options ? (
                      <select
                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors appearance-none"
                        style={{
                          backgroundColor: "var(--site-surface, #F7F7F5)",
                          border: "1px solid var(--site-border, #E6E6E4)",
                          color: "var(--site-text, #1A1A1A)",
                        }}
                      >
                        <option value="">{field.placeholder || "Choisir..."}</option>
                        {field.options.map((opt, j) => (
                          <option key={j} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || "text"}
                        placeholder={field.placeholder || ""}
                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                        style={{
                          backgroundColor: "var(--site-surface, #F7F7F5)",
                          border: "1px solid var(--site-border, #E6E6E4)",
                          color: "var(--site-text, #1A1A1A)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90 mt-6"
              style={{
                backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
                color: "var(--btn-text, #fff)",
                borderRadius: "var(--site-btn-radius, 8px)",
              }}
            >
              {content.submitLabel}
            </button>
          </form>

          {/* Optional side text */}
          {content.sideText && (
            <div className="md:w-[280px] flex-shrink-0">
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: "var(--site-surface, #F7F7F5)",
                  border: "1px solid var(--site-border, #E6E6E4)",
                }}
              >
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>
                  {content.sideText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(FormQuoteRequestBlockPreview);
