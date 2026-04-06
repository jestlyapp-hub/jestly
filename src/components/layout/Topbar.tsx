"use client";

import { usePathname } from "next/navigation";
import GlobalSearch from "@/components/layout/GlobalSearch";
import MobileNav from "@/components/layout/MobileNav";
import NotificationPanel from "@/components/dashboard/NotificationPanel";

/* Mapping pathname → label pour le breadcrumb */
const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/commandes": "Commandes",
  "/clients": "Clients",
  "/projets": "Projets",
  "/produits": "Offres",
  "/facturation": "Facturation",
  "/facturation/templates": "Modèles & Récurrences",
  "/abonnements": "Abonnements",
  "/analytics": "Analytics",
  "/parametres": "Paramètres",
  "/calendrier": "Calendrier",
  "/taches": "Tâches",
};

export default function Topbar() {
  const pathname = usePathname();
  const pageLabel = pageLabels[pathname]
    ?? (pathname.startsWith("/site-web") ? "Site web" : null)
    ?? (pathname.startsWith("/clients/") ? "Fiche client" : null)
    ?? (pathname.startsWith("/projets/") ? "Projet" : null)
    ?? (pathname.startsWith("/taches/") ? "Tâche" : null)
    ?? (pathname.startsWith("/produits/") ? "Offre" : null)
    ?? "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-[#E6E6E4] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      {/* Gauche — Hamburger mobile + Breadcrumb */}
      <div className="flex items-center gap-2">
        <MobileNav />
        <span className="text-[15px] font-semibold text-[#191919]">{pageLabel}</span>
      </div>

      {/* Centre — Search */}
      <div className="hidden md:flex items-center max-w-sm flex-1 mx-8">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <NotificationPanel />
      </div>
    </header>
  );
}
