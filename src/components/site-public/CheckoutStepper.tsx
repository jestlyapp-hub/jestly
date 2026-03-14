"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/productTypes";
import { trackOrderStart } from "@/lib/analytics";
import BriefFormRenderer from "@/components/briefs/BriefFormRenderer";
import type { Product, BriefField } from "@/types";

const inputClass = "w-full px-3 py-2.5 text-sm border border-[#E6E6E4] rounded-md bg-[#F7F7F5] text-[#191919] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]/20 focus:border-[var(--site-primary)] transition-all";

interface CheckoutStepperProps {
  product: Product;
  siteId: string;
  siteSlug: string;
  basePath?: string;
  /** Block-level brief override (from sale block settings) */
  briefTemplateId?: string | null;
  /** Whether the block uses the product's default brief */
  useProductDefaultBrief?: boolean;
  /** Whether brief is required (from block settings) */
  briefRequired?: boolean;
}

interface BriefConfig {
  template_id: string;
  template_name: string;
  template_version: number;
  fields: BriefField[];
  is_required: boolean;
}

type Step = "contact" | "briefing" | "recap" | "success";

export default function CheckoutStepper({
  product, siteId, siteSlug, basePath,
  briefTemplateId,
  useProductDefaultBrief = true,
  briefRequired: blockBriefRequired,
}: CheckoutStepperProps) {
  const siteUrl = basePath ?? `/s/${siteSlug}`;
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState("");

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [briefAnswers, setBriefAnswers] = useState<Record<string, unknown>>({});
  const [briefConfig, setBriefConfig] = useState<BriefConfig | null>(null);
  const [message, setMessage] = useState("");

  // Track checkout start for funnel analytics
  useEffect(() => {
    trackOrderStart(siteId, product.slug);
  }, [siteId, product.slug]);

  // Brief resolution: block.briefTemplateId > product default > none
  useEffect(() => {
    const params = new URLSearchParams({ product_id: product.id });

    // If block specifies a direct brief template, use that
    if (briefTemplateId) {
      params.set("brief_template_id", briefTemplateId);
    } else if (useProductDefaultBrief === false) {
      // Block explicitly disables product default brief
      return;
    }

    fetch(`/api/public/brief?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.fields && data.fields.length > 0) {
          setBriefConfig({
            ...data,
            is_required: blockBriefRequired ?? data.is_required ?? true,
          });
        }
      })
      .catch(() => {});
  }, [product.id, briefTemplateId, useProductDefaultBrief, blockBriefRequired]);

  const hasBriefing = !!briefConfig;
  const stepIndex = step === "contact" ? 0 : step === "briefing" ? 1 : step === "recap" ? (hasBriefing ? 2 : 1) : 3;
  const totalSteps = hasBriefing ? 3 : 2;

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        site_id: siteId,
        product_id: product.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || undefined,
        message: message || undefined,
      };

      // Include brief answers with snapshot data
      if (briefConfig && Object.keys(briefAnswers).length > 0) {
        body.brief_answers = briefAnswers;
        body.template_id = briefConfig.template_id;
        body.template_version = briefConfig.template_version;
        body.template_name = briefConfig.template_name;
        body.brief_fields = briefConfig.fields;
        body.brief_pinned = briefConfig.fields
          .filter((f) => f.pinned)
          .map((f) => f.key);
      }

      const res = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const respBody = await res.json().catch(() => ({}));
        throw new Error(respBody.error || "Erreur lors de la commande");
      }

      const data = await res.json();
      setOrderRef(data.order_id?.slice(0, 8) || "OK");
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const validateBrief = (): boolean => {
    if (!briefConfig) return true;
    for (const field of briefConfig.fields) {
      if (field.required) {
        const val = briefAnswers[field.key];
        if (val === undefined || val === null || val === "") return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (step === "contact") {
      setStep(hasBriefing ? "briefing" : "recap");
    } else if (step === "briefing") {
      setStep("recap");
    }
  };

  const goBack = () => {
    if (step === "briefing") setStep("contact");
    if (step === "recap") setStep(hasBriefing ? "briefing" : "contact");
  };

  const deliveryDate = product.deliveryTimeDays
    ? new Date(Date.now() + product.deliveryTimeDays * 86400000).toLocaleDateString("fr-FR")
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-16">
        {/* Back link */}
        <a href={siteUrl || "/"} className="text-sm text-[#8A8A88] hover:text-[#191919] transition-colors mb-6 inline-block">&larr; Retour au site</a>

        {/* Product summary */}
        <div className="mb-8 pb-6 border-b border-[#E6E6E4]">
          <h1 className="text-2xl font-bold text-[#191919] mb-1">{product.name}</h1>
          <p className="text-sm text-[#5A5A58] mb-3">{product.shortDescription}</p>
          <div className="text-2xl font-bold text-[var(--site-primary)]">{formatPrice(product.priceCents)}</div>
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                  i <= stepIndex ? "bg-[var(--site-primary)] text-white" : "bg-[#F7F7F5] text-[#999]"
                }`}>
                  {i + 1}
                </div>
                {i < totalSteps - 1 && <div className={`w-8 h-0.5 ${i < stepIndex ? "bg-[var(--site-primary)]" : "bg-[#E6E6E4]"}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Contact */}
          {step === "contact" && (
            <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-[#191919]">Vos coordonnées</h2>
              <div>
                <label className="block text-sm font-medium text-[#5A5A58] mb-1">Nom complet *</label>
                <input type="text" required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={inputClass} placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A58] mb-1">Email *</label>
                <input type="email" required value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={inputClass} placeholder="votre@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5A5A58] mb-1">Téléphone</label>
                <input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={inputClass} placeholder="06 12 34 56 78" />
              </div>
              <button
                onClick={goNext}
                disabled={!contact.name || !contact.email}
                className="w-full py-3 bg-[var(--site-primary)] text-white text-sm font-semibold rounded-md hover:bg-[var(--site-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {/* Step 2: Briefing */}
          {step === "briefing" && briefConfig && (
            <motion.div key="briefing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-[#191919]">Votre brief</h2>
              <BriefFormRenderer
                fields={briefConfig.fields}
                answers={briefAnswers}
                onChange={setBriefAnswers}
                onUpload={uploadFile}
              />
              <div>
                <label className="block text-sm font-medium text-[#5A5A58] mb-1">Message (optionnel)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputClass + " resize-none"} placeholder="Précisions supplémentaires..." />
              </div>
              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 py-3 border border-[#E6E6E4] text-[#666] text-sm font-semibold rounded-md hover:bg-[#F7F7F5] transition-colors">
                  Retour
                </button>
                {!briefConfig.is_required && (
                  <button onClick={() => setStep("recap")} className="flex-1 py-3 border border-[#E6E6E4] text-[#666] text-sm font-semibold rounded-md hover:bg-[#F7F7F5] transition-colors">
                    Passer
                  </button>
                )}
                <button
                  onClick={goNext}
                  disabled={briefConfig.is_required && !validateBrief()}
                  className="flex-1 py-3 bg-[var(--site-primary)] text-white text-sm font-semibold rounded-md hover:bg-[var(--site-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Recap */}
          {step === "recap" && (
            <motion.div key="recap" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-[#191919]">Récapitulatif</h2>
              <div className="bg-[#F7F7F5] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A5A58]">Service</span>
                  <span className="font-medium text-[#191919]">{product.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A5A58]">Prix</span>
                  <span className="font-bold text-[var(--site-primary)]">{formatPrice(product.priceCents)}</span>
                </div>
                {deliveryDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A5A58]">Livraison estimée</span>
                    <span className="text-[#191919]">{deliveryDate}</span>
                  </div>
                )}
                <div className="border-t border-[#E6E6E4] pt-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A5A58]">Nom</span>
                    <span className="text-[#191919]">{contact.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#5A5A58]">Email</span>
                    <span className="text-[#191919]">{contact.email}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 py-3 border border-[#E6E6E4] text-[#666] text-sm font-semibold rounded-md hover:bg-[#F7F7F5] transition-colors">
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-[var(--site-primary)] text-white text-sm font-semibold rounded-md hover:bg-[var(--site-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {loading ? "Envoi..." : `Confirmer — ${formatPrice(product.priceCents)}`}
                </button>
              </div>

              <p className="text-xs text-[#8A8A88] text-center">
                Pas de paiement immédiat. Vous serez contacté pour les détails.
              </p>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--site-primary-light)] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--site-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#191919] mb-2">Commande confirmée !</h2>
              <p className="text-sm text-[#8A8A88] leading-relaxed mb-4">
                Merci {contact.name}. Votre commande pour <strong>{product.name}</strong> est enregistrée.
              </p>
              <div className="bg-[#F7F7F5] rounded-lg p-4 max-w-xs mx-auto text-left space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A5A58]">Référence</span>
                  <span className="font-mono font-medium text-[#191919]">{orderRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A5A58]">Montant</span>
                  <span className="font-bold text-[var(--site-primary)]">{formatPrice(product.priceCents)}</span>
                </div>
              </div>
              <a href={siteUrl || "/"} className="inline-block mt-6 text-sm font-medium text-[var(--site-primary)] hover:underline">&larr; Retour au site</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
