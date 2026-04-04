"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ResetPasswordForm from "./ResetPasswordForm";

/* ═══════════════════════════════════════════════════════════════════════
   RESET PASSWORD — Client Component

   Supabase recovery uses the IMPLICIT flow: the token arrives in the
   URL hash fragment (#access_token=...&type=recovery).
   Hash fragments are NEVER sent to the server, so this MUST be a
   client component that reads window.location.hash.
   ═══════════════════════════════════════════════════════════════════════ */

type PageState = "loading" | "ready" | "error";

export default function ResetPasswordPage() {
  const [state, setState] = useState<PageState>("loading");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // 1. Check hash fragment for implicit flow tokens (#access_token=...&type=recovery)
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // The Supabase browser client auto-detects the hash fragment
      // and sets the session. We just need to wait for it.
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          if (session) {
            setState("ready");
          }
        }
      });

      // Also check immediately in case the event already fired
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setState("ready");
        }
      });

      // Timeout: if nothing happens after 5s, show error
      const timeout = setTimeout(() => {
        setState((prev) => (prev === "loading" ? "error" : prev));
      }, 5000);

      return () => clearTimeout(timeout);
    }

    // 2. Check for PKCE flow code in query params (?code=xxx)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setState("error");
        } else {
          setState("ready");
          // Clean URL
          window.history.replaceState({}, "", "/reset-password");
        }
      });
      return;
    }

    // 3. No token at all — check if there's an existing session (user came from Settings)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState("ready");
      } else {
        setState("error");
      }
    });
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 mx-auto mb-4 text-[#7C3AED]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
          </svg>
          <p className="text-[14px] text-[#66697A]">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-sm px-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-5" style={{ background: "rgba(239,68,68,0.08)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-[22px] font-extrabold text-[#111118] mb-2">Lien expiré ou invalide</h1>
          <p className="text-[14px] text-[#66697A] mb-6">
            Ce lien de réinitialisation n&apos;est plus valide. Demande un nouveau lien.
          </p>
          <button
            onClick={() => router.push("/forgot-password")}
            className="w-full h-[48px] rounded-xl text-[14px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", boxShadow: "0 6px 24px rgba(124,58,237,0.25)" }}
          >
            Demander un nouveau lien
          </button>
          <button
            onClick={() => router.push("/login")}
            className="w-full mt-3 text-[13px] font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
