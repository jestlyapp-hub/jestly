"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "@/lib/auth/actions";
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

const FORGOT_CARDS = [
  { label: "Email envoyé", sub: "Vérifie ta boîte", x: "15%", y: "20%", delay: 0, color: "#3B82F6" },
  { label: "Sécurisé", sub: "Lien temporaire", x: "62%", y: "16%", delay: 1, color: "#10B981" },
  { label: "Rapide", sub: "2 min max", x: "58%", y: "60%", delay: 2, color: "#F59E0B" },
  { label: "Simple", sub: "Un seul clic", x: "18%", y: "65%", delay: 1.5, color: "#7C3AED" },
];

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await forgotPassword(new FormData(formRef.current!));

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <AuthLayout headline="Ça arrive à tout le monde." floatCards={FORGOT_CARDS}>
      {/* Logo + badge */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/landing" className="flex items-center gap-2.5">
          <Image src="/logo-color.png" alt="Jestly" width={32} height={32} className="w-8 h-8" priority />
          <span className="text-[17px] font-bold text-[#111118] tracking-tight">Jestly</span>
        </Link>
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.12)" }}
        >
          Récupération
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
            style={{ background: "rgba(59,130,246,0.08)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
          </div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] mb-2 text-[#111118]">
            Email envoyé !
          </h1>
          <p className="text-[14px] text-[#66697A] mb-2">
            Un lien de réinitialisation a été envoyé à :
          </p>
          <p className="text-[14px] font-semibold text-[#111118] mb-6">{email}</p>
          <div className="rounded-xl px-4 py-3 text-[13px] text-[#66697A]" style={{ background: "#F7F7FB", border: "1px solid rgba(0,0,0,0.05)" }}>
            <p className="mb-1">Pense à vérifier tes <strong>spams</strong> si tu ne vois rien.</p>
            <p>Le lien expire dans 1 heure.</p>
          </div>
          <p className="text-center text-[13px] mt-8 text-[#66697A]">
            <Link href="/login" className="font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
              Retour à la connexion
            </Link>
          </p>
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
            Mot de passe oublié
          </motion.h1>
          <motion.p
            className="text-[14px] mb-8 text-[#66697A]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            Entre ton email pour recevoir un lien de réinitialisation.
          </motion.p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C4C4CC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>

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
                  Envoi...
                </span>
              ) : (
                "Envoyer le lien"
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
