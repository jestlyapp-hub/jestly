"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const previews = [
  {
    label: "Template",
    title: "Monteur vidéo",
    content: (
      <div className="space-y-3">
        <div className="h-24 rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-[11px] font-bold">STUDIO MONTAGE</div>
            <div className="text-[#818cf8] text-[9px] mt-1">Monteur vidéo freelance</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-[#f1f1ef]" />
          ))}
        </div>
        <div className="bg-[#4F46E5] text-white text-[9px] font-medium py-1.5 rounded text-center">
          Commander un montage
        </div>
      </div>
    ),
  },
  {
    label: "Portfolio",
    title: "Graphiste",
    content: (
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {["Branding", "Motion", "Print"].map((t) => (
            <span key={t} className="text-[8px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] font-medium">
              {t}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[#f1f1ef]" />
          ))}
        </div>
      </div>
    ),
  },
  {
    label: "Checkout",
    title: "Page produit",
    content: (
      <div className="space-y-2.5">
        <div className="font-semibold text-[11px] text-[#191919]">Pack Logo Complet</div>
        <div className="text-[#4F46E5] text-[13px] font-bold">490 &euro;</div>
        <div className="space-y-1.5">
          {["Brief créatif", "3 propositions", "Fichiers source"].map((f) => (
            <div key={f} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span className="text-[9px] text-[#666]">{f}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#4F46E5] text-white text-[9px] font-medium py-1.5 rounded text-center">
          Commander
        </div>
      </div>
    ),
  },
  {
    label: "Commandes",
    title: "Dashboard",
    content: (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[9px] text-[#999] font-medium border-b border-[#EFEFEF] pb-1.5">
          <span>Client</span><span>Statut</span>
        </div>
        {[
          { name: "Marie D.", status: "En cours", color: "bg-amber-100 text-amber-700" },
          { name: "Paul R.", status: "Livré", color: "bg-emerald-100 text-emerald-700" },
          { name: "Sophie L.", status: "Nouveau", color: "bg-blue-100 text-blue-700" },
        ].map((r) => (
          <div key={r.name} className="flex items-center justify-between">
            <span className="text-[9px] text-[#191919] font-medium">{r.name}</span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${r.color}`}>{r.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Client",
    title: "Client 360°",
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[9px] font-bold text-[#4F46E5]">MD</div>
          <div>
            <div className="text-[10px] font-semibold text-[#191919]">Marie Dupont</div>
            <div className="text-[8px] text-[#999]">3 commandes &middot; 1 240 &euro;</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F7F7F5] rounded p-1.5">
            <div className="text-[8px] text-[#999]">Revenu</div>
            <div className="text-[11px] font-bold text-[#191919]">1 240 &euro;</div>
          </div>
          <div className="bg-[#F7F7F5] rounded p-1.5">
            <div className="text-[8px] text-[#999]">Commandes</div>
            <div className="text-[11px] font-bold text-[#191919]">3</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: "Facture",
    title: "FAC-2026-014",
    content: (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#191919]">FAC-2026-014</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Payé</span>
        </div>
        <div className="border-t border-[#EFEFEF] pt-2 space-y-1">
          <div className="flex justify-between text-[9px]">
            <span className="text-[#999]">Montage vidéo</span>
            <span className="text-[#191919]">350 &euro;</span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-[#999]">Color grading</span>
            <span className="text-[#191919]">150 &euro;</span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-semibold border-t border-[#EFEFEF] pt-1.5">
          <span>Total</span>
          <span>500 &euro;</span>
        </div>
      </div>
    ),
  },
];

export default function AuthShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % previews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col justify-center px-8 py-12">
      {/* Mosaic grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {previews.map((preview, i) => (
          <motion.div
            key={preview.label}
            className="bg-white rounded-xl border border-[#E6E6E4] p-3.5 cursor-default relative overflow-hidden"
            animate={{
              scale: activeIndex === i ? 1.02 : 1,
              boxShadow: activeIndex === i ? "0 8px 30px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.03)",
            }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
            onMouseEnter={() => setActiveIndex(i)}
          >
            {/* Badge */}
            <span className="inline-block text-[8px] font-semibold px-1.5 py-0.5 rounded bg-[#F7F7F5] text-[#999] mb-2 uppercase tracking-wider">
              {preview.label}
            </span>
            <div className="text-[10px] font-semibold text-[#191919] mb-2">{preview.title}</div>
            {preview.content}

            {/* Pulse indicator */}
            <AnimatePresence>
              {activeIndex === i && (
                <motion.div
                  className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#4F46E5]"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Mini flow */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {["Site", "Commande", "Brief", "Livraison", "Paiement", "Client"].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#666]">{step}</span>
            {i < 5 && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-6">
        {[
          { value: "+120", label: "freelances en test" },
          { value: "4,8/5", label: "retours" },
          { value: "3h/sem", label: "temps gagné" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-[15px] font-bold text-[#191919]">{stat.value}</div>
            <div className="text-[10px] text-[#999]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
