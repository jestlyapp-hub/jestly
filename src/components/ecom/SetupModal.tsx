"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface Props {
  /** L'user courant est-il dans la whitelist bêta (calculé server-side via sync-state) ? */
  isBeta: boolean;
  onConnected: () => void;
}

type Step = "intro" | "connecting" | "connected";

export default function SetupModal({ isBeta, onConnected }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  const handleConnectLhorloge = async () => {
    setError(null);
    setStep("connecting");
    try {
      const res = await apiFetch<{ ok: boolean; shop: { name: string }; error?: string }>(
        "/api/integrations/shopify/seed-lhorloge",
        { method: "POST" },
      );
      if (!res.ok) throw new Error(res.error ?? "Échec");
      setShopName(res.shop?.name ?? "L'Horloge Murale");
      setStep("connected");
      toast.success("Lhorlogemurale connectée — import en cours");
      setTimeout(() => onConnected(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStep("intro");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white border border-[#E6E6E4] rounded-2xl shadow-xl p-8"
      >
        <AnimatePresence mode="wait">
          {step === "intro" && isBeta && (
            <motion.div key="intro-gabriel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
                  <Sparkles className="text-[#7C3AED]" size={22} />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-[#191919] tracking-tight">Tour de pilotage Shopify</h1>
                  <p className="text-[12px] text-[#8A8A88]">Connexion Lhorlogemurale</p>
                </div>
              </div>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-5">
                Les credentials de la boutique L&apos;Horloge Murale sont déjà chiffrés dans Jestly.
                Clique sur Connecter pour lancer l&apos;import initial (90 jours d&apos;historique commandes,
                tous les produits et clients).
              </p>
              <div className="mb-5 p-3 rounded-lg bg-[#F7F7F5] border border-[#E6E6E4]">
                <dl className="grid grid-cols-2 gap-y-1.5 text-[12px]">
                  <dt className="text-[#8A8A88]">Boutique</dt>
                  <dd className="text-[#191919] font-medium">L&apos;Horloge Murale</dd>
                  <dt className="text-[#8A8A88]">Domaine</dt>
                  <dd className="text-[#191919] font-medium">lhorlogemurale.fr</dd>
                  <dt className="text-[#8A8A88]">Auth</dt>
                  <dd className="text-[#191919] font-medium">client_credentials (token 24h)</dd>
                  <dt className="text-[#8A8A88]">Scopes</dt>
                  <dd className="text-[#191919] font-medium">16 (read-only)</dd>
                </dl>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnectLhorloge}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[14px] font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Store size={16} />
                Connecter Lhorlogemurale
              </button>
              <p className="text-[10px] text-[#8A8A88] mt-2 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={10} /> Secret chiffré AES-256-GCM, token jamais persisté
              </p>
            </motion.div>
          )}

          {step === "intro" && !isBeta && (
            <motion.div key="intro-other" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F7F7F5] flex items-center justify-center">
                  <Store className="text-[#8A8A88]" size={22} />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-[#191919] tracking-tight">E-commerce</h1>
                  <p className="text-[12px] text-[#8A8A88]">Multi-tenant bientôt disponible</p>
                </div>
              </div>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-5">
                La connexion multi-boutiques (Shopify, WooCommerce, etc.) arrive en V2.
                En attendant, le tour de pilotage est en bêta privée pour la boutique L&apos;Horloge Murale.
              </p>
              <div className="p-4 rounded-lg bg-[#F0EEFF] border border-[#DDD6FE] text-center">
                <p className="text-[12px] text-[#5B21B6] font-medium">
                  Tu veux connecter ta boutique ? Écris-nous à <a href="mailto:hello@jestly.fr" className="underline">hello@jestly.fr</a>
                </p>
              </div>
            </motion.div>
          )}

          {step === "connecting" && (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
              <Loader2 className="mx-auto text-[#7C3AED] animate-spin mb-3" size={32} />
              <p className="text-[14px] font-medium text-[#191919]">Connexion à Shopify…</p>
              <p className="text-[12px] text-[#8A8A88] mt-1">Mint du token et vérification de la boutique</p>
            </motion.div>
          )}

          {step === "connected" && (
            <motion.div key="connected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="text-emerald-600" size={28} />
              </div>
              <h2 className="text-[18px] font-bold text-[#191919] mb-1">Connectée</h2>
              {shopName && <p className="text-[13px] text-[#5A5A58] mb-1">{shopName}</p>}
              <p className="text-[12px] text-[#8A8A88]">Import en cours, redirection dans un instant…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
