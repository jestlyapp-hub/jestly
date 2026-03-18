"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

const tabDefs = [
  { label: "Aperçu", suffix: "" },
  { label: "Créateur", suffix: "/createur" },
  { label: "Pages", suffix: "/pages" },
  { label: "Produits / Briefs", suffix: "/offres" },
  { label: "Commandes", suffix: "/commandes" },
  { label: "Leads", suffix: "/leads" },
  { label: "Analytics", suffix: "/analytics" },
  { label: "Design", suffix: "/design" },
  { label: "SEO", suffix: "/seo" },
  { label: "Domaine", suffix: "/domaine" },
  { label: "Paramètres", suffix: "/parametres" },
];

export default function SiteWebNav() {
  const pathname = usePathname();
  const { siteId } = useParams<{ siteId: string }>();

  const base = `/site-web/${siteId}`;

  const isActive = (suffix: string) => {
    const href = base + suffix;
    return suffix === "" ? pathname === href : pathname.startsWith(href);
  };

  return (
    <nav className="flex items-center gap-1 border-b border-[#E6E6E4] mb-6 overflow-x-auto">
      {tabDefs.map((tab) => {
        const href = base + tab.suffix;
        return (
          <Link
            key={tab.suffix}
            href={href}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
              isActive(tab.suffix)
                ? "border-[#4F46E5] text-[#4F46E5]"
                : "border-transparent text-[#999] hover:text-[#666]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
