"use client";
import { memo, useState, useRef } from "react";
import type { NewsletterBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";
import type { LeadCaptureContext } from "@/lib/lead-capture";
import { submitLead } from "@/lib/lead-capture";

function NewsletterBlockPreviewInner({ content, leadCtx }: { content: NewsletterBlockContent; leadCtx?: LeadCaptureContext }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!leadCtx || !inputRef.current) return;
    const email = inputRef.current.value.trim();
    if (!email) return;

    setLoading(true);
    const result = await submitLead(leadCtx, { email, source: "newsletter" });
    setLoading(false);
    if (result.ok) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-6 text-center max-w-md mx-auto">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="text-[13px] font-medium" style={{ color: "var(--site-text)" }}>Merci ! Vous êtes inscrit.</p>
      </div>
    );
  }

  return (
    <div className="py-6 text-center max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-1" style={{ color: "var(--site-text)" }}>{content.title}</h3>
      <p className="text-[12px] mb-4" style={{ color: "var(--site-muted)" }}>{content.description}</p>
      <div className="flex gap-2">
        {leadCtx ? (
          <input
            ref={inputRef}
            type="email"
            placeholder={content.placeholder}
            className="flex-1 h-10 rounded-lg px-3 text-[12px] outline-none"
            style={{ background: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)", color: "var(--site-text, #1A1A1A)" }}
          />
        ) : (
          <div
            className="flex-1 h-10 rounded-lg flex items-center px-3"
            style={{ background: "var(--site-surface, #F7F7F5)", border: "1px solid var(--site-border, #E6E6E4)" }}
          >
            <span className="text-[12px]" style={{ color: "var(--site-muted, #BBB)" }}>{content.placeholder}</span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-styled text-[12px] font-semibold px-4 rounded-lg flex items-center cursor-pointer disabled:opacity-50"
          style={getButtonInlineStyle()}
        >
          {loading ? "..." : content.buttonLabel}
        </button>
      </div>
    </div>
  );
}

export default memo(NewsletterBlockPreviewInner);
