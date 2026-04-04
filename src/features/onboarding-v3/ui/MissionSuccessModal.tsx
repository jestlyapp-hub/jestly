"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "../engine/guide-engine";
import { ExternalLink, ShoppingCart, Users } from "lucide-react";
import { useModalBehavior } from "./use-modal-behavior";

// ═══════════════════════════════════════════════════════════════════
// Mission Success Modal — Shown ONLY after completing the LAST chapter
// in the current session. Never shown on page load / navigation.
// ═══════════════════════════════════════════════════════════════════

const SHOWN_KEY = "jestly_guide_v3_success_shown";

export default function MissionSuccessModal() {
  const { isDone, account, close } = useGuide();
  const [visible, setVisible] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const wasDoneRef = useRef(isDone);

  const dismiss = useCallback(() => {
    setVisible(false);
    close();
  }, [close]);

  // Focus trap + scroll lock
  const modalRef = useModalBehavior(visible, dismiss);

  useEffect(() => {
    if (isDone && !wasDoneRef.current) {
      let alreadyShown = false;
      try { alreadyShown = !!sessionStorage.getItem(SHOWN_KEY); } catch {}
      if (!alreadyShown) {
        const t = setTimeout(() => {
          setVisible(true);
          setConfettiPieces(generateConfetti(40));
          try { sessionStorage.setItem(SHOWN_KEY, "1"); } catch {}
        }, 300);
        return () => clearTimeout(t);
      }
    }
    wasDoneRef.current = isDone;
  }, [isDone]);

  const siteUrl = account.siteId
    ? `/s/${account.siteId}`
    : null;

  return (
    <AnimatePresence>
      {visible && (
        <div ref={modalRef} className="fixed inset-0 z-[90] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{ y: -20, x: piece.x, opacity: 1, rotate: 0 }}
              animate={{
                y: window.innerHeight + 20,
                x: piece.x + piece.drift,
                opacity: 0,
                rotate: piece.rotation,
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeIn" as const,
              }}
              className="fixed top-0 z-[91] pointer-events-none"
              style={{
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: 2,
              }}
            />
          ))}

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-success-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-[92] bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            {/* Header gradient */}
            <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] px-6 py-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.div>
              <h2 id="guide-success-title" className="text-xl font-bold">Bravo, ton espace Jestly est prêt</h2>
              <p className="text-white/80 text-sm mt-1.5 leading-relaxed">
                Tu as terminé la configuration de départ.<br />
                Tu peux maintenant créer ton premier service, ajouter un client et commencer à utiliser Jestly.
              </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {siteUrl && (
                <div className="bg-[#F7F7F5] rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-[13px] text-[#5A5A58] truncate">
                    jestly.fr{siteUrl}
                  </span>
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                    aria-label="Ouvrir le site dans un nouvel onglet"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              )}

              <div className="space-y-2">
                {siteUrl && (
                  <a
                    href={siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] text-white text-[13px] font-semibold hover:bg-[#4338CA] transition-colors"
                  >
                    <ExternalLink size={14} />
                    Voir mon site
                  </a>
                )}
                <div className="flex gap-2">
                  <a
                    href="/produits"
                    onClick={dismiss}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#E6E6E4] text-[12px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <ShoppingCart size={13} />
                    Créer mon premier service
                  </a>
                  <a
                    href="/clients"
                    onClick={dismiss}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#E6E6E4] text-[12px] font-medium text-[#5A5A58] hover:bg-[#F7F7F5] transition-colors"
                  >
                    <Users size={13} />
                    Ajouter un client
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <button
                onClick={dismiss}
                className="w-full text-center text-[12px] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
              >
                Commencer à utiliser Jestly
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Confetti ──────────────────────────────────────────────────────

interface ConfettiPiece {
  id: number;
  x: number;
  drift: number;
  rotation: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
}

const CONFETTI_COLORS = [
  "#4F46E5", "#7C3AED", "#EC4899", "#F59E0B",
  "#10B981", "#0EA5E9", "#EF4444", "#8B5CF6",
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * window.innerWidth,
    drift: (Math.random() - 0.5) * 200,
    rotation: Math.random() * 720 - 360,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 0.8,
    size: 6 + Math.random() * 6,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }));
}
