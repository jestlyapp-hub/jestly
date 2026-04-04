"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApi, apiFetch } from "@/lib/hooks/use-api";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { QuotaBar } from "@/components/ui/UpgradeGate";
import { isBetaOpenAccess } from "@/lib/beta";
import BetaPricingLock from "@/components/ui/BetaPricingLock";

/* ═══════════════════════════════════════════════════════════
   ABONNEMENT — Page de gestion du plan + upgrade in-app
   ═══════════════════════════════════════════════════════════ */

type Plan = "free" | "pro" | "business";

interface ProfileData {
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

/* ── Plans data ── */

interface PlanDef {
  id: Plan;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: { sites: string; commandes: string; projets: string };
  badge?: string;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Starter",
    tagline: "Pour découvrir Jestly",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "CRM basique",
      "Calendrier & tâches",
      "Analytics essentiels",
    ],
    limits: { sites: "1", commandes: "15 / mois", projets: "3" },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour les freelances actifs",
    monthlyPrice: 4.99,
    yearlyPrice: 3.99,
    badge: "Recommandé",
    features: [
      "CRM complet + exports",
      "Devis & factures automatiques",
      "Calendrier avancé",
      "Analytics complets",
      "Application mobile (soon)",
      "Support prioritaire",
    ],
    limits: { sites: "3", commandes: "50 / mois", projets: "Illimités" },
  },
  {
    id: "business",
    name: "Business",
    tagline: "Pour scaler sans limites",
    monthlyPrice: 14.99,
    yearlyPrice: 11.99,
    features: [
      "Domaine personnalisé",
      "White-label complet",
      "Analytics avancés + exports",
      "Automatisations (soon)",
      "Support prioritaire dédié",
      "Accès aux fonctionnalités bêta",
    ],
    limits: { sites: "Illimités", commandes: "Illimitées", projets: "Illimités" },
  },
];

/* ── Comparaison compacte ── */

const COMPARISON_ROWS: { label: string; free: string; pro: string; business: string }[] = [
  { label: "Sites vitrines", free: "1", pro: "3", business: "Illimité" },
  { label: "Commandes / mois", free: "15", pro: "50", business: "Illimité" },
  { label: "Projets", free: "3", pro: "Illimité", business: "Illimité" },
  { label: "CRM complet", free: "—", pro: "✓", business: "✓" },
  { label: "Devis & factures", free: "—", pro: "✓", business: "✓" },
  { label: "Domaine personnalisé", free: "—", pro: "—", business: "✓" },
  { label: "Analytics avancés", free: "—", pro: "✓", business: "✓" },
  { label: "White-label", free: "—", pro: "—", business: "✓" },
  { label: "Support prioritaire", free: "—", pro: "✓", business: "Dédié" },
  { label: "Automatisations", free: "—", pro: "—", business: "✓" },
];

/* ── FAQ ── */

const FAQ = [
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui, l'upgrade ou le downgrade est immédiat. Vos données sont toujours conservées." },
  { q: "Que se passe-t-il si je downgrade ?", a: "Vous gardez toutes vos données. Si vous dépassez les limites du plan inférieur, vous ne pourrez plus en créer de nouvelles." },
  { q: "Comment fonctionne la facturation ?", a: "Vous êtes facturé mensuellement ou annuellement selon votre choix. Aucun engagement, résiliez à tout moment." },
  { q: "Mon paiement est-il sécurisé ?", a: "Oui, tous les paiements sont gérés par Stripe, le leader mondial du paiement en ligne." },
];

/* ── Helpers ── */

function planIndex(plan: Plan): number {
  return plan === "free" ? 0 : plan === "pro" ? 1 : 2;
}

function Check() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function AbonnementPage() {
  const { data: profile, loading, mutate: mutateProfile } = useApi<ProfileData>("/api/settings");
  const { entitlements, planId: subPlanId, refresh: refreshSubscription } = useSubscription();
  const searchParams = useSearchParams();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [syncingAfterCheckout, setSyncingAfterCheckout] = useState(false);
  const syncDone = useRef(false);

  // ── Auto-sync après retour Stripe Checkout ──
  useEffect(() => {
    if (syncDone.current) return;
    const isSuccess = searchParams.get("success") === "true";
    if (!isSuccess) return;
    syncDone.current = true;
    setSyncingAfterCheckout(true);

    // Appeler le resync endpoint puis rafraîchir les données
    const doSync = async () => {
      try {
        await apiFetch("/api/stripe/sync", { method: "POST" });
      } catch (e) {
        console.error("[abonnement] Sync after checkout failed:", e);
      }
      // Rafraîchir les données même si le sync échoue (le webhook a peut-être déjà traité)
      await Promise.all([mutateProfile(), refreshSubscription()]);
      setSyncingAfterCheckout(false);
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/abonnement");
    };
    doSync();
  }, [searchParams, mutateProfile, refreshSubscription]);

  // ── Auto-sync à chaque ouverture si un customer Stripe existe ──
  // Filet de sécurité : si le webhook a raté, on resync depuis Stripe
  const openSyncDone = useRef(false);
  useEffect(() => {
    if (openSyncDone.current || loading || !profile) return;
    if (!profile.stripe_customer_id) return;
    if (searchParams.get("success") === "true") return; // déjà géré par le sync checkout
    openSyncDone.current = true;

    apiFetch("/api/stripe/sync", { method: "POST" })
      .then(() => { mutateProfile(); refreshSubscription(); })
      .catch(() => {});
  }, [loading, profile, searchParams, mutateProfile, refreshSubscription]);

  async function handleUpgrade(targetPlan: "pro" | "business") {
    setCheckoutLoading(targetPlan);
    try {
      const { url } = await apiFetch<{ url: string }>("/api/stripe/checkout", {
        method: "POST",
        body: { plan: targetPlan, yearly: annual },
      });
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutLoading(null);
    }
  }

  async function handleManageSubscription() {
    try {
      const { url } = await apiFetch<{ url: string }>("/api/stripe/portal", { method: "POST" });
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Portal error:", err);
    }
  }

  const beta = isBetaOpenAccess();
  const currentPlan: Plan = (profile?.plan as Plan) || "free";
  const currentIdx = planIndex(currentPlan);
  const currentDef = PLANS[currentIdx];

  if (loading) {
    return (
      <div className="max-w-[960px] mx-auto">
        <div className="h-8 w-48 bg-[#F7F7F5] rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-72 bg-[#F7F7F5] rounded animate-pulse mb-8" />
        <div className="h-48 bg-[#F7F7F5] rounded-xl animate-pulse mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-[#F7F7F5] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto">
      {/* ═══ Bandeau sync post-checkout ═══ */}
      {syncingAfterCheckout && (
        <motion.div
          className="mb-4 flex items-center gap-3 px-5 py-3.5 bg-[#F0EEFF] border border-[#DDD6FE] rounded-xl"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] font-medium text-[#6D28D9]">Activation de votre abonnement en cours…</span>
        </motion.div>
      )}

      {/* ═══ Bandeau Bêta ═══ */}
      {beta && (
        <motion.div
          className="mb-6 rounded-xl border border-[#DDD6FE] bg-gradient-to-r from-[#FAFAFF] to-[#F5F3FF] p-5"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#191919] mb-1">Bêta ouverte — Tout est inclus</h2>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed">
                Pendant la bêta, toutes les fonctionnalités sont accessibles gratuitement et sans limite.
                Les abonnements seront disponibles prochainement.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-[#4F46E5] bg-[#EEF2FF] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
                Accès complet gratuit
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ Header ═══ */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-[22px] font-bold text-[#191919] tracking-tight">Abonnement</h1>
        <p className="text-[13px] text-[#8A8A88] mt-0.5">
          {beta
            ? "Les abonnements arrivent bientôt. En attendant, profitez de tout gratuitement."
            : "Gérez votre plan et débloquez plus de puissance pour votre activité."}
        </p>
      </motion.div>

      {/* ═══ Bloc plan actuel ═══ */}
      <motion.div
        className="bg-white border border-[#E6E6E4] rounded-xl p-6 mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {beta ? (
          /* ── Mode bêta : état simplifié sans prix ni quotas ── */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full">
                  Bêta — Accès complet
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-[#191919] mb-1">Toutes les fonctionnalités incluses</h2>
              <p className="text-[13px] text-[#8A8A88]">
                Aucune limite pendant la bêta. Créez, gérez et développez votre activité librement.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#4F46E5] bg-[#EEF2FF] border border-[#DDD6FE] px-4 py-2 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Gratuit
              </span>
            </div>
          </div>
        ) : (
          /* ── Mode normal : plan actuel + limites + quotas ── */
          <>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-full">
                    Plan actuel
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${
                    currentPlan === "free"
                      ? "text-[#8A8A88] bg-[#F0F0EE]"
                      : "text-emerald-600 bg-emerald-50"
                  }`}>
                    {currentPlan === "free" ? "Gratuit" : "Actif"}
                  </span>
                </div>
                <h2 className="text-[20px] font-bold text-[#191919] mb-1">{currentDef.name}</h2>
                <p className="text-[13px] text-[#8A8A88] mb-4">{currentDef.tagline}</p>

                <div className="flex flex-wrap gap-4">
                  {Object.entries(currentDef.limits).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-[#191919]">{val}</span>
                      <span className="text-[12px] text-[#8A8A88]">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[28px] font-extrabold text-[#191919]">
                    {currentDef.monthlyPrice === 0 ? "0" : `${currentDef.monthlyPrice.toFixed(2).replace(".", ",")}`}
                  </span>
                  <span className="text-[14px] text-[#8A8A88] ml-1">€/mois</span>
                </div>
                {profile?.stripe_subscription_id && (
                  <button
                    onClick={handleManageSubscription}
                    className="text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors cursor-pointer"
                  >
                    Gérer l&apos;abonnement →
                  </button>
                )}
                {currentIdx < 2 && (
                  <a
                    href="#plans"
                    className="text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors mt-1"
                  >
                    Voir les plans supérieurs ↓
                  </a>
                )}
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[#F0F0EE]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B0B0AE] mb-3">Usage actuel</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <QuotaBar resource="orders_per_month" />
                <QuotaBar resource="sites" />
                <QuotaBar resource="active_projects" />
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-[#F0F0EE]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B0B0AE] mb-3">Inclus dans votre plan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {currentDef.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-[#5A5A58]">
                    <Check /> {f}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ═══ Plans disponibles ═══ */}
      {beta ? (
        /* ── Mode bêta : cartes verrouillées sous overlay ── */
        <motion.div id="plans" className="mb-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <BetaPricingLock>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
              {PLANS.map((plan) => (
                <div key={plan.id} className="bg-white rounded-xl border border-[#E6E6E4] p-5">
                  <h3 className="text-[15px] font-bold text-[#191919] mb-0.5">{plan.name}</h3>
                  <p className="text-[11px] text-[#8A8A88] mb-4">{plan.tagline}</p>
                  <div className="text-[30px] font-extrabold text-[#191919] mb-4">••••</div>
                  <div className="h-10 bg-[#F7F7F5] rounded-lg mb-4" />
                  <div className="space-y-2">
                    {plan.features.map((f) => (
                      <div key={f} className="h-3 bg-[#F7F7F5] rounded w-3/4" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </BetaPricingLock>
        </motion.div>
      ) : (
        /* ── Mode normal : cartes de plans actives ── */
        <motion.div
          id="plans"
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-bold text-[#191919]">
                {currentIdx === 2 ? "Tous les plans" : "Débloquez plus de puissance"}
              </h2>
              <p className="text-[12px] text-[#8A8A88] mt-0.5">
                {currentIdx === 2
                  ? "Vous êtes sur le plan le plus complet."
                  : "Passez au niveau supérieur pour centraliser encore plus."}
              </p>
            </div>

            <div className="flex items-center bg-[#F7F7F5] rounded-full p-0.5 border border-[#E6E6E4]">
              <button
                onClick={() => setAnnual(false)}
                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                  !annual ? "bg-white text-[#191919] shadow-sm" : "text-[#8A8A88]"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  annual ? "bg-white text-[#191919] shadow-sm" : "text-[#8A8A88]"
                }`}
              >
                Annuel
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">-20 %</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isUpgrade = planIndex(plan.id) > currentIdx;
              const isRecommended = plan.badge && isUpgrade;
              const price = annual ? plan.yearlyPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl p-5 flex flex-col ${
                    isRecommended
                      ? "border-2 border-[#4F46E5] shadow-lg shadow-[#4F46E5]/[0.06]"
                      : isCurrent
                        ? "border-2 border-[#E6E6E4]"
                        : "border border-[#E6E6E4] hover:shadow-md transition-shadow"
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.08em] bg-[#4F46E5] text-white px-3 py-1 rounded-full shadow-sm">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.08em] bg-[#191919] text-white px-3 py-1 rounded-full">
                        Actuel
                      </span>
                    </div>
                  )}

                  <h3 className={`text-[15px] font-bold mb-0.5 ${isRecommended ? "text-[#4F46E5]" : "text-[#191919]"}`}>{plan.name}</h3>
                  <p className="text-[11px] text-[#8A8A88] mb-4">{plan.tagline}</p>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[30px] font-extrabold text-[#191919] leading-none">
                      {price === 0 ? "0" : price.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[12px] text-[#8A8A88]">€/mois</span>
                  </div>
                  {annual && price > 0 && (
                    <p className="text-[10px] text-emerald-600 font-medium mb-4">
                      {(price * 12).toFixed(2).replace(".", ",")} € / an
                    </p>
                  )}
                  {(!annual || price === 0) && <div className="mb-4" />}

                  {isCurrent ? (
                    <div className="text-center py-2.5 rounded-lg text-[12px] font-semibold text-[#8A8A88] bg-[#F7F7F5] mb-4">Plan actuel</div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.id as "pro" | "business")}
                      disabled={checkoutLoading !== null}
                      className="w-full py-2.5 rounded-lg text-[12px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] transition-colors cursor-pointer mb-4 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {checkoutLoading === plan.id ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirection…</>
                      ) : (
                        `Passer à ${plan.name}`
                      )}
                    </button>
                  ) : (
                    <div className="text-center py-2.5 rounded-lg text-[12px] font-medium text-[#B0B0AE] border border-[#E6E6E4] mb-4">Inclus dans votre plan</div>
                  )}

                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between"><span className="text-[#8A8A88]">Sites</span><span className="font-semibold text-[#191919]">{plan.limits.sites}</span></div>
                    <div className="flex justify-between"><span className="text-[#8A8A88]">Commandes</span><span className="font-semibold text-[#191919]">{plan.limits.commandes}</span></div>
                    <div className="flex justify-between"><span className="text-[#8A8A88]">Projets</span><span className="font-semibold text-[#191919]">{plan.limits.projets}</span></div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#F0F0EE] flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[12px] text-[#5A5A58]"><Check /> {f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ═══ Comparatif compact ═══ */}
      {beta ? (
        <motion.div className="mb-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <BetaPricingLock title="Comparatif disponible prochainement" subtitle="Les détails de chaque plan seront visibles lors du lancement des abonnements.">
            <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 border-b border-[#E6E6E4] bg-[#FAFAF9]">
                <div className="px-4 py-3" />
                <div className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#B0B0AE]">Starter</div>
                <div className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">Pro</div>
                <div className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#B0B0AE]">Business</div>
              </div>
              {COMPARISON_ROWS.slice(0, 5).map((row, i) => (
                <div key={i} className="grid grid-cols-4 border-b border-[#F5F5F3] last:border-b-0">
                  <div className="px-4 py-2.5 text-[12px] text-[#5A5A58]">{row.label}</div>
                  <div className="px-3 py-2.5 text-center text-[12px] text-[#8A8A88]">—</div>
                  <div className="px-3 py-2.5 text-center text-[12px] text-[#8A8A88]">—</div>
                  <div className="px-3 py-2.5 text-center text-[12px] text-[#8A8A88]">—</div>
                </div>
              ))}
            </div>
          </BetaPricingLock>
        </motion.div>
      ) : (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-[17px] font-bold text-[#191919] mb-4">Comparer en détail</h2>
          <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 border-b border-[#E6E6E4] bg-[#FAFAF9]">
              <div className="px-4 py-3" />
              <div className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#B0B0AE]">Starter</div>
              <div className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#4F46E5]">Pro</div>
              <div className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#B0B0AE]">Business</div>
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-4 border-b border-[#F5F5F3] last:border-b-0 hover:bg-[#FAFAF9] transition-colors">
                <div className="px-4 py-2.5 text-[12px] text-[#5A5A58]">{row.label}</div>
                <div className="px-3 py-2.5 text-center text-[12px] text-[#8A8A88] font-medium">{row.free}</div>
                <div className="px-3 py-2.5 text-center text-[12px] font-medium bg-[#4F46E5]/[0.015]">
                  {row.pro === "✓" ? <span className="text-[#4F46E5]">✓</span> : <span className="text-[#5A5A58]">{row.pro}</span>}
                </div>
                <div className="px-3 py-2.5 text-center text-[12px] text-[#8A8A88] font-medium">
                  {row.business === "✓" ? <span className="text-[#4F46E5]">✓</span> : row.business}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ═══ FAQ ═══ */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-[17px] font-bold text-[#191919] mb-4">Questions fréquentes</h2>
        <div className="bg-white border border-[#E6E6E4] rounded-xl overflow-hidden">
          {FAQ.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className={i < FAQ.length - 1 ? "border-b border-[#F0F0EE]" : ""}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer group"
                >
                  <span className="text-[13px] font-semibold text-[#191919] group-hover:text-[#4F46E5] transition-colors pr-4">
                    {item.q}
                  </span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-[#8A8A88] leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══ CTA contextuel final ═══ */}
      <motion.div
        className="text-center pb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        {beta ? (
          <>
            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#191919] mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Profitez de la bêta
            </div>
            <p className="text-[13px] text-[#8A8A88] max-w-md mx-auto">
              Toutes les fonctionnalités sont accessibles gratuitement pendant la bêta.
              La monétisation sera activée plus tard.
            </p>
          </>
        ) : currentIdx === 2 ? (
          <>
            <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#191919] mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Vous êtes sur le plan le plus complet
            </div>
            <p className="text-[12px] text-[#8A8A88]">
              Vous bénéficiez de toutes les fonctionnalités Jestly.
            </p>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-[#191919] mb-3">
              Prêt à passer au niveau supérieur ?
            </p>
            <button className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-[13px] font-semibold px-6 py-3 rounded-lg hover:bg-[#4338CA] transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Passer à {PLANS[currentIdx + 1]?.name || "Pro"}
            </button>
            <p className="text-[11px] text-[#B0B0AE] mt-3">
              Sans engagement · Changement immédiat · Données conservées
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
