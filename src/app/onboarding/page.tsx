"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ══════════════════════════════════════════════════════════════
   TYPES & DONNÉES
   ══════════════════════════════════════════════════════════════ */

interface StepOption {
  value: string;
  label: string;
  icon?: string;
}

interface QuestionStep {
  key: string;
  title: string;
  subtitle: string;
  options: StepOption[];
  type: "single" | "toggle";
}

const STEPS: QuestionStep[] = [
  {
    key: "discovery_source",
    title: "Comment avez-vous connu Jestly ?",
    subtitle: "On adapte l'expérience pour mieux correspondre à votre activité.",
    type: "single",
    options: [
      { value: "youtube", label: "YouTube", icon: "▶" },
      { value: "tiktok", label: "TikTok", icon: "♪" },
      { value: "instagram", label: "Instagram", icon: "◎" },
      { value: "google", label: "Google", icon: "◉" },
      { value: "recommendation", label: "Recommandation", icon: "💬" },
      { value: "other", label: "Autre", icon: "…" },
    ],
  },
  {
    key: "freelance_type",
    title: "Quel type de freelance êtes-vous ?",
    subtitle: "Pour personnaliser votre espace et vos outils.",
    type: "single",
    options: [
      { value: "videaste", label: "Vidéaste", icon: "🎬" },
      { value: "graphiste", label: "Graphiste", icon: "🎨" },
      { value: "motion_designer", label: "Motion designer", icon: "✦" },
      { value: "photographe", label: "Photographe", icon: "📷" },
      { value: "thumbnail_designer", label: "Thumbnail designer", icon: "🖼" },
      { value: "community_manager", label: "Community manager", icon: "📱" },
      { value: "web_designer", label: "Web designer", icon: "🌐" },
      { value: "developpeur", label: "Développeur", icon: "⌨" },
      { value: "other", label: "Autre", icon: "…" },
    ],
  },
  {
    key: "freelance_experience",
    title: "Depuis combien de temps êtes-vous freelance ?",
    subtitle: "Pour adapter nos suggestions à votre niveau.",
    type: "single",
    options: [
      { value: "beginner", label: "Je débute" },
      { value: "less_1y", label: "Moins de 1 an" },
      { value: "1_3y", label: "1 à 3 ans" },
      { value: "3_5y", label: "3 à 5 ans" },
      { value: "5y_plus", label: "5 ans et +" },
    ],
  },
  {
    key: "client_volume",
    title: "Combien de clients avez-vous actuellement ?",
    subtitle: "Pour calibrer les fonctionnalités à votre activité.",
    type: "single",
    options: [
      { value: "0", label: "Aucun pour l'instant" },
      { value: "1_5", label: "1 à 5" },
      { value: "6_15", label: "6 à 15" },
      { value: "16_50", label: "16 à 50" },
      { value: "50_plus", label: "Plus de 50" },
    ],
  },
  {
    key: "main_goal",
    title: "Quel est votre objectif principal ?",
    subtitle: "Pour vous guider vers les bons outils dès le départ.",
    type: "single",
    options: [
      { value: "save_time", label: "Gagner du temps", icon: "⏱" },
      { value: "organize_clients", label: "Organiser mes clients", icon: "👥" },
      { value: "automate_billing", label: "Automatiser la facturation", icon: "📄" },
      { value: "create_site", label: "Créer un site freelance", icon: "🌐" },
      { value: "structure_business", label: "Structurer mon business", icon: "📊" },
      { value: "other", label: "Autre", icon: "…" },
    ],
  },
  {
    key: "wants_tips",
    title: "Recevoir des conseils personnalisés ?",
    subtitle: "Astuces, bonnes pratiques et nouveautés — directement dans votre boîte.",
    type: "toggle",
    options: [
      { value: "true", label: "Oui, avec plaisir" },
      { value: "false", label: "Non merci" },
    ],
  },
];

const TOTAL = STEPS.length;
const ease = [0.22, 1, 0.36, 1] as const;

/* ══════════════════════════════════════════════════════════════
   COMPOSANT PAGE
   ══════════════════════════════════════════════════════════════ */

export default function OnboardingPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.completed) { router.replace("/dashboard"); return; }
        if (data.step > 0) setCurrent(Math.min(data.step, TOTAL - 1));
        if (data.answers) {
          const restored: Record<string, string | null> = {};
          for (const [k, v] of Object.entries(data.answers)) {
            if (v !== null) restored[k] = String(v);
          }
          setAnswers(restored);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const saveProgress = useCallback(
    async (step: number, ans: Record<string, string | null>, completed = false) => {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step, answers: ans, completed }),
      });
    },
    [],
  );

  const step = STEPS[current];
  const selectedValue = answers[step?.key] ?? null;

  const handleSelect = async (value: string) => {
    const newAnswers = { ...answers, [step.key]: value };
    setAnswers(newAnswers);
    if (current < TOTAL - 1) {
      await saveProgress(current + 1, newAnswers);
      setTimeout(() => { setDirection(1); setCurrent((c) => c + 1); }, 300);
    }
  };

  const goBack = () => {
    if (current > 0) { setDirection(-1); setCurrent((c) => c - 1); }
  };

  const skipStep = async () => {
    await saveProgress(current + 1, answers);
    setDirection(1);
    setCurrent((c) => c + 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    await saveProgress(TOTAL, answers, true);
    router.replace("/dashboard");
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-[2.5px] border-[#4F46E5]/20 border-t-[#4F46E5] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "linear-gradient(180deg, #FAFAF9 0%, #F3F2EE 100%)" }}>

      {/* ── Fond décoratif ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid subtile */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #4F46E5 0.8px, transparent 0.8px)", backgroundSize: "28px 28px" }} />
        {/* Glow principal */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(ellipse, #4F46E5 0%, transparent 70%)" }} />
        {/* Glow secondaire */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(ellipse, #7C3AED 0%, transparent 70%)" }} />
      </div>

      {/* ══════════════ HEADER ══════════════ */}
      <header className="relative z-10 w-full max-w-[640px] mx-auto px-6 pt-8 sm:pt-12 pb-2">
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center shadow-sm shadow-[#4F46E5]/20">
              <span className="text-white text-[13px] font-extrabold tracking-tight">J</span>
            </div>
            <span className="text-[17px] font-bold text-[#191919] tracking-tight">Jestly</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-[#B0B0AE] uppercase tracking-wider">
              Étape {current + 1}/{TOTAL}
            </span>
          </div>
        </div>

        {/* Progress bar premium */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-[#E6E6E4]/80">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)" }}
                initial={{ width: i < current ? "100%" : "0%" }}
                animate={{ width: i <= current ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease }}
              />
            </div>
          ))}
        </div>

        {/* Micro-label */}
        <div className="flex items-center justify-center mt-4 mb-1">
          <span className="text-[10px] font-medium text-[#B0B0AE] tracking-wide uppercase">
            Configuration rapide — 30 secondes
          </span>
        </div>
      </header>

      {/* ══════════════ CONTENU ══════════════ */}
      <div className="relative z-10 flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 pb-24">
        <motion.div
          className="w-full max-w-[580px] bg-white/80 backdrop-blur-sm border border-[#E6E6E4]/70 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-10"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 30, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: direction * -30, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease }}
            >
              {/* ── Titre + sous-titre ── */}
              <div className="text-center mb-8">
                <h1 className="text-[21px] sm:text-[25px] font-bold text-[#191919] tracking-tight leading-snug mb-2.5">
                  {step.title}
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[#8A8A88] leading-relaxed max-w-sm mx-auto">
                  {step.subtitle}
                </p>
              </div>

              {/* ── Options : choix simple ── */}
              {step.type === "single" ? (
                <div className={`grid gap-2.5 ${step.options.length > 6 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {step.options.map((opt) => {
                    const isSelected = selectedValue === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[#4F46E5] bg-[#4F46E5]/[0.05] shadow-[0_0_0_1px_#4F46E5,0_2px_12px_rgba(79,70,229,0.1)]"
                            : "border-[#EBEBEA] bg-white hover:border-[#D0D0CE]"
                        }`}
                      >
                        {/* Icône */}
                        {opt.icon && (
                          <span className={`text-[15px] w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-200 ${
                            isSelected
                              ? "bg-[#4F46E5]/10"
                              : "bg-[#F7F7F5] group-hover:bg-[#F0F0EE]"
                          }`}>
                            {opt.icon}
                          </span>
                        )}
                        {/* Label */}
                        <span className={`text-[13px] sm:text-[14px] font-medium transition-colors flex-1 ${
                          isSelected ? "text-[#4F46E5]" : "text-[#191919]"
                        }`}>
                          {opt.label}
                        </span>
                        {/* Check */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="w-5 h-5 rounded-full bg-[#4F46E5] flex items-center justify-center flex-shrink-0"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                /* ── Options : toggle oui/non ── */
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  {step.options.map((opt) => {
                    const isSelected = selectedValue === opt.value;
                    const isYes = opt.value === "true";
                    return (
                      <motion.button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-between px-5 py-4.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[#4F46E5] bg-[#4F46E5]/[0.05] shadow-[0_0_0_1px_#4F46E5,0_2px_12px_rgba(79,70,229,0.1)]"
                            : "border-[#EBEBEA] bg-white hover:border-[#D0D0CE]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] transition-all ${
                            isSelected ? "bg-[#4F46E5]/10" : "bg-[#F7F7F5]"
                          }`}>
                            {isYes ? "✨" : "🚫"}
                          </span>
                          <span className={`text-[14px] font-medium ${isSelected ? "text-[#4F46E5]" : "text-[#191919]"}`}>
                            {opt.label}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-[#4F46E5] bg-[#4F46E5]" : "border-[#D0D0CE]"
                        }`}>
                          {isSelected && (
                            <motion.svg
                              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </motion.svg>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation intégrée ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F0F0EE]">
            {/* Retour */}
            {current > 0 ? (
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer group"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Retour
              </button>
            ) : (
              <div />
            )}

            {/* Zone droite */}
            <div className="flex items-center gap-4">
              {/* Skip */}
              {current < TOTAL - 1 && (
                <button
                  onClick={skipStep}
                  className="text-[12px] font-medium text-[#B0B0AE] hover:text-[#8A8A88] transition-colors cursor-pointer"
                >
                  Passer
                </button>
              )}

              {/* Terminer (dernière étape) */}
              {current === TOTAL - 1 && selectedValue !== null && (
                <motion.button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex items-center gap-2 text-[13px] font-semibold text-white px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)", boxShadow: "0 1px 2px rgba(79,70,229,0.3), 0 4px 12px rgba(79,70,229,0.15)" }}
                  whileHover={{ scale: 1.02, boxShadow: "0 1px 2px rgba(79,70,229,0.3), 0 6px 20px rgba(79,70,229,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {saving ? (
                    <>
                      <motion.span
                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Un instant…
                    </>
                  ) : (
                    <>
                      Accéder à Jestly
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </>
                  )}
                </motion.button>
              )}

              {/* Skip final */}
              {current === TOTAL - 1 && selectedValue === null && (
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="text-[12px] font-medium text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
                >
                  Passer et commencer →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Footer discret ── */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-[10px] text-[#C0C0BE]">
          Vous pourrez modifier ces informations plus tard dans les paramètres.
        </p>
      </div>
    </div>
  );
}
