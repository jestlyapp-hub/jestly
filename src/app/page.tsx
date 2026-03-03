"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const ACCESS_CODE = "177777";
const STORAGE_KEY = "jestly_access";

const FEATURES = [
  {
    title: "Commandes",
    desc: "Suivez chaque projet de A à Z",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    title: "Workflow",
    desc: "Organisation façon Notion",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    title: "Facturation",
    desc: "Factures auto & suivi paiements",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    title: "Clients",
    desc: "CRM intégré & historique",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
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
    if (e.key === "Enter") {
      validate();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
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

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#FAFAF8]" />;
  }

  return (
    <div className="fixed inset-0 bg-[#FAFAF8] overflow-hidden select-none">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s ease-out forwards; }
        @keyframes breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.05); }
        }
        .animate-breathe { animation: breathe 8s ease-in-out infinite; }
        @keyframes focus-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.12); }
          50% { box-shadow: 0 0 0 5px rgba(148, 163, 184, 0.06); }
        }
        .input-focus-pulse:focus { animation: focus-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow pearl — top left */}
      <div
        className="absolute -top-56 -left-56 w-[900px] h-[900px] rounded-full pointer-events-none animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(233,230,255,0.5) 0%, rgba(233,230,255,0.15) 40%, transparent 70%)" }}
      />

      {/* Glow silver — bottom right */}
      <div
        className="absolute -bottom-56 -right-56 w-[800px] h-[800px] rounded-full pointer-events-none animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(226,232,240,0.45) 0%, rgba(226,232,240,0.1) 40%, transparent 70%)", animationDelay: "4s" }}
      />

      {/* Warm gold whisper — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(233,217,181,0.08) 0%, transparent 60%)" }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">

        {/* Header */}
        <header className="flex items-center justify-between px-5 sm:px-8 lg:px-12 h-14 shrink-0">
          <span className="text-lg font-bold tracking-tight text-[#0B0F18]">
            Jestly
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#5B6270] border border-[#0F172A]/[0.08] rounded-full px-3 py-1 backdrop-blur-sm bg-white/40">
            Page temporaire — Accès privé
          </span>
        </header>

        {/* Main */}
        <main className="flex-1 min-h-0 flex items-center justify-center px-5 sm:px-8 lg:px-12 pb-6">
          <div className="w-full max-w-6xl grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-20 items-center">

            {/* ── Left column (desktop only) ── */}
            <div className="hidden lg:flex flex-col gap-7 animate-fade-in">
              <div>
                <h1 className="text-[2.75rem] xl:text-5xl font-bold leading-[1.12] tracking-tight">
                  <span className="bg-gradient-to-r from-[#1E293B] via-[#94A3B8] to-[#1E293B] bg-clip-text text-transparent">
                    Le cockpit secret
                  </span>
                  <br />
                  <span className="text-[#0B0F18]">des freelances</span>
                </h1>
                <p className="text-sm text-[#94A3B8] mt-1.5 font-medium tracking-[0.15em] uppercase">
                  Jestly
                </p>
              </div>

              <p className="text-[15px] text-[#5B6270] leading-relaxed max-w-md">
                Commandes, workflow Notion-like, facturation et
                gestion clients. Un seul outil, zéro friction.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-2 gap-3">
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="bg-white/50 border border-[#0F172A]/[0.06] rounded-xl p-4 backdrop-blur-sm hover:bg-white/70 hover:shadow-sm hover:shadow-slate-200/50 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-[#0F172A]/[0.06] flex items-center justify-center mb-2.5 text-[#5B6270] group-hover:text-[#0B0F18] transition-colors duration-300">
                      {f.icon}
                    </div>
                    <p className="text-sm font-medium text-[#0B0F18]/80 group-hover:text-[#0B0F18] transition-colors">{f.title}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column — Glass card ── */}
            <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="relative w-full max-w-[390px]">
                {/* Outer glow behind card */}
                <div
                  className="absolute -inset-8 rounded-3xl pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, rgba(233,230,255,0.25) 0%, transparent 70%)" }}
                />
                {/* Border shimmer */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white via-[#E9E6FF]/20 to-white pointer-events-none" />

                <div className="relative bg-white/55 backdrop-blur-2xl border border-[#0F172A]/[0.07] rounded-2xl p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.08)]">

                  {/* Mobile title */}
                  <div className="lg:hidden text-center mb-6">
                    <h1 className="text-2xl sm:text-[1.7rem] font-bold leading-tight">
                      <span className="bg-gradient-to-r from-[#1E293B] via-[#94A3B8] to-[#1E293B] bg-clip-text text-transparent">
                        Le cockpit secret
                      </span>
                    </h1>
                    <p className="text-xs text-[#94A3B8] mt-1.5 font-medium tracking-wide">des freelances</p>
                  </div>

                  {unlocked ? (
                    /* ── Unlocked state ── */
                    <div className="text-center">
                      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mb-4">
                        <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

                      <h2 className="text-lg font-semibold text-[#0B0F18]">Accès accordé</h2>
                      <p className="text-sm text-[#94A3B8] mt-1">Bienvenue dans le cockpit</p>

                      <a
                        href="/dashboard"
                        className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0B0F18] text-white text-sm font-medium hover:bg-[#1E293B] transition-all duration-300 shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/15"
                      >
                        Accéder au cockpit
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </a>

                      <button
                        onClick={lock}
                        className="mt-3 w-full py-2 rounded-xl border border-[#0F172A]/[0.06] text-[#94A3B8] text-xs hover:text-[#5B6270] hover:border-[#0F172A]/[0.12] hover:bg-white/50 transition-all duration-300 cursor-pointer"
                      >
                        Verrouiller l&apos;accès
                      </button>
                    </div>
                  ) : (
                    /* ── Code input state ── */
                    <div>
                      <div className="text-center mb-6">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 border border-[#0F172A]/[0.07] flex items-center justify-center mb-3">
                          <svg className="w-5 h-5 text-[#5B6270]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-[#0B0F18]">Code d&apos;accès</h2>
                        <p className="text-xs text-[#94A3B8] mt-1">Entrez les 6 chiffres</p>
                      </div>

                      {/* 6-digit code inputs */}
                      <div className={`flex gap-2 sm:gap-2.5 justify-center ${shake ? "animate-shake" : ""}`}>
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
                              input-focus-pulse
                              w-10 h-12 sm:w-[46px] sm:h-[54px] text-center text-lg font-semibold rounded-xl
                              border bg-white/70 outline-none transition-all duration-200
                              placeholder:text-[#CBD5E1]
                              ${error
                                ? "border-red-300 text-red-500 bg-red-50/50"
                                : success
                                  ? "border-emerald-300 text-emerald-600 bg-emerald-50/50"
                                  : digit
                                    ? "border-[#94A3B8]/40 text-[#0B0F18] shadow-sm shadow-slate-200/40"
                                    : "border-[#0F172A]/[0.08] text-[#0B0F18] focus:border-[#94A3B8]/50"
                              }
                            `}
                            placeholder="·"
                          />
                        ))}
                      </div>

                      {/* Feedback messages */}
                      <div className="h-6 flex items-center justify-center mt-3">
                        {error && (
                          <p className="text-xs text-red-400 animate-fade-in">
                            Code incorrect — Réessayez
                          </p>
                        )}
                        {success && !error && (
                          <p className="text-xs text-emerald-500 animate-fade-in">
                            Accès en cours...
                          </p>
                        )}
                      </div>

                      {/* Validate button */}
                      <button
                        onClick={validate}
                        disabled={digits.join("").length !== 6 || success}
                        className="mt-4 w-full py-2.5 rounded-xl bg-[#0B0F18] text-white text-sm font-medium transition-all duration-300 shadow-md shadow-slate-900/10 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none hover:enabled:bg-[#1E293B] hover:enabled:shadow-lg hover:enabled:shadow-slate-900/15"
                      >
                        Valider
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="shrink-0 h-8 flex items-center justify-center">
          <p className="text-[10px] text-[#CBD5E1] tracking-[0.15em]">
            JESTLY © 2025 — ACCÈS RESTREINT
          </p>
        </div>
      </div>
    </div>
  );
}
