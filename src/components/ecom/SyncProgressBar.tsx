"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

export interface SyncCounts {
  ad_accounts: number;
  campaigns: number;
  ad_groups: number;
  ads: number;
  metrics_rows: number;
}

interface Props {
  counts: SyncCounts;
  done?: boolean;
  label?: string;
}

export default function SyncProgressBar({ counts, done = false, label }: Props) {
  const items = [
    { label: "Ad accounts", value: counts.ad_accounts },
    { label: "Campagnes", value: counts.campaigns },
    { label: "Ad groups", value: counts.ad_groups },
    { label: "Annonces", value: counts.ads },
    { label: "Métriques", value: counts.metrics_rows },
  ];
  const allZero = items.every((i) => i.value === 0);

  return (
    <div className="bg-white border border-[#E6E6E4] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {done ? (
          <CheckCircle2 size={14} className="text-emerald-600" />
        ) : (
          <Loader2 size={14} className="text-[#7C3AED] animate-spin" />
        )}
        <span className="text-[12px] font-semibold text-[#191919]">
          {label ?? (done ? "Sync terminé" : "Sync en cours…")}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FBFBFA] border border-[#EFEFEF] rounded-md p-2 text-center"
          >
            <div className={`text-[15px] font-bold tabular-nums ${item.value > 0 ? "text-[#7C3AED]" : "text-[#8A8A88]"}`}>
              {item.value.toLocaleString("fr-FR")}
            </div>
            <div className="text-[10px] text-[#8A8A88] mt-0.5">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {!done && allZero && (
        <p className="text-[11px] text-[#8A8A88] mt-2 text-center">Récupération de la première page…</p>
      )}
    </div>
  );
}
