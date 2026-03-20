"use client";

import { memo, useState, useRef } from "react";
import type { ContactPremiumBlockContent } from "@/types";
import { useProducts } from "@/lib/product-context";

interface LeadCtx { siteId: string; pagePath: string; blockType: string; }

function ContactPremiumBlockPreviewInner({ content, leadCtx }: { content: ContactPremiumBlockContent; leadCtx?: LeadCtx }) {
  const { isPublic, siteId } = useProducts();
  const fields = content.fields ?? [];

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false); // anti double-submit lock

  const setValue = (label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  // ── Validation ──
  const validate = (): string | null => {
    // Check email field exists (required by backend)
    const emailField = fields.find(f => f.type === "email");
    if (!emailField) return "Ce formulaire nécessite un champ email";
    const emailVal = (formData[emailField.label] || "").trim();
    if (!emailVal) return `Le champ « ${emailField.label} » est requis`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) return "Adresse email invalide";

    for (const field of fields) {
      if (field.type === "email") continue; // already checked above
      const val = (formData[field.label] || "").trim();
      if (field.required && !val) return `Le champ « ${field.label} » est requis`;
      // Validate select value is in allowed options
      if (field.type === "select" && val && field.options?.length) {
        if (!field.options.includes(val)) return `Valeur invalide pour « ${field.label} »`;
      }
    }
    return null;
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!isPublic || submitted || submittingRef.current) return;
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    submittingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      // Trim all values for clean storage
      const trimmedFields: Record<string, string> = {};
      for (const [k, v] of Object.entries(formData)) {
        const trimmed = (v || "").trim();
        if (trimmed) trimmedFields[k] = trimmed;
      }

      // Extract canonical fields from dynamic form
      const emailField = fields.find(f => f.type === "email");
      const email = emailField ? (trimmedFields[emailField.label] || "") : "";
      const nameField = fields.find(f =>
        f.label.toLowerCase().includes("nom") ||
        f.label.toLowerCase().includes("name") ||
        f.label.toLowerCase().includes("prénom") ||
        f.label.toLowerCase().includes("pseudo")
      );
      const name = nameField ? (trimmedFields[nameField.label] || "") : "";
      const phoneField = fields.find(f => f.type === "phone" || f.label.toLowerCase().includes("téléphone") || f.label.toLowerCase().includes("phone"));
      const phone = phoneField ? (trimmedFields[phoneField.label] || "") : "";
      const messageField = fields.find(f => f.type === "textarea");
      const message = messageField ? (trimmedFields[messageField.label] || "") : "";

      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: leadCtx?.siteId || siteId,
          source: "contact-form",
          page_path: leadCtx?.pagePath || null,
          block_type: "contact-premium",
          email,
          name: name || null,
          phone: phone || null,
          message: message || null,
          fields: trimmedFields,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur lors de l'envoi");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  // ── Styles ──
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--site-surface)",
    border: "1px solid var(--site-border)",
    color: "var(--site-text)",
    borderRadius: "var(--site-btn-radius)",
    outline: "none",
  };

  // ── Success state ──
  if (submitted && isPublic) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: "var(--site-surface)", border: "1px solid var(--site-border)", boxShadow: "0 4px 32px -8px rgba(0,0,0,0.12)" }}
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "var(--site-primary-light)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="text-base font-medium" style={{ color: "var(--site-text)" }}>{content.successMessage || "Message envoyé !"}</p>
            <p className="text-sm mt-2" style={{ color: "var(--site-muted)" }}>Nous reviendrons vers vous rapidement.</p>
          </div>
        </div>
      </section>
    );
  }

  // ── Public interactive form ──
  if (isPublic) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {(content.title || content.subtitle) && (
            <div className="text-center mb-10">
              {content.title && (
                <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}>{content.title}</h2>
              )}
              {content.subtitle && (
                <p className="text-base max-w-lg mx-auto" style={{ color: "var(--site-muted)" }}>{content.subtitle}</p>
              )}
            </div>
          )}
          <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--site-surface)", border: "1px solid var(--site-border)", boxShadow: "0 4px 32px -8px rgba(0,0,0,0.12)" }}>
            <div className="space-y-5">
              {fields.map((field, index) => {
                const labelEl = (
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--site-text)" }}>
                    {field.label}
                    {field.required && <span className="ml-0.5" style={{ color: "var(--site-primary)" }}>*</span>}
                  </label>
                );

                if (field.type === "textarea") {
                  return (
                    <div key={index}>
                      {labelEl}
                      <textarea
                        rows={4}
                        value={formData[field.label] || ""}
                        onChange={(e) => setValue(field.label, e.target.value)}
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
                        value={formData[field.label] || ""}
                        onChange={(e) => setValue(field.label, e.target.value)}
                        className="w-full px-4 py-3 text-[13px] appearance-none transition-colors duration-200 focus:ring-2 focus:ring-[var(--site-primary)] focus:border-transparent"
                        style={{
                          ...inputStyle,
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 0.75rem center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "1.25em 1.25em",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="">{field.placeholder || "Sélectionner..."}</option>
                        {(field.options ?? []).map((opt, oi) => (
                          <option key={oi} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                return (
                  <div key={index}>
                    {labelEl}
                    <input
                      type={field.type === "phone" ? "tel" : field.type}
                      value={formData[field.label] || ""}
                      onChange={(e) => setValue(field.label, e.target.value)}
                      placeholder={field.placeholder || ""}
                      className="w-full px-4 py-3 text-[13px] transition-colors duration-200 focus:ring-2 focus:ring-[var(--site-primary)] focus:border-transparent"
                      style={inputStyle}
                    />
                  </div>
                );
              })}
            </div>

            {error && (
              <p className="text-[12px] text-red-500 mt-3 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full mt-8 text-[14px] font-semibold px-6 py-3.5 cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--site-primary)", color: "#fff", borderRadius: "var(--site-btn-radius)", border: "none" }}
            >
              {loading ? "Envoi en cours..." : (content.submitLabel || "Envoyer")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ── Builder preview (static, non-interactive) ──
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {(content.title || content.subtitle) && (
          <div className="text-center mb-10">
            {content.title && (
              <h2 className="text-3xl font-bold tracking-tight mb-3" style={{ color: "var(--site-text)", fontFamily: "var(--site-heading-font)" }}>{content.title}</h2>
            )}
            {content.subtitle && (
              <p className="text-base max-w-lg mx-auto" style={{ color: "var(--site-muted)" }}>{content.subtitle}</p>
            )}
          </div>
        )}
        <div className="rounded-2xl p-8" style={{ backgroundColor: "var(--site-surface)", border: "1px solid var(--site-border)", boxShadow: "0 4px 32px -8px rgba(0,0,0,0.12)" }}>
          <div className="space-y-5">
            {fields.map((field, index) => (
              <div key={index}>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: "var(--site-text)" }}>
                  {field.label}{field.required && <span className="ml-0.5" style={{ color: "var(--site-primary)" }}>*</span>}
                </label>
                {field.type === "textarea" ? (
                  <div className="w-full px-4 py-3 text-[13px] h-24" style={{ ...inputStyle, color: "var(--site-muted)" }}>{field.placeholder || ""}</div>
                ) : (
                  <div className="w-full px-4 py-3 text-[13px]" style={{ ...inputStyle, color: "var(--site-muted)" }}>{field.placeholder || ""}</div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full mt-8 text-[14px] font-semibold px-6 py-3.5 text-center" style={{ backgroundColor: "var(--site-primary)", color: "#fff", borderRadius: "var(--site-btn-radius)" }}>
            {content.submitLabel || "Envoyer"}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ContactPremiumBlockPreviewInner);
