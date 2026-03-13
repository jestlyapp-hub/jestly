"use client";

import { Check } from "lucide-react";
import type { ProfileData } from "./shared";
import { SectionCard } from "./shared";

const FREE_FEATURES = [
  "10 commandes / mois",
  "1 site public",
  "Facturation basique",
  "Tableau de bord",
];

const PRO_FEATURES = [
  "Commandes illimitées",
  "Sites publics illimités",
  "Facturation avancée + exports",
  "Automatisations & intégrations",
  "Support prioritaire",
  "Domaine personnalisé",
];

export function SubscriptionSection({ profile }: {
  profile: ProfileData;
}) {
  const isPro = profile.plan === "pro";

  return (
    <SectionCard id="abonnement" title="Abonnement" description="Gérez votre plan et votre facturation.">
      <div className="space-y-5">
        <div className={`rounded-xl border-2 p-5 ${isPro ? "border-[#7C3AED] bg-[#FAFAFF]" : "border-[#E6E6E4] bg-[#FAFAF9]"}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-[#1A1A1A]">
                  {isPro ? "Plan Pro" : "Plan Free"}
                </span>
                {isPro && (
                  <span className="text-[10px] font-semibold text-white bg-[#7C3AED] px-2 py-0.5 rounded-full">ACTIF</span>
                )}
              </div>
              <p className="text-[13px] text-[#A8A29E] mt-0.5">
                {isPro ? "7 €/mois — Accès complet" : "Gratuit — Limité à 10 commandes/mois"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {(isPro ? PRO_FEATURES : FREE_FEATURES).map(f => (
              <div key={f} className="flex items-center gap-2 text-[13px] text-[#57534E]">
                <Check size={14} className={isPro ? "text-[#7C3AED]" : "text-[#A8A29E]"} />
                {f}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {isPro ? (
            <div className="flex items-center gap-2 text-[13px] text-[#A8A29E]">
              <span className="text-[10px] font-semibold bg-[#F5F5F4] px-2 py-0.5 rounded-full">Gestion via Stripe — bientôt</span>
            </div>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-5 py-2.5 rounded-lg opacity-60 cursor-not-allowed shadow-sm shadow-[#7C3AED]/20"
              title="Bientôt disponible"
            >
              Passer au Pro — 7 €/mois
              <span className="text-[10px] font-normal ml-1 opacity-80">(bientôt)</span>
            </button>
          )}
        </div>

        {isPro && profile.stripe_subscription_id && (
          <p className="text-[11px] text-[#C4C4C2]">
            ID abonnement: {profile.stripe_subscription_id}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
