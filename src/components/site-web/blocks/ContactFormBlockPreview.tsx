"use client";

import { memo, useState } from "react";
import type { ContactFormBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";
import { useProducts } from "@/lib/product-context";

const inputClass = "w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--site-primary)]/20 transition-all border"
  + " bg-[var(--site-surface,#F7F7F5)] border-[var(--site-border,#E6E6E4)] text-[var(--site-text,#1A1A1A)] placeholder:text-[var(--site-muted,#999)]";

interface LeadCtx { siteId: string; pagePath: string; blockType: string; }

function ContactFormBlockPreviewInner({ content, leadCtx }: { content: ContactFormBlockContent; leadCtx?: LeadCtx }) {
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
      // Build field mappings from mapTo attributes
      const fieldMappings: Record<string, string> = {};
      for (const field of content.fields) {
        if (field.mapTo) {
          fieldMappings[field.label] = field.mapTo;
        }
      }

      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: leadCtx?.siteId || siteId,
          source: "contact-form",
          page_path: leadCtx?.pagePath,
          name: formData["Nom"] || formData["Name"] || "",
          email: formData["Email"] || "",
          fields: formData,
          create_order: content.createOrder || false,
          field_mappings: Object.keys(fieldMappings).length > 0 ? fieldMappings : undefined,
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
      <div className="py-6 max-w-lg mx-auto text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--site-primary-light)] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="text-sm text-[var(--site-muted,#5A5A58)]">{content.successMessage}</p>
      </div>
    );
  }

  // Public mode: real interactive form
  if (isPublic) {
    return (
      <div className="py-6 max-w-lg mx-auto">
        {content.title && <h3 className="text-lg font-bold mb-1" style={{ color: "var(--site-text)" }}>{content.title}</h3>}
        {content.description && <p className="text-[13px] mb-5" style={{ color: "var(--site-muted)" }}>{content.description}</p>}
        <div className="space-y-3">
          {content.fields.map((field, i) => (
            <div key={i}>
              <label className="block text-[11px] font-medium text-[var(--site-muted,#666)] mb-1">
                {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.label] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={4}
                  className={inputClass + " resize-none"}
                />
              ) : field.type === "select" ? (
                <select
                  value={formData[field.label] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Sélectionner...</option>
                  {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.label] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                  placeholder={field.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-styled block text-center text-[13px] font-semibold px-4 py-2.5 mt-4 w-full cursor-pointer disabled:opacity-50"
          style={getButtonInlineStyle()}
        >
          {loading ? "Envoi..." : content.submitLabel}
        </button>
        {submitError && <p className="text-[12px] text-red-500 mt-2 text-center">Une erreur est survenue. Veuillez réessayer.</p>}
      </div>
    );
  }

  // Builder mode: static preview
  return (
    <div className="py-6 max-w-lg mx-auto">
      {content.title && <h3 className="text-lg font-bold mb-1" style={{ color: "var(--site-text)" }}>{content.title}</h3>}
      {content.description && <p className="text-[13px] mb-5" style={{ color: "var(--site-muted)" }}>{content.description}</p>}
      <div className="space-y-3">
        {content.fields.map((field, i) => (
          <div key={i}>
            <label className="block text-[11px] font-medium text-[var(--site-muted,#666)] mb-1">
              {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
              <div className="w-full bg-[var(--site-surface,#F7F7F5)] border border-[var(--site-border,#E6E6E4)] rounded-lg px-3 py-2 text-[12px] text-[var(--site-muted,#999)] h-20">{field.placeholder || ""}</div>
            ) : field.type === "select" ? (
              <div className="w-full bg-[var(--site-surface,#F7F7F5)] border border-[var(--site-border,#E6E6E4)] rounded-lg px-3 py-2 text-[12px] text-[var(--site-muted,#999)]">{field.options?.[0] || "Sélectionner..."}</div>
            ) : (
              <div className="w-full bg-[var(--site-surface,#F7F7F5)] border border-[var(--site-border,#E6E6E4)] rounded-lg px-3 py-2 text-[12px] text-[var(--site-muted,#999)]">{field.placeholder || ""}</div>
            )}
          </div>
        ))}
      </div>
      <span className="btn-styled block text-center text-[13px] font-semibold px-4 py-2.5 mt-4 cursor-pointer" style={getButtonInlineStyle()}>{content.submitLabel}</span>
    </div>
  );
}

export default memo(ContactFormBlockPreviewInner);
