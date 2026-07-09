"use client";

/**
 * Tiroir « À regarder » : barre compacte cliquable (💡 X insights · Y € d'impact)
 * qui déplie/replie le détail. Replié par défaut, état persisté par user.
 * Animation d'ouverture douce (hauteur, ease-out) respectant prefers-reduced-
 * motion. Chaque insight garde icône, montant d'impact et flèche vers la vue
 * pré-filtrée ; priorisés par impact €.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, ChevronDown } from "lucide-react";
import { InsightCard } from "@/components/ecom/premium/InsightCard";
import { formatCurrency } from "@/lib/ads/formatters";
import { useEcomPref } from "@/components/ecom/EcomPrefsProvider";
import type { Insight } from "@/lib/gads/insights";

const NATURE: Record<Insight["severity"], "loss" | "data" | "opportunity"> = {
  critical: "loss",
  warning: "data",
  info: "opportunity",
};

export default function InsightsDrawer({ insights }: { insights: Insight[] }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useEcomPref<boolean>("insights_open", false);
  if (insights.length === 0) return null;

  const sorted = [...insights].sort((a, b) => b.impact_cents - a.impact_cents);
  const totalImpact = sorted.reduce((s, i) => s + Math.max(0, i.impact_cents), 0);

  return (
    <div className="bg-[var(--ecom-surface-1)] border border-[var(--ecom-card-border)] rounded-[var(--ecom-r-md)] shadow-[var(--ecom-shadow-sm)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ecom-brand-violet)] rounded-[var(--ecom-r-md)]"
      >
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--ecom-violet-light)] text-[var(--ecom-brand-violet)] shrink-0">
          <Lightbulb size={14} />
        </span>
        <span className="text-[13px] font-bold text-[var(--ecom-navy)]">À regarder</span>
        <span className="text-[12px] text-[var(--ecom-muted)]">
          {sorted.length} insight{sorted.length > 1 ? "s" : ""}
          {totalImpact > 0 && <> · <span className="font-semibold text-[var(--ecom-navy)] ecom-tnum">{formatCurrency(totalImpact)}</span> d&apos;impact potentiel</>}
        </span>
        <motion.span
          className="ml-auto text-[var(--ecom-muted)]"
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.2 }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
              {sorted.map((ins) => (
                <InsightCard
                  key={ins.id}
                  nature={NATURE[ins.severity]}
                  message={ins.message}
                  impact={ins.impact_cents > 0 ? formatCurrency(ins.impact_cents) : undefined}
                  href={ins.href}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aperçu compact quand replié : le 1er insight critique, cliquable pour ouvrir. */}
      {!open && (
        <button onClick={() => setOpen(true)} className="w-full text-left px-4 pb-2.5 -mt-1">
          <span className="text-[11px] text-[var(--ecom-muted)] line-clamp-1">
            {sorted[0].message}
          </span>
        </button>
      )}
    </div>
  );
}
