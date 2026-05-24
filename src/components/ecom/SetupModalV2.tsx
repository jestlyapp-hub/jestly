"use client";

/**
 * SetupModalV2 — connexion Shopify universelle (multi-tenant).
 *
 * Chaque user connecte SA propre boutique en collant ses credentials Dev Dashboard
 * (client_credentials grant). Aucun gate, aucune valeur hardcodée. 5 étapes :
 *   1. intro → 2. shop_domain → 3. tutoriel + creds → 4. test (/test) → 5. connect (/connect)
 *
 * Le client_secret part en POST server-side uniquement (jamais loggé/stocké côté client).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  ExternalLink, ShieldCheck, ChevronDown, ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/hooks/use-api";
import { toast } from "@/lib/hooks/use-toast";

interface Props {
  onConnected: () => void;
}

type Step = "intro" | "domain" | "creds" | "tested" | "connecting";

const SCOPES_16 = [
  "read_orders", "read_all_orders", "read_products", "read_product_listings",
  "read_customers", "read_inventory", "read_locations", "read_analytics",
  "read_reports", "read_fulfillments", "read_shipping", "read_marketing_events",
  "read_publications", "read_price_rules", "read_discounts", "read_checkouts",
];

const RE_DOMAIN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;
const RE_CLIENT_ID = /^[a-f0-9]{32}$/i;
const RE_SECRET = /^shpss_[a-f0-9]{32,}$/i;

const ACCENT = "#7C3AED";

interface TestedShop {
  name: string;
  currency?: string;
  plan?: string;
  myshopifyDomain?: string;
}

export default function SetupModalV2({ onConnected }: Props) {
  const [step, setStep] = useState<Step>("intro");
  const [shopDomain, setShopDomain] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shop, setShop] = useState<TestedShop | null>(null);

  const domainValid = RE_DOMAIN.test(shopDomain.trim());
  const idValid = RE_CLIENT_ID.test(clientId.trim());
  const secretValid = RE_SECRET.test(clientSecret.trim());
  const credsValid = idValid && secretValid;

  const adminUrl = domainValid
    ? `https://${shopDomain.trim()}/admin/settings/apps/development`
    : "https://www.shopify.com/admin";

  async function runTest() {
    setError(null);
    setStep("tested"); // affiche l'écran de vérif avec loader
    setShop(null);
    try {
      const res = await apiFetch<{ ok: boolean; shop: TestedShop; error?: string }>(
        "/api/integrations/shopify/test",
        { method: "POST", body: { shop_domain: shopDomain.trim(), client_id: clientId.trim(), client_secret: clientSecret.trim() } },
      );
      if (!res.ok) throw new Error(res.error ?? "Échec du test");
      setShop(res.shop);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStep("creds");
    }
  }

  async function runConnect() {
    setError(null);
    setStep("connecting");
    try {
      const res = await apiFetch<{ ok: boolean; shop: { name: string }; error?: string }>(
        "/api/integrations/shopify/connect",
        { method: "POST", body: { shop_domain: shopDomain.trim(), client_id: clientId.trim(), client_secret: clientSecret.trim() } },
      );
      if (!res.ok) throw new Error(res.error ?? "Échec de la connexion");
      toast.success(`${res.shop?.name ?? "Boutique"} connectée — import en cours`);
      setTimeout(() => onConnected(), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setStep("tested");
    }
  }

  const stepIndex = ["intro", "domain", "creds", "tested", "connecting"].indexOf(step);

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white border border-[#E6E6E4] rounded-2xl shadow-xl p-8"
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1 transition-colors"
              style={{ background: i <= Math.min(stepIndex, 3) ? ACCENT : "#E6E6E4" }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1 : Intro ──────────────────────────────── */}
          {step === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
                  <Store style={{ color: ACCENT }} size={22} />
                </div>
                <div>
                  <h1 className="text-[20px] font-bold text-[#191919] tracking-tight">Connectez votre boutique Shopify</h1>
                  <p className="text-[12px] text-[#8A8A88]">Tour de pilotage e-commerce</p>
                </div>
              </div>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-6">
                Importez vos commandes, produits et clients pour piloter votre activité depuis Jestly.
                La connexion est en lecture seule et prend 2 minutes.
              </p>
              <button
                onClick={() => setStep("domain")}
                className="w-full text-white text-[14px] font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                style={{ background: ACCENT }}
              >
                Commencer <ArrowRight size={16} />
              </button>
              <p className="text-[11px] text-[#8A8A88] mt-3 text-center">
                Pas encore de boutique Shopify ?{" "}
                <a href="https://www.shopify.com" target="_blank" rel="noreferrer" className="underline">Créer un compte</a>
              </p>
            </motion.div>
          )}

          {/* ── Step 2 : Shop domain ────────────────────────── */}
          {step === "domain" && (
            <motion.div key="domain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-[18px] font-bold text-[#191919] mb-1">Votre boutique Shopify</h1>
              <p className="text-[12px] text-[#8A8A88] mb-5">Indiquez le domaine technique de votre boutique.</p>

              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Domaine .myshopify.com</label>
              <input
                autoFocus
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                placeholder="monshop.myshopify.com"
                className="w-full px-3 py-2.5 text-[14px] border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED] transition-colors"
              />
              {shopDomain && !domainValid && (
                <p className="text-[11px] text-rose-600 mt-1.5">Format attendu : monshop.myshopify.com (pas votre domaine personnalisé).</p>
              )}
              <p className="text-[11px] text-[#8A8A88] mt-2">
                💡 C&apos;est le domaine en <code>.myshopify.com</code>, visible dans Réglages → Domaines de votre admin.
              </p>

              <div className="flex items-center justify-between mt-6">
                <button onClick={() => setStep("intro")} className="text-[13px] text-[#8A8A88] flex items-center gap-1 hover:text-[#191919]">
                  <ArrowLeft size={14} /> Retour
                </button>
                <button
                  onClick={() => setStep("creds")}
                  disabled={!domainValid}
                  className="text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-40 transition-opacity"
                  style={{ background: ACCENT }}
                >
                  Continuer <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 : Tutorial + credentials ─────────────── */}
          {step === "creds" && (
            <motion.div key="creds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-[18px] font-bold text-[#191919] mb-1">Créer une app sur Shopify</h1>
              <p className="text-[12px] text-[#8A8A88] mb-4">Une app personnalisée (Dev Dashboard) donne accès à vos données en lecture seule.</p>

              {/* Tutoriel accordéon */}
              <div className="border border-[#E6E6E4] rounded-lg mb-5 overflow-hidden">
                <button
                  onClick={() => setTutorialOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F7F5] text-[13px] font-medium text-[#191919]"
                >
                  <span>📋 Tutoriel — créer l&apos;app (5 étapes)</span>
                  {tutorialOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {tutorialOpen && (
                  <div className="px-4 py-3 text-[12px] text-[#5A5A58] leading-relaxed space-y-2.5">
                    <p>
                      <strong>1.</strong> Ouvrez l&apos;admin développeur de votre boutique :{" "}
                      <a href={adminUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline" style={{ color: ACCENT }}>
                        Ouvrir l&apos;admin Shopify <ExternalLink size={11} />
                      </a>
                    </p>
                    <p><strong>2.</strong> Si demandé, autorisez le développement d&apos;apps personnalisées, puis <em>Créer une app</em> (nom : « Jestly Dashboard »).</p>
                    <p><strong>3.</strong> Onglet <em>Configuration / API Admin</em> → cochez ces 16 permissions (lecture seule) :</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pl-3 font-mono text-[11px] text-[#191919]">
                      {SCOPES_16.map((s) => <span key={s}>☐ {s}</span>)}
                    </div>
                    <p><strong>4.</strong> <em>Enregistrer</em>, puis <em>Installer l&apos;app</em> (bouton en haut à droite).</p>
                    <p><strong>5.</strong> Onglet <em>Identifiants API</em> → copiez le <strong>Client ID</strong> et le <strong>Client secret</strong> (commence par <code>shpss_</code>).</p>
                  </div>
                )}
              </div>

              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5">Client ID</label>
              <input
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="1cc9148524eb6d1fecc47b8693af485c"
                className="w-full px-3 py-2.5 text-[13px] font-mono border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED] mb-1"
              />
              {clientId && !idValid && <p className="text-[11px] text-rose-600 mb-2">Le Client ID est une chaîne hexadécimale de 32 caractères.</p>}

              <label className="block text-[12px] font-medium text-[#5A5A58] mb-1.5 mt-3">Client secret</label>
              <input
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="shpss_••••••••••••••••••••••••••••••••"
                className="w-full px-3 py-2.5 text-[13px] font-mono border border-[#E6E6E4] rounded-lg focus:outline-none focus:border-[#7C3AED] mb-1"
              />
              {clientSecret && !secretValid && <p className="text-[11px] text-rose-600 mb-2">Le secret commence par <code>shpss_</code> suivi de caractères hexadécimaux.</p>}

              {error && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-700">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <button onClick={() => setStep("domain")} className="text-[13px] text-[#8A8A88] flex items-center gap-1 hover:text-[#191919]">
                  <ArrowLeft size={14} /> Retour
                </button>
                <button
                  onClick={runTest}
                  disabled={!credsValid}
                  className="text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-40 transition-opacity"
                  style={{ background: ACCENT }}
                >
                  Tester <ArrowRight size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[#8A8A88] mt-3 text-center flex items-center justify-center gap-1">
                <ShieldCheck size={10} /> Secret chiffré AES-256-GCM côté serveur, jamais exposé.
              </p>
            </motion.div>
          )}

          {/* ── Step 4 : Test result ────────────────────────── */}
          {step === "tested" && (
            <motion.div key="tested" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-[18px] font-bold text-[#191919] mb-4">Vérification de la connexion</h1>

              {!shop && !error && (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto animate-spin mb-3" style={{ color: ACCENT }} size={32} />
                  <p className="text-[13px] text-[#5A5A58]">Mint du token et vérification de la boutique…</p>
                </div>
              )}

              {shop && (
                <>
                  <div className="space-y-2 mb-5">
                    <Check label="Connexion à votre boutique" />
                    <Check label={`Boutique trouvée : « ${shop.name} »`} />
                    {shop.currency && <Check label={`Devise : ${shop.currency}`} />}
                    {shop.plan && <Check label={`Plan : ${shop.plan}`} />}
                    <Check label="Credentials valides" />
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 mb-5">
                    <p className="text-[13px] font-medium text-emerald-800">Tout est OK !</p>
                  </div>
                </>
              )}

              {error && (
                <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                  <AlertCircle size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-700">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button onClick={() => { setError(null); setStep("creds"); }} className="text-[13px] text-[#8A8A88] flex items-center gap-1 hover:text-[#191919]">
                  <ArrowLeft size={14} /> Retour
                </button>
                {shop && (
                  <button
                    onClick={runConnect}
                    className="text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2"
                    style={{ background: ACCENT }}
                  >
                    <Store size={16} /> Connecter ma boutique
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 5 : Connecting ─────────────────────────── */}
          {step === "connecting" && (
            <motion.div key="connecting" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="text-emerald-600" size={28} />
              </div>
              <h2 className="text-[18px] font-bold text-[#191919] mb-1">Connexion réussie</h2>
              <p className="text-[12px] text-[#8A8A88]">Import de vos données en cours, redirection…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function Check({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
      <span className="text-[13px] text-[#191919]">{label}</span>
    </div>
  );
}
