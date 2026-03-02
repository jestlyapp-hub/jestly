"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Aperçu", href: "/site-web" },
  { label: "Créateur", href: "/site-web/createur" },
  { label: "Pages", href: "/site-web/pages" },
  { label: "Commandes", href: "/site-web/commandes" },
  { label: "Design", href: "/site-web/design" },
  { label: "SEO", href: "/site-web/seo" },
  { label: "Domaine", href: "/site-web/domaine" },
  { label: "Paramètres", href: "/site-web/parametres" },
];

export default function SiteWebNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/site-web" ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="flex items-center gap-1 border-b border-[#E6E8F0] mb-6 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
            isActive(tab.href)
              ? "border-[#6a18f1] text-[#6a18f1]"
              : "border-transparent text-[#999] hover:text-[#666]"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
