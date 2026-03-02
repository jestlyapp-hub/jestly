"use client";

import { usePathname } from "next/navigation";

/* Mapping pathname → label pour le breadcrumb */
const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/commandes": "Commandes",
  "/clients": "Clients",
  "/produits": "Produits",
  "/facturation": "Facturation",
  "/abonnements": "Abonnements",
  "/analytics": "Analytics",
  "/parametres": "Paramètres",
};

export default function Topbar() {
  const pathname = usePathname();
  const pageLabel = pageLabels[pathname] ?? (pathname.startsWith("/site-web") ? "Site web" : "Dashboard");

  return (
    <header className="h-14 bg-white border-b border-[#E6E8F0] flex items-center justify-between px-6 flex-shrink-0">
      {/* Gauche — Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold text-[#1A1A1A]">{pageLabel}</span>
      </div>

      {/* Centre — Search */}
      <div className="hidden md:flex items-center max-w-sm flex-1 mx-8">
        <div className="relative w-full">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-[#F8F9FC] border border-[#E6E8F0] rounded-lg pl-10 pr-14 py-2 text-[13px] text-[#1A1A1A] placeholder-[#AAA] focus:outline-none focus:border-[#6a18f1]/30 focus:ring-1 focus:ring-[#6a18f1]/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#BBB] bg-white border border-[#E6E8F0] rounded px-1.5 py-0.5 font-mono">
            &#8984;K
          </kbd>
        </div>
      </div>

      {/* Droite — Actions */}
      <div className="flex items-center gap-2">
        {/* Bouton New */}
        <button className="flex items-center gap-1.5 bg-[#6a18f1] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-[#5a12d9] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nouveau
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-[#F8F9FC] transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6a18f1] rounded-full" />
        </button>

        {/* Avatar */}
        <button className="w-8 h-8 rounded-full bg-[#F0EBFF] flex items-center justify-center text-[11px] font-semibold text-[#6a18f1] hover:ring-2 hover:ring-[#6a18f1]/20 transition-all">
          GB
        </button>
      </div>
    </header>
  );
}
