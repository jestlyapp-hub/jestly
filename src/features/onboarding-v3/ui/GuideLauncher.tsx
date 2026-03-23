"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "../engine/guide-engine";
import { GraduationCap, ArrowRight, X } from "lucide-react";

const DISMISS_KEY = "jestly_guide_v3_launch_dismissed";

/**
 * Modal affiché UNE SEULE FOIS à la création du compte.
 * Ne se réaffiche JAMAIS après dismiss (persisté en localStorage).
 */
export default function GuideLauncher() {
  const { start, isActive, isDone } = useGuide();
  const [showModal, setShowModal] = useState(false);
  const hasChecked = useRef(false);

  // Check ONE TIME on mount — never re-trigger on navigation
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Already active or completed — don't show
    if (isActive || isDone) return;

    // Already dismissed — don't show
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    // Show after short delay
    const t = setTimeout(() => setShowModal(true), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = () => {
    setShowModal(false);
    localStorage.setItem(DISMISS_KEY, "1");
    start();
  };

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  // Escape to close
  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleDismiss(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showModal]);

  return (
    <AnimatePresence>
      {showModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[95]"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" as const }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[96] w-full max-w-md"
          >
            <div className="relative bg-white rounded-2xl border border-[#E6E6E4] shadow-2xl p-8 text-center mx-4">
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#CCCCCC] hover:text-[#8A8A88] hover:bg-[#F7F7F5] transition-all cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                <GraduationCap size={32} className="text-[#4F46E5]" strokeWidth={1.5} />
              </div>

              <h2 className="text-xl font-bold text-[#191919] tracking-[-0.01em] mb-2">
                Découvrez Jestly pas à pas
              </h2>
              <p className="text-[14px] text-[#5A5A58] leading-relaxed mb-2">
                Un guide interactif vous accompagne pour créer votre site, vos offres et comprendre le cycle de commande.
              </p>
              <p className="text-[12px] text-[#8A8A88] mb-6">
                5 minutes pour tout maîtriser.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleStart}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#4F46E5] text-white text-[14px] font-semibold shadow-sm hover:bg-[#4338CA] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Lancer le guide
                  <ArrowRight size={16} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full text-[13px] text-[#8A8A88] hover:text-[#5A5A58] py-2.5 transition-colors cursor-pointer"
                >
                  Je préfère explorer seul
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
