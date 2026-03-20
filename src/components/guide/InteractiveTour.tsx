"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TourStep {
  title: string;
  description: string;
  targetX: number;
  targetY: number;
}

interface InteractiveTourProps {
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}

export default function InteractiveTour({
  steps,
  open,
  onClose,
}: InteractiveTourProps) {
  const [current, setCurrent] = useState(0);

  // Reset when opened
  useEffect(() => {
    if (open) setCurrent(0);
  }, [open]);

  const handleNext = useCallback(() => {
    if (current < steps.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onClose();
    }
  }, [current, steps.length, onClose]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const step = steps[current];
  if (!step) return null;

  // Tooltip positioning: try to place it near but not overlapping the spotlight
  const tooltipLeft = step.targetX > 50 ? step.targetX - 30 : step.targetX + 8;
  const tooltipTop = step.targetY > 60 ? step.targetY - 28 : step.targetY + 12;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overlay with spotlight hole */}
          <div className="absolute inset-0" onClick={onClose}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <motion.circle
                    r="60"
                    fill="black"
                    animate={{
                      cx: `${step.targetX}%`,
                      cy: `${step.targetY}%`,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut" as const,
                    }}
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.6)"
                mask="url(#spotlight-mask)"
              />
            </svg>
          </div>

          {/* Spotlight ring */}
          <motion.div
            className="absolute w-[120px] h-[120px] rounded-full border-2 border-white/30 pointer-events-none"
            animate={{
              left: `calc(${step.targetX}% - 60px)`,
              top: `calc(${step.targetY}% - 60px)`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" as const }}
          />

          {/* Tooltip card */}
          <motion.div
            className="absolute z-10 w-[320px] bg-white rounded-xl shadow-xl border border-[#E6E6E4] p-5"
            animate={{
              left: `${tooltipLeft}%`,
              top: `${tooltipTop}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" as const }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step counter */}
            <p className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">
              Etape {current + 1} sur {steps.length}
            </p>

            <h3 className="text-[15px] font-bold text-[#191919] mb-1.5">
              {step.title}
            </h3>
            <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-5">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="text-[12px] text-[#8A8A88] hover:text-[#5A5A58] transition-colors cursor-pointer"
              >
                Ignorer
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#4F46E5] text-white text-[13px] font-medium rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer"
              >
                {current < steps.length - 1 ? "Suivant" : "Terminer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
