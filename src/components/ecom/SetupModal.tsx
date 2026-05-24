"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Key, CheckCircle2, AlertCircle, Loader2, ExternalLink, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface Props {
  onConnected: () => void;
}

type Step = "intro" | "domain" | "token" | "verifying" | "connected";

export default function SetupModal({ onConnected }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shopInfo, setShopInfo] = useState<{ name: string; primaryDomain?: string; currency: string } | null>(null);

  const handleVerifyAndConnect = async () => {
    setError(null);
    setStep("verifying");
    try {
      // 1. Test connectivité
      const testRes = await apiFetch<{ ok: boolean; shop: { name: string; primaryDomain?: string; currency: string }; error?: string }>(
        "/api/integrations/shopify/test",
        { method: "POST", body: JSON.stringify({ shop_domain: shopDomain.trim(), access_token: accessToken.trim() }) },
      );
      if (!testRes.ok) throw new Error(testRes.error ?? "Test échoué");
      setShopInfo(testRes.shop);

      // 2. Connect = persist + initial sync
      await apiFetch("/api/integrations/shopify/connect", {
        method: "POST",
        body: JSON.stringify({
          shop_domain: shopDomain.trim(),
          access_token: accessToken.trim(),
          webhook_secret: webhookSecret.trim() || undefined,
        }),
      });

      setStep("connected");
      toast.success("Boutique connectée — synchronisation en cours");
      setTimeout(() => onConnected(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStep("token");
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
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
                  <Sparkles className="text-[#7C3AED]" size={22} />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-[#191919] tracking-tight">Tour de pilotage Shopify</h1>
                  <p className="text-[12px] text-[#8A8A88]">Connectez votre boutique en moins de 2 minutes</p>
                </div>
              </div>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-6">
                Suivez vos KPIs, vos sources de trafic, vos produits et vos clients depuis Jestly,
                avec la précision d&apos;une vraie tour de pilotage e-commerce. Zéro abonnement,
                tout est inclus.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Chiffre d'affaires, panier moyen, taux de conversion en temps réel",
                  "Sources de trafic & ROAS par canal",
                  "Top produits + drill-down jusqu'aux variantes",
                  "Comparaison de périodes & export CSV illimité",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-[#5A5A58]">
                    <CheckCircle2 size={14} className="text-[#7C3AED] mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setStep("domain")}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[14px] font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Store size={16} />
                Connecter ma boutique Shopify
              </button>
            </motion.div>
          )}

          {step === "domain" && (
            <motion.div key="domain" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-[18px] font-bold text-[#191919] mb-2">Domaine de votre boutique</h2>
              <p className="text-[13px] text-[#5A5A58] mb-5">Le domaine .myshopify.com (pas le custom domain).</p>
              <label className="block text-[12px] font-semibold text-[#191919] mb-1.5">Shop domain</label>
              <input
                type="text"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value.toLowerCase().replace(/\s/g, ""))}
                placeholder="monshop.myshopify.com"
                className="w-full px-3 py-2.5 border border-[#E6E6E4] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] mb-5"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("intro")}
                  className="px-4 py-2.5 border border-[#E6E6E4] rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA]"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep("token")}
                  disabled={!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shopDomain)}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#E6E6E4] disabled:cursor-not-allowed text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          )}

          {step === "token" && (
            <motion.div key="token" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-[18px] font-bold text-[#191919] mb-2">Token Custom App</h2>
              <p className="text-[13px] text-[#5A5A58] mb-4">
                Créez une Custom App dans votre admin Shopify avec les scopes ci-dessous,
                puis collez le token (shpat_…).
              </p>

              <details className="mb-4 border border-[#E6E6E4] rounded-lg">
                <summary className="px-3 py-2.5 text-[12px] font-medium text-[#191919] cursor-pointer flex items-center justify-between hover:bg-[#FBFBFA]">
                  Comment créer une Custom App ?
                  <ExternalLink size={12} className="text-[#8A8A88]" />
                </summary>
                <div className="px-3 pb-3 pt-1 text-[12px] text-[#5A5A58] space-y-2">
                  <ol className="list-decimal ml-4 space-y-1">
                    <li>
                      <a href={`https://${shopDomain || "monshop"}/admin/settings/apps/development`}
                         target="_blank" rel="noopener noreferrer" className="text-[#7C3AED] underline">
                        Admin Shopify → Apps → Develop apps
                      </a>
                    </li>
                    <li>Create app → nommez-la &laquo;&nbsp;Jestly Dashboard&nbsp;&raquo;</li>
                    <li>Configure Admin API scopes : <code className="bg-[#F7F7F5] px-1 rounded text-[11px]">read_orders, read_all_orders, read_products, read_customers, read_inventory, read_analytics, read_reports</code></li>
                    <li>Install app → Reveal Admin API access token → copiez la valeur (shpat_…)</li>
                  </ol>
                </div>
              </details>

              <label className="block text-[12px] font-semibold text-[#191919] mb-1.5">Access token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="shpat_..."
                className="w-full px-3 py-2.5 border border-[#E6E6E4] rounded-lg text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] mb-4"
                autoFocus
              />

              <label className="block text-[12px] font-semibold text-[#191919] mb-1.5">
                Webhook signing secret <span className="font-normal text-[#8A8A88]">(optionnel)</span>
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Activez les webhooks plus tard"
                className="w-full px-3 py-2.5 border border-[#E6E6E4] rounded-lg text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] mb-4"
              />

              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-700">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("domain")}
                  className="px-4 py-2.5 border border-[#E6E6E4] rounded-lg text-[13px] font-medium text-[#5A5A58] hover:bg-[#FBFBFA]"
                >
                  Retour
                </button>
                <button
                  onClick={handleVerifyAndConnect}
                  disabled={!/^shpat_[a-f0-9]{32,}$/i.test(accessToken)}
                  className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#E6E6E4] disabled:cursor-not-allowed text-white text-[13px] font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Key size={14} />
                  Connecter
                </button>
              </div>
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
              <Loader2 className="mx-auto text-[#7C3AED] animate-spin mb-3" size={32} />
              <p className="text-[14px] font-medium text-[#191919]">Vérification…</p>
              <p className="text-[12px] text-[#8A8A88] mt-1">Connexion à Shopify et chargement de votre boutique</p>
            </motion.div>
          )}

          {step === "connected" && (
            <motion.div key="connected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="text-emerald-600" size={28} />
              </div>
              <h2 className="text-[18px] font-bold text-[#191919] mb-1">Boutique connectée</h2>
              {shopInfo && <p className="text-[13px] text-[#5A5A58] mb-1">{shopInfo.name}</p>}
              <p className="text-[12px] text-[#8A8A88]">Import initial en cours, vous serez redirigé dans un instant…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
