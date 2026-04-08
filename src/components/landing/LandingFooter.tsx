"use client";

import Link from "next/link";
import Image from "next/image";

/* ═══════════════════════════════════════════════════════════════════════
   LandingFooter — Premium marketing footer
   Reusable across all /landing/* pages via layout.tsx
   ═══════════════════════════════════════════════════════════════════════ */

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/fonctionnalites" },
      { label: "Solutions", href: "/pour-qui" },
      { label: "Tarifs", href: "/tarifs" },
      { label: "Démo", href: "/demo" },
      { label: "Intégrations", href: "/integrations" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "FAQ", href: "/faq" },
      { label: "Centre d'aide", href: "/centre-aide" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Comparatifs", href: "/comparatifs" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Confidentialité", href: "/confidentialite" },
      { label: "Conditions générales", href: "/cgu" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer style={{ background: "#F7F4FF", borderTop: "1px solid rgba(124,58,237,0.1)" }}>
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ── Main grid ── */}
        <div className="pt-20 pb-14 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:pr-8">
            <Link
              href="/"
              aria-label="Jestly — Retour à l'accueil"
              className="flex items-center gap-2.5 mb-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 focus-visible:ring-offset-2 rounded-md"
            >
              <Image src="/logo-color.png" alt="" aria-hidden width={32} height={32} className="w-8 h-8" />
              <span className="text-[18px] font-bold text-[#111118] tracking-tight">Jestly</span>
            </Link>
            <p className="text-[14px] leading-relaxed mb-4 text-[#3F3F46]">
              La plateforme qui aide les freelances à centraliser clients, projets, paiements et visibilité.
            </p>
            <p className="text-[13px] leading-relaxed mb-6 text-[#5B5F6B]">
              Pensé pour les freelances créatifs, consultants et indépendants.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.12)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              Lancement 2026
            </span>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-4 text-[#111118]">
                {col.title}
              </h4>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="block text-[14px] font-medium py-2 -my-0.5 text-[#3F3F46] hover:text-[#7C3AED] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 focus-visible:ring-offset-2 rounded-md"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="h-px" style={{ background: "rgba(124,58,237,0.08)" }} />

        {/* ── Bottom bar ── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-[#5B5F6B]">
            © 2026 Jestly. Tous droits réservés.
          </p>

          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            {[
              { label: "Confidentialité", href: "/confidentialite" },
              { label: "Conditions", href: "/cgu" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium px-3 py-2 rounded-md text-[#3F3F46] hover:text-[#7C3AED] hover:bg-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40"
              >
                {link.label}
              </Link>
            ))}

            {/* Social icons */}
            <div className="flex items-center gap-3 ml-2">
              {/* X / Twitter */}
              <span className="opacity-40 cursor-default" aria-label="Twitter" title="Bientôt disponible">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5B5F6B"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </span>
              {/* LinkedIn */}
              <span className="opacity-40 cursor-default" aria-label="LinkedIn" title="Bientôt disponible">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#5B5F6B"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
