"use client";

import { useEffect } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL ERROR BOUNDARY — Captures les erreurs non gérées
   ═══════════════════════════════════════════════════════════════════════ */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Jestly] Erreur non gérée :", error);
    // Report to error logging (replaces Sentry during beta)
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        source: "error-boundary-global",
        metadata: { digest: error.digest, stack: error.stack?.slice(0, 1000) },
        url: window.location.href,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "rgba(124,58,237,0.08)",
            border: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#111118] mb-2">
          Oups, quelque chose s&apos;est mal pass&eacute;
        </h1>

        {/* Body */}
        <p className="text-[14px] text-[#66697A] mb-8 leading-relaxed">
          Une erreur inattendue est survenue. Tu peux r&eacute;essayer ou
          retourner &agrave; l&apos;accueil.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full h-[50px] rounded-xl text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              boxShadow: "0 6px 24px rgba(124,58,237,0.25)",
            }}
          >
            R&eacute;essayer
          </button>

          <Link
            href="/dashboard"
            className="w-full h-[48px] rounded-xl text-[13px] font-medium flex items-center justify-center transition-all duration-200 hover:bg-[#F7F7FB]"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              color: "#66697A",
            }}
          >
            Retour &agrave; l&apos;accueil
          </Link>
        </div>

        {/* Digest */}
        {error.digest && (
          <p className="mt-6 text-[11px] text-[#C4C4CC]">
            Code erreur : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
