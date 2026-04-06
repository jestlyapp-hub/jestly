"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/auth/error-messages";
import AuthLayout from "@/components/auth/AuthLayout";

const ease = [0.22, 1, 0.36, 1] as const;

const inputCls =
  "w-full h-[50px] rounded-xl pl-11 pr-4 text-[14px] text-[#111118] placeholder:text-[#C4C4CC] outline-none transition-all duration-200";
const inputStyle: React.CSSProperties = {
  background: "#F7F7FB",
  border: "1px solid rgba(0,0,0,0.08)",
};
const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)";
};
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
  e.currentTarget.style.boxShadow = "none";
};

const RESET_CARDS = [
  { label: "Sécurisé", sub: "Chiffrement AES-256", x: "15%", y: "20%", delay: 0, color: "#10B981" },
  { label: "Nouveau mdp", sub: "Protège ton compte", x: "62%", y: "16%", delay: 1, color: "#7C3AED" },
  { label: "C'est parti !", sub: "Accès restauré", x: "58%", y: "60%", delay: 2, color: "#3B82F6" },
  { label: "Vérifié", sub: "Identité confirmée", x: "18%", y: "65%", delay: 1.5, color: "#F59E0B" },
];

export default function ResetPasswordForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fd = new FormData(formRef.current!);
      const password = (fd.get("password") as string) || "";
      const confirm = (fd.get("confirm") as string) || "";

      // Client-side validation (FR)
      if (!password || password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }
      if (password !== confirm) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      const supabase = createClient();

      // Update password via browser client (session is client-side from hash fragment)
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(translateAuthError(updateError.message));
        return;
      }

      // Security: destroy session — user must re-login manually
      await supabase.auth.signOut();

      setSuccess(true);
      setTimeout(() => router.push("/login?reset=success"), 2500);
    } catch {
      setError("Une erreur est survenue. Réessaie ou demande un nouveau lien.");
    } finally {
      // ALWAYS release the button — prevents infinite loading
      if (!success) setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Ton nouveau départ." floatCards={RESET_CARDS}>
      {/* Logo + badge */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-color.png" alt="Jestly" width={32} height={32} className="w-8 h-8" priority />
          <span className="text-[17px] font-bold text-[#111118] tracking-tight">Jestly</span>
        </Link>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.12)" }}
        >
          Réinitialisation
        </span>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: "rgba(16,185,129,0.08)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] mb-2 text-[#111118]">
            Mot de passe mis à jour !
          </h1>
          <p className="text-[14px] text-[#66697A] mb-6">
            Ton mot de passe a été modifié avec succès. Tu vas être redirigé vers la page de connexion.
          </p>
          <div className="flex items-center gap-2 text-[13px] text-[#059669] font-medium">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
            </svg>
            Redirection vers la connexion...
          </div>
        </motion.div>
      ) : (
        <>
          <motion.div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
            style={{ background: "rgba(124,58,237,0.08)" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </motion.div>

          <motion.h1
            className="text-[26px] font-extrabold tracking-[-0.03em] mb-1.5 text-[#111118]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            Nouveau mot de passe
          </motion.h1>
          <motion.p
            className="text-[14px] mb-8 text-[#66697A]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            Choisis un nouveau mot de passe pour sécuriser ton compte.
          </motion.p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Nouveau mot de passe"
                className={inputCls}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <input
                type="password"
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Confirmer le mot de passe"
                className={inputCls}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>

            <p className="text-[11px] text-[#A8A29E]">Minimum 8 caractères</p>

            {error && (
              <motion.div
                className="rounded-xl px-4 py-3 text-[13px] font-medium"
                style={{ background: "rgba(239,68,68,0.06)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.1)" }}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] rounded-xl text-[14px] font-semibold text-white transition-all duration-300 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", boxShadow: "0 6px 24px rgba(124,58,237,0.25)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Mise à jour...
                </span>
              ) : (
                "Réinitialiser mon mot de passe"
              )}
            </button>
          </form>

          <p className="text-center text-[13px] mt-8 text-[#66697A]">
            <Link href="/login" className="font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
              Retour à la connexion
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
