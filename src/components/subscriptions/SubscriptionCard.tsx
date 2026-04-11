"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Subscription } from "@/types/subscription";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/types/subscription";
import {
  monthlyAmount,
  yearlyAmount,
  daysUntilBilling,
  nextBillingDate,
  isUrgent,
  isDormant,
  healthScore,
  costInWorkDays,
} from "@/lib/subscriptions/helpers";
import { useSubscriptionLogo } from "@/lib/hooks/use-subscription-logo";
import { AlertTriangle, Clock } from "lucide-react";

// ── Logo avec auto-detection + fallback ──────────────────────────

function SubLogo({ sub }: { sub: Subscription }) {
  const { logoUrl, isFallback, isLoading, fallback } = useSubscriptionLogo(sub.name, sub.domain);
  const [imgError, setImgError] = useState(false);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-xl skeleton-shimmer flex-shrink-0" />
    );
  }

  // Logo trouvé (Clearbit ou auto-guess)
  if (logoUrl && !isFallback && !imgError) {
    return (
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#F0F0EE] flex items-center justify-center flex-shrink-0">
        <Image
          src={logoUrl}
          alt={sub.name}
          width={28}
          height={28}
          className="object-contain"
          unoptimized
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback : lettre + gradient
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-[15px] font-bold shadow-sm"
      style={{ background: fallback.background }}
    >
      {fallback.letter}
    </div>
  );
}

// ── Badge urgence ────────────────────────────────────────────────

function UrgencyBadge({ days }: { days: number }) {
  if (days > 7) return null;
  if (days <= 3) {
    return (
      <motion.span
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"
      >
        <AlertTriangle size={10} /> {days <= 0 ? "Aujourd'hui" : `${days}j`}
      </motion.span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <Clock size={10} /> {days}j
    </span>
  );
}

// ── Carte principale ─────────────────────────────────────────────

interface SubscriptionCardProps {
  sub: Subscription;
  onClick?: () => void;
}

export default function SubscriptionCard({ sub, onClick }: SubscriptionCardProps) {
  const [hovered, setHovered] = useState(false);
  const monthly = monthlyAmount(sub);
  const days = daysUntilBilling(sub);
  const urgent = isUrgent(sub);
  const dormant = isDormant(sub);
  const score = healthScore(sub);
  const catConfig = CATEGORY_CONFIG[sub.category];
  const statusConfig = STATUS_CONFIG[sub.status];

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-300 ${
        urgent
          ? "border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.08)]"
          : "border-[#E6E6E4] hover:border-[#D0D0CE] hover:shadow-lg"
      }`}
      style={{
        boxShadow: hovered
          ? `0 8px 32px rgba(124, 58, 237, 0.08), 0 0 0 1px rgba(124, 58, 237, 0.05)`
          : undefined,
      }}
    >
      {/* Accent top line */}
      <div className="h-0.5" style={{ background: catConfig.color }} />

      <div className="p-4">
        {/* Header : logo + name + price */}
        <div className="flex items-start gap-3 mb-3">
          <SubLogo sub={sub} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-semibold text-[#191919] truncate">{sub.name}</h3>
              {sub.status === "to_cancel" && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full"
                >
                  À résilier
                </motion.span>
              )}
            </div>
            <p className="text-[12px] text-[#8A8A88]">{sub.domain || catConfig.label}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[16px] font-bold text-[#191919]">{monthly.toFixed(0)}€</p>
            <p className="text-[10px] text-[#AAA]">/mois</p>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
            style={{ color: catConfig.color, borderColor: `${catConfig.color}30`, backgroundColor: `${catConfig.color}08` }}
          >
            {catConfig.icon} {catConfig.label}
          </span>
          {sub.is_tax_deductible && (
            <span className="text-[10px] font-medium text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
              Déductible
            </span>
          )}
          <UrgencyBadge days={days} />
          {dormant && sub.status === "active" && (
            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
              Dormant
            </span>
          )}
        </div>

        {/* Expanded details on hover */}
        <motion.div
          initial={false}
          animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-2 mt-2 border-t border-[#F0F0EE] grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#AAA]">Coût annuel</span>
              <p className="font-semibold text-[#191919]">{yearlyAmount(sub).toFixed(0)}€</p>
            </div>
            <div>
              <span className="text-[#AAA]">Prochain paiement</span>
              <p className="font-semibold text-[#191919]">
                {nextBillingDate(sub).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div>
              <span className="text-[#AAA]">Coût en temps</span>
              <p className="font-semibold text-[#191919]">{costInWorkDays(sub)} jour{costInWorkDays(sub) !== 1 ? "s" : ""}</p>
            </div>
            <div>
              <span className="text-[#AAA]">Score santé</span>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${score}%`,
                      backgroundColor: score > 70 ? "#10B981" : score > 40 ? "#F59E0B" : "#EF4444",
                    }}
                  />
                </div>
                <span className="font-semibold text-[#191919]">{score}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
