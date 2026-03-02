"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SlidePanel from "@/components/ui/SlidePanel";
import { mockLeads } from "@/lib/mock-data";
import type { Lead } from "@/types";

const sourceLabels: Record<string, { label: string; color: string; bg: string }> = {
  "contact-form": { label: "Contact", color: "#4F46E5", bg: "#EEF2FF" },
  "newsletter": { label: "Newsletter", color: "#10B981", bg: "#ECFDF5" },
  "lead-magnet": { label: "Lead magnet", color: "#F59E0B", bg: "#FFFBEB" },
  "order_form": { label: "Commande", color: "#8B5CF6", bg: "#F5F3FF" },
};

export default function SiteLeadsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = mockLeads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-xl font-bold text-[#191919]">Leads</h1>
          <p className="text-[13px] text-[#8A8A88] mt-0.5">{mockLeads.length} contacts collectés depuis votre site</p>
        </div>
        <div className="relative w-full sm:w-64">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E6E4] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#191919] placeholder-[#8A8A88] focus:outline-none focus:border-[#4F46E5]/30 focus:ring-1 focus:ring-[#4F46E5]/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Table */}
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
                {["Nom", "Email", "Source", "Date"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const src = sourceLabels[lead.source] ?? { label: lead.source, color: "#8A8A88", bg: "#F7F7F5" };
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FBFBFA] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-[13px] font-medium text-[#191919]">{lead.name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-[#5A5A58]">{lead.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: src.color, backgroundColor: src.bg }}
                      >
                        {src.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#8A8A88]">{lead.date}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#8A8A88]">
                    Aucun lead trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail panel */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} title={selected ? selected.name : ""}>
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">Email</div>
              <a href={`mailto:${selected.email}`} className="text-[14px] font-medium text-[#4F46E5] hover:underline">
                {selected.email}
              </a>
            </div>
            <div className="h-px bg-[#E6E6E4]" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">Source</div>
                <div className="text-[13px] text-[#191919]">
                  {(sourceLabels[selected.source] ?? { label: selected.source }).label}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-1">Date</div>
                <div className="text-[13px] text-[#191919]">{selected.date}</div>
              </div>
            </div>
            {Object.keys(selected.fields).length > 0 && (
              <>
                <div className="h-px bg-[#E6E6E4]" />
                <div>
                  <div className="text-[11px] font-semibold text-[#8A8A88] uppercase tracking-wider mb-2">Champs</div>
                  <div className="space-y-2">
                    {Object.entries(selected.fields).map(([key, value]) => (
                      <div key={key} className="bg-[#F7F7F5] rounded-lg p-3">
                        <div className="text-[11px] font-medium text-[#8A8A88] mb-0.5">{key}</div>
                        <div className="text-[13px] text-[#191919]">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="pt-4">
              <a
                href={`mailto:${selected.email}`}
                className="block w-full text-center bg-[#4F46E5] text-white text-[13px] font-semibold py-2.5 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                Envoyer un email
              </a>
            </div>
          </div>
        )}
      </SlidePanel>
    </div>
  );
}
