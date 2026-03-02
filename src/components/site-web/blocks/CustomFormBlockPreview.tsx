"use client";

import { memo, useState } from "react";
import type { CustomFormBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";
import { useProducts } from "@/lib/product-context";

const inputClass = "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[var(--site-primary)]/30 focus:ring-1 focus:ring-[var(--site-primary)]/20 transition-all";

function CustomFormBlockPreviewInner({ content }: { content: CustomFormBlockContent }) {
  const { isPublic } = useProducts();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!isPublic) return;
    setLoading(true);
    try {
      await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "custom-form",
          name: formData["Nom"] || formData["Name"] || "",
          email: formData["Email"] || "",
          fields: formData,
        }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (submitted && isPublic) {
    return (
      <div className="py-4 max-w-md mx-auto text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--site-primary-light)] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="text-sm text-[#5A5A58]">Merci ! Votre message a bien été envoyé.</p>
      </div>
    );
  }

  // Public mode: real interactive form
  if (isPublic) {
    return (
      <div className="py-4 max-w-md mx-auto space-y-3">
        {content.fields.map((field, i) => (
          <div key={i}>
            <label className="block text-[11px] font-medium text-[#999] mb-1">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                value={formData[field.label] || ""}
                onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                rows={3}
                className={inputClass + " resize-none"}
              />
            ) : (
              <input
                type={field.type}
                value={formData[field.label] || ""}
                onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                className={inputClass}
              />
            )}
          </div>
        ))}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-styled inline-block text-[12px] font-semibold px-4 py-2 cursor-pointer disabled:opacity-50"
          style={getButtonInlineStyle()}
        >
          {loading ? "Envoi..." : content.submitLabel}
        </button>
      </div>
    );
  }

  // Builder mode: static preview
  return (
    <div className="py-4 max-w-md mx-auto space-y-3">
      {content.fields.map((field, i) => (
        <div key={i}>
          <label className="block text-[11px] font-medium text-[#999] mb-1">
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          {field.type === "textarea" ? (
            <div className="w-full h-16 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg" />
          ) : (
            <div className="w-full h-9 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg" />
          )}
        </div>
      ))}
      <span className="btn-styled inline-block text-[12px] font-semibold px-4 py-2 cursor-pointer" style={getButtonInlineStyle()}>
        {content.submitLabel}
      </span>
    </div>
  );
}

export default memo(CustomFormBlockPreviewInner);
