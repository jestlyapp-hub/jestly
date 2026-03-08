"use client";

import { useState, useEffect, useRef } from "react";

const JOB_TYPES = [
  { value: "freelance-creative", label: "Freelance créatif" },
  { value: "freelance-dev", label: "Freelance dev / tech" },
  { value: "agency", label: "Agence / studio" },
  { value: "freelance-other", label: "Freelance autre" },
  { value: "curious", label: "Curieux / autre" },
];

const METIERS = [
  "Monteur vidéo",
  "Designer",
  "Motion designer",
  "Photographe",
  "Miniaturiste YouTube",
  "Freelance créatif",
];

const REPLACES = [
  { name: "Notion", desc: "Workflow & organisation" },
  { name: "Stripe", desc: "Paiements & facturation" },
  { name: "Trello", desc: "Gestion de projets" },
  { name: "Calendly", desc: "Rendez-vous & agenda" },
  { name: "Google Drive", desc: "Fichiers & documents" },
  { name: "Mailchimp", desc: "Newsletter & emails" },
  { name: "HoneyBook", desc: "CRM clients" },
  { name: "WordPress", desc: "Site vitrine" },
];

const PRODUCT_CARDS = [
  {
    title: "Commandes clients",
    desc: "Centralise tes demandes, briefs et projets.",
    icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  },
  {
    title: "Portail client",
    desc: "Tes clients voient leurs projets et fichiers.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    title: "Facturation automatique",
    desc: "Devis, factures et paiements au même endroit.",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  },
  {
    title: "Organisation Notion-like",
    desc: "Visualise tes projets et ton workflow facilement.",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  },
];

/* ═══════════════════════════════════════════
   Shared form component (used in hero + bottom)
   ═══════════════════════════════════════════ */
function WaitlistForm({
  firstName, setFirstName,
  email, setEmail,
  jobType, setJobType,
  twitter, setTwitter,
  status, errorMsg,
  onSubmit,
}: {
  firstName: string; setFirstName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  jobType: string; setJobType: (v: string) => void;
  twitter: string; setTwitter: (v: string) => void;
  status: string; errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (status === "success") {
    return (
      <div className="relative text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200/50 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#0B0F18]">Bienvenue dans la liste !</h3>
        <p className="text-[14px] text-[#5B6270] mt-2 max-w-xs mx-auto">
          On te tient au courant d&egrave;s que ta place est pr&ecirc;te.
        </p>
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="relative text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-200/50 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#0B0F18]">D&eacute;j&agrave; inscrit !</h3>
        <p className="text-[14px] text-[#5B6270] mt-2">Cet email est d&eacute;j&agrave; sur la liste. On te contacte tr&egrave;s vite.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-3.5 sm:space-y-4">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[#0B0F18]">Rejoins la beta priv&eacute;e</h2>
        <p className="text-[12px] sm:text-[13px] text-[#94A3B8] mt-1">Acc&egrave;s prioritaire + prix fondateur</p>
      </div>

      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Prénom"
        required
        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-[13px] sm:text-sm text-[#0B0F18] placeholder:text-gray-400 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-500/10 transition-all"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email professionnel"
        required
        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-[13px] sm:text-sm text-[#0B0F18] placeholder:text-gray-400 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-500/10 transition-all"
      />

      <select
        value={jobType}
        onChange={(e) => setJobType(e.target.value)}
        required
        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-[13px] sm:text-sm text-[#0B0F18] outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}
      >
        <option value="" disabled>Je suis...</option>
        {JOB_TYPES.map((j) => (
          <option key={j.value} value={j.value}>{j.label}</option>
        ))}
      </select>

      <input
        type="text"
        value={twitter}
        onChange={(e) => setTwitter(e.target.value)}
        placeholder="@twitter (optionnel)"
        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-gray-200 text-[13px] sm:text-sm text-[#0B0F18] placeholder:text-gray-400 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-500/10 transition-all"
      />

      {status === "error" && (
        <p className="text-[11px] sm:text-xs text-red-500 font-medium">{errorMsg || "Erreur, réessaie."}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-[13px] sm:text-sm font-semibold transition-all duration-300 cursor-pointer disabled:opacity-50 hover:enabled:scale-[1.02] shadow-[0_8px_32px_rgba(124,58,237,0.25)] hover:enabled:shadow-[0_12px_44px_rgba(124,58,237,0.38)]"
      >
        {status === "loading" ? "Inscription..." : "Rejoindre la waitlist"}
      </button>

      <p className="text-[10px] sm:text-[11px] text-center text-[#94A3B8]">
        Pas de spam. On t&apos;envoie un seul mail de confirmation.
      </p>

    </form>
  );
}

/* ═══════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════ */
export default function WaitlistLanding() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [twitter, setTwitter] = useState("");
  const [jobType, setJobType] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const waitlistRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !jobType) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: firstName,
          twitter: twitter || undefined,
          job_type: jobType,
          utm_source: params.get("utm_source") || undefined,
          utm_medium: params.get("utm_medium") || undefined,
          utm_campaign: params.get("utm_campaign") || undefined,
          utm_content: params.get("utm_content") || undefined,
          utm_term: params.get("utm_term") || undefined,
          referrer: document.referrer || undefined,
          source: "landing",
        }),
      });

      if (res.status === 409) {
        setStatus("duplicate");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Une erreur est survenue");
    }
  };

  const formProps = {
    firstName, setFirstName,
    email, setEmail,
    jobType, setJobType,
    twitter, setTwitter,
    status, errorMsg,
    onSubmit: handleSubmit,
  };

  if (!mounted) return <div className="min-h-screen bg-[#f0eff5]" />;

  return (
    <div className="min-h-screen bg-[#f0eff5] relative overflow-x-hidden">
      <style>{`
        @keyframes fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .anim-up{animation:fade-up .7s ease-out both}
        .anim-d1{animation-delay:.1s}
        .anim-d2{animation-delay:.2s}
        .anim-d3{animation-delay:.3s}
        @keyframes breathe{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.55;transform:scale(1.03)}}
        .animate-breathe{animation:breathe 8s ease-in-out infinite}
        @keyframes float-slow{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        .float-1{animation:float-slow 5s ease-in-out infinite}
        .float-2{animation:float-slow 6s ease-in-out infinite;animation-delay:1s}
        .float-3{animation:float-slow 7s ease-in-out infinite;animation-delay:2s}
        .float-4{animation:float-slow 5.5s ease-in-out infinite;animation-delay:0.5s}
        .float-5{animation:float-slow 6.5s ease-in-out infinite;animation-delay:1.5s}
        .float-6{animation:float-slow 5.8s ease-in-out infinite;animation-delay:2.5s}
        .float-7{animation:float-slow 7.2s ease-in-out infinite;animation-delay:0.8s}
        .mock-card{transition:transform .4s ease,box-shadow .4s ease}
        .mock-card:hover{transform:rotate(0deg) scale(1.04)!important;box-shadow:0 12px 40px rgba(124,58,237,0.15)!important}
        .feat-block{transition:transform .26s ease-out,box-shadow .26s ease-out}
        .feat-block:hover{transform:translateY(-4px) scale(1.012);box-shadow:0 25px 70px rgba(0,0,0,0.12)}
        .feat-block .ui-panel{transition:transform .32s ease-out}.feat-block:hover .ui-panel{transform:translateY(-3px)}
        .feat-block .ui-panel-2{transition:transform .38s ease-out}.feat-block:hover .ui-panel-2{transform:translateY(-6px)}
        .feat-btn-plus{transition:all .26s ease-out}.feat-block:hover .feat-btn-plus{transform:rotate(90deg);box-shadow:0 0 20px rgba(255,255,255,0.25)}
      `}</style>

      {/* ═══ BACKGROUND ═══ */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        className="fixed -top-60 -left-60 w-[900px] h-[900px] rounded-full pointer-events-none animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(233,230,255,0.5) 0%, transparent 65%)" }}
      />
      <div
        className="fixed -bottom-40 -right-40 w-[800px] h-[800px] rounded-full pointer-events-none animate-breathe"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 60%)", animationDelay: "4s" }}
      />

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            1. HEADER — branding only
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <header className="flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5 max-w-[1400px] mx-auto w-full">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(124,58,237,0.12)] flex items-center justify-center">
              <img src="/logo-color.png" alt="Jestly" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" draggable={false} />
            </div>
            <span className="text-[15px] sm:text-[17px] font-bold text-[#0B0F18] tracking-tight">Jestly</span>
          </div>
        </header>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. HERO — 2 colonnes
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-5 sm:px-8 md:px-12 lg:px-16 pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20 lg:pb-24 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 xl:gap-20 items-center max-w-[680px] lg:max-w-none mx-auto">

            {/* Left — Copy */}
            <div className="anim-up">
              <div className="inline-flex items-center gap-2 bg-violet-100/60 border border-violet-200/50 rounded-full px-3.5 sm:px-4 py-1.5 mb-5 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
                <span className="text-[11px] sm:text-[12px] font-semibold text-[#7C3AED]">Beta priv&eacute;e &mdash; Places limit&eacute;es</span>
              </div>

              <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.2rem] xl:text-[3.6rem] font-extrabold leading-[1.1] tracking-tight text-[#0B0F18]">
                Le cockpit{" "}
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">tout-en-un</span>
                <br />
                des freelances{" "}
                <span className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">cr&eacute;atifs</span>
              </h1>

              <p className="mt-4 sm:mt-5 text-[15px] sm:text-[16px] md:text-[17px] text-[#5B6270] leading-relaxed max-w-[480px]">
                Commandes, facturation, CRM, site vitrine, agenda et workflow
                Notion-like. Un seul outil remplace vos 10 abonnements.
              </p>

            </div>

            {/* Right — Form Card */}
            <div className="anim-up anim-d1 max-w-[480px] lg:max-w-none mx-auto lg:mx-0 w-full">
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-[1.5rem] sm:rounded-[1.75rem] bg-gradient-to-b from-violet-300/30 via-white/40 to-violet-200/20 pointer-events-none" />
                <div className="relative rounded-[1.375rem] sm:rounded-[1.625rem] bg-white/70 backdrop-blur-2xl border border-white/80 p-5 sm:p-7 md:p-9 shadow-[0_30px_80px_-15px_rgba(124,58,237,0.20)]">
                  <div className="absolute inset-0 rounded-[1.375rem] sm:rounded-[1.625rem] pointer-events-none bg-gradient-to-br from-violet-500/[0.03] via-transparent to-indigo-500/[0.02]" />
                  <WaitlistForm {...formProps} />
                </div>
              </div>
            </div>
          </div>
        </section>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. FEATURE SHOWCASE — Premium product teaser
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-5 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-28 max-w-[1400px] mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-[1.6rem] sm:text-[2rem] md:text-[2.4rem] lg:text-[2.6rem] font-extrabold text-[#0B0F18] leading-tight mb-3 sm:mb-4">
              Tout ton business freelance.<br />
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">Un seul cockpit.</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#5B6270] max-w-lg mx-auto leading-relaxed px-2">
              Chaque module dont tu as besoin, pens&eacute; pour les cr&eacute;atifs ind&eacute;pendants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-5">

            {/* ══════════════════════════════════════════
                BLOCK 1 — Créateur de site (FULL WIDTH)
            ══════════════════════════════════════════ */}
            <div className="md:col-span-2 feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[460px] p-5 sm:p-7 md:p-10" style={{ background: "linear-gradient(135deg, #4C1D95 0%, #6D28D9 40%, #7C3AED 100%)" }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

              <div className="relative z-10 max-w-sm">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-white mb-2">Cr&eacute;ateur de site freelance</h3>
                <p className="text-[13px] sm:text-[14px] md:text-[15px] text-white/65 leading-relaxed">Cr&eacute;e une pr&eacute;sence professionnelle claire, moderne et pr&ecirc;te &agrave; convertir.</p>
              </div>

              {/* Main canvas preview */}
              <div className="ui-panel absolute right-3 sm:right-6 md:right-10 bottom-3 sm:bottom-6 md:bottom-10 top-[130px] sm:top-[140px] md:top-12 left-[38%] sm:left-[40%] z-[2]">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-white/80">
                  {/* Browser bar */}
                  <div className="h-7 sm:h-9 bg-[#FAFAFA] border-b border-gray-100 flex items-center px-3 gap-1.5">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF6159]" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBF2F]" />
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2ACB42]" />
                    <div className="ml-3 sm:ml-4 h-4 w-24 sm:w-36 bg-gray-100 rounded-full" />
                  </div>
                  {/* Hero mockup */}
                  <div className="p-3 sm:p-5">
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50/80 rounded-lg p-3 sm:p-5 mb-2 sm:mb-3">
                      <div className="h-1.5 sm:h-2 bg-violet-200/80 rounded w-3/5 mb-1.5 sm:mb-2" />
                      <div className="h-1 sm:h-1.5 bg-violet-100 rounded w-full mb-1" />
                      <div className="h-1 sm:h-1.5 bg-violet-100 rounded w-4/5 mb-2 sm:mb-3" />
                      <div className="h-6 sm:h-8 w-24 sm:w-28 bg-[#7C3AED] rounded-lg flex items-center justify-center">
                        <span className="text-[7px] sm:text-[9px] text-white font-semibold">Demander un devis</span>
                      </div>
                    </div>
                    {/* Services row */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 hidden sm:grid">
                      {["Portfolio", "Services", "Contact"].map(s => (
                        <div key={s} className="bg-gray-50/80 rounded-md p-2 sm:p-2.5">
                          <div className="w-5 h-5 rounded bg-gray-200/60 mb-1.5" />
                          <div className="h-1 bg-gray-200/80 rounded w-3/4 mb-1" />
                          <div className="h-0.5 bg-gray-100 rounded w-1/2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating — sidebar panel */}
              <div className="ui-panel-2 absolute left-[30%] sm:left-[34%] top-[170px] sm:top-[110px] z-[3] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.22)] p-2.5 sm:p-3 w-[110px] sm:w-[140px] hidden md:block">
                <p className="text-[8px] sm:text-[9px] font-bold text-[#0B0F18] mb-2 uppercase tracking-wider">Blocs</p>
                {["Hero", "Services", "Avis", "Contact", "Footer"].map((b, i) => (
                  <div key={b} className={`flex items-center gap-2 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md text-[9px] sm:text-[10px] ${i === 0 ? "bg-violet-50 text-[#7C3AED] font-semibold" : "text-[#5B6270]"}`}>
                    <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded ${i === 0 ? "bg-violet-200" : "bg-gray-100"}`} />
                    {b}
                  </div>
                ))}
              </div>

              {/* Floating — mobile preview */}
              <div className="ui-panel-2 absolute right-[7%] sm:right-[8%] top-[54%] sm:top-[52%] z-[4] bg-white rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.2)] w-[56px] sm:w-[72px] h-[90px] sm:h-[120px] overflow-hidden hidden lg:block border-2 border-gray-100">
                <div className="bg-violet-50 p-1.5 sm:p-2 h-1/2">
                  <div className="h-0.5 bg-violet-200 rounded w-3/4 mb-1" />
                  <div className="h-0.5 bg-violet-100 rounded w-1/2" />
                </div>
                <div className="p-1.5 sm:p-2">
                  <div className="h-3 w-full bg-[#7C3AED] rounded" />
                </div>
              </div>

              {/* + btn */}
              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 z-10">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 2 — Agenda (HALF)
            ══════════════════════════════════════════ */}
            <div className="feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[340px] md:min-h-[400px] p-5 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #2DD4BF 100%)" }}>
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5">Agenda freelance intelligent</h3>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-white/65">Planifie tes projets, rendez-vous et deadlines sans t&apos;&eacute;parpiller.</p>
              </div>

              {/* Calendar mockup */}
              <div className="ui-panel relative z-[2] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] p-3 sm:p-4 max-w-[340px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] sm:text-[12px] font-bold text-[#0B0F18]">Mars 2026</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">&lsaquo;</div>
                    <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[8px] text-gray-400">&rsaquo;</div>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven"].map(d => (
                    <div key={d} className="text-[7px] sm:text-[8px] text-[#94A3B8] text-center font-medium py-0.5">{d}</div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-5 gap-1">
                    <div className="col-span-2 bg-teal-50 border border-teal-200/50 rounded-md px-2 py-1.5">
                      <span className="text-[8px] sm:text-[9px] font-semibold text-teal-700 block">Call client</span>
                      <span className="text-[6px] sm:text-[7px] text-teal-500">10h &mdash; 11h</span>
                    </div>
                    <div className="bg-violet-50 border border-violet-200/50 rounded-md px-2 py-1.5 col-span-2">
                      <span className="text-[8px] sm:text-[9px] font-semibold text-violet-700 block">Montage final</span>
                      <span className="text-[6px] sm:text-[7px] text-violet-500">14h &mdash; 17h</span>
                    </div>
                    <div className="bg-gray-50 rounded-md" />
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    <div className="bg-amber-50 border border-amber-200/50 rounded-md px-2 py-1.5 col-span-3">
                      <span className="text-[8px] sm:text-[9px] font-semibold text-amber-700 block">Brief branding</span>
                      <span className="text-[6px] sm:text-[7px] text-amber-500">9h &mdash; 12h</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200/50 rounded-md px-2 py-1.5 col-span-2">
                      <span className="text-[8px] sm:text-[9px] font-semibold text-rose-700 block">Livraison YT</span>
                      <span className="text-[6px] sm:text-[7px] text-rose-500">15h</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    <div className="bg-gray-50 rounded-md" />
                    <div className="bg-indigo-50 border border-indigo-200/50 rounded-md px-2 py-1.5 col-span-2">
                      <span className="text-[8px] sm:text-[9px] font-semibold text-indigo-700 block">Relance devis</span>
                      <span className="text-[6px] sm:text-[7px] text-indigo-500">11h</span>
                    </div>
                    <div className="bg-gray-50 rounded-md col-span-2" />
                  </div>
                </div>
              </div>

              {/* Floating — today tasks */}
              <div className="ui-panel-2 absolute right-3 sm:right-5 bottom-14 sm:bottom-16 z-[3] bg-white rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] p-2.5 sm:p-3 w-[130px] sm:w-[145px] hidden md:block">
                <p className="text-[8px] sm:text-[9px] font-bold text-[#0B0F18] uppercase tracking-wider mb-2">Aujourd&apos;hui</p>
                {[{ t: "Relance devis", done: true }, { t: "Export miniature", done: false }, { t: "Call 16h", done: false }].map((task) => (
                  <div key={task.t} className="flex items-center gap-1.5 py-1">
                    <div className={`w-3 h-3 rounded-[3px] border-[1.5px] flex items-center justify-center ${task.done ? "border-teal-400 bg-teal-400" : "border-gray-300"}`}>
                      {task.done && <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] ${task.done ? "line-through text-gray-400" : "text-[#0B0F18] font-medium"}`}>{task.t}</span>
                  </div>
                ))}
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 z-10">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 3 — Commandes clients (HALF)
            ══════════════════════════════════════════ */}
            <div className="feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[340px] md:min-h-[400px] p-5 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)" }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5">Commandes clients centralis&eacute;es</h3>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-white/65">Re&ccedil;ois, organise et suis toutes tes demandes au m&ecirc;me endroit.</p>
              </div>

              {/* Orders table */}
              <div className="ui-panel relative z-[2] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden max-w-[380px]">
                <div className="grid grid-cols-[1fr_80px_64px] sm:grid-cols-[1fr_90px_72px] gap-2 px-3 sm:px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                  <span className="text-[8px] sm:text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider">Commande</span>
                  <span className="text-[8px] sm:text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider">Client</span>
                  <span className="text-[8px] sm:text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right">Statut</span>
                </div>
                {[
                  { name: "Miniature YouTube", client: "Studio Nova", status: "En cours", sc: "bg-blue-50 text-blue-600 border-blue-200", price: "120\u20AC" },
                  { name: "Montage Reel", client: "Agence Pulse", status: "\u00C0 livrer", sc: "bg-amber-50 text-amber-600 border-amber-200", price: "350\u20AC" },
                  { name: "Refonte branding", client: "Client priv\u00E9", status: "Valid\u00E9", sc: "bg-emerald-50 text-emerald-600 border-emerald-200", price: "890\u20AC" },
                  { name: "Pack r\u00E9seaux", client: "Marie L.", status: "Nouveau", sc: "bg-violet-50 text-violet-600 border-violet-200", price: "200\u20AC" },
                ].map((o, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_64px] sm:grid-cols-[1fr_90px_72px] gap-2 px-3 sm:px-4 py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#0B0F18] block leading-tight">{o.name}</span>
                      <span className="text-[8px] sm:text-[9px] text-[#94A3B8]">{o.price}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-[#5B6270] self-center truncate">{o.client}</span>
                    <span className={`text-[7px] sm:text-[8px] font-medium ${o.sc} px-1.5 py-0.5 rounded-full border self-center text-center whitespace-nowrap`}>{o.status}</span>
                  </div>
                ))}
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 z-10">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 4 — Workflow Kanban (HALF)
            ══════════════════════════════════════════ */}
            <div className="feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[340px] md:min-h-[400px] p-5 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #C2410C 0%, #EA580C 40%, #F97316 100%)" }}>
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5">Workflow visuel ultra clair</h3>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-white/65">Organise tes t&acirc;ches et ton ex&eacute;cution dans une interface fluide.</p>
              </div>

              {/* Kanban */}
              <div className="ui-panel relative z-[2] flex gap-2 sm:gap-3">
                {[
                  { title: "\u00C0 faire", color: "bg-orange-100 text-orange-700", cards: ["Cr\u00E9er moodboard", "Export HD"] },
                  { title: "En cours", color: "bg-blue-100 text-blue-700", cards: ["Envoyer preview", "Corriger V2"] },
                  { title: "Termin\u00E9", color: "bg-emerald-100 text-emerald-700", cards: ["Livraison finale"] },
                ].map(col => (
                  <div key={col.title} className="flex-1 min-w-0">
                    <div className={`inline-block text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full mb-2 ${col.color}`}>{col.title}</div>
                    <div className="space-y-1.5">
                      {col.cards.map(card => (
                        <div key={card} className="bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.08)] p-2 sm:p-2.5 border border-white/80">
                          <div className="flex items-start gap-1.5">
                            <div className="mt-0.5 flex flex-col gap-[2px] flex-shrink-0">
                              <div className="w-1 h-1 rounded-full bg-gray-300" />
                              <div className="w-1 h-1 rounded-full bg-gray-300" />
                              <div className="w-1 h-1 rounded-full bg-gray-300" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-medium text-[#0B0F18] leading-tight">{card}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 z-10">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 5 — Fichiers clients (HALF)
            ══════════════════════════════════════════ */}
            <div className="feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[340px] md:min-h-[400px] p-5 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 40%, #A78BFA 100%)" }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1E1B4B] mb-1.5">Fichiers clients organis&eacute;s</h3>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#1E1B4B]/55">Centralise tous les fichiers d&apos;un projet sans chercher partout.</p>
              </div>

              {/* File manager */}
              <div className="ui-panel relative z-[2] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] p-3 sm:p-4 max-w-[340px]">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-[12px] font-bold text-[#0B0F18] block">Studio Nova</span>
                    <span className="text-[8px] sm:text-[9px] text-[#94A3B8]">5 fichiers &middot; 166 MB</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { name: "Logo_client.png", type: "PNG", size: "2.4 MB", color: "bg-pink-50 text-pink-500 border-pink-100" },
                    { name: "Video_final.mp4", type: "MP4", size: "128 MB", color: "bg-blue-50 text-blue-500 border-blue-100" },
                    { name: "Miniature_YT.psd", type: "PSD", size: "34 MB", color: "bg-violet-50 text-violet-500 border-violet-100" },
                    { name: "Brief_client.pdf", type: "PDF", size: "1.2 MB", color: "bg-red-50 text-red-500 border-red-100" },
                    { name: "Script_reel.docx", type: "DOC", size: "0.5 MB", color: "bg-sky-50 text-sky-500 border-sky-100" },
                  ].map(f => (
                    <div key={f.name} className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-gray-50/80 transition-colors">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${f.color} border flex items-center justify-center text-[7px] sm:text-[8px] font-bold flex-shrink-0`}>{f.type}</div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] sm:text-[11px] font-medium text-[#0B0F18] block truncate">{f.name}</span>
                        <span className="text-[8px] sm:text-[9px] text-[#94A3B8]">{f.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full bg-[#1E1B4B]/10 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-[#1E1B4B]/10 z-10">
                <svg className="w-4 h-4 text-[#1E1B4B]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 6 — Produits & Services (HALF)
            ══════════════════════════════════════════ */}
            <div className="feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[340px] md:min-h-[400px] p-5 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #BE185D 0%, #EC4899 45%, #F472B6 100%)" }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5">Produits &amp; services pr&ecirc;ts &agrave; vendre</h3>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-white/65">Cr&eacute;e tes offres, structure tes prestations et pr&eacute;pare tes ventes.</p>
              </div>

              {/* Product grid */}
              <div className="ui-panel relative z-[2] grid grid-cols-2 gap-2 sm:gap-2.5 max-w-[360px]">
                {[
                  { name: "Miniature YouTube", price: "120\u20AC", status: "Disponible", sc: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                  { name: "Montage TikTok", price: "90\u20AC", status: "Disponible", sc: "text-emerald-600 bg-emerald-50 border-emerald-200" },
                  { name: "Pack Branding", price: "450\u20AC", status: "Sur devis", sc: "text-violet-600 bg-violet-50 border-violet-200" },
                  { name: "Montage Podcast", price: "180\u20AC", status: "Nouveau", sc: "text-blue-600 bg-blue-50 border-blue-200" },
                ].map(p => (
                  <div key={p.name} className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-2.5 sm:p-3 border border-white/80">
                    <div className="w-full h-10 sm:h-12 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 mb-2 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-pink-200/50" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#0B0F18] block mb-1 leading-tight">{p.name}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-[12px] font-bold text-[#7C3AED]">{p.price}</span>
                      <span className={`text-[7px] sm:text-[8px] font-medium px-1.5 py-px rounded-full border ${p.sc}`}>{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 z-10">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 7 — Facturation (HALF)
            ══════════════════════════════════════════ */}
            <div className="feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[340px] md:min-h-[400px] p-5 sm:p-6 md:p-8" style={{ background: "linear-gradient(135deg, #047857 0%, #059669 40%, #10B981 100%)" }}>
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />

              <div className="relative z-10 mb-4 sm:mb-5 md:mb-6">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5">Facturation &amp; paiements simplifi&eacute;s</h3>
                <p className="text-[12px] sm:text-[13px] md:text-[14px] text-white/65">Cr&eacute;e tes devis, envoie tes factures et suis tes encaissements.</p>
              </div>

              {/* Invoice card */}
              <div className="ui-panel relative z-[2] bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] p-3.5 sm:p-4 max-w-[310px]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[12px] sm:text-[13px] font-bold text-[#0B0F18] block">INV-0042</span>
                    <span className="text-[8px] sm:text-[9px] text-[#94A3B8]">8 mars 2026</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-200">Pay&eacute;e</span>
                </div>
                <div className="border-t border-gray-100 pt-2.5 space-y-1.5">
                  <div className="flex justify-between text-[9px] sm:text-[10px]">
                    <span className="text-[#5B6270]">Miniature YouTube x2</span>
                    <span className="font-medium text-[#0B0F18]">240&euro;</span>
                  </div>
                  <div className="flex justify-between text-[9px] sm:text-[10px]">
                    <span className="text-[#5B6270]">Montage Reel</span>
                    <span className="font-medium text-[#0B0F18]">350&euro;</span>
                  </div>
                  <div className="flex justify-between text-[9px] sm:text-[10px]">
                    <span className="text-[#5B6270]">R&eacute;visions</span>
                    <span className="font-medium text-[#0B0F18]">60&euro;</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 mt-2.5 pt-2.5 flex justify-between items-baseline">
                  <span className="text-[9px] sm:text-[10px] font-semibold text-[#5B6270]">Total TTC</span>
                  <span className="text-[14px] sm:text-[16px] font-extrabold text-[#0B0F18]">1&nbsp;250&euro;</span>
                </div>
                <div className="mt-1.5 text-[8px] sm:text-[9px] text-[#94A3B8]">Client : Studio Nova</div>
              </div>

              {/* Floating — monthly summary */}
              <div className="ui-panel-2 absolute right-3 sm:right-5 bottom-14 sm:bottom-16 z-[3] bg-white rounded-xl shadow-[0_16px_50px_rgba(0,0,0,0.18)] p-2.5 sm:p-3 w-[120px] sm:w-[135px] hidden md:block">
                <p className="text-[8px] sm:text-[9px] font-bold text-[#0B0F18] uppercase tracking-wider mb-1.5">Ce mois</p>
                <div className="text-[16px] sm:text-[18px] font-extrabold text-emerald-600 mb-0.5">3&nbsp;840&euro;</div>
                <span className="text-[8px] sm:text-[9px] text-emerald-500 font-medium">+18% vs f&eacute;v.</span>
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-5 sm:right-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/20 z-10">
                <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

            {/* ══════════════════════════════════════════
                BLOCK 8 — Analytics (FULL WIDTH, DARK)
            ══════════════════════════════════════════ */}
            <div className="md:col-span-2 feat-block group relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[1.75rem] min-h-[300px] sm:min-h-[360px] md:min-h-[420px] p-5 sm:p-7 md:p-10" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)" }}>
              <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(124,58,237,0.4) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

              <div className="relative z-10 max-w-sm mb-6 sm:mb-0">
                <h3 className="text-[1.25rem] sm:text-[1.5rem] md:text-[1.75rem] font-bold text-white mb-2">Analytics business</h3>
                <p className="text-[13px] sm:text-[14px] md:text-[15px] text-white/45 leading-relaxed">Suis tes revenus, tes clients et ta performance en un coup d&apos;&oelig;il.</p>
              </div>

              {/* KPI row */}
              <div className="ui-panel absolute top-5 sm:top-7 md:top-10 right-5 sm:right-7 md:right-10 z-[2] flex gap-1.5 sm:gap-2 md:gap-3">
                {[
                  { label: "Revenu", value: "3\u00A0840\u20AC", change: "+18%", up: true },
                  { label: "Projets", value: "12", change: "+3", up: true },
                  { label: "Clients", value: "8", change: "+2", up: true },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-white/[0.07] backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/[0.08] p-2 sm:p-3 md:p-4 min-w-[70px] sm:min-w-[90px] md:min-w-[115px]">
                    <span className="text-[6px] sm:text-[7px] md:text-[9px] text-white/35 uppercase tracking-wider font-medium block mb-0.5 sm:mb-1">{kpi.label}</span>
                    <span className="text-[13px] sm:text-[16px] md:text-[20px] font-extrabold text-white block leading-tight">{kpi.value}</span>
                    <span className="text-[7px] sm:text-[8px] md:text-[10px] font-semibold text-emerald-400">{kpi.change}</span>
                  </div>
                ))}
              </div>

              {/* Chart area */}
              <div className="ui-panel-2 absolute bottom-5 sm:bottom-7 md:bottom-10 right-5 sm:right-7 md:right-10 left-5 sm:left-[38%] z-[2]">
                <div className="bg-white/[0.05] backdrop-blur-sm rounded-xl border border-white/[0.06] p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] sm:text-[10px] text-white/45 font-medium">Revenus 6 mois</span>
                    <div className="flex gap-1.5">
                      <span className="text-[8px] sm:text-[9px] text-violet-400 font-semibold bg-violet-400/10 px-2 py-0.5 rounded-full">Mensuel</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-2 sm:gap-3 h-14 sm:h-20">
                    {[
                      { h: 40, label: "Oct" },
                      { h: 55, label: "Nov" },
                      { h: 48, label: "D\u00E9c" },
                      { h: 68, label: "Jan" },
                      { h: 62, label: "F\u00E9v" },
                      { h: 85, label: "Mar" },
                    ].map(bar => (
                      <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-full rounded-t-md ${bar.label === "Mar" ? "bg-gradient-to-t from-violet-400 to-violet-300" : "bg-gradient-to-t from-violet-500/60 to-violet-400/40"}`} style={{ height: `${bar.h}%` }} />
                        <span className="text-[6px] sm:text-[8px] text-white/25 font-medium">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating — conversion badge */}
              <div className="ui-panel-2 absolute left-5 sm:left-7 md:left-10 bottom-5 sm:bottom-7 md:bottom-10 z-[3] bg-white/[0.08] backdrop-blur-sm rounded-xl border border-white/[0.08] px-3 sm:px-4 py-2.5 sm:py-3 hidden md:block">
                <span className="text-[8px] sm:text-[9px] text-white/35 uppercase tracking-wider font-medium block mb-1">Taux conversion</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[18px] sm:text-[22px] font-extrabold text-white">68%</span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-400">+5pts</span>
                </div>
              </div>

              <div className="feat-btn-plus absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center cursor-pointer border border-white/15 z-10">
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </div>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            4. MÉTIERS — Hub circulaire
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-5 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24 max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-[1.4rem] sm:text-2xl md:text-3xl font-bold text-[#0B0F18]">
              Construit pour les <span className="text-[#7C3AED]">cr&eacute;atifs ind&eacute;pendants</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5B6270] mt-3 max-w-lg mx-auto px-2">
              Que tu sois designer, d&eacute;v, photographe ou consultant,<br className="hidden sm:block" />
              Jestly s&apos;adapte &agrave; ton m&eacute;tier.
            </p>
          </div>

          {/* Desktop — circular hub */}
          <div className="hidden md:block relative w-[380px] lg:w-[420px] h-[380px] lg:h-[420px] mx-auto">
            {/* Connecting lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 420" fill="none">
              {METIERS.map((_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const x = 210 + Math.cos(angle) * 160;
                const y = 210 + Math.sin(angle) * 160;
                return (
                  <line key={i} x1="210" y1="210" x2={x} y2={y} stroke="#C4B5FD" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                );
              })}
            </svg>

            {/* Center — Jestly */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-xl border border-violet-200/50 shadow-[0_12px_40px_rgba(124,58,237,0.18)] flex items-center justify-center">
                <img src="/logo-color.png" alt="Jestly" className="w-10 h-10 object-contain" draggable={false} />
              </div>
            </div>

            {/* Orbital pills */}
            {METIERS.map((m, i) => {
              const angle = (i * 60 - 90) * (Math.PI / 180);
              const x = 210 + Math.cos(angle) * 160;
              const y = 210 + Math.sin(angle) * 160;
              return (
                <div
                  key={m}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                  style={{ left: x, top: y }}
                >
                  <span className="block px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/90 text-[13px] font-medium text-[#0B0F18] shadow-[0_4px_16px_rgba(124,58,237,0.08)] group-hover:border-violet-300 group-hover:shadow-[0_6px_24px_rgba(124,58,237,0.15)] group-hover:text-[#7C3AED] transition-all whitespace-nowrap cursor-default">
                    {m}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile fallback — pills row */}
          <div className="md:hidden flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {METIERS.map((m) => (
              <span
                key={m}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/70 backdrop-blur-sm border border-white/80 text-[13px] sm:text-[14px] font-medium text-[#0B0F18] shadow-[0_2px_12px_rgba(124,58,237,0.06)]"
              >
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            5. REMPLACE 10 OUTILS — Avant / Après
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="px-5 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24 max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-[1.4rem] sm:text-2xl md:text-3xl font-bold text-[#0B0F18]">
              Un seul outil remplace <span className="text-[#7C3AED]">10 abonnements</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5B6270] mt-3 max-w-lg mx-auto px-2">
              Arr&ecirc;te de jongler entre 10 apps.<br className="hidden sm:block" />
              Tout est centralis&eacute; dans un seul cockpit.
            </p>
          </div>

          {/* Desktop — Avant / Après */}
          <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-center max-w-4xl mx-auto">
            {/* AVANT — scattered tools */}
            <div className="relative bg-red-50/30 border border-red-200/30 rounded-2xl p-8">
              <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-5">Avant</p>
              <div className="grid grid-cols-2 gap-2.5">
                {REPLACES.map((tool) => (
                  <div key={tool.name} className="flex items-center gap-2.5 bg-white/60 border border-gray-200/50 rounded-lg px-3 py-2">
                    <div className="w-7 h-7 rounded-md bg-[#E8E7ED] flex items-center justify-center text-[#8A8A94] text-[11px] font-bold flex-shrink-0">
                      {tool.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-[#5B6270] truncate line-through decoration-red-300/60">{tool.name}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-red-400/80 mt-4 font-medium text-center">~85&euro; / mois d&apos;abonnements</p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-[0_4px_20px_rgba(124,58,237,0.3)]">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>

            {/* APRÈS — Jestly */}
            <div className="relative bg-emerald-50/30 border border-emerald-200/30 rounded-2xl p-8 flex flex-col items-center text-center">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-5 self-start">Apr&egrave;s</p>
              <div className="w-16 h-16 rounded-2xl bg-white/80 border border-violet-200/50 shadow-[0_8px_30px_rgba(124,58,237,0.15)] flex items-center justify-center mb-4">
                <img src="/logo-color.png" alt="Jestly" className="w-9 h-9 object-contain" draggable={false} />
              </div>
              <h3 className="text-[18px] font-bold text-[#0B0F18] mb-1">Jestly</h3>
              <p className="text-[13px] text-[#5B6270] mb-5">Tout-en-un pour freelances</p>
              <div className="bg-white/70 border border-violet-200/40 rounded-xl px-6 py-3 shadow-sm">
                <span className="text-2xl font-extrabold text-[#7C3AED]">0&euro;</span>
                <span className="text-[13px] text-[#5B6270] ml-2">/ mois pour d&eacute;marrer</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-2">Gratuit, sans carte bancaire</p>
            </div>
          </div>

          {/* Mobile fallback */}
          <div className="md:hidden space-y-4">
            <div className="grid grid-cols-2 gap-2 max-w-[400px] mx-auto">
              {REPLACES.map((tool) => (
                <div key={tool.name} className="flex items-center gap-2 bg-white/50 border border-white/70 rounded-lg px-3 py-2">
                  <div className="w-7 h-7 rounded-md bg-[#E8E7ED] flex items-center justify-center text-[#8A8A94] text-[11px] font-bold">{tool.name[0]}</div>
                  <span className="text-[11px] font-semibold text-[#5B6270] line-through decoration-[#C4B5FD]/60">{tool.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
            <div className="text-center bg-white/70 border border-violet-200/40 rounded-2xl p-6">
              <img src="/logo-color.png" alt="Jestly" className="w-10 h-10 mx-auto mb-3 object-contain" />
              <span className="text-2xl font-extrabold text-[#7C3AED]">0&euro;</span>
              <span className="text-[13px] text-[#5B6270] ml-2">/ mois pour d&eacute;marrer</span>
              <p className="text-[11px] text-[#94A3B8] mt-1">Gratuit, sans carte bancaire</p>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            6. WAITLIST FINALE
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section ref={waitlistRef} className="px-5 sm:px-8 md:px-12 lg:px-16 py-14 sm:py-20 md:py-28 max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-[1.4rem] sm:text-2xl md:text-3xl font-bold text-[#0B0F18]">
              Acc&egrave;s b&ecirc;ta <span className="text-[#7C3AED]">limit&eacute;</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#5B6270] mt-3 max-w-md mx-auto px-2">
              Jestly est actuellement en d&eacute;veloppement.<br />
              Rejoins la waitlist pour &ecirc;tre invit&eacute; en priorit&eacute;.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-[1.5rem] sm:rounded-[1.75rem] bg-gradient-to-b from-violet-300/30 via-white/40 to-violet-200/20 pointer-events-none" />
              <div className="relative rounded-[1.375rem] sm:rounded-[1.625rem] bg-white/70 backdrop-blur-2xl border border-white/80 p-5 sm:p-7 md:p-9 shadow-[0_30px_80px_-15px_rgba(124,58,237,0.18)]">
                <div className="absolute inset-0 rounded-[1.375rem] sm:rounded-[1.625rem] pointer-events-none bg-gradient-to-br from-violet-500/[0.03] via-transparent to-indigo-500/[0.02]" />
                <WaitlistForm {...formProps} />
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            FOOTER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <footer className="px-5 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 border-t border-[#0B0F18]/[0.06]">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-color.png" alt="Jestly" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#0B0F18]">Jestly</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#94A3B8]">
              &copy; 2026 Rasenya &mdash; Jestly. Tous droits r&eacute;serv&eacute;s.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
