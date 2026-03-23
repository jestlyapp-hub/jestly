"use client";

import { useState, useTransition } from "react";
import { signIn, forgotPassword, resendConfirmationEmail } from "@/lib/auth/actions";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-[10px] px-4 py-2.5 text-[14px] text-[#111] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all";

const labelClass = "block text-[12px] font-medium text-[#6B7280] mb-1.5";

export default function AuthPanel() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  // Email not confirmed state
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = () => {
    setError(null);
    setSuccess(null);
    setEmailNotConfirmed(false);

    if (!loginEmail || !loginPassword) {
      setError("Email et mot de passe requis.");
      return;
    }

    const formData = new FormData();
    formData.set("email", loginEmail);
    formData.set("password", loginPassword);

    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error === "email_not_confirmed") {
        setEmailNotConfirmed(true);
        setUnconfirmedEmail(result.email || loginEmail);
        setResendSuccess(false);
      } else if (result?.error) {
        setError(result.error);
      }
    });
  };

  const handleResendConfirmation = async () => {
    if (resending) return;
    setResending(true);
    setError(null);
    setResendSuccess(false);

    const result = await resendConfirmationEmail(unconfirmedEmail);
    if (result?.error) {
      setError(result.error);
    } else {
      setResendSuccess(true);
    }
    setResending(false);
  };

  const handleForgot = () => {
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("email", forgotEmail);

    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "Email envoyé.");
      }
    });
  };

  // ── Forgot password view ──
  if (showForgot) {
    return (
      <div className="flex flex-col justify-center h-full px-8 lg:px-12 py-12 max-w-md mx-auto w-full">
        <button
          onClick={() => { setShowForgot(false); setError(null); setSuccess(null); }}
          className="text-[13px] text-[#6B7280] hover:text-[#111] mb-6 flex items-center gap-1.5 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>

        <h2 className="text-[22px] font-bold text-[#111] mb-2">Mot de passe oublié</h2>
        <p className="text-[14px] text-[#6B7280] mb-6">Entrez votre email, on vous envoie un lien de réinitialisation.</p>

        {error && <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-2.5 text-[13px] text-red-600 mb-4">{error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-2.5 text-[13px] text-emerald-600 mb-4">{success}</div>}

        <div className="mb-4">
          <label className={labelClass}>Email</label>
          <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="vous@email.com" className={inputClass} />
        </div>

        <button onClick={handleForgot} disabled={isPending || !forgotEmail} className="w-full bg-[#4F46E5] text-white text-[14px] font-semibold py-2.5 rounded-[10px] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
          {isPending ? "Envoi..." : "Envoyer le lien"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-12 py-12 max-w-md mx-auto w-full">
      {/* Title */}
      <h1 className="text-[28px] lg:text-[36px] font-bold text-[#111] leading-tight mb-2">
        Pilote ton freelancing.{" "}
        <span className="text-[#4F46E5]">Vends. Livre. Encaisse.</span>
      </h1>
      <p className="text-[14px] text-[#6B7280] mb-8">
        Connectez-vous pour accéder à votre espace.
      </p>

      {/* ── Email not confirmed — dedicated premium block ── */}
      {emailNotConfirmed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-5 mb-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-[14px] font-bold text-amber-900">Email non confirmé</p>
          </div>

          {/* Explanation */}
          <p className="text-[13px] text-amber-800 leading-relaxed mb-2">
            Ton compte a bien été créé, mais ton adresse email n&apos;a pas encore été confirmée.
          </p>
          <p className="text-[12px] text-amber-700 mb-3">
            Nous avons envoyé un email de validation à :<br />
            <span className="font-semibold text-amber-900">{unconfirmedEmail}</span>
          </p>

          {/* Steps */}
          <div className="bg-white/60 rounded-lg px-4 py-3 mb-3 border border-amber-200/50">
            <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-2">Pour accéder à ton espace :</p>
            <ol className="text-[12px] text-amber-700 space-y-1 list-decimal list-inside">
              <li>Ouvre l&apos;email reçu de Jestly</li>
              <li>Clique sur le lien de validation</li>
              <li>Reviens ensuite te connecter</li>
            </ol>
          </div>

          {/* Check spam hint */}
          <p className="text-[11px] text-amber-600 mb-4">
            Pense à vérifier ta <strong>boîte de réception</strong>, ton dossier <strong>spam</strong> ou <strong>promotions</strong>.
          </p>

          {/* Resend success */}
          {resendSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-3 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              <p className="text-[12px] text-emerald-700 font-medium">
                Email renvoyé avec succès. Vérifie ta boîte mail.
              </p>
            </div>
          ) : (
            <button
              onClick={handleResendConfirmation}
              disabled={resending}
              className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg px-4 py-2.5 transition-colors cursor-pointer disabled:opacity-50 mb-2"
            >
              {resending ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10" /></svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
                  Renvoyer l&apos;email de confirmation
                </>
              )}
            </button>
          )}

          {error && (
            <p className="text-[11px] text-red-600 mb-2">{error}</p>
          )}

          <button
            onClick={() => { setEmailNotConfirmed(false); setError(null); setResendSuccess(false); }}
            className="w-full text-[12px] text-amber-600 hover:text-amber-800 py-1.5 cursor-pointer transition-colors"
          >
            Modifier mon adresse email
          </button>
        </div>
      )}

      {/* Standard errors */}
      {!emailNotConfirmed && error && <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-2.5 text-[13px] text-red-600 mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-2.5 text-[13px] text-emerald-600 mb-4">{success}</div>}

      {/* ── LOGIN ── */}
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="vous@email.com" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Mot de passe</label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Votre mot de passe"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => { setShowForgot(true); setForgotEmail(loginEmail); setError(null); setEmailNotConfirmed(false); }}
            className="text-[12px] text-[#4F46E5] hover:underline cursor-pointer"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={isPending || !loginEmail || !loginPassword}
          className="w-full bg-[#4F46E5] text-white text-[14px] font-semibold py-2.5 rounded-[10px] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isPending ? "Connexion..." : "Se connecter"}
        </button>
      </div>

      {/* Lien inscription */}
      <p className="mt-8 text-center text-[13px] text-[#6B7280]">
        Pas encore de compte ?{" "}
        <a href="/signup" className="font-semibold text-[#4F46E5] hover:underline">
          Créer un compte
        </a>
      </p>
    </div>
  );
}
