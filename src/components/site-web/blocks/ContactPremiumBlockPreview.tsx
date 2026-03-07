"use client";

import { memo } from "react";
import type { ContactPremiumBlockContent } from "@/types";

function ContactPremiumBlockPreviewInner({ content }: { content: ContactPremiumBlockContent }) {
  const fields = content.fields ?? [];

  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        {(content.title || content.subtitle) && (
          <div className="text-center mb-10">
            {content.title && (
              <h2
                className="text-3xl font-bold tracking-tight mb-3"
                style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}
              >
                {content.title}
              </h2>
            )}
            {content.subtitle && (
              <p className="text-base max-w-lg mx-auto" style={{ color: "var(--site-muted)" }}>
                {content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Form container */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "var(--site-surface)",
            border: "1px solid var(--site-border)",
            boxShadow: "0 4px 32px -8px rgba(0,0,0,0.12)",
          }}
        >
          <div className="space-y-5">
            {fields.map((field, index) => {
              const inputStyle: React.CSSProperties = {
                backgroundColor: "var(--site-surface)",
                border: "1px solid var(--site-border)",
                color: "var(--site-text)",
                borderRadius: "var(--site-btn-radius)",
                outline: "none",
              };

              const labelEl = (
                <label
                  className="block text-[13px] font-medium mb-1.5"
                  style={{ color: "var(--site-text)" }}
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-0.5" style={{ color: "var(--site-primary)" }}>*</span>
                  )}
                </label>
              );

              if (field.type === "textarea") {
                return (
                  <div key={index}>
                    {labelEl}
                    <textarea
                      rows={4}
                      placeholder={field.placeholder || ""}
                      className="w-full px-4 py-3 text-[13px] resize-none transition-colors duration-200 focus:ring-2 focus:ring-[var(--site-primary)] focus:border-transparent"
                      style={inputStyle}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={index}>
                    {labelEl}
                    <select
                      className="w-full px-4 py-3 text-[13px] appearance-none transition-colors duration-200 focus:ring-2 focus:ring-[var(--site-primary)] focus:border-transparent"
                      style={{
                        ...inputStyle,
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.75rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.25em 1.25em",
                        paddingRight: "2.5rem",
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {field.placeholder || "Sélectionner..."}
                      </option>
                      {(field.options ?? []).map((opt, oi) => (
                        <option key={oi} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              // text, email, phone
              return (
                <div key={index}>
                  {labelEl}
                  <input
                    type={field.type === "phone" ? "tel" : field.type}
                    placeholder={field.placeholder || ""}
                    className="w-full px-4 py-3 text-[13px] transition-colors duration-200 focus:ring-2 focus:ring-[var(--site-primary)] focus:border-transparent"
                    style={inputStyle}
                  />
                </div>
              );
            })}
          </div>

          {/* Submit button */}
          <button
            type="button"
            className="w-full mt-8 text-[14px] font-semibold px-6 py-3.5 cursor-pointer transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: "var(--site-primary)",
              color: "var(--site-text, #fff)",
              borderRadius: "var(--site-btn-radius)",
              border: "none",
            }}
          >
            {content.submitLabel || "Envoyer"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(ContactPremiumBlockPreviewInner);
