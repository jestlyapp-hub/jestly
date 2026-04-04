"use client";

import { Check } from "lucide-react";
import type { ProfileData } from "./shared";
import { SectionCard } from "./shared";
import { useTrack } from "@/lib/hooks/use-track";
import { isBetaOpenAccess } from "@/lib/beta";

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

const BETA_FEATURES = [
  "Toutes les fonctionnalités",
  "Sites illimités",
  "Commandes illimitées",
  "Projets illimités",
  "Exports et analytics",
  "Aucune restriction",
];

export function SubscriptionSection({ profile }: {
  profile: ProfileData;
}) {
  const isPro = profile.plan === "pro";
  const track = useTrack();
  const beta = isBetaOpenAccess();

  return (
    <SectionCard id="abonnement" title="Abonnement" description={beta ? "Les abonnements arrivent bientôt." : "Gérez votre plan et votre facturation."}>
      <div className="space-y-5">
        {beta ? (
          <div className="rounded-xl border-2 border-[#4F46E5] bg-[#FAFAFF] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#191919]">Bêta ouverte</span>
                  <span className="text-[10px] font-semibold text-white bg-[#4F46E5] px-2 py-0.5 rounded-full">ACCÈS COMPLET</span>
                </div>
                <p className="text-[13px] text-[#A8A29E] mt-0.5">
                  Gratuit — Toutes les fonctionnalités incluses
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {BETA_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2 text-[13px] text-[#57534E]">
                  <Check size={14} className="text-[#4F46E5]" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`rounded-xl border-2 p-5 ${isPro ? "border-[#7C3AED] bg-[#FAFAFF]" : "border-[#E6E6E4] bg-[#FAFAF9]"}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[#191919]">
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
        )}

        {!beta && (
          <div className="flex gap-3">
            {isPro ? (
              <div className="flex items-center gap-2 text-[13px] text-[#A8A29E]">
                <span className="text-[10px] font-semibold bg-[#F5F5F4] px-2 py-0.5 rounded-full">Gestion via Stripe — bientôt</span>
              </div>
            ) : (
              <a
                href="mailto:support@jestly.fr?subject=Upgrade%20Pro"
                onClick={() => track("upgrade_clicked", { source: "settings" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#7C3AED] px-5 py-2.5 rounded-lg hover:bg-[#6D28D9] transition-colors shadow-sm shadow-[#7C3AED]/20"
              >
                Passer au Pro — 7 €/mois
              </a>
            )}
          </div>
        )}

        {!beta && isPro && profile.stripe_subscription_id && (
          <p className="text-[11px] text-[#C4C4C2]">
            ID abonnement: {profile.stripe_subscription_id}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
