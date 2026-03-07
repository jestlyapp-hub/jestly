"use client";

import { usePathname } from "next/navigation";
import GlobalSearch from "@/components/layout/GlobalSearch";

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
  "/calendrier": "Calendrier",
  "/taches": "Tâches",
};

export default function Topbar() {
  const pathname = usePathname();
  const pageLabel = pageLabels[pathname] ?? (pathname.startsWith("/site-web") ? "Site web" : "Dashboard");

  return (
    <header className="h-14 bg-white border-b border-[#E6E6E4] flex items-center justify-between px-6 flex-shrink-0">
      {/* Gauche — Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold text-[#1A1A1A]">{pageLabel}</span>
      </div>

      {/* Centre — Search */}
      <div className="hidden md:flex items-center max-w-sm flex-1 mx-8">
        <GlobalSearch />
      </div>

      {/* Droite — Avatar uniquement (QuickActions + NotificationPanel sont dans le dashboard) */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[11px] font-semibold text-[#4F46E5] hover:ring-2 hover:ring-[#4F46E5]/20 transition-all">
          GB
        </button>
      </div>
    </header>
  );
}
