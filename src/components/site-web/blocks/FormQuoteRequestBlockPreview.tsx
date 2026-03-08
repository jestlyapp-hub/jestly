"use client";
import { memo, useState, useRef } from "react";
import type { FormQuoteRequestBlockContent } from "@/types";
import type { LeadCaptureContext } from "@/lib/lead-capture";
import { submitLead } from "@/lib/lead-capture";

function FormQuoteRequestBlockPreview({ content, leadCtx }: { content: FormQuoteRequestBlockContent; leadCtx?: LeadCaptureContext }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCtx || !formRef.current) return;

    const fd = new FormData(formRef.current);
    const fields: Record<string, string> = {};
    let email = "";
    let name = "";
    let phone = "";
    let message = "";

    for (const field of content.fields) {
      const val = fd.get(field.label) as string || "";
      if (field.type === "email") email = val;
      else if (field.type === "tel") phone = val;
      else if (field.type === "textarea") message = val;
      else if (field.label.toLowerCase().includes("nom")) name = val;
      fields[field.label] = val;
    }

    if (!email) { setError("Email requis"); return; }

    setLoading(true);
    setError("");
    const result = await submitLead(leadCtx, { email, name, phone, message, fields, source: "quote-request" });
    setLoading(false);

    if (result.ok) setSubmitted(true);
    else setError(result.error || "Erreur");
  };

  if (submitted) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="text-[15px] font-medium" style={{ color: "var(--site-text, #1A1A1A)" }}>Merci ! Votre demande de devis a bien été envoyée.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {content.title && (
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "var(--site-text, #1A1A1A)", fontFamily: "var(--site-heading-font, inherit)" }}>
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-center text-[15px] mb-10 max-w-2xl mx-auto" style={{ color: "var(--site-muted, #666)" }}>{content.subtitle}</p>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          <form ref={formRef} onSubmit={handleSubmit} className="flex-1">
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
                        name={field.label}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                        rows={4}
                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                        style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)", color: "var(--site-text, #1A1A1A)" }}
                      />
                    ) : field.type === "select" && field.options ? (
                      <select
                        name={field.label}
                        required={field.required}
                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors appearance-none"
                        style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)", color: "var(--site-text, #1A1A1A)" }}
                      >
                        <option value="">{field.placeholder || "Choisir..."}</option>
                        {field.options.map((opt, j) => (
                          <option key={j} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={field.label}
                        type={field.type || "text"}
                        placeholder={field.placeholder || ""}
                        required={field.required}
                        className="w-full rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
                        style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)", color: "var(--site-text, #1A1A1A)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {error && <p className="text-[13px] text-red-500 mt-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 text-[15px] font-semibold transition-opacity hover:opacity-90 mt-6 disabled:opacity-50"
              style={{ backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))", color: "var(--btn-text, #fff)", borderRadius: "var(--site-btn-radius, 8px)" }}
            >
              {loading ? "Envoi..." : content.submitLabel}
            </button>
          </form>

          {content.sideText && (
            <div className="md:w-[280px] flex-shrink-0">
              <div className="rounded-xl p-6" style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)" }}>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--site-muted, #666)" }}>{content.sideText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(FormQuoteRequestBlockPreview);
