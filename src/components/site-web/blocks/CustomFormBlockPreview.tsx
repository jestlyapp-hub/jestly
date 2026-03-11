"use client";

import { memo, useState } from "react";
import type { CustomFormBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";
import { useProducts } from "@/lib/product-context";

const inputClass = "w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--site-primary)]/20 transition-all border"
  + " bg-[var(--site-surface,#F7F7F5)] border-[var(--site-border,#E6E6E4)] text-[var(--site-text,#1A1A1A)]";

interface LeadCtx { siteId: string; pagePath: string; blockType: string; }

function CustomFormBlockPreviewInner({ content, leadCtx }: { content: CustomFormBlockContent; leadCtx?: LeadCtx }) {
  const { isPublic, siteId } = useProducts();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleSubmit = async () => {
    if (!isPublic) return;
    setLoading(true);
    setSubmitError(false);
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "custom-form",
          site_id: leadCtx?.siteId || siteId,
          page_path: leadCtx?.pagePath,
          name: formData["Nom"] || formData["Name"] || "",
          email: formData["Email"] || "",
          fields: formData,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSubmitted(true);
    } catch {
      setSubmitError(true);
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
        <p className="text-sm" style={{ color: "var(--site-muted, #5A5A58)" }}>Merci ! Votre message a bien été envoyé.</p>
      </div>
    );
  }

  // Public mode: real interactive form
  if (isPublic) {
    return (
      <div className="py-4 max-w-md mx-auto space-y-3">
        {content.fields.map((field, i) => (
          <div key={i}>
            <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--site-muted, #999)" }}>
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
        {submitError && <p className="text-[12px] text-red-500 mt-2">Une erreur est survenue. Veuillez réessayer.</p>}
      </div>
    );
  }

  // Builder mode: static preview
  return (
    <div className="py-4 max-w-md mx-auto space-y-3">
      {content.fields.map((field, i) => (
        <div key={i}>
          <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--site-muted, #999)" }}>
            {field.label} {field.required && <span className="text-red-400">*</span>}
          </label>
          {field.type === "textarea" ? (
            <div className="w-full h-16 rounded-lg border" style={{ background: "var(--site-surface, #F7F7F5)", borderColor: "var(--site-border, #E6E6E4)" }} />
          ) : (
            <div className="w-full h-9 rounded-lg border" style={{ background: "var(--site-surface, #F7F7F5)", borderColor: "var(--site-border, #E6E6E4)" }} />
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
