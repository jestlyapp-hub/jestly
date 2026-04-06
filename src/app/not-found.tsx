import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL 404 — Page introuvable
   ═══════════════════════════════════════════════════════════════════════ */

export default function NotFound() {
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>

        {/* 404 badge */}
        <span
          className="inline-block text-[11px] font-semibold px-3 py-1 rounded-full mb-4"
          style={{
            background: "rgba(124,58,237,0.08)",
            color: "#7C3AED",
            border: "1px solid rgba(124,58,237,0.12)",
          }}
        >
          404
        </span>

        {/* Heading */}
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#111118] mb-2">
          Page introuvable
        </h1>

        {/* Body */}
        <p className="text-[14px] text-[#66697A] mb-8 leading-relaxed">
          La page que tu cherches n&apos;existe pas ou a
          &eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full h-[50px] rounded-xl text-[14px] font-semibold text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #A78BFA)",
              boxShadow: "0 6px 24px rgba(124,58,237,0.25)",
            }}
          >
            Retour au dashboard
          </Link>

          <Link
            href="/"
            className="w-full h-[48px] rounded-xl text-[13px] font-medium flex items-center justify-center transition-all duration-200 hover:bg-[#F7F7FB]"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              color: "#66697A",
            }}
          >
            Retour &agrave; l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
