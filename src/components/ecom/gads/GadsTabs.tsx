"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ecom/gads", label: "Pilotage" },
  { href: "/ecom/gads/timeline", label: "Détail temporel" },
  { href: "/ecom/gads/attribution", label: "Attribution" },
  { href: "/ecom/gads/orders", label: "Commandes" },
  { href: "/ecom/gads/products", label: "Produits" },
];

export default function GadsTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex items-center bg-[#F7F7F5] border border-[#E6E6E4] rounded-md p-0.5">
      {TABS.map((tab) => {
        const active = tab.href === "/ecom/gads" ? pathname === tab.href : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-3 py-1 text-[12px] font-medium rounded transition-colors ${
              active ? "bg-white text-[#191919] shadow-sm" : "text-[#5A5A58] hover:text-[#191919]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
