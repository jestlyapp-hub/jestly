"use client";

import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════
   LandingFooter — Premium marketing footer
   Reusable across all /landing/* pages via layout.tsx
   ═══════════════════════════════════════════════════════════════════════ */

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "/landing#features" },
      { label: "Solutions", href: "/landing#solutions" },
      { label: "Tarifs", href: "/landing#pricing" },
      { label: "Témoignages", href: "/landing#testimonials" },
      { label: "Démo", href: "/landing#demo" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Guide freelance", href: "#" },
      { label: "FAQ", href: "/landing#faq" },
      { label: "Centre d'aide", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Partenariats", href: "#" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Mentions légales", href: "#" },
      { label: "Confidentialité", href: "#" },
      { label: "Conditions générales", href: "#" },
      { label: "Cookies", href: "#" },
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
            <Link href="/landing" className="flex items-center gap-2.5 mb-5">
              <img src="/logo-color.png" alt="Jestly" className="w-8 h-8" />
              <span className="text-[18px] font-bold text-[#111118] tracking-tight">Jestly</span>
            </Link>
            <p className="text-[14px] leading-relaxed mb-4" style={{ color: "#57534E" }}>
              La plateforme qui aide les freelances à centraliser clients, projets, paiements et visibilité.
            </p>
            <p className="text-[12px] leading-relaxed mb-6" style={{ color: "#9CA3AF" }}>
              Pensé pour les freelances créatifs, consultants et indépendants.
            </p>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: "rgba(124,58,237,0.08)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.12)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              Lancement 2026
            </span>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] mb-5" style={{ color: "#111118" }}>
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] font-medium transition-all duration-200 hover:text-[#7C3AED] hover:translate-x-0.5 inline-block"
                      style={{ color: "#6B7280" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="h-px" style={{ background: "rgba(124,58,237,0.08)" }} />

        {/* ── Bottom bar ── */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-medium" style={{ color: "#9CA3AF" }}>
            © 2026 Jestly. Tous droits réservés.
          </p>

          <div className="flex items-center gap-6">
            {[
              { label: "Confidentialité", href: "#" },
              { label: "Conditions", href: "#" },
              { label: "Contact", href: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[12px] font-medium transition-colors duration-200 hover:text-[#7C3AED]"
                style={{ color: "#9CA3AF" }}
              >
                {link.label}
              </Link>
            ))}

            {/* Social icons */}
            <div className="flex items-center gap-3 ml-2">
              {/* X / Twitter */}
              <a href="#" className="transition-all duration-200 hover:-translate-y-0.5" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9CA3AF" className="hover:fill-[#7C3AED] transition-colors"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="transition-all duration-200 hover:-translate-y-0.5" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#9CA3AF" className="hover:fill-[#7C3AED] transition-colors"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
