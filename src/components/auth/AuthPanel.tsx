"use client";

import { useState, useEffect, useTransition } from "react";
import { signUp, signIn, signInWithGoogle, forgotPassword, checkSlugAvailable } from "@/lib/auth/actions";

type Tab = "register" | "login";

const inputClass =
  "w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-[10px] px-4 py-2.5 text-[14px] text-[#111] placeholder-[#BBB] focus:outline-none focus:border-[#4F46E5]/40 focus:ring-2 focus:ring-[#4F46E5]/10 transition-all";

const labelClass = "block text-[12px] font-medium text-[#6B7280] mb-1.5";

export default function AuthPanel() {
  const [tab, setTab] = useState<Tab>("register");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [slugPreview, setSlugPreview] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  // Slug preview — debounced check
  useEffect(() => {
    const slug = businessName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    setSlugPreview(slug);
    setSlugAvailable(null);
    setSlugSuggestion(null);

    if (slug.length < 2) return;

    const timer = setTimeout(() => {
      checkSlugAvailable(slug).then((result) => {
        setSlugAvailable(result.available);
        setSlugSuggestion(result.suggestion);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [businessName]);

  const handleRegister = () => {
    setError(null);
    setSuccess(null);

    if (!regEmail || !regPassword || !businessName) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (regPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (!acceptCGU) {
      setError("Veuillez accepter les CGU.");
      return;
    }

    const formData = new FormData();
    formData.set("email", regEmail);
    formData.set("password", regPassword);
    formData.set("businessName", businessName);

    startTransition(async () => {
      const result = await signUp(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "Compte créé !");
      }
    });
  };

  const handleLogin = () => {
    setError(null);
    setSuccess(null);

    if (!loginEmail || !loginPassword) {
      setError("Email et mot de passe requis.");
      return;
    }

    const formData = new FormData();
    formData.set("email", loginEmail);
    formData.set("password", loginPassword);

    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
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

  const handleGoogle = () => {
    setError(null);
    startTransition(async () => {
      const result = await signInWithGoogle();
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  // Forgot password view
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
        Sites + commandes + clients + factures. Tout au même endroit.
      </p>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b border-[#E6E6E4]">
        {(["register", "login"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setSuccess(null); }}
            className={`pb-2.5 px-1 mr-6 text-[14px] font-medium transition-colors cursor-pointer ${
              tab === t
                ? "text-[#111] border-b-2 border-[#4F46E5]"
                : "text-[#999] hover:text-[#666]"
            }`}
          >
            {t === "register" ? "Inscription" : "Connexion"}
          </button>
        ))}
      </div>

      {/* Error / Success */}
      {error && <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-2.5 text-[13px] text-red-600 mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-2.5 text-[13px] text-emerald-600 mb-4">{success}</div>}

      {/* ── REGISTER ── */}
      {tab === "register" && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="vous@email.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Mot de passe</label>
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="8+ caractères" className={inputClass} />
            {regPassword && regPassword.length < 8 && (
              <p className="text-[11px] text-amber-500 mt-1">8 caractères minimum</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Nom d&apos;atelier / Studio</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Studio Nova"
              className={inputClass}
            />
            {slugPreview && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[11px] text-[#999]">
                  {slugPreview}.jestly.site
                </span>
                {slugAvailable === true && (
                  <span className="text-[10px] text-emerald-500 font-medium">Disponible</span>
                )}
                {slugAvailable === false && (
                  <span className="text-[10px] text-red-400 font-medium">
                    Déjà utilisé
                    {slugSuggestion && (
                      <button
                        onClick={() => setBusinessName(slugSuggestion)}
                        className="ml-1 text-[#4F46E5] underline cursor-pointer"
                      >
                        → {slugSuggestion}
                      </button>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptCGU}
              onChange={(e) => setAcceptCGU(e.target.checked)}
              className="mt-0.5 rounded border-[#E6E6E4] text-[#4F46E5] focus:ring-[#4F46E5]/20"
            />
            <span className="text-[12px] text-[#6B7280]">
              J&apos;accepte les{" "}
              <span className="text-[#4F46E5] underline">CGU</span>
            </span>
          </label>

          <button
            onClick={handleRegister}
            disabled={isPending || !regEmail || !regPassword || !businessName || !acceptCGU}
            className="w-full bg-[#4F46E5] text-white text-[14px] font-semibold py-2.5 rounded-[10px] hover:bg-[#4338CA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isPending ? "Création..." : "Créer mon espace"}
          </button>

          {/* Separator */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#E6E6E4]" />
            <span className="text-[12px] text-[#999]">OU</span>
            <div className="flex-1 h-px bg-[#E6E6E4]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={isPending}
            className="w-full bg-white border border-[#E6E6E4] text-[#111] text-[14px] font-medium py-2.5 rounded-[10px] hover:bg-[#F7F7F5] disabled:opacity-40 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>
        </div>
      )}

      {/* ── LOGIN ── */}
      {tab === "login" && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="vous@email.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Mot de passe</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Votre mot de passe" className={inputClass} />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => { setShowForgot(true); setForgotEmail(loginEmail); setError(null); }}
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

          {/* Separator */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#E6E6E4]" />
            <span className="text-[12px] text-[#999]">OU</span>
            <div className="flex-1 h-px bg-[#E6E6E4]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={isPending}
            className="w-full bg-white border border-[#E6E6E4] text-[#111] text-[14px] font-medium py-2.5 rounded-[10px] hover:bg-[#F7F7F5] disabled:opacity-40 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>
        </div>
      )}

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
        {[
          "14 jours offerts",
          "Sans CB",
          "Annulation en 1 clic",
        ].map((badge) => (
          <span key={badge} className="text-[11px] text-[#999] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
