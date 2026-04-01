"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TextSwapButton from "@/components/ui/TextSwapButton";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Demo / Product Tour Page
   ═══════════════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    num: 1,
    title: "Créez votre espace",
    desc: "Inscription en 30 secondes, sans carte bancaire.",
    icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 100-8 4 4 0 000 8M20 8v6M23 11h-6",
  },
  {
    num: 2,
    title: "Configurez vos commandes",
    desc: "Ajoutez vos premiers projets et clients.",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    num: 3,
    title: "Personnalisez votre site",
    desc: "Activez votre vitrine en quelques clics.",
    icon: "M3 3h18v18H3zM3 9h18M9 21V9",
  },
  {
    num: 4,
    title: "Suivez votre activité",
    desc: "Dashboard, analytics et calendrier connectés.",
    icon: "M3 3v18h18M7 16l4-8 4 4 5-9",
  },
  {
    num: 5,
    title: "Facturez et encaissez",
    desc: "Devis, factures et paiements en un clic.",
    icon: "M1 4h22v16H1zM1 10h22",
  },
];

export default function DemoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* ── Background ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(180deg, #F8F8FC 0%, #F4F3FA 100%)",
        }}
      >
        <div
          className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(124,92,255,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* ── Hero ── */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold mb-6"
              style={{
                background: "rgba(124,92,255,0.08)",
                color: "#7C5CFF",
                border: "1px solid rgba(124,92,255,0.12)",
              }}
            >
              Démo
            </span>
          </motion.div>
          <motion.h1
            className="text-[36px] sm:text-[48px] font-bold leading-[1.1] tracking-tight mb-5"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Découvrez Jestly en action
          </motion.h1>
          <motion.p
            className="text-[16px] sm:text-[18px] leading-relaxed max-w-[560px] mx-auto"
            style={{ color: "#6B6F80" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
          >
            Explorez les fonctionnalités principales en quelques minutes.
          </motion.p>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="pb-24 px-6">
        <div className="max-w-[720px] mx-auto flex flex-col gap-5">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              className="flex items-start gap-5 p-6 rounded-2xl"
              style={{
                background: "#FFFFFF",
                border: "1px solid #EEEDF2",
                borderLeft: "4px solid #7C5CFF",
              }}
            >
              {/* Number circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[15px] font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)",
                }}
              >
                {step.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C5CFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={step.icon} />
                  </svg>
                  <h3
                    className="text-[16px] font-semibold"
                    style={{ color: "#111118" }}
                  >
                    {step.title}
                  </h3>
                </div>
                <p
                  className="text-[14px] leading-relaxed"
                  style={{ color: "#6B6F80" }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA: Essayez maintenant ── */}
      <section className="pb-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
          className="max-w-[720px] mx-auto rounded-2xl p-10 text-center"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EEEDF2",
          }}
        >
          <h2
            className="text-[24px] sm:text-[28px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Essayez maintenant
          </h2>
          <p
            className="text-[15px] leading-relaxed mb-8 max-w-[460px] mx-auto"
            style={{ color: "#6B6F80" }}
          >
            Commencez gratuitement et explorez par vous-même.
          </p>
          <TextSwapButton
            label="Commencer gratuitement"
            href="/auth"
            size="lg"
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
          />
        </motion.div>
      </section>

      {/* ── Besoin d'accompagnement ── */}
      <section className="pb-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="max-w-[480px] mx-auto rounded-2xl p-6 text-center"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EEEDF2",
          }}
        >
          <p
            className="text-[14px] font-medium mb-3"
            style={{ color: "#111118" }}
          >
            Besoin d&apos;un accompagnement ?
          </p>
          <Link
            href="/contact"
            className="text-[13px] font-semibold transition-colors duration-200 hover:underline"
            style={{ color: "#7C5CFF" }}
          >
            Parlez-nous directement →
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
