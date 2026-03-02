"use client";

import { memo, useState } from "react";
import type { LeadMagnetBlockContent } from "@/types";
import { getButtonInlineStyle } from "@/lib/block-style-engine";

function LeadMagnetBlockPreviewInner({ content }: { content: LeadMagnetBlockContent }) {
  const [success, setSuccess] = useState(false);

  return (
    <div className="py-6 text-center max-w-md mx-auto">
      {success ? (
        <div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[13px] font-medium mb-2">{content.successMessage}</p>
          <button
            onClick={() => setSuccess(false)}
            className="text-[11px] text-[var(--site-primary)] hover:underline"
          >
            Retour
          </button>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold mb-1">{content.title}</h3>
          <p className="text-[12px] opacity-60 mb-4">{content.description}</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-3 py-2 text-[13px] text-[#1A1A1A] focus:outline-none"
              readOnly
            />
            <button
              onClick={() => setSuccess(true)}
              className="btn-styled px-4 py-2 text-[12px] font-semibold cursor-pointer whitespace-nowrap"
              style={getButtonInlineStyle()}
            >
              {content.buttonLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(LeadMagnetBlockPreviewInner);
