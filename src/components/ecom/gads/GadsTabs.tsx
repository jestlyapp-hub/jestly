"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const TABS = [
  { href: "/ecom/gads", label: "Vue d'ensemble" },
  { href: "/ecom/gads/attribution", label: "Attribution" },
  { href: "/ecom/gads/orders", label: "Commandes" },
  { href: "/ecom/gads/products", label: "Produits" },
  { href: "/ecom/gads/timeline", label: "Détail temporel" },
  { href: "/ecom/gads/costs", label: "Réglages coûts" },
];

export default function GadsTabs() {
  const pathname = usePathname();
  const sp = useSearchParams();
  // La période (?from&to&pl) survit à la navigation entre onglets.
  const period = new URLSearchParams();
  for (const key of ["from", "to", "pl"]) {
    const v = sp.get(key);
    if (v) period.set(key, v);
  }
  const qs = period.toString();

  return (
    // Scrollable en mobile : 6 onglets débordent sur petit écran.
    <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E5E3F0] rounded-md p-0.5 max-w-full overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.href === "/ecom/gads" ? pathname === tab.href : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={(qs ? `${tab.href}?${qs}` : tab.href) as never}
            className={`px-3 py-1 text-[12px] font-medium rounded whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] ${
              active ? "bg-white text-[#1a1535] shadow-sm" : "text-[#5A5A58] hover:text-[#1a1535]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
