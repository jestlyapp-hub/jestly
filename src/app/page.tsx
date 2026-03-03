"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const ACCESS_CODE = "177777";
const STORAGE_KEY = "jestly_access";

const FEATURES = [
  {
    title: "Commandes",
    desc: "Suivez chaque projet de A à Z",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: "Workflow",
    desc: "Organisation façon Notion",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    title: "Facturation",
    desc: "Factures auto & suivi paiements",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Clients",
    desc: "CRM intégré & historique",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

const CHIPS = [
  { label: "Notion-like workflow", icon: "M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5" },
  { label: "Portail client", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" },
  { label: "Facturation + paiements", icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export default function Home() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
      setSuccess(true);
    }
  }, []);

  useEffect(() => {
    if (mounted && !unlocked) {
      inputRefs.current[0]?.focus();
    }
  }, [mounted, unlocked]);

  const validate = useCallback(() => {
    const code = digits.join("");
    if (code.length !== 6) return;
    if (code === ACCESS_CODE) {
      setSuccess(true);
      setError(false);
      localStorage.setItem(STORAGE_KEY, "true");
      setTimeout(() => setUnlocked(true), 1200);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }, 600);
    }
  }, [digits]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") validate();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    setError(false);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setSuccess(false);
    setDigits(Array(6).fill(""));
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  if (!mounted) return <div className="h-screen bg-[#F7F6F2]" />;

  return (
    <div className="h-screen bg-[#F7F6F2] overflow-hidden select-none relative">
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          10%,30%,50%,70%,90%{transform:translateX(-5px)}
          20%,40%,60%,80%{transform:translateX(5px)}
        }
        .animate-shake{animation:shake .5s ease-in-out}
        @keyframes fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .animate-fade-up{animation:fade-up .7s ease-out both}
        @keyframes breathe{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.6;transform:scale(1.04)}}
        .animate-breathe{animation:breathe 8s ease-in-out infinite}
      `}</style>

      {/* ═══ BACKGROUND LAYERS ═══ */}

      {/* 1. Fine blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* 2. Noise grain */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. Radial glow — pearl top-left */}
      <div
        className="absolute -top-60 -left-60 w-[950px] h-[950px] rounded-full pointer-events-none animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(233,230,255,0.55) 0%, rgba(233,230,255,0.12) 45%, transparent 70%)" }}
      />

      {/* 4. Radial glow — violet bottom-right */}
      <div
        className="absolute -bottom-52 -right-52 w-[850px] h-[850px] rounded-full pointer-events-none animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.09) 0%, rgba(167,139,250,0.04) 40%, transparent 70%)", animationDelay: "4s" }}
      />


      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10 h-full flex flex-col">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-5 sm:px-8 lg:px-12 h-14 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            {unlocked && (
              <button
                onClick={lock}
                className="text-[11px] text-[#7C3AED] font-medium border border-violet-200 rounded-full px-3 py-1 hover:bg-violet-50 transition-colors cursor-pointer"
              >
                Verrouiller
              </button>
            )}
            <span className="text-[10px] sm:text-[11px] text-[#5B6270] border border-[#0F172A]/[0.08] rounded-full px-3 py-1 bg-white/50 backdrop-blur-sm">
              Page temporaire — Accès privé
            </span>
          </div>
        </header>

        {/* ── Logo central premium ── */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="relative flex items-center justify-center">
            {/* Halo violet diffus animé */}
            <div className="absolute w-28 h-28 rounded-full bg-violet-500/20 blur-3xl animate-breathe" />

            {/* Container glass */}
            <div className="relative w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(124,58,237,0.25)] flex items-center justify-center">
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/80 via-white/30 to-transparent pointer-events-none" />
              {/* Logo */}
              <img
                src="/logo-color.png"
                alt="Jestly"
                className="relative w-12 h-12 object-contain drop-shadow-[0_8px_20px_rgba(124,58,237,0.25)]"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* ── Main ── */}
        <main className="flex-1 min-h-0 flex items-center justify-center px-5 sm:px-8 lg:px-12">
          <div className="w-full max-w-[1120px] grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-20 items-center">

            {/* ══ Left column (desktop) ══ */}
            <div className="hidden lg:flex flex-col gap-5 animate-fade-up">

              {/* Title */}
              <div>
                <h1 className="text-[2.6rem] xl:text-[3.1rem] font-bold leading-[1.1] tracking-tight text-[#0B0F18]">
                  Le cockpit{" "}
                  <span className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">
                    secret
                  </span>
                  <br />
                  des freelances
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-[15px] text-[#5B6270] leading-relaxed max-w-[420px]">
                Commandes, workflow Notion-like, facturation et
                gestion clients. Un seul outil, zéro friction.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="relative bg-white/60 backdrop-blur-sm border border-[#0F172A]/[0.06] rounded-xl p-3.5 transition-all duration-300 group hover:border-violet-300/50 hover:shadow-[0_4px_24px_rgba(124,58,237,0.1)]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-50 to-violet-100/60 border border-violet-200/40 flex items-center justify-center mb-2 text-[#7C3AED]/70 group-hover:text-[#7C3AED] transition-colors">
                      {f.icon}
                    </div>
                    <p className="text-[13px] font-semibold text-[#0B0F18]/85 group-hover:text-[#0B0F18]">{f.title}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Proof chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {CHIPS.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-[#0F172A]/[0.06] rounded-full pl-2 pr-3 py-1.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
                      </svg>
                    </span>
                    <span className="text-[11px] font-medium text-[#5B6270]">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ Right column — ACCESS CARD ══ */}
            <div className="flex justify-center animate-fade-up" style={{ animationDelay: "0.12s" }}>
              <div className="relative w-full max-w-[420px]">

                {/* Outer violet halo */}
                <div
                  className="absolute -inset-16 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.10) 0%, transparent 65%)" }}
                />

                {/* Card outer glow ring */}
                <div className="absolute -inset-[1px] rounded-[1.75rem] bg-gradient-to-b from-violet-300/30 via-white/40 to-violet-200/20 pointer-events-none" />

                {/* THE CARD */}
                <div className="relative rounded-[1.625rem] bg-white/65 backdrop-blur-2xl border border-white/70 p-8 sm:p-10 shadow-[0_30px_100px_-20px_rgba(124,58,237,0.22),0_0_0_1px_rgba(124,58,237,0.04)]">

                  {/* Inner violet wash */}
                  <div className="absolute inset-0 rounded-[1.625rem] pointer-events-none bg-gradient-to-br from-violet-500/[0.04] via-transparent to-indigo-500/[0.02]" />

                  {/* Mobile title */}
                  <div className="lg:hidden text-center mb-7 relative">
                    <h1 className="text-[1.6rem] sm:text-[1.85rem] font-bold leading-tight text-[#0B0F18]">
                      Le cockpit{" "}
                      <span className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">
                        secret
                      </span>
                    </h1>
                    <p className="text-xs text-[#94A3B8] mt-1 font-medium">des freelances</p>
                  </div>

                  <div className="relative">
                    {unlocked ? (
                      /* ── Unlocked ── */
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/50 flex items-center justify-center mb-5 shadow-sm">
                          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        <h2 className="text-xl font-bold text-[#0B0F18]">Accès accordé</h2>
                        <p className="text-sm text-[#94A3B8] mt-1.5">Bienvenue dans le cockpit</p>

                        <a
                          href="/dashboard"
                          className="mt-7 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_32px_rgba(124,58,237,0.30)] hover:shadow-[0_12px_44px_rgba(124,58,237,0.40)]"
                        >
                          Accéder au cockpit
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </a>
                      </div>
                    ) : (
                      /* ── Code input ── */
                      <div>
                        {/* Lock icon */}
                        <div className="text-center mb-7">
                          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/70 border border-violet-200/50 flex items-center justify-center mb-4 shadow-sm">
                            <svg className="w-6 h-6 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-bold text-[#0B0F18]">Code d&apos;accès</h2>
                          <p className="text-[13px] text-[#94A3B8] mt-1">Entrez les 6 chiffres pour continuer</p>
                        </div>

                        {/* 6-digit inputs */}
                        <div className={`flex gap-2.5 sm:gap-3 justify-center ${shake ? "animate-shake" : ""}`}>
                          {digits.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => { inputRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleChange(i, e.target.value)}
                              onKeyDown={(e) => handleKeyDown(i, e)}
                              onPaste={handlePaste}
                              className={`
                                w-12 h-14 sm:w-14 sm:h-[3.5rem]
                                text-center text-[1.35rem] font-bold rounded-xl
                                bg-white border-2 outline-none
                                transition-all duration-200
                                placeholder:text-gray-200 placeholder:font-normal
                                focus:border-[#7C3AED] focus:ring-[3px] focus:ring-violet-500/15
                                focus:shadow-[0_0_24px_rgba(124,58,237,0.20)]
                                ${error
                                  ? "border-red-300 text-red-500 ring-2 ring-red-400/15 bg-red-50/40"
                                  : success
                                    ? "border-emerald-300 text-emerald-600 ring-2 ring-emerald-400/15 bg-emerald-50/40"
                                    : digit
                                      ? "border-[#A78BFA] text-[#0B0F18] shadow-[0_0_16px_rgba(124,58,237,0.12)]"
                                      : "border-gray-200 text-[#0B0F18] hover:border-gray-300"
                                }
                              `}
                              placeholder="·"
                            />
                          ))}
                        </div>

                        {/* Feedback */}
                        <div className="h-7 flex items-center justify-center mt-3">
                          {error && (
                            <p className="text-xs font-medium text-red-400 animate-fade-up">
                              Code incorrect — Veuillez réessayer
                            </p>
                          )}
                          {success && !error && (
                            <p className="text-xs font-medium text-emerald-500 animate-fade-up">
                              Accès en cours...
                            </p>
                          )}
                        </div>

                        {/* Button */}
                        <button
                          onClick={validate}
                          disabled={digits.join("").length !== 6 || success}
                          className="mt-4 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-sm font-semibold transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none hover:enabled:scale-[1.02] shadow-[0_8px_32px_rgba(124,58,237,0.25)] hover:enabled:shadow-[0_12px_44px_rgba(124,58,237,0.38)]"
                        >
                          Valider
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="shrink-0 h-9 flex items-center justify-center">
          <p className="text-[10px] text-[#B8BCC4] tracking-[0.12em] font-medium">
            RASENYA — 2026 — JESTLY
          </p>
        </footer>
      </div>
    </div>
  );
}
