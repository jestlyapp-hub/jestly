"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  type ResourceKey,
  type FeatureKey,
  type PlanId,
  PLANS,
  RESOURCE_LABELS,
  FEATURE_LABELS,
  formatLimit,
  minimumPlanFor,
  minimumPlanForLimit,
} from "@/lib/plans";
import { useSubscription } from "@/lib/hooks/use-subscription";

/* ══════════════════════════════════════════════════════════════
   UpgradeGate — Composant de blocage / upsell premium

   Deux modes :
   1. resource="orders_per_month" → vérifie un quota numérique
   2. feature="analytics_exports" → vérifie un feature flag

   Si l'accès est accordé, rend children normalement.
   Si bloqué, affiche un CTA d'upgrade contextuel premium.

   Usage :
     <UpgradeGate resource="orders_per_month">
       <CreateOrderButton />
     </UpgradeGate>

     <UpgradeGate feature="analytics_exports">
       <ExportButton />
     </UpgradeGate>

     <UpgradeGate resource="orders_per_month" mode="inline">
       ...affiche un bandeau inline au lieu de remplacer
     </UpgradeGate>
   ══════════════════════════════════════════════════════════════ */

interface UpgradeGateProps {
  resource?: ResourceKey;
  feature?: FeatureKey;
  /** "replace" remplace le children. "inline" affiche un bandeau au-dessus. */
  mode?: "replace" | "inline";
  children: ReactNode;
}

export default function UpgradeGate({ resource, feature, mode = "replace", children }: UpgradeGateProps) {
  const { entitlements, loading } = useSubscription();

  if (loading) return <>{children}</>;

  let blocked = false;
  let upgradePlan: PlanId = "pro";
  let message = "";
  let counter = "";

  if (resource) {
    const ent = entitlements.resources[resource];
    if (!ent.canCreate) {
      blocked = true;
      upgradePlan = minimumPlanForLimit(resource, ent.current + 1);
      const label = RESOURCE_LABELS[resource];
      counter = `${ent.current}/${formatLimit(ent.limit)}`;
      message = `${counter} ${label} utilisé${ent.current > 1 ? "s" : ""}`;
    }
  }

  if (feature) {
    if (!entitlements.features[feature]) {
      blocked = true;
      upgradePlan = minimumPlanFor(feature);
      message = `${FEATURE_LABELS[feature]} — disponible avec ${PLANS[upgradePlan].name}`;
    }
  }

  if (!blocked) return <>{children}</>;

  const plan = PLANS[upgradePlan];
  const ctaLabel = upgradePlan === "business" ? "Passer Business" : "Passer Pro";

  const gate = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#E8E5F0] bg-gradient-to-br from-[#FAFAFF] to-[#F5F3FF] p-5"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#F0EEFF] flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          {/* Counter badge */}
          {counter && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-[11px] font-semibold mb-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {counter}
            </div>
          )}

          <p className="text-[13px] font-semibold text-[#191919] mb-1">{message}</p>
          <p className="text-[12px] text-[#78716C] mb-3">
            Passez au plan {plan.name} pour débloquer{resource ? ` jusqu'à ${formatLimit(plan.limits[resource])} ${RESOURCE_LABELS[resource].toLowerCase()}` : ` ${feature ? FEATURE_LABELS[feature].toLowerCase() : "cette fonctionnalité"}`}.
          </p>

          <a
            href="/abonnement"
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {ctaLabel} — {plan.monthlyPrice} € / mois
          </a>
        </div>
      </div>
    </motion.div>
  );

  if (mode === "inline") {
    return (
      <>
        {gate}
        <div className="opacity-50 pointer-events-none select-none">{children}</div>
      </>
    );
  }

  return gate;
}

/* ══════════════════════════════════════════════════════════════
   QuotaBar — Barre de progression de quota

   Usage :
     <QuotaBar resource="orders_per_month" />
   ══════════════════════════════════════════════════════════════ */

export function QuotaBar({ resource, className = "" }: { resource: ResourceKey; className?: string }) {
  const { entitlements, loading } = useSubscription();
  if (loading) return null;

  const ent = entitlements.resources[resource];
  if (ent.limit === -1) return null; // pas de barre pour illimité

  const pct = Math.min(100, Math.round((ent.current / ent.limit) * 100));
  const isWarning = pct >= 80;
  const isFull = pct >= 100;

  return (
    <div className={`text-[11px] ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#78716C]">{RESOURCE_LABELS[resource]}</span>
        <span className={`font-semibold tabular-nums ${isFull ? "text-red-500" : isWarning ? "text-amber-600" : "text-[#191919]"}`}>
          {ent.current}/{formatLimit(ent.limit)}
        </span>
      </div>
      <div className="h-1.5 bg-[#F0F0EE] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isFull ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-[#7C3AED]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
