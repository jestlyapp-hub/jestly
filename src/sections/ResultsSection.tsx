"use client";

import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — "UI Preview"
   Big dashboard mockup with floating cards
   ═══════════════════════════════════════════════════════════════════════ */

const ease = [0.22, 1, 0.36, 1] as const;

export default function ResultsSection() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 px-6 overflow-hidden" style={{ background: "white" }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(124,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14 sm:mb-16">
          <motion.span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-5" style={{ background: "rgba(124,92,255,0.08)", color: "#7C5CFF", border: "1px solid rgba(124,92,255,0.12)" }} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }}>
            Aperçu produit
          </motion.span>
          <motion.h2 className="text-[26px] sm:text-[36px] md:text-[44px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-4" style={{ color: "#111118" }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08, ease }}>
            Un dashboard<span className="bg-clip-text text-transparent ml-2" style={{ backgroundImage: "linear-gradient(135deg, #7C5CFF, #9F7BFF)" }}>pensé pour vous</span>
          </motion.h2>
          <motion.p className="text-[14px] sm:text-[16px] leading-relaxed max-w-lg mx-auto" style={{ color: "#66697A" }} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.16, ease }}>
            Clarté immédiate. Actions en 2 clics. Informations reliées.
          </motion.p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          className="relative rounded-[28px] overflow-hidden mx-auto max-w-4xl"
          style={{ background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-5 py-3 border-b" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
            <div className="flex-1 mx-4 h-6 rounded-full flex items-center px-3" style={{ background: "#F0F0EE" }}>
              <span className="text-[10px] font-medium" style={{ color: "#B0B3C0" }}>app.jestly.fr/dashboard</span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-5 sm:p-8 space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Revenus ce mois", value: "4 230 €", trend: "+12%" },
                { label: "Projets actifs", value: "3", trend: "" },
                { label: "Factures en attente", value: "1", trend: "" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "white", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <div className="text-[10px] font-medium" style={{ color: "#8A8FA3" }}>{s.label}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[16px] font-bold" style={{ color: "#111118" }}>{s.value}</span>
                    {s.trend && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#F0FDF4", color: "#059669" }}>{s.trend}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Table mockup */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
              <div className="grid grid-cols-4 gap-0 px-4 py-2" style={{ background: "#F7F7F8" }}>
                {["Client", "Projet", "Montant", "Statut"].map((h) => (
                  <span key={h} className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#8A8FA3" }}>{h}</span>
                ))}
              </div>
              {[
                { client: "Sophie M.", project: "Refonte site", amount: "2 400 €", status: "En cours", statusColor: "#7C5CFF" },
                { client: "Pierre D.", project: "Logo + charte", amount: "850 €", status: "Payé", statusColor: "#10B981" },
                { client: "Laura K.", project: "Landing page", amount: "1 200 €", status: "Devis envoyé", statusColor: "#F59E0B" },
              ].map((row) => (
                <div key={row.client} className="grid grid-cols-4 gap-0 px-4 py-3 bg-white" style={{ borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "#111118" }}>{row.client}</span>
                  <span className="text-[11px] font-medium" style={{ color: "#66697A" }}>{row.project}</span>
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: "#111118" }}>{row.amount}</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md w-fit" style={{ background: `${row.statusColor}10`, color: row.statusColor }}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Floating cards */}
        <motion.div className="absolute top-[20%] left-[2%] hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }} animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
          <div><div className="text-[10px] font-semibold" style={{ color: "#111118" }}>Paiement reçu</div><div className="text-[8px]" style={{ color: "#8A8FA3" }}>+1 247 €</div></div>
        </motion.div>

        <motion.div className="absolute top-[15%] right-[3%] hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }} animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#7C5CFF" }} />
          <div><div className="text-[10px] font-semibold" style={{ color: "#111118" }}>Nouveau lead</div><div className="text-[8px]" style={{ color: "#8A8FA3" }}>Sophie Martin</div></div>
        </motion.div>
      </div>
    </section>
  );
}
