"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockSite } from "@/lib/mock-data";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function SiteSeoPage() {
  const [globalTitle, setGlobalTitle] = useState(mockSite.seo.globalTitle);
  const [globalDesc, setGlobalDesc] = useState(mockSite.seo.globalDescription);
  const [ogImage, setOgImage] = useState(mockSite.seo.ogImageUrl || "");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Meta globales */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Méta globales</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Titre global (meta title)</label>
              <input type="text" value={globalTitle} onChange={(e) => setGlobalTitle(e.target.value)} className={inputClass} />
              <div className="text-[11px] text-[#BBB] mt-1">{globalTitle.length}/60 caractères recommandés</div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Description globale (meta description)</label>
              <textarea value={globalDesc} onChange={(e) => setGlobalDesc(e.target.value)} rows={3} className={inputClass} />
              <div className="text-[11px] text-[#BBB] mt-1">{globalDesc.length}/160 caractères recommandés</div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Image Open Graph (URL)</label>
              <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
          </div>

          {/* Google preview */}
          <div className="mt-5 p-4 bg-[#F8F9FC] rounded-lg">
            <div className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-2">Aperçu Google</div>
            <div className="text-[14px] text-[#1a0dab] font-medium truncate">{globalTitle || "Titre de la page"}</div>
            <div className="text-[11px] text-[#006621] mb-0.5">studionova.jestly.site</div>
            <div className="text-[12px] text-[#545454] line-clamp-2">{globalDesc || "Description de la page..."}</div>
          </div>
        </motion.section>

        {/* SEO par page */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-4">SEO par page</h2>
          <div className="space-y-3">
            {mockSite.pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 rounded-lg border border-[#E6E8F0]">
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A1A]">{page.name}</div>
                  <div className="text-[11px] text-[#999]">{page.seoTitle || "Titre non défini"}</div>
                </div>
                <div className="flex items-center gap-2">
                  {page.seoTitle ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                  <span className="text-[11px] text-[#999]">{page.seoTitle ? "Configuré" : "À définir"}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sitemap */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-3">Sitemap</h2>
          <div className="p-3 bg-[#F8F9FC] rounded-lg">
            <div className="text-[12px] font-mono text-[#999]">
              https://studionova.jestly.site/sitemap.xml
            </div>
          </div>
          <p className="text-[11px] text-[#BBB] mt-2">
            Le sitemap est généré automatiquement à partir des pages publiées.
          </p>
        </motion.section>

        {/* Save */}
        <div className="flex justify-end">
          <button className="bg-[#6a18f1] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5a12d9] transition-colors">
            Sauvegarder le SEO
          </button>
        </div>
      </div>
    </div>
  );
}
