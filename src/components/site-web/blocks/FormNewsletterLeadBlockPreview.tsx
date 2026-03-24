"use client";
import { memo, useState, useRef } from "react";
import type { FormNewsletterLeadBlockContent } from "@/types";
import type { LeadCaptureContext } from "@/lib/lead-capture";
import { submitLead } from "@/lib/lead-capture";

function FormNewsletterLeadBlockPreview({ content, leadCtx }: { content: FormNewsletterLeadBlockContent; leadCtx?: LeadCaptureContext }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCtx || !inputRef.current) return;

    const email = inputRef.current.value.trim();
    if (!email) { setError("Email requis"); return; }

    setLoading(true);
    setError("");
    const result = await submitLead(leadCtx, { email, source: "newsletter" });
    setLoading(false);

    if (result.ok) setSubmitted(true);
    else setError(result.error || "Erreur");
  };

  if (submitted) {
    return (
      <section className="py-16 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <p className="text-[15px] font-medium" style={{ color: "var(--site-text, #191919)" }}>Merci ! Vous êtes inscrit.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-md mx-auto text-center">
        {content.title && (
          <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--site-text, #191919)", fontFamily: "var(--site-heading-font, inherit)" }}>
            {content.title}
          </h2>
        )}
        {content.subtitle && (
          <p className="text-[15px] mb-8" style={{ color: "var(--site-muted, #666)" }}>{content.subtitle}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            ref={inputRef}
            type="email"
            placeholder={content.placeholder || "votre@email.com"}
            required
            className="flex-1 w-full sm:w-auto rounded-lg px-4 py-3 text-[14px] outline-none transition-colors"
            style={{ backgroundColor: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)", color: "var(--site-text, #191919)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 text-[14px] font-semibold flex-shrink-0 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--btn-bg, var(--site-primary, #4F46E5))", color: "var(--btn-text, #fff)", borderRadius: "var(--site-btn-radius, 8px)" }}
          >
            {loading ? "..." : content.ctaLabel}
          </button>
        </form>

        {error && <p className="text-[13px] text-red-500 mt-2">{error}</p>}

        {content.privacyNote && (
          <p className="text-[12px] mt-4" style={{ color: "var(--site-muted, #666)" }}>{content.privacyNote}</p>
        )}
      </div>
    </section>
  );
}

export default memo(FormNewsletterLeadBlockPreview);
