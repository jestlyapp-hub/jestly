"use client";
import { memo } from "react";
import type { FormContactSimpleBlockContent } from "@/types";

function FormContactSimpleBlockPreview({ content }: { content: FormContactSimpleBlockContent }) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-xl mx-auto">
        {content.title && (
          <h2
            className="text-3xl font-bold text-center mb-3"
            style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}
          >
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-10" style={{ color: "var(--site-muted, #666)" }}>
            {content.subtitle}
          </p>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {content.fields.map((field, i) => (
            <div key={i}>
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
          ))}

          <button
            type="submit"
            className="w-full px-6 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90 mt-2"
            style={{
              backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))",
              color: "var(--btn-text, #fff)",
              borderRadius: "var(--site-btn-radius, 8px)",
            }}
          >
            {content.submitLabel}
          </button>

          {content.trustNote && (
            <p className="text-center text-[12px] mt-3" style={{ color: "var(--site-muted, #666)" }}>
              {content.trustNote}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

export default memo(FormContactSimpleBlockPreview);
