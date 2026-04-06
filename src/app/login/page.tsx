"use client";

import { Suspense, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { signIn, signInWithGoogle } from "@/lib/auth/actions";
import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";

/* ═══════════════════════════════════════════════════════════════════════
   LOGIN — White left panel + purple right visual
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

const inputCls = "w-full h-[50px] rounded-xl pl-11 pr-4 text-[14px] text-[#111118] placeholder:text-[#C4C4CC] outline-none transition-all duration-200";
const inputStyle: React.CSSProperties = { background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.08)" };
const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; };
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.boxShadow = "none"; };

const LOGIN_CARDS = [
  { label: "+2 400 €", sub: "Encaissé ce mois", x: "15%", y: "18%", delay: 0, color: "#10B981" },
  { label: "Nouveau lead", sub: "Sophie Martin", x: "65%", y: "14%", delay: 1, color: "#EC4899" },
  { label: "Projet livré", sub: "Brand Kit", x: "60%", y: "58%", delay: 2, color: "#3B82F6" },
  { label: "Site en ligne", sub: "julie.jestly.fr", x: "18%", y: "65%", delay: 1.5, color: "#FF8A3D" },
];

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const resetExpired = searchParams.get("error") === "reset-expired";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const result = await signIn(new FormData(formRef.current!));
    if (result?.error) { setError(result.error); setLoading(false); }
  };

  return (
    <AuthLayout headline="Retrouve ton activité." floatCards={LOGIN_CARDS}>

      {/* Logo + badge */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-color.png" alt="Jestly" width={32} height={32} className="w-8 h-8" priority />
          <span className="text-[17px] font-bold text-[#111118] tracking-tight">Jestly</span>
        </Link>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.12)" }}>
          Connexion
        </span>
      </div>

      <>
        <motion.h1 className="text-[26px] font-extrabold tracking-[-0.03em] mb-1.5 text-[#111118]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          Bon retour.
        </motion.h1>
        <motion.p className="text-[14px] mb-8 text-[#66697A]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease }}>
          Connecte-toi pour accéder à ton espace freelance.
        </motion.p>

        {/* Success banner after password reset */}
        {resetSuccess && (
          <motion.div className="rounded-xl px-4 py-3 text-[13px] font-medium mb-4" style={{ background: "rgba(16,185,129,0.06)", color: "#059669", border: "1px solid rgba(16,185,129,0.1)" }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            Mot de passe mis à jour ! Connecte-toi avec ton nouveau mot de passe.
          </motion.div>
        )}

        {/* Error banner for expired reset link */}
        {resetExpired && (
          <motion.div className="rounded-xl px-4 py-3 text-[13px] font-medium mb-4" style={{ background: "rgba(239,68,68,0.06)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.1)" }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
            Le lien de réinitialisation a expiré. <Link href="/forgot-password" className="underline font-semibold">Demander un nouveau lien</Link>
          </motion.div>
        )}

        <form ref={formRef} onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg></div>
            <input type="email" name="email" required autoComplete="email" placeholder="Email" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
            <input type="password" name="password" required autoComplete="current-password" placeholder="Mot de passe" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div className="text-right">
            <Link href="/forgot-password" className="text-[12px] font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <motion.div className="rounded-xl px-4 py-3 text-[13px] font-medium" style={{ background: "rgba(239,68,68,0.06)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.1)" }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}

          <button type="submit" disabled={loading} className="w-full h-[50px] rounded-xl text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none" style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", boxShadow: "0 6px 24px rgba(124,58,237,0.25)" }}>
            {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Connexion…</span> : "Se connecter"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-[#EEEFF2]" /><span className="text-[10px] font-medium text-[#C4C4CC]">ou</span><div className="flex-1 h-px bg-[#EEEFF2]" /></div>

        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError(""); setLoading(true);
            const result = await signInWithGoogle();
            if (result?.error) { setError(result.error); setLoading(false); }
          }}
          className="w-full h-[48px] rounded-xl text-[13px] font-medium flex items-center justify-center gap-2.5 bg-white hover:bg-[#F7F7FB] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          style={{ border: "1px solid rgba(0,0,0,0.08)", color: "#57534E" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continuer avec Google
        </button>

        <p className="text-center text-[13px] mt-8 text-[#66697A]">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">Créer un compte</Link>
        </p>
      </>

    </AuthLayout>
  );
}
