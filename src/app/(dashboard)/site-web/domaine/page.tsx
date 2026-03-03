"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/lib/hooks/use-site";

export default function SiteDomainePage() {
  const { site } = useSite();
  const [copied, setCopied] = useState(false);
  const siteUrl = `${site.domain.subdomain}.jestly.site`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${siteUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Sous-domaine */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">Sous-domaine Jestly</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg overflow-hidden">
              <span className="px-3 text-[13px] text-[#999] border-r border-[#E6E6E4] py-2.5">https://</span>
              <input
                type="text"
                defaultValue={site.domain.subdomain}
                className="flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none"
              />
              <span className="px-3 text-[13px] text-[#999] border-l border-[#E6E6E4] py-2.5">.jestly.site</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="text-[12px] font-medium text-[#4F46E5] border border-[#4F46E5]/20 px-3 py-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"
            >
              {copied ? "Copié !" : "Copier le lien"}
            </button>
            <a
              href={`https://${siteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium text-[#666] border border-[#E6E6E4] px-3 py-1.5 rounded-lg hover:bg-[#F7F7F5] transition-colors flex items-center gap-1"
            >
              Ouvrir
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-50 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-[12px] text-emerald-600 font-medium">SSL actif — Connexion sécurisée</span>
          </div>
        </motion.section>

        {/* Domaine personnalisé */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E6E4] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Domaine personnalisé</h2>
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Bientôt disponible
            </span>
          </div>
          <p className="text-[13px] text-[#999] mb-4">
            Connectez votre propre nom de domaine pour un rendu plus professionnel.
          </p>
          <input
            type="text"
            placeholder="www.monsite.fr"
            disabled
            className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#BBB] cursor-not-allowed"
          />
          <p className="text-[11px] text-[#BBB] mt-2">
            Cette fonctionnalité sera disponible avec le plan Pro.
          </p>
        </motion.section>
      </div>
    </div>
  );
}
