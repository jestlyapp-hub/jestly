"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import BadgeStatus from "@/components/ui/BadgeStatus";
import SlidePanel from "@/components/ui/SlidePanel";
import { useSite } from "@/lib/hooks/use-site";
import type { SitePage } from "@/types";

export default function SitePagesPage() {
  const { site } = useSite();
  const [selected, setSelected] = useState<SitePage | null>(null);
  const pages = site.pages;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-[15px] font-semibold text-[#191919]">Pages du site</h2>
          <p className="text-[12px] text-[#999] mt-0.5">{pages.length} pages</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E6E6E4] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EFEFEF]">
                {["Nom", "Slug", "Statut", "Blocs"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr
                  key={page.id}
                  onClick={() => setSelected(page)}
                  className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#191919]">{page.name}</td>
                  <td className="px-5 py-3.5 text-[12px] font-mono text-[#999]">{page.slug}</td>
                  <td className="px-5 py-3.5"><BadgeStatus status={page.status} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-[#666]">{page.blocks.length} blocs</td>
                  <td className="px-5 py-3.5">
                    <button className="text-[12px] font-medium text-[#4F46E5] hover:underline">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected ? `Page : ${selected.name}` : ""}>
        {selected && (
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">Nom de la page</label>
              <input type="text" defaultValue={selected.name} className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">Slug</label>
              <input type="text" defaultValue={selected.slug} className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
            </div>
            <div className="h-px bg-[#E6E6E4]" />
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">SEO — Titre</label>
              <input type="text" defaultValue={selected.seoTitle || ""} placeholder="Titre de la page" className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-1.5">SEO — Description</label>
              <textarea defaultValue={selected.seoDescription || ""} rows={3} placeholder="Description pour les moteurs de recherche" className="w-full bg-[#F7F7F5] border border-[#E6E6E4] rounded-lg px-4 py-2.5 text-[13px] text-[#191919] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all" />
            </div>
            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors">
                Sauvegarder
              </button>
              <button onClick={() => setSelected(null)} className="flex-1 border border-[#E6E6E4] text-[#666] text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#F7F7F5] transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
