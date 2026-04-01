"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Politique de cookies
   ═══════════════════════════════════════════════════════════════════════ */

const COOKIES = [
  {
    category: "Essentiels",
    desc: "Authentification, session, préférences de langue",
    status: "Toujours actifs",
    statusColor: "#22c55e",
    statusBg: "#ECFDF5",
  },
  {
    category: "Analytiques",
    desc: "Mesure d\u2019audience anonyme",
    status: "Optionnels",
    statusColor: "#F59E0B",
    statusBg: "#FEF9EC",
  },
  {
    category: "Fonctionnels",
    desc: "Préférences UI, thème, langue",
    status: "Optionnels",
    statusColor: "#F59E0B",
    statusBg: "#FEF9EC",
  },
];

export default function CookiesPage() {
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
      </div>

      {/* ── Hero ── */}
      <section className="pt-36 pb-16 px-6">
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
              Légal
            </span>
          </motion.div>
          <motion.h1
            className="text-[36px] sm:text-[48px] font-bold leading-[1.1] tracking-tight"
            style={{ color: "#111118" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
          >
            Politique de cookies
          </motion.h1>
        </div>
      </section>

      {/* ── Content card ── */}
      <section className="pb-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease }}
          className="max-w-3xl mx-auto rounded-2xl p-8 sm:p-12"
          style={{
            background: "#FFFFFF",
            border: "1px solid #EEEDF2",
          }}
        >
          {/* Qu'est-ce qu'un cookie ? */}
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Qu&apos;est-ce qu&apos;un cookie ?
          </h2>
          <p
            className="text-[14px] leading-relaxed mb-8"
            style={{ color: "#6B6F80" }}
          >
            Un cookie est un petit fichier texte stocké sur votre appareil
            lorsque vous visitez un site web. Il permet au site de mémoriser
            vos actions et préférences (langue, affichage, connexion) pendant
            une durée déterminée, afin que vous n&apos;ayez pas à les
            ressaisir à chaque visite.
          </p>

          {/* Cookies utilisés */}
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Cookies utilisés par Jestly
          </h2>
          <div className="mb-8 rounded-xl overflow-hidden" style={{ border: "1px solid #EEEDF2" }}>
            {/* Table header */}
            <div
              className="grid grid-cols-3 gap-4 px-5 py-3 text-[12px] font-semibold uppercase tracking-wider"
              style={{ background: "#F8F8FC", color: "#A8A8B0" }}
            >
              <span>Catégorie</span>
              <span>Description</span>
              <span>Statut</span>
            </div>
            {COOKIES.map((c) => (
              <div
                key={c.category}
                className="grid grid-cols-3 gap-4 px-5 py-4 text-[14px]"
                style={{ borderTop: "1px solid #EEEDF2" }}
              >
                <span className="font-medium" style={{ color: "#111118" }}>
                  {c.category}
                </span>
                <span style={{ color: "#6B6F80" }}>{c.desc}</span>
                <span>
                  <span
                    className="inline-flex px-2.5 py-1 rounded-full text-[12px] font-semibold"
                    style={{ background: c.statusBg, color: c.statusColor }}
                  >
                    {c.status}
                  </span>
                </span>
              </div>
            ))}
          </div>

          {/* Gestion */}
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Gestion de vos cookies
          </h2>
          <p
            className="text-[14px] leading-relaxed mb-8"
            style={{ color: "#6B6F80" }}
          >
            Vous pouvez à tout moment gérer vos préférences de cookies
            directement depuis les paramètres de votre navigateur. La plupart
            des navigateurs vous permettent de refuser ou supprimer les
            cookies. Notez que la désactivation de certains cookies peut
            affecter votre expérience sur Jestly.
          </p>

          {/* Durée de conservation */}
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Durée de conservation
          </h2>
          <p
            className="text-[14px] leading-relaxed mb-8"
            style={{ color: "#6B6F80" }}
          >
            Les cookies essentiels sont conservés pendant la durée de votre
            session ou jusqu&apos;à 12 mois. Les cookies analytiques et
            fonctionnels sont conservés pour une durée maximale de 13 mois,
            conformément aux recommandations de la CNIL.
          </p>

          {/* Contact */}
          <h2
            className="text-[16px] font-bold mb-3"
            style={{ color: "#111118" }}
          >
            Contact
          </h2>
          <p
            className="text-[14px] leading-relaxed mb-6"
            style={{ color: "#6B6F80" }}
          >
            Pour toute question concernant notre politique de cookies,
            n&apos;hésitez pas à{" "}
            <Link
              href="/contact"
              className="font-semibold underline transition-colors duration-200 hover:text-[#7C5CFF]"
              style={{ color: "#7C5CFF" }}
            >
              nous contacter
            </Link>
            .
          </p>

          {/* Dernière mise à jour */}
          <p className="text-[12px] pt-4" style={{ color: "#A8A8B0", borderTop: "1px solid #EEEDF2" }}>
            Dernière mise à jour : mars 2026
          </p>
        </motion.div>
      </section>
    </main>
  );
}
