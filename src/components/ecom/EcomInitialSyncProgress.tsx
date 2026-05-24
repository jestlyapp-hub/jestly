"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Package, ShoppingCart, Users, BarChart3 } from "lucide-react";

interface Props {
  progress: Record<string, { synced: number; completed?: boolean }>;
}

const STEPS: { key: string; label: string; icon: typeof Package }[] = [
  { key: "orders", label: "Commandes (90 derniers jours)", icon: ShoppingCart },
  { key: "products", label: "Produits", icon: Package },
  { key: "customers", label: "Clients", icon: Users },
  { key: "analytics", label: "Analytics journalières", icon: BarChart3 },
];

export default function EcomInitialSyncProgress({ progress }: Props) {
  const completedCount = STEPS.filter((s) => progress[s.key]?.completed).length;
  const pct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="max-w-xl mx-auto pt-16 pb-20 px-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EEFF] flex items-center justify-center mx-auto mb-4">
          <Loader2 className="text-[#7C3AED] animate-spin" size={26} />
        </div>
        <h1 className="text-[22px] font-bold text-[#191919] tracking-tight mb-1">Import en cours</h1>
        <p className="text-[13px] text-[#8A8A88]">
          Nous chargeons l&apos;historique de votre boutique. Restez sur cette page, c&apos;est rapide.
        </p>
      </motion.div>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const item = progress[step.key];
          const completed = item?.completed ?? false;
          const synced = item?.synced ?? 0;
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="flex items-center gap-3 p-3 rounded-xl border border-[#E6E6E4] bg-white"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                completed ? "bg-emerald-50 text-emerald-600" : "bg-[#F7F7F5] text-[#8A8A88]"
              }`}>
                {completed ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[#191919]">{step.label}</div>
                <div className="text-[11px] text-[#8A8A88]">
                  {completed ? `${synced} synchronisés` : "En attente…"}
                </div>
              </div>
              {!completed && <Loader2 className="text-[#7C3AED] animate-spin" size={14} />}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-[#5A5A58]">Progression</span>
          <span className="text-[11px] font-semibold text-[#7C3AED]">{pct}%</span>
        </div>
        <div className="h-1.5 bg-[#F7F7F5] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-[#7C3AED]"
          />
        </div>
      </div>
    </div>
  );
}
