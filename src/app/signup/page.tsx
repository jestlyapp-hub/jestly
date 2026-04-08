"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { signUp, signInWithGoogle, resendConfirmationEmail } from "@/lib/auth/actions";
import AuthLayout from "@/components/auth/AuthLayout";
import { useTrack } from "@/lib/hooks/use-track";

const ease = [0.22, 1, 0.36, 1] as const;

const inputCls = "w-full h-[50px] rounded-xl pl-11 pr-4 text-[14px] text-[#111118] placeholder:text-[#C4C4CC] outline-none transition-all duration-200";
const inputStyle: React.CSSProperties = { background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.08)" };
const focusIn = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; };
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.boxShadow = "none"; };

const SIGNUP_CARDS = [
  { label: "Nouveau lead", sub: "Brief reçu", x: "12%", y: "20%", delay: 0, color: "#EC4899" },
  { label: "+2 400 €", sub: "Devis accepté", x: "68%", y: "16%", delay: 1, color: "#10B981" },
  { label: "Portfolio", sub: "3 projets publiés", x: "18%", y: "68%", delay: 2, color: "#A855F7" },
  { label: "Facture payée", sub: "#JES-042", x: "62%", y: "60%", delay: 1.5, color: "#3B82F6" },
  { label: "Site en ligne", sub: "julie.jestly.fr", x: "40%", y: "84%", delay: 2.5, color: "#FF8A3D" },
];

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const track = useTrack();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const fd = new FormData(formRef.current!);
    const pw = fd.get("password") as string;
    const pw2 = fd.get("confirm-password") as string;
    if (pw !== pw2) { setError("Les mots de passe ne correspondent pas."); setLoading(false); return; }
    if (pw.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); setLoading(false); return; }
    if (!fd.get("accept-terms")) { setError("Vous devez accepter les CGU et la politique de confidentialité."); setLoading(false); return; }

    // Clear previous account data from localStorage (guide, preferences)
    localStorage.removeItem("jestly_guide_v3");
    localStorage.removeItem("jestly_guide_v3_launch_dismissed");
    localStorage.removeItem("jestly_guide_v3_success_shown");

    const result = await signUp(fd);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.needsConfirmation) {
      // Email confirmation required — show success state
      setConfirmationSent(true);
      setConfirmedEmail(result.email || "");
      track("signup_completed");
      setLoading(false);
    } else {
      // Direct login (no confirmation needed) — redirect handled by server action
      track("signup_completed");
    }
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    setError("");
    setResendSuccess(false);

    const result = await resendConfirmationEmail(confirmedEmail);
    if (result?.error) {
      setError(result.error);
    } else {
      setResendSuccess(true);
    }
    setResending(false);
  };

  // ── Confirmation sent state ──
  if (confirmationSent) {
    return (
      <AuthLayout headline="Construis ton système freelance." floatCards={SIGNUP_CARDS}>
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-color.png" alt="Jestly" width={32} height={32} className="w-8 h-8" priority />
            <span className="text-[17px] font-bold text-[#111118] tracking-tight">Jestly</span>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Success icon */}
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </div>

          <h1 className="text-[22px] font-bold text-[#111118] text-center mb-2">
            Vérifie ta boîte mail
          </h1>
          <p className="text-[14px] text-[#66697A] text-center mb-2 leading-relaxed">
            Ton compte a bien été créé. On a envoyé un email de confirmation à :
          </p>
          <p className="text-[14px] font-semibold text-[#111118] text-center mb-6">
            {confirmedEmail}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-[12px] text-amber-800 leading-relaxed">
              Clique sur le lien dans l&apos;email pour activer ton compte.
              Si tu ne le trouves pas, vérifie tes <strong>spams</strong> ou <strong>courrier indésirable</strong>.
            </p>
          </div>

          {/* Resend button */}
          {resendSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-[12px] text-emerald-700 font-medium text-center">
                Email renvoyé avec succès. Vérifie ta boîte mail.
              </p>
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full h-[44px] rounded-xl text-[13px] font-semibold border border-[#E6E6E4] text-[#666] bg-white hover:bg-[#F7F7F5] transition-colors cursor-pointer disabled:opacity-50 mb-4"
            >
              {resending ? "Envoi en cours..." : "Renvoyer l'email de confirmation"}
            </button>
          )}

          {error && (
            <div className="rounded-xl px-4 py-3 text-[12px] text-red-600 bg-red-50 border border-red-200 mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-2 mt-2">
            <Link href="/login" className="text-[13px] font-semibold text-[#4F46E5] hover:underline">
              J&apos;ai déjà confirmé mon email → Se connecter
            </Link>
            <button
              onClick={() => { setConfirmationSent(false); setError(""); }}
              className="text-[12px] text-[#999] hover:text-[#666] cursor-pointer"
            >
              Modifier mon adresse email
            </button>
          </div>
        </motion.div>
      </AuthLayout>
    );
  }

  // ── Signup form ──
  return (
    <AuthLayout headline="Construis ton système freelance." floatCards={SIGNUP_CARDS}>

      {/* Logo + badge */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-color.png" alt="Jestly" width={32} height={32} className="w-8 h-8" priority />
          <span className="text-[17px] font-bold text-[#111118] tracking-tight">Jestly</span>
        </Link>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.12)" }}>
          Inscription
        </span>
      </div>

      <motion.h1 className="text-[26px] font-extrabold tracking-[-0.03em] mb-1.5 text-[#111118]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
        Créer mon espace.
      </motion.h1>
      <motion.p className="text-[14px] mb-8 text-[#66697A]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease }}>
        Lance ton système freelance en quelques secondes.
      </motion.p>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg></div>
          <input type="email" name="email" required autoComplete="email" placeholder="Email" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
          <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="Mot de passe (8+ caractères)" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg></div>
          <input type="password" name="confirm-password" required autoComplete="new-password" placeholder="Confirmer le mot de passe" className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
        </div>

        <label className="flex items-start gap-2.5 text-[12px] text-[#66697A] leading-relaxed cursor-pointer select-none">
          <input
            type="checkbox"
            name="accept-terms"
            required
            className="mt-[2px] w-4 h-4 rounded border-[#D4D4DC] text-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30 cursor-pointer"
          />
          <span>
            J&apos;accepte les{" "}
            <Link href="/cgu" className="text-[#7C3AED] font-semibold hover:underline">CGU</Link>
            {" "}et la{" "}
            <Link href="/confidentialite" className="text-[#7C3AED] font-semibold hover:underline">politique de confidentialité</Link>.
          </span>
        </label>

        {error && <motion.div className="rounded-xl px-4 py-3 text-[13px] font-medium" style={{ background: "rgba(239,68,68,0.06)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.1)" }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}

        <button type="submit" disabled={loading} className="w-full h-[50px] rounded-xl text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none" style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", boxShadow: "0 6px 24px rgba(124,58,237,0.25)" }}>
          {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" /></svg>Création…</span> : "Créer mon espace"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6"><div className="flex-1 h-px bg-[#EEEFF2]" /><span className="text-[10px] font-medium text-[#C4C4CC]">ou</span><div className="flex-1 h-px bg-[#EEEFF2]" /></div>

      <button
        type="button"
        onClick={async () => {
          setError(""); setLoading(true);
          const result = await signInWithGoogle();
          if (result?.error) { setError(result.error); setLoading(false); }
        }}
        disabled={loading}
        className="w-full h-[48px] rounded-xl text-[13px] font-medium flex items-center justify-center gap-2.5 bg-white hover:bg-[#FAFAFA] transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        style={{ border: "1px solid rgba(0,0,0,0.08)", color: "#57534E" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continuer avec Google
      </button>

      <p className="text-center text-[13px] mt-8 text-[#66697A]">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">Se connecter</Link>
      </p>

    </AuthLayout>
  );
}
