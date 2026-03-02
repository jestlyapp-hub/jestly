"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types";

const inputClass = "w-full px-3 py-2.5 text-sm border border-[#E6E6E4] rounded-md bg-[#F7F7F5] text-[#191919] focus:outline-none focus:ring-2 focus:ring-[var(--site-primary)]/20 focus:border-[var(--site-primary)] transition-all";

interface CheckoutStepperProps {
  product: Product;
  siteId: string;
  siteSlug: string;
}

interface FormSchema {
  label: string;
  type: "text" | "textarea" | "select" | "email";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

type Step = "contact" | "briefing" | "recap" | "success";

export default function CheckoutStepper({ product, siteId, siteSlug }: CheckoutStepperProps) {
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderRef, setOrderRef] = useState("");

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formSchema: FormSchema[] = Array.isArray((product as any).formSchemaJson)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (product as any).formSchemaJson
    : [];
  const hasBriefing = formSchema.length > 0;

  const stepIndex = step === "contact" ? 0 : step === "briefing" ? 1 : step === "recap" ? (hasBriefing ? 2 : 1) : 3;
  const totalSteps = hasBriefing ? 3 : 2;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/public/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          product_id: product.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone || undefined,
          message: message || undefined,
          form_data: Object.keys(formData).length > 0 ? formData : undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur lors de la commande");
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
        <a href={`/s/${siteSlug}`} className="text-sm text-[#8A8A88] hover:text-[#191919] transition-colors mb-6 inline-block">&larr; Retour au site</a>

        {/* Product summary */}
        <div className="mb-8 pb-6 border-b border-[#E6E6E4]">
          <h1 className="text-2xl font-bold text-[#191919] mb-1">{product.name}</h1>
          <p className="text-sm text-[#5A5A58] mb-3">{product.shortDescription}</p>
          <div className="text-2xl font-bold text-[var(--site-primary)]">{product.price} &euro;</div>
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

          {/* Step 2: Briefing (dynamic form) */}
          {step === "briefing" && (
            <motion.div key="briefing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-[#191919]">Votre brief</h2>
              {formSchema.map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-[#5A5A58] mb-1">
                    {field.label} {field.required && "*"}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      rows={4}
                      placeholder={field.placeholder}
                      className={inputClass + " resize-none"}
                    />
                  ) : field.type === "select" && field.options ? (
                    <select
                      value={formData[field.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Sélectionner...</option>
                      {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.label] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#5A5A58] mb-1">Message (optionnel)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputClass + " resize-none"} placeholder="Décrivez votre besoin..." />
              </div>
              <div className="flex gap-3">
                <button onClick={goBack} className="flex-1 py-3 border border-[#E6E6E4] text-[#666] text-sm font-semibold rounded-md hover:bg-[#F7F7F5] transition-colors">
                  Retour
                </button>
                <button onClick={goNext} className="flex-1 py-3 bg-[var(--site-primary)] text-white text-sm font-semibold rounded-md hover:bg-[var(--site-primary-hover)] transition-colors">
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
                  <span className="font-bold text-[var(--site-primary)]">{product.price} &euro;</span>
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
                  {loading ? "Envoi..." : `Confirmer — ${product.price} €`}
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
                  <span className="font-bold text-[var(--site-primary)]">{product.price} &euro;</span>
                </div>
              </div>
              <a href={`/s/${siteSlug}`} className="inline-block mt-6 text-sm font-medium text-[var(--site-primary)] hover:underline">&larr; Retour au site</a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
