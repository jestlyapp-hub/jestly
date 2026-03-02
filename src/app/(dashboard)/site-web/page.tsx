"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import StatCard from "@/components/ui/StatCard";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { mockSite, siteOrders, siteStats } from "@/lib/mock-data";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const, delay: i * 0.06 },
  }),
};

const stats = [
  { label: "Visites", value: siteStats.visits, change: "+18 % vs mois dernier", positive: true },
  { label: "Conversion", value: siteStats.conversion, change: "+0,4 % vs mois dernier", positive: true },
  { label: "Panier moyen", value: siteStats.avgCart, change: "+12 % vs mois dernier", positive: true },
  { label: "Taux clic CTA", value: siteStats.ctaRate, change: "-1,2 % vs mois dernier", positive: false },
];

export default function SiteWebApercu() {
  const [maintenance, setMaintenance] = useState(mockSite.settings.maintenanceMode);
  const [copied, setCopied] = useState(false);
  const siteUrl = `${mockSite.domain.subdomain}.jestly.site`;
  const recentOrders = siteOrders.slice(0, 3);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${siteUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* URL du site */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E8F0] p-4 flex items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#F0EBFF] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <span className="text-[14px] font-medium text-[#1A1A1A] truncate">{siteUrl}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="text-[12px] font-medium text-[#6a18f1] border border-[#6a18f1]/20 px-3 py-1.5 rounded-lg hover:bg-[#F0EBFF] transition-colors"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
          <a
            href={`https://${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] font-medium text-[#666] border border-[#E6E8F0] px-3 py-1.5 rounded-lg hover:bg-[#F8F9FC] transition-colors flex items-center gap-1"
          >
            Ouvrir
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={fadeIn} custom={i} initial="hidden" animate="visible">
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Layout 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gauche — Aperçu visuel */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-[#E6E8F0] overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="px-5 py-4 border-b border-[#E6E8F0]">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Aperçu du site</h2>
          </div>
          <div className="p-6">
            <div className="bg-[#F8F9FC] rounded-lg border border-[#E6E8F0] overflow-hidden">
              {/* Browser bar mock */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-[#E6E8F0]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 bg-[#F8F9FC] rounded px-3 py-1 text-[11px] text-[#999] text-center">
                  {siteUrl}
                </div>
              </div>
              {/* Site preview placeholder */}
              <div className="h-[280px] bg-gradient-to-br from-[#6a18f1]/10 to-[#6a18f1]/5 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#6a18f1]/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="text-[15px] font-semibold text-[#1A1A1A]">{mockSite.settings.name}</div>
                <div className="text-[12px] text-[#999] max-w-xs text-center">{mockSite.settings.description}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Droite — Actions rapides */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Actions */}
          <div className="bg-white rounded-xl border border-[#E6E8F0] p-5">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <Link
                href="/site-web/createur"
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8F0] hover:bg-[#F8F9FC] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0EBFF] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A1A]">Modifier le site</div>
                  <div className="text-[11px] text-[#999]">Ouvrir le créateur</div>
                </div>
              </Link>
              <a
                href={`https://${siteUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8F0] hover:bg-[#F8F9FC] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0EBFF] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A1A]">Voir le site</div>
                  <div className="text-[11px] text-[#999]">Ouvrir dans un nouvel onglet</div>
                </div>
              </a>
              <Link
                href="/site-web/parametres"
                className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8F0] hover:bg-[#F8F9FC] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F0EBFF] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a18f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#1A1A1A]">Paramètres</div>
                  <div className="text-[11px] text-[#999]">Configurer le site</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Toggle Maintenance */}
          <div className="bg-white rounded-xl border border-[#E6E8F0] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#1A1A1A]">Mode maintenance</div>
                <div className="text-[11px] text-[#999] mt-0.5">
                  {maintenance ? "Site hors ligne" : "Site en ligne"}
                </div>
              </div>
              <button
                onClick={() => setMaintenance(!maintenance)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  maintenance ? "bg-[#6a18f1]" : "bg-[#E6E8F0]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    maintenance ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Commandes récentes du site */}
      <motion.div
        className="bg-white rounded-xl border border-[#E6E8F0] overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <div className="px-5 py-4 border-b border-[#E6E8F0] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Commandes récentes du site</h2>
          <Link href="/site-web/commandes" className="text-[12px] font-medium text-[#6a18f1] hover:underline">
            Tout voir
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F0F5]">
                {["Ref", "Client", "Service", "Prix", "Statut", "Date"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-[#F8F8FA] last:border-b-0 hover:bg-[#FAFBFD] transition-colors">
                  <td className="px-5 py-3.5 text-[12px] font-mono text-[#999]">{order.id}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">{order.client}</td>
                  <td className="px-5 py-3.5 text-[13px] text-[#666]">{order.service}</td>
                  <td className="px-5 py-3.5 text-[13px] font-medium text-[#1A1A1A]">{order.price} &euro;</td>
                  <td className="px-5 py-3.5"><BadgeStatus status={order.status} /></td>
                  <td className="px-5 py-3.5 text-[13px] text-[#999]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
