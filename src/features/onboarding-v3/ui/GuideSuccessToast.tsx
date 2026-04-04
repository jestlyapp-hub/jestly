"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGuide } from "../engine/guide-engine";
import { Check } from "lucide-react";

/**
 * Micro-confirmation premium affichée brièvement quand une section
 * de type "recap" / "success" est atteinte.
 *
 * Non bloquant — disparaît automatiquement après 2.5s.
 * Positionné en bas-centre, au-dessus de tout.
 */

const SUCCESS_MESSAGES: Record<string, string> = {
  create_site_done: "Site créé",
  brief_done: "Brief créé",
  product_done: "Produit + Brief liés",
  builder_product_visible: "Bloc de vente ajouté",
  pub_done: "Site publié",
  final: "Guide terminé",
};

export default function GuideSuccessToast() {
  const { step, isActive } = useGuide();
  const [toast, setToast] = useState<string | null>(null);
  const lastShownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isActive || !step) return;

    const message = SUCCESS_MESSAGES[step.id];
    if (!message) return;

    // Ne pas réafficher le même toast
    if (lastShownRef.current === step.id) return;
    lastShownRef.current = step.id;

    setToast(message);
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [isActive, step?.id, step]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-2.5 bg-white border border-[#E6E6E4] rounded-xl px-4 py-2.5 shadow-lg shadow-black/5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Check size={11} className="text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-semibold text-[#191919] whitespace-nowrap">
              {toast}
            </span>
            {/* Barre de progression qui se vide */}
            <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-[#F0F0EE]">
              <motion.div
                className="h-full bg-emerald-400 rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
