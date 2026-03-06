"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TEMPLATES } from "@/lib/site-templates";

const BLANK_CARD = {
  id: "blank",
  name: "Page vierge",
  description: "Partez de zero et construisez votre site bloc par bloc.",
  audience: "Tous les profils",
  bullets: ["Aucun bloc pre-configure", "Liberte totale", "Ajoutez vos pages et blocs"],
  gradient: "from-gray-700 to-gray-500",
};

const allCards = [...TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: t.description, audience: t.audience, bullets: t.bullets, gradient: t.gradient })), BLANK_CARD];

export default function NouveauSitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(templateId: string) {
    if (loading) return;
    setLoading(templateId);

    try {
      const res = await fetch("/api/sites/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Erreur creation:", err);
        setLoading(null);
        return;
      }

      const { siteId } = await res.json();
      router.push(`/site-web/${siteId}/createur`);
    } catch (e) {
      console.error("Erreur:", e);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-[#191919] mb-3">
            Choisissez votre point de depart
          </h1>
          <p className="text-[#5A5A58] text-lg max-w-xl mx-auto">
            Selectionnez un template premium ou partez d'une page vierge. Vous pourrez tout personnaliser ensuite.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allCards.map((card, i) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() => handleSelect(card.id)}
              disabled={loading !== null}
              className={`group relative text-left rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-[#4F46E5]/30 ${
                loading === card.id ? "ring-2 ring-[#4F46E5]" : "border-[#E6E6E4]"
              } bg-white disabled:opacity-70`}
            >
              {/* Gradient preview header */}
              <div className={`h-36 bg-gradient-to-br ${card.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <span className="text-white font-bold text-xl drop-shadow-md">{card.name}</span>
                  <span className="text-white/80 text-sm mt-1">{card.audience}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <p className="text-[13px] text-[#5A5A58] leading-relaxed mb-4">
                  {card.description}
                </p>
                <ul className="space-y-1.5 mb-5">
                  {card.bullets.map((b) => (
                    <li key={b} className="text-[12px] text-[#5A5A58] flex items-start gap-2">
                      <span className="text-[#4F46E5] mt-0.5 shrink-0">&#10003;</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div
                  className={`inline-flex items-center gap-2 text-[13px] font-semibold px-4 py-2 rounded-md transition-colors ${
                    loading === card.id
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#EEF2FF] text-[#4F46E5] group-hover:bg-[#4F46E5] group-hover:text-white"
                  }`}
                >
                  {loading === card.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creation en cours...
                    </>
                  ) : (
                    "Utiliser ce template"
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
