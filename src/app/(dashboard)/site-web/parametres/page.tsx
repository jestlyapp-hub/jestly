"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { mockSite } from "@/lib/mock-data";

const inputClass = "w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg px-4 py-2.5 text-[13px] text-[#1A1A1A] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all";

export default function SiteParametresPage() {
  const [name, setName] = useState(mockSite.settings.name);
  const [description, setDescription] = useState(mockSite.settings.description);
  const [maintenance, setMaintenance] = useState(mockSite.settings.maintenanceMode);
  const [socials, setSocials] = useState(mockSite.settings.socials);

  const updateSocial = (key: string, value: string) => {
    setSocials((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Informations générales */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Informations générales</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Nom du site</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#999] mb-1.5">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#F8F9FC] border-2 border-dashed border-[#E6E8F0] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div>
                  <button className="text-[12px] font-medium text-[#6a18f1] border border-[#6a18f1]/20 px-3 py-1.5 rounded-lg hover:bg-[#F0EBFF] transition-colors">
                    Uploader un logo
                  </button>
                  <p className="text-[11px] text-[#BBB] mt-1">PNG, JPG ou SVG. Max 2 Mo.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Mode maintenance */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Mode maintenance</h2>
              <p className="text-[12px] text-[#999] mt-0.5">
                {maintenance ? "Votre site est actuellement hors ligne." : "Votre site est en ligne et accessible."}
              </p>
            </div>
            <button
              onClick={() => setMaintenance(!maintenance)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                maintenance ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  maintenance ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </motion.section>

        {/* Réseaux sociaux */}
        <motion.section
          className="bg-white rounded-xl border border-[#E6E8F0] p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <h2 className="text-[15px] font-semibold text-[#1A1A1A] mb-5">Réseaux sociaux</h2>
          <div className="space-y-4">
            {[
              { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
              { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/..." },
              { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
              { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
              { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
            ].map((social) => (
              <div key={social.key}>
                <label className="block text-[12px] font-medium text-[#999] mb-1.5">{social.label}</label>
                <input
                  type="text"
                  value={(socials as Record<string, string | undefined>)[social.key] || ""}
                  onChange={(e) => updateSocial(social.key, e.target.value)}
                  placeholder={social.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Save */}
        <div className="flex justify-end">
          <button className="bg-[#6a18f1] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:bg-[#5a12d9] transition-colors">
            Sauvegarder les paramètres
          </button>
        </div>
      </div>
    </div>
  );
}
